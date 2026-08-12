
// // 📂 src/app/features/admin/reports/actions/getFinancesReportData.ts (MASTER WEIGHTED TOTALS HARDENED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { verifyStaff } from "@/lib/payloadAuth";
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
// import { format, differenceInDays, startOfDay, endOfDay } from "date-fns";

// // ✅ SAFE SERIALIZE UTILITIES
// import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// // ================================================================
// export interface FinancesReportRow {
//   date: string;
//   grossSales?: number;
//   discounts?: number;
//   netSales?: number;
//   shipping?: number;
//   totalRevenue?: number; // Total Cash Received (Net Sales + Shipping = Rs. 9,350)
//   costOfGoods?: number;
//   avgUnitCostPrice?: number;
//   duties?: number;
//   fees?: number;
//   tax?: number;          // FBR GST Tax Collected (Rs. 1,500)
//   adSpend?: number;
//   grossProfit?: number; 
//   targetProfit?: number; // Target Profit BEFORE Coupon (e.g. Rs. 2,000)
//   netProfit?: number;    // Realized Pure Profit AFTER Coupon (e.g. Rs. 1,000)
//   marginPercent?: number;
//   roiPercent?: number;
  
//   // FBR GST
//   appliedGstRate?: number;
//   gstAmount?: number;
//   fbrReference?: string;
  
//   // Payment Analysis
//   method?: string;
//   totalOrders?: number;
//   appliedFeeRate?: number;
//   gatewayFees?: number;
//   netReceivable?: number;
  
//   // Loss Analysis (RTO)
//   refundOrders?: number;
//   refundAmount?: number;
//   rtoOrders?: number;
//   appliedRtoRate?: number;
//   rtoLoss?: number;
//   totalLoss?: number;
// }

// export interface FinancesReportResponse {
//   data: FinancesReportRow[];
//   totals: Record<string, number>;
//   generatedAt: string;
// }

// // ================================================================
// // 🛡️ ATOMIC LOCK CONFIG
// // ================================================================
// const LUA_RELEASE_LOCK = `
//   if redis.call("get", KEYS[1]) == ARGV[1] then
//     return redis.call("del", KEYS[1])
//   else
//     return 0
//   end
// `;

// const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
//   try {
//     const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
//     if (result === 1) console.log(`🔓 Finances Lock released (${requestId}).`);
//   } catch (error) {
//     console.error("❌ Finances Lock release error:", error);
//   }
// };

// // ================================================================
// // 🔧 HELPERS (PKT Timezone Aware Grouping — 31 Days Daily Threshold)
// // ================================================================
// function getDateGrouping(startDate: Date, endDate: Date): {
//   format: string;
//   groupByString: any;
// } {
//   const diffDays = differenceInDays(endDate, startDate) + 1;
//   const timezone = "+05:00"; // Pakistan Time Standard

//   if (diffDays <= 1) {
//     return {
//       format: "yyyy-MM-dd HH:00",
//       groupByString: { $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt", timezone } }
//     };
//   } else if (diffDays <= 31) { 
//     return {
//       format: "yyyy-MM-dd",
//       groupByString: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } }
//     };
//   } else {
//     return {
//       format: "yyyy-MM",
//       groupByString: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone } }
//     };
//   }
// }

// // ================================================================
// // 🚀 MAIN REPORT SERVER ACTION (Weighted Overall Totals Engine)
// // ================================================================
// export async function getFinancesReportData(
//   range: { startDate: Date; endDate: Date },
//   slug: "profit-loss" | "fbr-gst-sales-tax" | "payment-breakdown" | "refunds-rto"
// ): Promise<{ success: boolean; data?: FinancesReportResponse; error?: string }> {
//   const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
//   const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
//   const cacheKey = `analytics_finances_v23_${slug}_${fromStr}_${toStr}`;

//   try {
//     await verifyStaff(["admin", "manager"]);

//     // 1. Cache Read
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<FinancesReportResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log(`⚡ Redis Cache Hit: Finances Report (${slug})`);
//       return { success: true, data: parsed };
//     }

//     // 2. Lock Cache Stampede
//     const LOCK_TTL = 30;
//     const lockKey = `lock:${cacheKey}`;
//     const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

