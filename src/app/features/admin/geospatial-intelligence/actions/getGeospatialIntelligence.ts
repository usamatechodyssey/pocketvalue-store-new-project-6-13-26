// // 📂 src/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence.ts (RTO REVENUE ISOLATED & HARDENED)

// "use server";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order from "@/models/Order";
// import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// import { format, subDays, differenceInDays } from "date-fns";
// import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
// import { getCachedSettings } from "@/app/shared/lib/cache/settings";
// import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// // ✅ SAFE SERIALIZE UTILITIES
// import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// export interface GeospatialCityData {
//   city: string;
//   province: string;
//   lat: number | null;
//   lng: number | null;
//   revenue: number;
//   orders: number;
//   aov: number;
//   growth: number;
//   trend: "STAR" | "FALLING" | "STABLE";
//   rtoRate: number;
//   isHighPotential: boolean;
// }

// export interface GeospatialProvinceData {
//   province: string;
//   revenue: number;
//   orders: number;
//   cities: number;
//   growth: number;
//   rtoRate: number;
//   topCities: string[];
// }

// export interface CourierPerformanceItem {
//   city: string;
//   courier: string;
//   total: number;
//   delivered: number;
//   rto: number;
//   successRate: number;
//   rtoRate: number;
//   avgDeliveryTimeDays: number | null;
// }

// export interface DistanceBucket {
//   bucketLabel: string;
//   totalOrders: number;
//   rtoRate: number;
//   avgDistance: number;
//   totalRevenue: number;
// }

// export interface GeospatialResponse {
//   cities: GeospatialCityData[];
//   provinces: GeospatialProvinceData[];
//   summary: {
//     totalRevenue: number;
//     totalOrders: number;
//     totalCities: number;
//     totalProvinces: number;
//     topCity: string;
//     topProvince: string;
//   };
//   settings: {
//     highPotentialRevenue: number;
//     highPotentialRto: number;
//     topCityLimit: number;
//   };
//   logistics: {
//     courierPerformance: CourierPerformanceItem[];
//     distanceAnalysis: DistanceBucket[];
//   };
//   generatedAt: string;
// }

// // ================================================================
// // 🛡️ ATOMIC LOCK RELEASE & HELPERS
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
//     if (result === 1) console.log(`🔓 Geospatial Lock released (${requestId}).`);
//   } catch (error) {
//     console.error("Geospatial Lock release error:", error);
//   }
// };

// const getTrend = (growth: number): "STAR" | "FALLING" | "STABLE" => {
//   if (growth > 15) return "STAR";
//   if (growth < -15) return "FALLING";
//   return "STABLE";
// };

// // ✅ PROVINCE AUTO-RESOLVER (Eliminates UNKNOWN_PROVINCE)
// const resolveProvince = (city: string, rawProvince?: string): string => {
//   if (rawProvince && rawProvince !== "UNKNOWN_PROVINCE" && rawProvince.trim().length > 0) {
//     return rawProvince.toUpperCase();
//   }
//   const c = city.toUpperCase();
//   if (["KARACHI", "HYDERABAD", "SUKKUR", "LARKANA"].some((p) => c.includes(p))) return "SINDH";
//   if (["LAHORE", "RAWALPINDI", "FAISALABAD", "MULTAN", "SIALKOT", "GUJRANWALA", "BAHAWALPUR", "SARGODHA"].some((p) => c.includes(p))) return "PUNJAB";
//   if (["ISLAMABAD"].some((p) => c.includes(p))) return "ICT";
//   if (["PESHAWAR", "ABBOTTABAD", "MARDAN", "SWAT"].some((p) => c.includes(p))) return "KPK";
//   if (["QUETTA", "GWADAR", "TURBAT"].some((p) => c.includes(p))) return "BALOCHISTAN";
//   if (["GILGIT", "SKARDU"].some((p) => c.includes(p))) return "GILGIT-BALTISTAN";
//   if (["MUZAFFARABAD", "MIRPUR"].some((p) => c.includes(p))) return "AJK";
//   return "OTHERS";
// };

// // ================================================================
// // 🚀 MAIN EXPORT
// // ================================================================
// export async function getGeospatialIntelligencePayload(
//   range: { from: Date; to: Date },
//   filters?: { province?: string; search?: string }
// ): Promise<GeospatialResponse> {
//   const fromStr = format(range.from, "yyyy-MM-dd");
//   const toStr = format(range.to, "yyyy-MM-dd");
//   const provinceFilter = filters?.province || "all";
//   const searchFilter = filters?.search?.trim().toLowerCase() || "";
//   const cacheKey = `analytics_geospatial_v6:${fromStr}_${toStr}:prov_${provinceFilter}:search_${searchFilter}`;

