// 📂 src/app/features/admin/reports/actions/getOperationalReportData.ts (FULLY SNAPSHOT-ALIGNED & HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, differenceInDays, startOfDay, endOfDay } from "date-fns";

// ✅ SINGLE SOURCE OF TRUTH (Verified from analytics.ts)
import { REVENUE_STATUSES, LIMBO_STATUSES } from "@/app/shared/constants/analytics";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// ================================================================
export interface OperationalReportRow {
  // Fulfillment Health Column Keys
  date?: string;
  totalOrders?: number;
  delivered?: number;
  pending?: number;
  cancelled?: number;
  fulfillmentRate?: number;
  leakageRate?: number;

  // Courier Performance Column Keys
  courier?: string;
  totalShipments?: number;
  rto?: number;       
  deliveryRate?: number;
  avgDeliveryDays?: number;

  // Geospatial RTO Column Keys
  location?: string;
  orders?: number;
  rtoCount?: number;  
  rtoRate?: number;
  revenueLost?: number;
}

export interface OperationalReportResponse {
  data: OperationalReportRow[];
  totals: Record<string, number>;
  generatedAt: string;
}

// ================================================================
// 🛡️ ATOMIC LOCK CONFIG
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
    if (result === 1) console.log(`🔓 Operational Report Lock released (${requestId}).`);
  } catch (error) {
    console.error("❌ Operational Report Lock release error:", error);
  }
};

// ================================================================
// 🔧 HELPERS (PKT Timezone Aware Grouping)
// ================================================================
function getDateGrouping(startDate: Date, endDate: Date): {
  format: string;
  groupByString: any;
} {
  const diffDays = differenceInDays(endDate, startDate) + 1;
  const timezone = "+05:00"; // Pakistan Standard Time

  if (diffDays <= 1) {
    return {
      format: "yyyy-MM-dd HH:00",
      groupByString: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt", timezone } }
    };
  } else if (diffDays <= 7) {
    return {
      format: "yyyy-MM-dd",
      groupByString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } }
    };
  } else {
    return {
      format: "yyyy-MM",
      groupByString: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone } }
    };
  }
}