//     if (!lockAcquired) {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const retryCache = await redis.get(cacheKey);
//       const retryParsed = safeParse<FinancesReportResponse>(retryCache as string | null);
//       if (retryParsed) return { success: true, data: retryParsed };
//       return { success: false, error: "Report generation in progress. Refreshing soon..." };
//     }

//     try {
//       await connectMongoose();
//       const start = startOfDay(new Date(range.startDate));
//       const end = endOfDay(new Date(range.endDate));
//       const grouping = getDateGrouping(start, end);
//       let responseData: FinancesReportResponse;

//       // ================================================================
//       // 📊 A. PROFIT & LOSS REPORT
//       // ================================================================
//       if (slug === "profit-loss") {
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
//           {
//             $group: {
//               _id: grouping.groupByString,
//               totalOrders: { $sum: 1 },
//               grossSales: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
//                   }
//                 }
//               },
//               discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
//               netSales: { $sum: "$totalPrice" },
//               shipping: { $sum: "$shippingCost" },
//               totalQuantity: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] } } } },
//               costOfGoods: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] } } } },
//               fees: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] } } } },
//               tax: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
//               targetProfit: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.targetProfit", { $ifNull: ["$$this.profit", 0] }] }] }
//                   }
//                 }
//               },
//               pureProfit: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] }
//                   }
//                 }
//               },
//               totalDuties: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: {
//                       $add: [
//                         "$$value",
//                         { $multiply: [{ $ifNull: ["$$this.capital", 0] }, { $divide: [{ $ifNull: ["$$this.appliedDutiesRate", 0] }, 100] }] }
//                       ]
//                     }
//                   }
//                 }
//               },
//               totalAdSpend: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: {
//                       $add: [
//                         "$$value",
//                         { $multiply: [{ $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }, { $divide: [{ $ifNull: ["$$this.appliedAdSpendRate", 0] }, 100] }] }
//                       ]
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           { $sort: { _id: 1 } }
//         ]);

//         const data: FinancesReportRow[] = aggregation.map((item: any) => {
//           const grossSales = item.grossSales || 0;
//           const discounts = item.discounts || 0;
//           const productNetSales = grossSales - discounts; 
//           const shipping = item.shipping || 0;             
//           const totalRevenue = productNetSales + shipping;  

//           const cogs = item.costOfGoods || 0;
//           const grossProfit = grossSales - cogs; 
          
//           const targetProfit = item.targetProfit || 0; 
//           const pureProfit = item.pureProfit || 0;     
//           const fees = item.fees || 0;
//           const tax = item.tax || 0;

//           return {
//             date: item._id,
//             totalOrders: item.totalOrders || 0,
//             grossSales,
//             discounts,
//             netSales: productNetSales,
//             shipping,
//             totalRevenue,
//             costOfGoods: cogs,
//             avgUnitCostPrice: item.totalQuantity > 0 ? Math.round(cogs / item.totalQuantity) : 0,
//             duties: Math.round(item.totalDuties || 0),
//             fees,
//             tax, 
//             adSpend: Math.round(item.totalAdSpend || 0),
//             grossProfit, 
//             targetProfit,
//             netProfit: pureProfit,
//             marginPercent: productNetSales > 0 ? Number(((pureProfit / productNetSales) * 100).toFixed(1)) : 0,
//             roiPercent: cogs > 0 ? Number(((pureProfit / cogs) * 100).toFixed(1)) : 0,
//           };
//         });

//         responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
//       }

//       // ================================================================
//       // 📊 B. FBR GST REPORT
//       // ================================================================
//       else if (slug === "fbr-gst-sales-tax") {
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
//           {
//             $group: {
//               _id: grouping.groupByString,
//               grossSales: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
//                   }
//                 }
//               },
//               discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
//               gstAmount: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
//               gstRate: {
//                 $avg: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.appliedGstRate", 0] }] }
//                   }
//                 }
//               }
//             }
//           },
//           { $sort: { _id: 1 } }
//         ]);

//         const data: FinancesReportRow[] = aggregation.map((item: any) => {
//           const grossSales = item.grossSales || 0;
//           const discounts = item.discounts || 0;
//           const netSales = grossSales - discounts;

//           return {
//             date: item._id,
//             grossSales,
//             discounts,
//             netSales,
//             appliedGstRate: item.gstRate ? Number(item.gstRate.toFixed(1)) : 15.0,
//             gstAmount: item.gstAmount || 0,
//             fbrReference: `FBR-${item._id.replace(/[- :]/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
//           };
//         });