//   try {
//     await verifyAdminAccess();
//     await connectMongoose();

//     // ✅ 1. Cache Check
//     const cachedData = await redis.get(cacheKey);
//     const parsed = safeParse<GeospatialResponse>(cachedData as string | null);
//     if (parsed) {
//       console.log("⚡ Redis Cache Hit: Geospatial Intelligence");
//       return parsed;
//     }

//     // ✅ 2. Cache Stampede Protection
//     const LOCK_TTL = 30;
//     const lockKey = `lock:${cacheKey}`;
//     const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

//     if (!lockAcquired) {
//       await new Promise((resolve) => setTimeout(resolve, 500));
//       const retryCache = await redis.get(cacheKey);
//       const retryParsed = safeParse<GeospatialResponse>(retryCache as string | null);
//       if (retryParsed) {
//         console.log("⚡ Served stale geospatial cache.");
//         return retryParsed;
//       }
//       return {
//         cities: [],
//         provinces: [],
//         summary: {
//           totalRevenue: 0,
//           totalOrders: 0,
//           totalCities: 0,
//           totalProvinces: 0,
//           topCity: "N/A",
//           topProvince: "N/A",
//         },
//         settings: { highPotentialRevenue: 50000, highPotentialRto: 10, topCityLimit: 10 },
//         logistics: { courierPerformance: [], distanceAnalysis: [] },
//         generatedAt: new Date().toISOString(),
//       };
//     }

//     try {
//       console.log(`🔒 Geospatial Lock acquired (${requestId}). Generating intelligence...`);

//       let settings: any = {};
//       try {
//         settings = await getCachedSettings();
//       } catch (e) {
//         settings = {};
//       }
//       const highPotentialRevenue = settings?.geospatial?.highPotentialRevenue ?? 50000;
//       const highPotentialRto = settings?.geospatial?.highPotentialRto ?? 10;
//       const topCityLimit = settings?.geospatial?.topCityLimit ?? 10;

//       const daysDiff = differenceInDays(range.to, range.from) + 1;
//       const prevFrom = subDays(range.from, daysDiff);
//       const prevTo = subDays(range.to, daysDiff);

//       // Status query includes RTO to accurately compute rtoRate
//       const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO"]));

