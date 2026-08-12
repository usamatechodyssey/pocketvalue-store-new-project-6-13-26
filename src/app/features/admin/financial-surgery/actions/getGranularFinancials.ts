// // 📂 src/app/features/admin/financial-surgery/actions/getGranularFinancials.ts (SEPARATE RTO BUCKETS HARDENED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { format } from "date-fns";
// import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// // ✅ SAFE SERIALIZATION
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // 👑 COMPLETE FINANCIAL ANATOMY INTERFACE (Separate RTO Buckets)
// // ================================================================
// export interface GranularFinancialsResult {
//   originalPrice: number;
//   avgUnitCostPrice: number;
//   totalItemsSold: number;
//   adSpend: number;
//   platformFees: number;
//   taxes: number;
//   duties: number;
//   actualRtoLoss: number; // ✅ Actual Realized RTO Courier Penalty (e.g. Rs. 800)
//   rtoLoss: number;       // ✅ Snapshotted RTO Risk Reserve Buffer (e.g. Rs. 7,300)
//   operationalExpenses: number;
//   shipping: number;
//   targetProfit: number; // Target Profit BEFORE Coupon (e.g. Rs. 14,600)
//   pureProfit: number;   // Realized Pure Profit AFTER Coupon (e.g. Rs. 12,600)
//   grossTotal: number;   // MSRP Gross Product Sales (Rs. 73,000)
//   discounts: number;    // Total Promo Burn (Rs. 2,000)
//   netRevenue: number;   // Net Product Sales (Rs. 71,000)
//   marginPercent: number;
//   roiPercent: number;
//   // Dynamic Simulator Controls (For Interactive Slider UI)
//   pricingTiers?: Array<{ minCost: number; maxCost: number; profitPercent: number; adSpendPercent: number }>;
//   gstPercent?: number;
//   dutiesPercent?: number;
//   fixedFeePercent?: number;
// }

// // ================================================================
// // 🛡️ ATOMIC LOCK RELEASE
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
//     if (result === 1) console.log(`🔓 Financials Lock released (${requestId}).`);
//   } catch (error) {
//     console.error("Financials Lock release error:", error);
//   }
// };

// interface DateRange {
//   from: Date;
//   to: Date;
//   startDate: Date;
//   endDate: Date;
//   compareStartDate: Date;
//   compareEndDate: Date;
//   compare: boolean;
// }

// // ================================================================
// // 🚀 MAIN FINANCIAL SURGERY ACTION
// // ================================================================
// export async function getGranularFinancialsPayload(
//   range: DateRange
// ): Promise<GranularFinancialsResult | null> {
//   const cacheKey = `analytics_financials_v13:${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}:compare_${range.compare}`;

//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     // 1. Cache Read
//     const cachedData = (await redis.get(cacheKey)) as string | null;
//     const parsed = safeParse<GranularFinancialsResult>(cachedData);
//     if (parsed) {
//       console.log("⚡ Redis Cache Hit: Granular Financials");
//       return parsed;
//     }

//     // 2. Lock Acquire
//     const LOCK_TTL = 30;
//     const lockKey = `lock:${cacheKey}`;
//     const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

//     if (!lockAcquired) {
//       console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const retryCache = (await redis.get(cacheKey)) as string | null;
//       const retryParsed = safeParse<GranularFinancialsResult>(retryCache);
//       if (retryParsed) return retryParsed;
//       return null;
//     }

//     try {
//       console.log("🔒 Financials Lock acquired. Generating pure snapshot financial surgery...");

//       let settings: any = {};
//       try {
//         settings = await getCachedSettings();
//       } catch (e) {
//         settings = {};
//       }

//       const globalFeesArray = settings.globalFixedFees || [];
//       const fixedFeePercent = globalFeesArray.reduce((sum: number, fee: any) => sum + (fee.percentage || 0), 0);
//       const gstPercent = settings.taxSettings?.standardGstPercent ?? 0;
//       const dutiesPercent = settings.pricingSettings?.estimatedDutiesPercent ?? 0;