//         responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
//       }

//       // ================================================================
//       // 📊 C. PAYMENT ANALYSIS
//       // ================================================================
//       else if (slug === "payment-breakdown") {
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
//           {
//             $group: {
//               _id: "$paymentMethod",
//               totalOrders: { $sum: 1 },
//               totalRevenue: { $sum: "$totalPrice" },
//               gatewayFees: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] } } } },
//               feeRate: {
//                 $avg: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.appliedFeeRate", 0] }] }
//                   }
//                 }
//               }
//             }
//           }
//         ]);

//         const data: FinancesReportRow[] = aggregation.map((item: any) => ({
//           date: `${fromStr} to ${toStr}`,
//           method: item._id ? String(item._id).toUpperCase() : "COD",
//           totalOrders: item.totalOrders,
//           totalRevenue: item.totalRevenue,
//           appliedFeeRate: item.feeRate ? Number(item.feeRate.toFixed(1)) : 3.0,
//           gatewayFees: item.gatewayFees,
//           netReceivable: Math.round(item.totalRevenue - item.gatewayFees)
//         }));

//         responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
//       }

//       // ================================================================
//       // 📊 D. LOSS ANALYSIS (REFUNDS & RTO)
//       // ================================================================
//       else if (slug === "refunds-rto") {
//         const aggregation = await Order.aggregate([
//           { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ["Refund Initiated", "RTO"] } } },
//           {
//             $group: {
//               _id: grouping.groupByString,
//               refundOrders: { $sum: { $cond: [{ $eq: ["$status", "Refund Initiated"] }, 1, 0] } },
//               refundAmount: { $sum: { $cond: [{ $eq: ["$status", "Refund Initiated"] }, "$totalPrice", 0] } },
//               rtoOrders: { $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] } },
//               rtoLoss: { $sum: { $cond: [{ $eq: ["$status", "RTO"] }, { $multiply: ["$shippingCost", 2] }, 0] } }, 
//               avgRtoRate: {
//                 $avg: {
//                   $map: {
//                     input: "$products",
//                     as: "p",
//                     in: { $ifNull: ["$$p.appliedRtoRate", 0] }
//                   }
//                 }
//               }
//             }
//           },
//           { $sort: { _id: 1 } }
//         ]);

//         const data: FinancesReportRow[] = aggregation.map((item: any) => ({
//           date: item._id,
//           refundOrders: item.refundOrders,
//           refundAmount: Math.round(item.refundAmount), 
//           rtoOrders: item.rtoOrders,
//           appliedRtoRate: item.avgRtoRate ? Number(item.avgRtoRate.toFixed(1)) : 0,
//           rtoLoss: Math.round(item.rtoLoss), 
//           totalLoss: Math.round(item.refundAmount + item.rtoLoss) 
//         }));

//         responseData = { data, totals: calculateTotals(data), generatedAt: new Date().toISOString() };
//       } else {
//         throw new Error("Invalid report slug.");
//       }

//       await redis.set(cacheKey, safeStringify(responseData), { ex: 300 });
//       return { success: true, data: responseData };

//     } finally {
//       await releaseLock(lockKey, requestId);
//     }
//   } catch (error: any) {
//     console.error(`❌ Finances Report Final Engine Error:`, error.message);
//     return { success: false, error: error.message };
//   }
// }

// // ================================================================
// // ✅ GLOBAL TOTALS AGGREGATOR (With Weighted Storewide Ratios)
// // ================================================================
// function calculateTotals(data: FinancesReportRow[]): Record<string, number> {
//   const totals: Record<string, number> = {};
//   if (data.length === 0) return totals;

//   const keysToExclude = [
//     'date', 
//     'method', 
//     'fbrReference',
//     'appliedGstRate', 
//     'appliedFeeRate', 
//     'appliedRtoRate',
//     'marginPercent', 
//     'roiPercent',
//     'avgUnitCostPrice' 
//   ];

//   const numericKeys = Object.keys(data[0]).filter(k => !keysToExclude.includes(k));
  
//   // 1. Sum up all numeric keys
//   numericKeys.forEach(key => {
//     totals[key] = Math.round(data.reduce((sum, row) => sum + (Number((row as any)[key]) || 0), 0));
//   });