//       // ================================================================
//       // 🚀 PARALLEL AGGREGATIONS (RTO REVENUE ISOLATED)
//       // ================================================================
//       const [cityData, prevCityData, courierPerformance, distanceAnalysis] = await Promise.all([
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: range.from, $lte: range.to },
//               status: { $in: STATUS_QUERY },
//             },
//           },
//           {
//             $group: {
//               _id: {
//                 city: { $toUpper: "$shippingAddress.city" },
//                 province: { $toUpper: "$shippingAddress.province" },
//               },
//               // ✅ CRITICAL FIX: Sum revenue ONLY if status belongs to REVENUE_STATUSES (Excludes RTO)
//               revenue: {
//                 $sum: {
//                   $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0],
//                 },
//               },
//               orders: { $sum: 1 },
//               rtoOrders: {
//                 $sum: {
//                   $cond: [{ $eq: ["$status", "RTO"] }, 1, 0],
//                 },
//               },
//               lat: { $first: "$shippingAddress.lat" },
//               lng: { $first: "$shippingAddress.lng" },
//             },
//           },
//         ]),
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: prevFrom, $lte: prevTo },
//               status: { $in: STATUS_QUERY },
//             },
//           },
//           {
//             $group: {
//               _id: {
//                 city: { $toUpper: "$shippingAddress.city" },
//               },
//               // ✅ CRITICAL FIX: Sum revenue ONLY for REVENUE_STATUSES
//               revenue: {
//                 $sum: {
//                   $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0],
//                 },
//               },
//               orders: { $sum: 1 },
//             },
//           },
//         ]),
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: range.from, $lte: range.to },
//               status: { $in: STATUS_QUERY },
//               "shipments.0": { $exists: true },
//             },
//           },
//           { $unwind: "$shipments" },
//           {
//             $group: {
//               _id: {
//                 city: { $toUpper: "$shippingAddress.city" },
//                 courier: "$shipments.courier",
//               },
//               total: { $sum: 1 },
//               delivered: {
//                 $sum: {
//                   $cond: [{ $eq: ["$shipments.status", "Delivered"] }, 1, 0],
//                 },
//               },
//               rto: {
//                 $sum: {
//                   $cond: [{ $eq: ["$shipments.status", "RTO"] }, 1, 0],
//                 },
//               },
//               totalDeliveryTimeMs: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $and: [
//                         { $eq: ["$shipments.status", "Delivered"] },
//                         { $ne: ["$shipments.deliveredAt", null] },
//                         { $ne: ["$shipments.createdAt", null] },
//                       ],
//                     },
//                     {
//                       $subtract: [
//                         { $toDate: "$shipments.deliveredAt" },
//                         { $toDate: "$shipments.createdAt" },
//                       ],
//                     },
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//           {
//             $project: {
//               city: "$_id.city",
//               courier: "$_id.courier",
//               total: 1,
//               delivered: 1,
//               rto: 1,
//               successRate: {
//                 $cond: [
//                   { $eq: ["$total", 0] },
//                   0,
//                   { $multiply: [{ $divide: ["$delivered", "$total"] }, 100] },
//                 ],
//               },
//               rtoRate: {
//                 $cond: [
//                   { $eq: ["$total", 0] },
//                   0,
//                   { $multiply: [{ $divide: ["$rto", "$total"] }, 100] },
//                 ],
//               },
//               avgDeliveryTimeDays: {
//                 $cond: [
//                   { $eq: ["$delivered", 0] },
//                   null,
//                   {
//                     $divide: [
//                       { $divide: ["$totalDeliveryTimeMs", "$delivered"] },
//                       1000 * 60 * 60 * 24,
//                     ],
//                   },
//                 ],
//               },
//             },
//           },
//           { $sort: { city: 1, total: -1 } },
//         ]),
//         Order.aggregate([
//           {
//             $match: {
//               createdAt: { $gte: range.from, $lte: range.to },
//             },
//           },
//           {
//             $bucket: {
//               groupBy: { $ifNull: ["$warehouseDistance", 10] },
//               boundaries: [0, 50, 100, 200, 500],
//               default: "500+",
//               output: {
//                 totalOrders: { $sum: 1 },
//                 rtoOrders: {
//                   $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] },
//                 },
//                 avgDistance: { $avg: { $ifNull: ["$warehouseDistance", 10] } },
//                 // ✅ CRITICAL FIX: Sum revenue ONLY for valid REVENUE_STATUSES
//                 totalRevenue: {
//                   $sum: {
//                     $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0],
//                   },
//                 },
//               },
//             },
//           },
//           {
//             $project: {
//               bucketLabel: {
//                 $switch: {
//                   branches: [
//                     { case: { $eq: ["$_id", 0] }, then: "0-50 km" },
//                     { case: { $eq: ["$_id", 50] }, then: "50-100 km" },
//                     { case: { $eq: ["$_id", 100] }, then: "100-200 km" },
//                     { case: { $eq: ["$_id", 200] }, then: "200-500 km" },
//                   ],
//                   default: "500+ km",
//                 },
//               },
//               totalOrders: 1,
//               rtoRate: {
//                 $cond: [
//                   { $eq: ["$totalOrders", 0] },
//                   0,
//                   { $multiply: [{ $divide: ["$rtoOrders", "$totalOrders"] }, 100] },
//                 ],
//               },
//               avgDistance: { $round: ["$avgDistance", 1] },
//               totalRevenue: 1,
//             },
//           },
//           { $sort: { _id: 1 } },
//         ]),
//       ]);

//       // ✅ 4. Build Previous Sales Map
//       const prevMap = new Map(
//         prevCityData.map((i: any) => [i._id.city, { revenue: i.revenue, orders: i.orders }])
//       );

//       // ✅ 5. Build City List
//       const provinceMap = new Map<
//         string,
//         { revenue: number; orders: number; cities: Set<string>; rtoOrders: number }
//       >();
//       const cityList: GeospatialCityData[] = [];

//       for (const item of cityData) {
//         const city = item._id.city || "UNKNOWN";
//         const province = resolveProvince(city, item._id.province);
//         const revenue = item.revenue || 0;
//         const orders = item.orders || 0;
//         const rtoOrders = item.rtoOrders || 0;
//         const lat = item.lat || null;
//         const lng = item.lng || null;

//         const prev = prevMap.get(city);
//         const prevRevenue = prev?.revenue || 0;
//         const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : revenue > 0 ? 100 : 0;
//         const aov = orders > 0 ? revenue / orders : 0;
//         const rtoRate = orders > 0 ? (rtoOrders / orders) * 100 : 0;
//         const isHighPotential = revenue > highPotentialRevenue && rtoRate < highPotentialRto;

//         cityList.push({
//           city,
//           province,
//           lat,
//           lng,
//           revenue,
//           orders,
//           aov: Number(aov.toFixed(2)),
//           growth: Number(growth.toFixed(1)),
//           trend: getTrend(growth),
//           rtoRate: Number(rtoRate.toFixed(1)),
//           isHighPotential,
//         });