//       // ================================================================
//       // 📊 3. PURE SNAPSHOT AGGREGATION & ACTUAL RTO LOSS LOOKUP
//       // ================================================================
//       const [financials, actualRtoAgg] = await Promise.all([
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: range.startDate, $lte: range.endDate },
//               status: { $in: REVENUE_STATUSES },
//             },
//           },
//           {
//             $group: {
//               _id: null,
//               grossSales: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
//                   }
//                 }
//               },
//               totalShipping: { $sum: "$shippingCost" },
//               totalDiscounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
//               totalQuantity: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] },
//                   },
//                 },
//               },
//               targetProfit: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.targetProfit", { $ifNull: ["$$this.profit", 0] }] }] },
//                   },
//                 },
//               },
//               pureProfit: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
//                   },
//                 },
//               },
//               totalFees: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] },
//                   },
//                 },
//               },
//               totalTax: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] },
//                   },
//                 },
//               },
//               totalCapital: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] },
//                   },
//                 },
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
//               },
//               totalRtoReserve: {
//                 $sum: {
//                   $reduce: {
//                     input: "$products",
//                     initialValue: 0,
//                     in: {
//                       $add: [
//                         "$$value",
//                         {
//                           $multiply: [
//                             { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] },
//                             { $divide: [{ $ifNull: ["$$this.appliedRtoRate", 0] }, 100] }
//                           ]
//                         }
//                       ]
//                     }
//                   }
//                 }
//               },
//             },
//           },
//         ]),
//         // ✅ ACTUAL REALIZED RTO LOSS AGGREGATED (Double Shipping Penalty on RTO status orders)
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: range.startDate, $lte: range.endDate },
//               status: "RTO",
//             },
//           },
//           {
//             $group: {
//               _id: null,
//               actualRtoLoss: { $sum: { $multiply: ["$shippingCost", 2] } },
//             },
//           },
//         ]),
//       ]);

//       const result = financials[0] || {
//         grossSales: 0,
//         totalShipping: 0,
//         totalDiscounts: 0,
//         totalQuantity: 0,
//         targetProfit: 0,
//         pureProfit: 0,
//         totalFees: 0,
//         totalTax: 0,
//         totalCapital: 0,
//         totalDuties: 0,
//         totalRtoReserve: 0,
//         totalAdSpend: 0,
//       };

//       const actualRtoLoss = actualRtoAgg[0]?.actualRtoLoss || 0; // e.g. Rs. 800

//       const grossSales = result.grossSales || 0;
//       const discounts = result.totalDiscounts || 0;
//       const netSales = grossSales - discounts;

//       const cogs = result.totalCapital || 0;
//       const targetProfit = result.targetProfit || 0;
//       const pureProfit = result.pureProfit || 0;
      
//       const totalFees = result.totalFees || 0;
//       const totalTax = result.totalTax || 0;
//       const totalDuties = Math.round(result.totalDuties || 0);
//       const totalRtoReserve = Math.round(result.totalRtoReserve || 0); // e.g. Rs. 7,300
//       const totalAdSpend = Math.round(result.totalAdSpend || 0);
//       const totalItemsSold = result.totalQuantity || 0;

//       const avgUnitCostPrice = totalItemsSold > 0 ? Math.round(cogs / totalItemsSold) : 0;
//       const operationalExpenses = Math.round(totalFees + totalTax + totalDuties + totalAdSpend);

//       const marginPercent = netSales > 0 ? (pureProfit / netSales) * 100 : 0;
//       const roiPercent = cogs > 0 ? (pureProfit / cogs) * 100 : 0;

//       const financialsResult: GranularFinancialsResult = {
//         originalPrice: cogs,
//         avgUnitCostPrice,
//         totalItemsSold,
//         adSpend: totalAdSpend,
//         platformFees: totalFees,
//         taxes: totalTax,
//         duties: totalDuties,
//         actualRtoLoss,                // ✅ Actual RTO Courier Penalty (e.g. Rs. 800)
//         rtoLoss: totalRtoReserve,    // ✅ RTO Risk Reserve Buffer (e.g. Rs. 7,300)
//         operationalExpenses,
//         shipping: result.totalShipping,
//         targetProfit,
//         pureProfit,
//         grossTotal: grossSales,
//         discounts,
//         netRevenue: netSales,
//         marginPercent: Number(marginPercent.toFixed(1)),
//         roiPercent: Number(roiPercent.toFixed(1)),
//         pricingTiers: settings.pricingLogicTiers || [],
//         gstPercent,
//         dutiesPercent,
//         fixedFeePercent,
//       };

