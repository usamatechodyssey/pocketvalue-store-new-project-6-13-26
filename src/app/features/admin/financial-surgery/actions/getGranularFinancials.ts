// 📂 src/app/features/admin/financial-surgery/actions/getGranularFinancials.ts (PURE SNAPSHOT HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ✅ SAFE SERIALIZATION
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// 👑 COMPLETE FINANCIAL ANATOMY INTERFACE
// ================================================================
export interface GranularFinancialsResult {
  originalPrice: number;
  avgUnitCostPrice: number;
  totalItemsSold: number;
  adSpend: number;
  platformFees: number;
  taxes: number;
  duties: number;
  rtoLoss: number;
  operationalExpenses: number;
  shipping: number;
  pureProfit: number;
  grossTotal: number;
  discounts: number;
  netRevenue: number;
  marginPercent: number;
  roiPercent: number;
  // Dynamic Simulator Controls (For Interactive Slider UI)
  pricingTiers?: Array<{ minCost: number; maxCost: number; profitPercent: number; adSpendPercent: number }>;
  gstPercent?: number;
  dutiesPercent?: number;
  fixedFeePercent?: number;
}

// ================================================================
// 🛡️ ATOMIC LOCK RELEASE
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
    if (result === 1) console.log(`🔓 Financials Lock released (${requestId}).`);
  } catch (error) {
    console.error("Financials Lock release error:", error);
  }
};

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
// 🚀 MAIN FINANCIAL SURGERY ACTION
// ================================================================
export async function getGranularFinancialsPayload(
  range: DateRange
): Promise<GranularFinancialsResult | null> {
  const cacheKey = `analytics_financials:${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}:compare_${range.compare}`;

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // 1. Cache Read
    const cachedData = (await redis.get(cacheKey)) as string | null;
    const parsed = safeParse<GranularFinancialsResult>(cachedData);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Granular Financials");
      return parsed;
    }

    // 2. Lock Acquire
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = (await redis.get(cacheKey)) as string | null;
      const retryParsed = safeParse<GranularFinancialsResult>(retryCache);
      if (retryParsed) return retryParsed;
      return null;
    }

    try {
      console.log("🔒 Financials Lock acquired. Generating pure snapshot financial surgery...");

      // Fetch settings ONLY to supply interactive simulator controls to client UI
      let settings: any = {};
      try {
        settings = await getCachedSettings();
      } catch (e) {
        settings = {};
      }

      const globalFeesArray = settings.globalFixedFees || [];
      const fixedFeePercent = globalFeesArray.reduce((sum: number, fee: any) => sum + (fee.percentage || 0), 0);
      const gstPercent = settings.taxSettings?.standardGstPercent ?? 0;
      const dutiesPercent = settings.pricingSettings?.estimatedDutiesPercent ?? 0;

      // ================================================================
      // 📊 3. PURE SNAPSHOT AGGREGATION
      // ================================================================
      const financials = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: range.startDate, $lte: range.endDate },
            status: { $in: REVENUE_STATUSES },
          },
        },
        {
          $group: {
            _id: null,
            grossTotal: { $sum: "$totalPrice" },
            totalShipping: { $sum: "$shippingCost" },
            totalDiscounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
            totalQuantity: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM: Profit
            totalProfit: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM: Platform Fees
            totalFees: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM: Tax (GST)
            totalTax: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM: Capital (COGS)
            totalCapital: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] },
                },
              },
            },
            // ✅ SNAPSHOT SUM: Duties
            totalDuties: {
              $sum: {
                $reduce: {
                  input: "$products",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $multiply: [
                          { $ifNull: ["$$this.capital", 0] },
                          { $divide: [{ $ifNull: ["$$this.appliedDutiesRate", 0] }, 100] }
                        ]
                      }
                    ]
                  }
                }
              }
            },
            // ✅ SNAPSHOT SUM: RTO Reserve
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
          },
        },
      ]);

      const result = financials[0] || {
        grossTotal: 0,
        totalShipping: 0,
        totalDiscounts: 0,
        totalQuantity: 0,
        totalProfit: 0,
        totalFees: 0,
        totalTax: 0,
        totalCapital: 0,
        totalDuties: 0,
        totalRtoReserve: 0,
      };

      const tRevenue = result.grossTotal;
      const discounts = result.totalDiscounts;
      const netRevenue = Math.max(0, tRevenue - discounts);
      const totalProfit = result.totalProfit;
      const totalFees = result.totalFees;
      const totalTax = result.totalTax;
      const totalCapital = result.totalCapital;
      const totalDuties = Math.round(result.totalDuties);
      const totalRtoReserve = Math.round(result.totalRtoReserve);
      const totalItemsSold = result.totalQuantity || 0;

      const avgUnitCostPrice = totalItemsSold > 0 ? Math.round(totalCapital / totalItemsSold) : 0;

      // ✅ REVERSE ALGEBRA AD SPEND (100% Snapshot Derived)
      const totalAdSpend = Math.max(0, netRevenue - (totalTax + totalFees + totalProfit + totalCapital));

      // ✅ PURE SNAPSHOT PROFIT & OPERATIONAL EXPENSES
      const pureProfit = Math.round(totalProfit - discounts - totalRtoReserve);
      const operationalExpenses = Math.round(totalFees + totalTax + totalRtoReserve + totalDuties);

      const marginPercent = tRevenue > 0 ? (pureProfit / tRevenue) * 100 : 0;
      const roiPercent = totalCapital > 0 ? (pureProfit / totalCapital) * 100 : 0;

      const financialsResult: GranularFinancialsResult = {
        originalPrice: totalCapital,
        avgUnitCostPrice,
        totalItemsSold,
        adSpend: Math.round(totalAdSpend),
        platformFees: totalFees,
        taxes: totalTax,
        duties: totalDuties,
        rtoLoss: totalRtoReserve,
        operationalExpenses,
        shipping: result.totalShipping,
        pureProfit,
        grossTotal: tRevenue,
        discounts,
        netRevenue,
        marginPercent: Number(marginPercent.toFixed(2)),
        roiPercent: Number(roiPercent.toFixed(2)),
        // Simulator Controls (For Interactive UI Sliders)
        pricingTiers: settings.pricingLogicTiers || [],
        gstPercent,
        dutiesPercent,
        fixedFeePercent,
      };

      const stringified = safeStringify(financialsResult);
      await redis.set(cacheKey, stringified, { ex: 600 });

      return financialsResult;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Financial Surgery Error:", error.message);
    return null;
  }
}