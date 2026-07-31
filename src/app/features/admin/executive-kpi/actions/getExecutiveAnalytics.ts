// 📂 src/app/features/admin/executive-kpi/actions/getExecutiveAnalytics.ts (PURE SNAPSHOT HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import { SystemStats } from "@/models/SystemStats";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { differenceInDays, subDays, format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ ENTERPRISE CONSTANTS & SERIALIZATION
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// 👑 EXECUTIVE SUMMARY INTERFACE (8 CAPITAL METRICS)
export interface ExecutiveSummary {
  revenue: {
    gross: number;
    netProfitEstimate: number;
    growthPercentage: number;
    deliveredCash: number;     // Liquid cash received in Bank (Paid)
    courierVault: number;      // Money collected by Couriers (Delivered + Unpaid)
    pipelineCapital: number;   // Unfulfilled/Pending sales value
    totalDiscounts: number;    // Promotional coupon discount burn
  };
  orders: {
    total: number;
    velocity: number;
    avgOrderValue: number;
  };
  customers: {
    total: number;
    newToday: number;
  };
  inventory: {
    totalVariants: number;
    criticalStockCount: number;
    outOfStockCount: number;
  };
}

interface DateRange {
  from: Date;
  to: Date;
  startDate: Date;
  endDate: Date;
  compareStartDate: Date;
  compareEndDate: Date;
  compare: boolean;
}

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE (Lua Script)
// ================================================================
const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
  try {
    const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
    if (result === 1) {
      console.log(`🔓 Lock released (${requestId}).`);
    } else {
      console.warn(`⚠️ Lock not released. Value mismatch or expired.`);
    }
  } catch (error) {
    console.error(`❌ Lock release error:`, error);
  }
};