//         if (!provinceMap.has(province)) {
//           provinceMap.set(province, { revenue: 0, orders: 0, cities: new Set(), rtoOrders: 0 });
//         }
//         const pData = provinceMap.get(province)!;
//         pData.revenue += revenue;
//         pData.orders += orders;
//         pData.cities.add(city);
//         pData.rtoOrders += rtoOrders;
//       }

//       // ✅ 6. Apply Search & Province Filters
//       let filteredCities = cityList;
//       if (provinceFilter !== "all") {
//         filteredCities = filteredCities.filter((c) => c.province === provinceFilter.toUpperCase());
//       }
//       if (searchFilter) {
//         filteredCities = filteredCities.filter(
//           (c) => c.city.toLowerCase().includes(searchFilter) || c.province.toLowerCase().includes(searchFilter)
//         );
//       }
//       filteredCities.sort((a, b) => b.revenue - a.revenue);

//       // ✅ 7. Build Province List
//       const provinceList: GeospatialProvinceData[] = [];
//       for (const [province, data] of provinceMap.entries()) {
//         const pCities = cityList.filter((c) => c.province === province);
//         const sorted = [...pCities].sort((a, b) => b.revenue - a.revenue);
//         const avgGrowth =
//           sorted.length > 0 ? sorted.reduce((sum, c) => sum + c.growth, 0) / sorted.length : 0;
//         provinceList.push({
//           province,
//           revenue: data.revenue,
//           orders: data.orders,
//           cities: data.cities.size,
//           growth: Number(avgGrowth.toFixed(1)),
//           rtoRate: data.orders > 0 ? Number(((data.rtoOrders / data.orders) * 100).toFixed(1)) : 0,
//           topCities: sorted.slice(0, 3).map((c) => c.city),
//         });
//       }
//       provinceList.sort((a, b) => b.revenue - a.revenue);

//       // ✅ 8. Final Response Assembly
//       const response: GeospatialResponse = {
//         cities: filteredCities.slice(0, topCityLimit),
//         provinces: provinceList,
//         summary: {
//           totalRevenue: filteredCities.reduce((s, c) => s + c.revenue, 0),
//           totalOrders: filteredCities.reduce((s, c) => s + c.orders, 0),
//           totalCities: filteredCities.length,
//           totalProvinces: provinceList.length,
//           topCity: filteredCities.length > 0 ? filteredCities[0].city : "N/A",
//           topProvince: provinceList.length > 0 ? provinceList[0].province : "N/A",
//         },
//         settings: { highPotentialRevenue, highPotentialRto, topCityLimit },
//         logistics: {
//           courierPerformance: courierPerformance || [],
//           distanceAnalysis: distanceAnalysis || [],
//         },
//         generatedAt: new Date().toISOString(),
//       };

//       // ✅ 9. Cache for 10 Minutes
//       const stringified = safeStringify(response);
//       await redis.set(cacheKey, stringified, { ex: 600 });
//       console.log(`✅ Geospatial Intelligence Cached (RTO Revenue Isolated).`);

//       return response;
//     } finally {
//       await releaseLock(lockKey, requestId);
//     }
//   } catch (error: any) {
//     console.error("Geospatial Engine Error:", error.message);
//     return {
//       cities: [],
//       provinces: [],
//       summary: {
//         totalRevenue: 0,
//         totalOrders: 0,
//         totalCities: 0,
//         totalProvinces: 0,
//         topCity: "N/A",
//         topProvince: "N/A",
//       },
//       settings: { highPotentialRevenue: 50000, highPotentialRto: 10, topCityLimit: 10 },
//       logistics: { courierPerformance: [], distanceAnalysis: [] },
//       generatedAt: new Date().toISOString(),
//     };
//   }
// }
// 📂 src/app/features/admin/geospatial-intelligence/actions/getGeospatialIntelligence.ts

"use server";

import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { format } from "date-fns";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ✅ CENTRAL SHARED ENGINE
import {
  buildGeospatialMatrix,
  UnifiedGeospatialCityData,
  UnifiedGeospatialProvinceData,
  UnifiedCourierPerformanceItem,
  UnifiedDistanceBucket,
} from "@/app/features/admin/shared/engines/geospatialEngine";

// ================================================================
// ✅ TYPES (100% Preserved for Geospatial UI & Widgets)
// ================================================================
export interface GeospatialCityData {
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  revenue: number;
  orders: number;
  aov: number;
  growth: number;
  trend: "STAR" | "FALLING" | "STABLE";
  rtoRate: number;
  isHighPotential: boolean;
}