//   // 2. ✅ HARDENED: Compute Weighted Storewide Ratios for Totals Footer Row!
//   const totalNetSales = totals.netSales || totals.totalRevenue || 0;
//   const totalPureProfit = totals.netProfit || 0;
//   const totalCogs = totals.costOfGoods || 0;

//   if (totalNetSales > 0 && totalPureProfit !== undefined) {
//     totals.marginPercent = Number(((totalPureProfit / totalNetSales) * 100).toFixed(1));
//   }

//   if (totalCogs > 0 && totalPureProfit !== undefined) {
//     totals.roiPercent = Number(((totalPureProfit / totalCogs) * 100).toFixed(1));
//   }

//   return totals;
// }
// 📂 src/app/features/admin/reports/actions/getFinancesReportData.ts

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { format, startOfDay, endOfDay } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeStringify, safeParse } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE (Option 1 Path)
import {
  buildFinancesReportMatrix,
  UnifiedFinancesReportRow,
} from "@/app/features/admin/shared/engines/financialsEngine";

// ================================================================
// ✅ TYPES (Strictly Aligned with reportConfigs.ts)
// ================================================================
export interface FinancesReportRow {
  date: string;
  grossSales?: number;
  discounts?: number;
  netSales?: number;
  shipping?: number;
  totalRevenue?: number;
  costOfGoods?: number;
  avgUnitCostPrice?: number;
  duties?: number;
  fees?: number;
  tax?: number;
  adSpend?: number;
  grossProfit?: number; 
  targetProfit?: number;
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
// 🚀 MAIN REPORT COMPILER (Financial P&L Core)
// ================================================================
export async function getFinancesReportData(
  range: { startDate: Date; endDate: Date },
  slug: "profit-loss" | "fbr-gst-sales-tax" | "payment-breakdown" | "refunds-rto"
): Promise<{ success: boolean; data?: FinancesReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_finances_v24_${slug}_${fromStr}_${toStr}`;

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
      let responseData: FinancesReportResponse;

      // ================================================================
      // 📊 A. P&L, GST TAX, PAYMENTS REPORTS (CENTRAL ENGINE DELEGATED)
      // ================================================================
      if (slug === "profit-loss" || slug === "fbr-gst-sales-tax" || slug === "payment-breakdown") {
        const engineResult = await buildFinancesReportMatrix(
          { startDate: start, endDate: end },
          slug
        );

        const data: FinancesReportRow[] = engineResult.data.map((item: UnifiedFinancesReportRow) => ({
          date: item.date,
          grossSales: item.grossSales,
          discounts: item.discounts,
          netSales: item.netSales,
          shipping: item.shipping,
          totalRevenue: item.totalRevenue,
          costOfGoods: item.costOfGoods,
          avgUnitCostPrice: item.avgUnitCostPrice,
          duties: item.duties,
          fees: item.fees,
          tax: item.tax,
          adSpend: item.adSpend,
          grossProfit: item.grossProfit,
          targetProfit: item.targetProfit,
          netProfit: item.netProfit,
          marginPercent: item.marginPercent,
          roiPercent: item.roiPercent,
          appliedGstRate: item.appliedGstRate,
          gstAmount: item.gstAmount,
          fbrReference: item.fbrReference,
          method: item.method,
          totalOrders: item.totalOrders,
          appliedFeeRate: item.appliedFeeRate,
          gatewayFees: item.gatewayFees,
          netReceivable: item.netReceivable,
        }));

        responseData = {
          data,
          totals: engineResult.totals,
          generatedAt: engineResult.generatedAt,
        };
      }

      // ================================================================
      // 📊 B. LOSS ANALYSIS (REFUNDS & RTO)
      // ================================================================
      else if (slug === "refunds-rto") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ["Refund Initiated", "RTO"] } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:00" } },
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
// ✅ GLOBAL TOTALS AGGREGATOR
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

  const totalNetSales = totals.netSales || totals.totalRevenue || 0;
  const totalPureProfit = totals.netProfit || 0;
  const totalCogs = totals.costOfGoods || 0;

  if (totalNetSales > 0 && totalPureProfit !== undefined) {
    totals.marginPercent = Number(((totalPureProfit / totalNetSales) * 100).toFixed(1));
  }
  if (totalCogs > 0 && totalPureProfit !== undefined) {
    totals.roiPercent = Number(((totalPureProfit / totalCogs) * 100).toFixed(1));
  }

  return totals;
}