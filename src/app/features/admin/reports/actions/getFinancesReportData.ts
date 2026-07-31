// 📂 src/app/features/admin/reports/actions/getFinancesReportData.ts (FULLY SNAPSHOT-DECOUPLED & HARDENED)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { format, differenceInDays, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// ================================================================
export interface FinancesReportRow {
  date: string;
  grossSales?: number;
  discounts?: number;
  netSales?: number;
  costOfGoods?: number;
  avgUnitCostPrice?: number;
  duties?: number;
  fees?: number;
  adSpend?: number;
  shipping?: number;
  grossProfit?: number; 
  netProfit?: number;
  marginPercent?: number;
  roiPercent?: number;
  
  // FBR GST
  appliedGstRate?: number;
  gstAmount?: number;
  fbrReference?: string;
  
  // Payment Analysis
  method?: string;
  totalOrders?: number;
  totalRevenue?: number;
  appliedFeeRate?: number;
  gatewayFees?: number;
  netReceivable?: number;
  
  // Loss Analysis (RTO)
  refundOrders?: number;
  refundAmount?: number;
  rtoOrders?: number;
  appliedRtoRate?: number;
  rtoLoss?: number;
  totalLoss?: number;
}

export interface FinancesReportResponse {
  data: FinancesReportRow[];
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
    if (result === 1) console.log(`🔓 Finances Lock released (${requestId}).`);
  } catch (error) {
    console.error("❌ Finances Lock release error:", error);
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
  const timezone = "+05:00"; // Pakistan Time Standard

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
// 🚀 MAIN REPORT SERVER ACTION (100% Snapshot Driven)
// ================================================================
export async function getFinancesReportData(
  range: { startDate: Date; endDate: Date },
  slug: "profit-loss" | "fbr-gst-sales-tax" | "payment-breakdown" | "refunds-rto"
): Promise<{ success: boolean; data?: FinancesReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_finances_v9_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<FinancesReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Finances Report (${slug})`);
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
      const retryParsed = safeParse<FinancesReportResponse>(retryCache as string | null);
      if (retryParsed) return { success: true, data: retryParsed };
      return { success: false, error: "Report generation in progress. Refreshing soon..." };
    }

    try {
      await connectMongoose();
      const start = startOfDay(new Date(range.startDate));
      const end = endOfDay(new Date(range.endDate));
      const grouping = getDateGrouping(start, end);
      let responseData: FinancesReportResponse;

      // ================================================================
      // 📊 A. PROFIT & LOSS REPORT
      // ================================================================
      if (slug === "profit-loss") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: grouping.groupByString,
              grossSales: { $sum: "$totalPrice" },
              discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
              shipping: { $sum: "$shippingCost" },
              totalQuantity: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] } } } },
              costOfGoods: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] } } } },
              fees: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] } } } },
              tax: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
              profit: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] } } } },
              totalDuties: {
                $sum: {
                  $reduce: {
                    input: "$products",
                    initialValue: 0,
                    in: {
                      $add: [
                        "$$value",
                        { $multiply: [{ $ifNull: ["$$this.capital", 0] }, { $divide: [{ $ifNull: ["$$this.appliedDutiesRate", 0] }, 100] }] }
                      ]
                    }
                  }
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        const data: FinancesReportRow[] = aggregation.map((item: any) => {
          const netSales = (item.grossSales || 0) - (item.discounts || 0);
          const cogs = item.costOfGoods || 0;
          const pureProfit = item.profit || 0;
          const grossProfit = netSales - cogs; 
          
          // Reverse Algebra Ad Spend: Net - (Tax + Fees + Profit + COGS)
          const adSpend = Math.max(0, netSales - (item.fees + item.tax + pureProfit + cogs));

          return {
            date: item._id,
            grossSales: item.grossSales,
            discounts: item.discounts,
            netSales,
            costOfGoods: cogs,
            avgUnitCostPrice: item.totalQuantity > 0 ? Math.round(cogs / item.totalQuantity) : 0,
            duties: Math.round(item.totalDuties || 0),
            fees: item.fees,
            adSpend: Math.round(adSpend),
            shipping: item.shipping,
            grossProfit, 
            netProfit: pureProfit,
            marginPercent: netSales > 0 ? Number(((pureProfit / netSales) * 100).toFixed(2)) : 0,
            roiPercent: cogs > 0 ? Number(((pureProfit / cogs) * 100).toFixed(2)) : 0,
          };
        });

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 B. FBR GST REPORT
      // ================================================================
      else if (slug === "fbr-gst-sales-tax") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: grouping.groupByString,
              netSales: { $sum: { $subtract: ["$totalPrice", { $ifNull: ["$coupon.amount", 0] }] } },
              gstAmount: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
              gstRate: {
                $avg: {
                  $map: {
                    input: "$products",
                    as: "p",
                    in: { $ifNull: ["$$p.appliedGstRate", 0] }
                  }
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        const data: FinancesReportRow[] = aggregation.map((item: any) => ({
          date: item._id,
          netSales: item.netSales,
          appliedGstRate: item.gstRate ? Number(item.gstRate.toFixed(1)) : 0,
          gstAmount: item.gstAmount,
          fbrReference: `FBR-${item._id.replace(/[- :]/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        }));

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 C. PAYMENT ANALYSIS
      // ================================================================
      else if (slug === "payment-breakdown") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
          {
            $group: {
              _id: "$paymentMethod",
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalPrice" },
              gatewayFees: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] } } } },
              feeRate: {
                $avg: {
                  $map: {
                    input: "$products",
                    as: "p",
                    in: { $ifNull: ["$$p.appliedFeeRate", 0] }
                  }
                }
              }
            }
          }
        ]);

        const data: FinancesReportRow[] = aggregation.map((item: any) => ({
          date: `${fromStr} to ${toStr}`,
          method: item._id,
          totalOrders: item.totalOrders,
          totalRevenue: item.totalRevenue,
          appliedFeeRate: item.feeRate ? Number(item.feeRate.toFixed(1)) : 0,
          gatewayFees: item.gatewayFees,
          netReceivable: Math.round(item.totalRevenue - item.gatewayFees)
        }));

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 D. LOSS ANALYSIS (REFUNDS & RTO)
      // ================================================================
      else if (slug === "refunds-rto") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ["Refund Initiated", "RTO"] } } },
          {
            $group: {
              _id: grouping.groupByString,
              refundOrders: { $sum: { $cond: [{ $eq: ["$status", "Refund Initiated"] }, 1, 0] } },
              refundAmount: { $sum: { $cond: [{ $eq: ["$status", "Refund Initiated"] }, "$totalPrice", 0] } },
              rtoOrders: { $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] } },
              rtoLoss: { $sum: { $cond: [{ $eq: ["$status", "RTO"] }, { $multiply: ["$shippingCost", 2] }, 0] } }, 
              avgRtoRate: {
                $avg: {
                  $map: {
                    input: "$products",
                    as: "p",
                    in: { $ifNull: ["$$p.appliedRtoRate", 0] }
                  }
                }
              }
            }
          },
          { $sort: { _id: 1 } }
        ]);

        const data: FinancesReportRow[] = aggregation.map((item: any) => ({
          date: item._id,
          refundOrders: item.refundOrders,
          refundAmount: Math.round(item.refundAmount), 
          rtoOrders: item.rtoOrders,
          appliedRtoRate: item.avgRtoRate ? Number(item.avgRtoRate.toFixed(1)) : 0,
          rtoLoss: Math.round(item.rtoLoss), 
          totalLoss: Math.round(item.refundAmount + item.rtoLoss) 
        }));

        responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
      } else {
        throw new Error("Invalid report slug.");
      }

      await redis.set(cacheKey, safeStringify(responseData), { ex: 300 });
      return { success: true, data: responseData };

    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error(`❌ Finances Report Final Engine Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// ================================================================
// ✅ GLOBAL TOTALS AGGREGATOR (PERCENTAGE RATE EXCLUSION FILTERED)
// ================================================================
function calculateTotals(data: FinancesReportRow[]): Record<string, number> {
  const totals: Record<string, number> = {};
  if (data.length === 0) return totals;

  const keysToExclude = [
    'date', 
    'method', 
    'fbrReference',
    'appliedGstRate', 
    'appliedFeeRate', 
    'appliedRtoRate',
    'marginPercent', 
    'roiPercent',
    'avgUnitCostPrice' 
  ];

  const numericKeys = Object.keys(data[0]).filter(k => !keysToExclude.includes(k));
  
  numericKeys.forEach(key => {
    totals[key] = Math.round(data.reduce((sum, row) => sum + (Number((row as any)[key]) || 0), 0));
  });
  
  return totals;
}