export interface GeospatialProvinceData {
  province: string;
  revenue: number;
  orders: number;
  cities: number;
  growth: number;
  rtoRate: number;
  topCities: string[];
}

export interface CourierPerformanceItem {
  city: string;
  courier: string;
  total: number;
  delivered: number;
  rto: number;
  successRate: number;
  rtoRate: number;
  avgDeliveryTimeDays: number | null;
}

export interface DistanceBucket {
  bucketLabel: string;
  totalOrders: number;
  rtoRate: number;
  avgDistance: number;
  totalRevenue: number;
}

export interface GeospatialResponse {
  cities: GeospatialCityData[];
  provinces: GeospatialProvinceData[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCities: number;
    totalProvinces: number;
    topCity: string;
    topProvince: string;
  };
  settings: {
    highPotentialRevenue: number;
    highPotentialRto: number;
    topCityLimit: number;
  };
  logistics: {
    courierPerformance: CourierPerformanceItem[];
    distanceAnalysis: DistanceBucket[];
  };
  generatedAt: string;
}

// ================================================================
// 🚀 MAIN SERVER ACTION
// ================================================================
export async function getGeospatialIntelligencePayload(
  range: { from: Date; to: Date },
  filters?: { province?: string; search?: string }
): Promise<GeospatialResponse> {
  const fromStr = format(range.from, "yyyy-MM-dd");
  const toStr = format(range.to, "yyyy-MM-dd");
  const provinceFilter = filters?.province || "all";
  const searchFilter = filters?.search?.trim().toLowerCase() || "";
  const cacheKey = `analytics_geospatial_v7:${fromStr}_${toStr}:prov_${provinceFilter}:search_${searchFilter}`;

  try {
    await verifyAdminAccess();

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<GeospatialResponse>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Geospatial Intelligence (Central Engine)");
      return parsed;
    }

    // 2. Delegate Calculation to Central Shared Engine
    const engineResult = await buildGeospatialMatrix(
      { startDate: range.from, endDate: range.to },
      filters
    );

    const response: GeospatialResponse = {
      cities: engineResult.cities.map((c: UnifiedGeospatialCityData) => ({
        city: c.city,
        province: c.province,
        lat: c.lat,
        lng: c.lng,
        revenue: c.revenue,
        orders: c.orders,
        aov: c.aov,
        growth: c.growth,
        trend: c.trend,
        rtoRate: c.rtoRate,
        isHighPotential: c.isHighPotential,
      })),
      provinces: engineResult.provinces.map((p: UnifiedGeospatialProvinceData) => ({
        province: p.province,
        revenue: p.revenue,
        orders: p.orders,
        cities: p.cities,
        growth: p.growth,
        rtoRate: p.rtoRate,
        topCities: p.topCities,
      })),
      summary: engineResult.summary,
      settings: engineResult.settings,
      logistics: {
        courierPerformance: engineResult.logistics.courierPerformance.map((item: UnifiedCourierPerformanceItem) => ({
          city: item.city,
          courier: item.courier,
          total: item.total,
          delivered: item.delivered,
          rto: item.rto,
          successRate: item.successRate,
          rtoRate: item.rtoRate,
          avgDeliveryTimeDays: item.avgDeliveryTimeDays,
        })),
        distanceAnalysis: engineResult.logistics.distanceAnalysis.map((item: UnifiedDistanceBucket) => ({
          bucketLabel: item.bucketLabel,
          totalOrders: item.totalOrders,
          rtoRate: item.rtoRate,
          avgDistance: item.avgDistance,
          totalRevenue: item.totalRevenue,
        })),
      },
      generatedAt: engineResult.generatedAt,
    };

    // 3. Cache for 10 Minutes
    try {
      await redis.set(cacheKey, safeStringify(response), { ex: 600 });
      console.log("✅ Geospatial Intelligence Cached.");
    } catch (cacheErr) {
      console.warn("⚠️ Failed to cache geospatial intelligence:", cacheErr);
    }

    return response;
  } catch (error: any) {
    console.error("❌ Geospatial Engine Failure:", error.message);
    return {
      cities: [],
      provinces: [],
      summary: {
        totalRevenue: 0,
        totalOrders: 0,
        totalCities: 0,
        totalProvinces: 0,
        topCity: "N/A",
        topProvince: "N/A",
      },
      settings: { highPotentialRevenue: 50000, highPotentialRto: 10, topCityLimit: 10 },
      logistics: { courierPerformance: [], distanceAnalysis: [] },
      generatedAt: new Date().toISOString(),
    };
  }
}