// ================================================================
// 🚀 MAIN EXECUTIVE KPI ACTION (PURE SNAPSHOT READ)
// ================================================================
export async function getExecutiveAnalyticsPayload(range: DateRange): Promise<ExecutiveSummary | null> {
  const cacheKey = `analytics_executive:${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}:compare_${range.compare}`;

  let lockKey = '';
  let requestId = '';

  try {
    await verifyAdminAccess();
    await connectMongoose();

    lockKey = `lock:${cacheKey}`;
    requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // ================================================================
    // 📦 1. CACHE READ
    // ================================================================
    let cachedData: string | null = null;
    try {
      cachedData = await redis.get(cacheKey) as string | null;
    } catch (redisError) {
      console.warn("⚠️ Redis unavailable (GET). Proceeding with direct DB query.");
    }

    if (cachedData) {
      const parsed = safeParse<ExecutiveSummary>(cachedData);
      if (parsed) {
        console.log("⚡ Redis Cache Hit: Executive Summary");
        return parsed;
      }
    }

    // ================================================================
    // 🔒 2. LOCK ACQUIRE (Cache Stampede Defense)
    // ================================================================
    const LOCK_TTL = 30;
    let lockAcquired = false;
    try {
      const result = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });
      lockAcquired = result === "OK";
    } catch (redisError) {
      console.warn("⚠️ Redis unavailable (LOCK). Proceeding without distributed lock.");
      lockAcquired = false;
    }

    if (!lockAcquired) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const retryCache = await redis.get(cacheKey) as string | null;
        if (retryCache) {
          const retryParsed = safeParse<ExecutiveSummary>(retryCache);
          if (retryParsed) return retryParsed;
        }
      } catch (e) {}
    }

    // ================================================================
    // 📊 3. PURE SNAPSHOT AGGREGATION (Zero Live Settings Dependency)
    // ================================================================
    const daysDiff = differenceInDays(range.endDate, range.startDate) + 1;
    const prevRangeFrom = subDays(range.startDate, daysDiff);
    const prevRangeTo = subDays(range.endDate, daysDiff);

    let inventoryStats = null;
    try {
      inventoryStats = await SystemStats.findOne({ _id: "inventory" }).lean();
    } catch (dbError) {
      console.error("❌ Failed to fetch inventory stats:", dbError);
    }
    const invData = (inventoryStats || {
      totalVariants: 0,
      criticalStockCount: 0,
      outOfStockCount: 0,
    }) as {
      totalVariants: number;
      criticalStockCount: number;
      outOfStockCount: number;
    };

    const [currentMetricsRes, prevMetricsRes, totalUsers, newUsers] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.startDate, $lte: range.endDate },
            status: { $in: REVENUE_STATUSES },
          },
        },
        {
          $group: {
            _id: null,
            gross: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 },
            discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
            tShip: { $sum: "$shippingCost" },
            // ✅ SNAPSHOT SUM 1: Line Profit
            totalProfit: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM 2: Pure Snapshotted RTO Reserve
            totalRtoReserve: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $multiply: [
                          { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] },
                          { $divide: [{ $ifNull: ["$$this.appliedRtoRate", 0] }, 100] }
                        ]
                      }
                    ]
                  }
                }
              }
            },
            // ✅ LIQUID CAPITAL METRICS
            deliveredCash: {
              $sum: {
                $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalPrice", 0],
              },
            },
            courierVault: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", "Delivered"] },
                      { $eq: ["$paymentStatus", "Unpaid"] },
                    ],
                  },
                  "$totalPrice",
                  0,
                ],
              },
            },
            pipelineCapital: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$status", "Delivered"] },
                      { $ne: ["$status", "Completed"] },
                      { $ne: ["$status", "Cancelled"] },
                      { $ne: ["$status", "Rejected"] },
                    ],
                  },
                  "$totalPrice",
                  0,
                ],
              },
            },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevRangeFrom, $lte: prevRangeTo },
            status: { $in: REVENUE_STATUSES },
          },
        },
        {
          $group: {
            _id: null,
            gross: { $sum: "$totalPrice" },
          },
        },
      ]),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({
        createdAt: { $gte: range.startDate, $lte: range.endDate },
        role: "customer",
      }),
    ]);

    const currentTotals = currentMetricsRes[0] || {
      gross: 0,
      totalOrders: 0,
      discounts: 0,
      tShip: 0,
      totalProfit: 0,
      totalRtoReserve: 0,
      deliveredCash: 0,
      courierVault: 0,
      pipelineCapital: 0,
    };
    const prevGross = prevMetricsRes[0]?.gross || 0;

    const currentRevenue = currentTotals.gross;
    const discounts = currentTotals.discounts;
    const totalProfit = currentTotals.totalProfit;
    const totalRtoReserve = currentTotals.totalRtoReserve;

    const growth =
      prevGross > 0
        ? ((currentRevenue - prevGross) / prevGross) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    const hoursDiff = daysDiff * 24;
    const velocity = currentTotals.totalOrders / (hoursDiff || 1);

    // ✅ PURE SNAPSHOT NET PROFIT FORMULA
    const pureProfit = totalProfit - discounts - totalRtoReserve;

    const summaryResult: ExecutiveSummary = {
      revenue: {
        gross: currentRevenue,
        netProfitEstimate: Math.round(pureProfit),
        growthPercentage: Number(growth.toFixed(2)),
        deliveredCash: currentTotals.deliveredCash,
        courierVault: currentTotals.courierVault,
        pipelineCapital: currentTotals.pipelineCapital,
        totalDiscounts: discounts,
      },
      orders: {
        total: currentTotals.totalOrders,
        velocity: Number(velocity.toFixed(2)),
        avgOrderValue:
          currentTotals.totalOrders > 0 ? Math.round(currentRevenue / currentTotals.totalOrders) : 0,
      },
      customers: { total: totalUsers, newToday: newUsers },
      inventory: {
        totalVariants: invData.totalVariants,
        criticalStockCount: invData.criticalStockCount,
        outOfStockCount: invData.outOfStockCount,
      },
    };

    // ================================================================
    // 💾 4. CACHE WRITE
    // ================================================================
    try {
      const stringified = safeStringify(summaryResult);
      await redis.set(cacheKey, stringified, { ex: 600 });
      console.log(`✅ Executive Summary cached successfully.`);
    } catch (redisError) {
      console.warn("⚠️ Redis unavailable (SET). Data served directly.");
    }

    return summaryResult;

  } catch (error: any) {
    console.error("Executive Engine Error:", error.message);
    return null;
  } finally {
    if (lockKey && requestId) {
      await releaseLock(lockKey, requestId);
    }
  }
}