// ================================================================
// 🚀 MAIN REPORT COMPILER (100% Hardened & Snapshot Driven)
// ================================================================
export async function getOperationalReportData(
  range: { startDate: Date; endDate: Date },
  slug: "fulfillment-health" | "courier-performance" | "geospatial-rto"
): Promise<{ success: boolean; data?: OperationalReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_operational_v6_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<OperationalReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Operational Report (${slug})`);
      return { success: true, data: parsed };
    }

    // 2. Lock Cache Stampede
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<OperationalReportResponse>(retryCache as string | null);
      if (retryParsed) return { success: true, data: retryParsed };
      return { success: false, error: "Report generation in progress." };
    }

    try {
      await connectMongoose();
      const start = startOfDay(new Date(range.startDate));
      const end = endOfDay(new Date(range.endDate));
      const grouping = getDateGrouping(start, end);
      let responseData: OperationalReportResponse;

      // ================================================================
      // 📊 A. FULFILLMENT HEALTH REPORT
      // ================================================================
      if (slug === "fulfillment-health") {
        const OPERATIONAL_STATUS_QUERY = Array.from(
          new Set([...REVENUE_STATUSES, ...LIMBO_STATUSES, "Cancelled", "Completed", "Rejected"])
        );

        const aggregation = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: { $in: OPERATIONAL_STATUS_QUERY },
            },
          },
          {
            $group: {
              _id: grouping.groupByString,
              totalOrders: { $sum: 1 },
              delivered: {
                $sum: {
                  $cond: [{ $in: ["$status", ["Delivered", "Completed"]] }, 1, 0],
                },
              },
              cancelled: {
                $sum: {
                  $cond: [{ $in: ["$status", ["Cancelled", "Rejected"]] }, 1, 0],
                },
              },
              pending: {
                $sum: {
                  $cond: [{ $in: ["$status", LIMBO_STATUSES] }, 1, 0],
                },
              },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        const data: OperationalReportRow[] = aggregation.map((item: any) => {
          const total = item.totalOrders || 0;
          const delivered = item.delivered || 0;
          const cancelled = item.cancelled || 0;
          const pending = item.pending || 0;

          const fulfillmentRate = total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 0;
          const leakageRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0;

          return {
            date: item._id,
            totalOrders: total,
            delivered,
            pending,
            cancelled,
            fulfillmentRate,
            leakageRate,
          };
        });

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 B. COURIER PERFORMANCE REPORT
      // ================================================================
      else if (slug === "courier-performance") {
        const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO", "Cancelled"]));
        const aggregation = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: { $in: STATUS_QUERY },
              "shipments.0": { $exists: true },
            },
          },
          { $unwind: "$shipments" },
          {
            $group: {
              _id: "$shipments.courier",
              totalShipments: { $sum: 1 },
              deliveredCount: {
                $sum: {
                  $cond: [{ $eq: ["$shipments.status", "Delivered"] }, 1, 0],
                },
              },
              rtoCount: {
                $sum: {
                  $cond: [{ $eq: ["$shipments.status", "RTO"] }, 1, 0],
                },
              },
              totalDeliveryTimeMs: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$shipments.status", "Delivered"] },
                        { $ne: ["$shipments.deliveredAt", null] },
                        { $ne: ["$shipments.createdAt", null] },
                      ],
                    },
                    {
                      $subtract: [
                        { $toDate: "$shipments.deliveredAt" },
                        { $toDate: "$shipments.createdAt" },
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
          { $sort: { totalShipments: -1 } },
        ]);

        const data: OperationalReportRow[] = aggregation.map((item: any) => {
          const total = item.totalShipments || 0;
          const delivered = item.deliveredCount || 0;
          const rto = item.rtoCount || 0;
          const deliveryRate = total > 0 ? Number(((delivered / total) * 100).toFixed(2)) : 0;

          const avgDays =
            delivered > 0
              ? Number((item.totalDeliveryTimeMs / delivered / (1000 * 60 * 60 * 24)).toFixed(2))
              : 0;

          return {
            courier: item._id ? item._id.toUpperCase() : "Manual/Self-Pickup",
            totalShipments: total,
            delivered,
            rto,
            deliveryRate,
            avgDeliveryDays: avgDays,
          };
        });

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 C. GEOSPATIAL RTO REPORT
      // ================================================================
      else if (slug === "geospatial-rto") {
        const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO"]));
        const aggregation = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              status: { $in: STATUS_QUERY },
              "shippingAddress.city": { $exists: true, $ne: "" },
            },
          },
          {
            $group: {
              _id: { $toUpper: "$shippingAddress.city" },
              orders: { $sum: 1 },
              rtoCount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "RTO"] }, 1, 0],
                },
              },
              revenueLost: {
                $sum: {
                  $cond: [{ $eq: ["$status", "RTO"] }, "$totalPrice", 0],
                },
              },
            },
          },
          { $sort: { orders: -1 } },
          { $limit: 100 },
        ]);

        const data: OperationalReportRow[] = aggregation.map((item: any) => {
          const total = item.orders || 0;
          const rto = item.rtoCount || 0;
          const rtoRate = total > 0 ? Number(((rto / total) * 100).toFixed(2)) : 0;

          return {
            location: item._id || "Unknown",
            orders: total,
            rtoCount: rto, 
            rtoRate,
            revenueLost: item.revenueLost || 0,
          };
        });

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      } else {
        return { success: false, error: "Invalid operational report slug." };
      }

      const stringified = safeStringify(responseData);
      await redis.set(cacheKey, stringified, { ex: 300 });
      console.log(`✅ Operational Report "${slug}" cached successfully.`);

      return { success: true, data: responseData };
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error(`❌ Operational Report Engine Error (${slug}):`, error.message);
    return { success: false, error: error.message };
  }
}

// ================================================================
// ✅ GLOBAL TOTALS AGGREGATOR (PERCENTAGE RATE EXCLUSION FILTERED)
// ================================================================
function calculateTotals(data: OperationalReportRow[]): Record<string, number> {
  const totals: Record<string, number> = {};
  if (data.length === 0) return totals;

  const keysToExclude = [
    'date', 
    'courier', 
    'location',
    'deliveryRate', 
    'rtoRate', 
    'fulfillmentRate', 
    'leakageRate',
    'avgDeliveryDays'
  ];

  const numericKeys = Object.keys(data[0]).filter(k => !keysToExclude.includes(k));
  
  numericKeys.forEach(key => {
    totals[key] = Math.round(data.reduce((sum, row) => sum + (Number((row as any)[key]) || 0), 0));
  });
  
  return totals;
}