//       const stringified = safeStringify(financialsResult);
//       await redis.set(cacheKey, stringified, { ex: 600 });

//       return financialsResult;
//     } finally {
//       await releaseLock(lockKey, requestId);
//     }
//   } catch (error: any) {
//     console.error("Financial Surgery Error:", error.message);
//     return null;
//   }
// }
// 📂 src/app/features/admin/financial-surgery/actions/getGranularFinancials.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ SAFE SERIALIZATION
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildGranularFinancialsMatrix,
  UnifiedGranularFinancialsResult,
} from "@/app/features/admin/shared/engines/financialsEngine";

// ================================================================
// 👑 COMPLETE FINANCIAL ANATOMY INTERFACE (Separate RTO Buckets)
// ================================================================
export interface GranularFinancialsResult {
  originalPrice: number;
  avgUnitCostPrice: number;
  totalItemsSold: number;
  adSpend: number;
  platformFees: number;
  taxes: number;
  duties: number;
  actualRtoLoss: number;
  rtoLoss: number;
  operationalExpenses: number;
  shipping: number;
  targetProfit: number;
  pureProfit: number;
  grossTotal: number;
  discounts: number;
  netRevenue: number;
  marginPercent: number;
  roiPercent: number;
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
  const cacheKey = `analytics_financials_v14:${format(range.startDate, "yyyy-MM-dd")}_${format(range.endDate, "yyyy-MM-dd")}:compare_${range.compare}`;

  let lockKey = '';
  let requestId = '';

  try {
    await verifyAdminAccess();

    lockKey = `lock:${cacheKey}`;
    requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Cache Read
    const cachedData = (await redis.get(cacheKey)) as string | null;
    const parsed = safeParse<GranularFinancialsResult>(cachedData);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Granular Financials (Central Engine)");
      return parsed;
    }

    // 2. Lock Acquire
    const LOCK_TTL = 30;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = (await redis.get(cacheKey)) as string | null;
      const retryParsed = safeParse<GranularFinancialsResult>(retryCache);
      if (retryParsed) return retryParsed;
      return null;
    }

    try {
      console.log("🔒 Financials Lock acquired. Delegating to Central shared Financial Surgery Engine...");

      // 3. Delegate to Central Shared Engine
      const engineResult = await buildGranularFinancialsMatrix({
        startDate: range.startDate,
        endDate: range.endDate,
      });

      if (!engineResult) return null;

      const response: GranularFinancialsResult = {
        originalPrice: engineResult.originalPrice,
        avgUnitCostPrice: engineResult.avgUnitCostPrice,
        totalItemsSold: engineResult.totalItemsSold,
        adSpend: engineResult.adSpend,
        platformFees: engineResult.platformFees,
        taxes: engineResult.taxes,
        duties: engineResult.duties,
        actualRtoLoss: engineResult.actualRtoLoss,
        rtoLoss: engineResult.rtoLoss,
        operationalExpenses: engineResult.operationalExpenses,
        shipping: engineResult.shipping,
        targetProfit: engineResult.targetProfit,
        pureProfit: engineResult.pureProfit,
        grossTotal: engineResult.grossTotal,
        discounts: engineResult.discounts,
        netRevenue: engineResult.netRevenue,
        marginPercent: engineResult.marginPercent,
        roiPercent: engineResult.roiPercent,
        pricingTiers: engineResult.pricingTiers,
        gstPercent: engineResult.gstPercent,
        dutiesPercent: engineResult.dutiesPercent,
        fixedFeePercent: engineResult.fixedFeePercent,
      };

      // 4. Cache Write
      const stringified = safeStringify(response);
      await redis.set(cacheKey, stringified, { ex: 600 });
      console.log("✅ Granular Financials Cached successfully.");

      return response;
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Financial Surgery Error:", error.message);
    return null;
  }
}