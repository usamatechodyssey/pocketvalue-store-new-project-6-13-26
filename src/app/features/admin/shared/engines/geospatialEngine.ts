// 📂 src/app/features/admin/shared/engines/geospatialEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { subDays, differenceInDays } from "date-fns";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================

export interface UnifiedGeospatialCityData {
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

export interface UnifiedGeospatialProvinceData {
  province: string;
  revenue: number;
  orders: number;
  cities: number;
  growth: number;
  rtoRate: number;
  topCities: string[];
}

export interface UnifiedCourierPerformanceItem {
  city: string;
  courier: string;
  total: number;
  delivered: number;
  rto: number;
  successRate: number;
  rtoRate: number;
  avgDeliveryTimeDays: number | null;
}

export interface UnifiedDistanceBucket {
  bucketLabel: string;
  totalOrders: number;
  rtoRate: number;
  avgDistance: number;
  totalRevenue: number;
}

export interface UnifiedGeospatialResponse {
  cities: UnifiedGeospatialCityData[];
  provinces: UnifiedGeospatialProvinceData[];
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
    courierPerformance: UnifiedCourierPerformanceItem[];
    distanceAnalysis: UnifiedDistanceBucket[];
  };
  generatedAt: string;
}

export interface UnifiedGeospatialRtoReportRow {
  location: string;
  orders: number;
  rtoCount: number;
  rtoRate: number;
  revenueLost: number;
}

// ================================================================
// 🔧 HELPERS
// ================================================================
const getTrend = (growth: number): "STAR" | "FALLING" | "STABLE" => {
  if (growth > 15) return "STAR";
  if (growth < -15) return "FALLING";
  return "STABLE";
};

// Province Auto-Resolver
export const resolveProvince = (city: string, rawProvince?: string): string => {
  if (rawProvince && rawProvince !== "UNKNOWN_PROVINCE" && rawProvince.trim().length > 0) {
    return rawProvince.toUpperCase();
  }
  const c = (city || "").toUpperCase();
  if (["KARACHI", "HYDERABAD", "SUKKUR", "LARKANA"].some((p) => c.includes(p))) return "SINDH";
  if (["LAHORE", "RAWALPINDI", "FAISALABAD", "MULTAN", "SIALKOT", "GUJRANWALA", "BAHAWALPUR", "SARGODHA"].some((p) => c.includes(p))) return "PUNJAB";
  if (["ISLAMABAD"].some((p) => c.includes(p))) return "ICT";
  if (["PESHAWAR", "ABBOTTABAD", "MARDAN", "SWAT"].some((p) => c.includes(p))) return "KPK";
  if (["QUETTA", "GWADAR", "TURBAT"].some((p) => c.includes(p))) return "BALOCHISTAN";
  if (["GILGIT", "SKARDU"].some((p) => c.includes(p))) return "GILGIT-BALTISTAN";
  if (["MUZAFFARABAD", "MIRPUR"].some((p) => c.includes(p))) return "AJK";
  return "OTHERS";
};

// ================================================================
// 🚀 ENGINE 1: MAIN GEOSPATIAL INTELLIGENCE MATRIX
// ================================================================
export async function buildGeospatialMatrix(
  range: { startDate: Date; endDate: Date },
  filters?: { province?: string; search?: string }
): Promise<UnifiedGeospatialResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;
  const provinceFilter = filters?.province || "all";
  const searchFilter = filters?.search?.trim().toLowerCase() || "";

  let settings: any = {};
  try {
    settings = await getCachedSettings();
  } catch (e) {
    settings = {};
  }

  const highPotentialRevenue = settings?.geospatial?.highPotentialRevenue ?? 50000;
  const highPotentialRto = settings?.geospatial?.highPotentialRto ?? 10;
  const topCityLimit = settings?.geospatial?.topCityLimit ?? 10;

  const daysDiff = differenceInDays(end, start) + 1;
  const prevFrom = subDays(start, daysDiff);
  const prevTo = subDays(end, daysDiff);

  const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO"]));

  const [cityData, prevCityData, courierPerformance, distanceAnalysis] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: STATUS_QUERY },
        },
      },
      {
        $group: {
          _id: {
            city: { $toUpper: "$shippingAddress.city" },
            province: { $toUpper: "$shippingAddress.province" },
          },
          revenue: {
            $sum: {
              $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0],
            },
          },
          orders: { $sum: 1 },
          rtoOrders: {
            $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] },
          },
          lat: { $first: "$shippingAddress.lat" },
          lng: { $first: "$shippingAddress.lng" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: prevFrom, $lte: prevTo },
          status: { $in: STATUS_QUERY },
        },
      },
      {
        $group: {
          _id: { city: { $toUpper: "$shippingAddress.city" } },
          revenue: {
            $sum: {
              $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0],
            },
          },
          orders: { $sum: 1 },
        },
      },
    ]),
    Order.aggregate([
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
          _id: {
            city: { $toUpper: "$shippingAddress.city" },
            courier: "$shipments.courier",
          },
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ["$shipments.status", "Delivered"] }, 1, 0] },
          },
          rto: {
            $sum: { $cond: [{ $eq: ["$shipments.status", "RTO"] }, 1, 0] },
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
      {
        $project: {
          city: "$_id.city",
          courier: "$_id.courier",
          total: 1,
          delivered: 1,
          rto: 1,
          successRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$delivered", "$total"] }, 100] },
            ],
          },
          rtoRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$rto", "$total"] }, 100] },
            ],
          },
          avgDeliveryTimeDays: {
            $cond: [
              { $eq: ["$delivered", 0] },
              null,
              {
                $divide: [
                  { $divide: ["$totalDeliveryTimeMs", "$delivered"] },
                  1000 * 60 * 60 * 24,
                ],
              },
            ],
          },
        },
      },
      { $sort: { city: 1, total: -1 } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $bucket: {
          groupBy: { $ifNull: ["$warehouseDistance", 10] },
          boundaries: [0, 50, 100, 200, 500],
          default: "500+",
          output: {
            totalOrders: { $sum: 1 },
            rtoOrders: { $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] } },
            avgDistance: { $avg: { $ifNull: ["$warehouseDistance", 10] } },
            totalRevenue: {
              $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, "$totalPrice", 0] },
            },
          },
        },
      },
      {
        $project: {
          bucketLabel: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", 0] }, then: "0-50 km" },
                { case: { $eq: ["$_id", 50] }, then: "50-100 km" },
                { case: { $eq: ["$_id", 100] }, then: "100-200 km" },
                { case: { $eq: ["$_id", 200] }, then: "200-500 km" },
              ],
              default: "500+ km",
            },
          },
          totalOrders: 1,
          rtoRate: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $multiply: [{ $divide: ["$rtoOrders", "$totalOrders"] }, 100] },
            ],
          },
          avgDistance: { $round: ["$avgDistance", 1] },
          totalRevenue: 1,
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const prevMap = new Map(
    prevCityData.map((i: any) => [i._id.city, { revenue: i.revenue, orders: i.orders }])
  );

  const provinceMap = new Map<
    string,
    { revenue: number; orders: number; cities: Set<string>; rtoOrders: number }
  >();
  const cityList: UnifiedGeospatialCityData[] = [];

  for (const item of cityData) {
    const city = item._id.city || "UNKNOWN";
    const province = resolveProvince(city, item._id.province);
    const revenue = Math.round(item.revenue || 0);
    const orders = item.orders || 0;
    const rtoOrders = item.rtoOrders || 0;
    const lat = item.lat || null;
    const lng = item.lng || null;

    const prev = prevMap.get(city);
    const prevRevenue = prev?.revenue || 0;
    const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : revenue > 0 ? 100 : 0;
    const aov = orders > 0 ? revenue / orders : 0;
    const rtoRate = orders > 0 ? (rtoOrders / orders) * 100 : 0;
    const isHighPotential = revenue > highPotentialRevenue && rtoRate < highPotentialRto;

    cityList.push({
      city,
      province,
      lat,
      lng,
      revenue,
      orders,
      aov: Number(aov.toFixed(2)),
      growth: Number(growth.toFixed(1)),
      trend: getTrend(growth),
      rtoRate: Number(rtoRate.toFixed(1)),
      isHighPotential,
    });

    if (!provinceMap.has(province)) {
      provinceMap.set(province, { revenue: 0, orders: 0, cities: new Set(), rtoOrders: 0 });
    }
    const pData = provinceMap.get(province)!;
    pData.revenue += revenue;
    pData.orders += orders;
    pData.cities.add(city);
    pData.rtoOrders += rtoOrders;
  }

  let filteredCities = cityList;
  if (provinceFilter !== "all") {
    filteredCities = filteredCities.filter((c) => c.province === provinceFilter.toUpperCase());
  }
  if (searchFilter) {
    filteredCities = filteredCities.filter(
      (c) => c.city.toLowerCase().includes(searchFilter) || c.province.toLowerCase().includes(searchFilter)
    );
  }
  filteredCities.sort((a, b) => b.revenue - a.revenue);

  const provinceList: UnifiedGeospatialProvinceData[] = [];
  for (const [province, data] of provinceMap.entries()) {
    const pCities = cityList.filter((c) => c.province === province);
    const sorted = [...pCities].sort((a, b) => b.revenue - a.revenue);
    const avgGrowth = sorted.length > 0 ? sorted.reduce((sum, c) => sum + c.growth, 0) / sorted.length : 0;
    provinceList.push({
      province,
      revenue: Math.round(data.revenue),
      orders: data.orders,
      cities: data.cities.size,
      growth: Number(avgGrowth.toFixed(1)),
      rtoRate: data.orders > 0 ? Number(((data.rtoOrders / data.orders) * 100).toFixed(1)) : 0,
      topCities: sorted.slice(0, 3).map((c) => c.city),
    });
  }
  provinceList.sort((a, b) => b.revenue - a.revenue);

  return {
    cities: filteredCities.slice(0, topCityLimit),
    provinces: provinceList,
    summary: {
      totalRevenue: filteredCities.reduce((s, c) => s + c.revenue, 0),
      totalOrders: filteredCities.reduce((s, c) => s + c.orders, 0),
      totalCities: filteredCities.length,
      totalProvinces: provinceList.length,
      topCity: filteredCities.length > 0 ? filteredCities[0].city : "N/A",
      topProvince: provinceList.length > 0 ? provinceList[0].province : "N/A",
    },
    settings: { highPotentialRevenue, highPotentialRto, topCityLimit },
    logistics: {
      courierPerformance: courierPerformance || [],
      distanceAnalysis: distanceAnalysis || [],
    },
    generatedAt: new Date().toISOString(),
  };
}

// ================================================================
// 🚀 ENGINE 2: GEOSPATIAL RTO REPORT MATRIX
// ================================================================
export async function buildGeospatialRtoReportMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedGeospatialRtoReportRow[]> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

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
          $sum: { $cond: [{ $eq: ["$status", "RTO"] }, 1, 0] },
        },
        revenueLost: {
          $sum: { $cond: [{ $eq: ["$status", "RTO"] }, "$totalPrice", 0] },
        },
      },
    },
    { $sort: { orders: -1 } },
    { $limit: 100 },
  ]);

  return aggregation.map((item: any) => {
    const total = item.orders || 0;
    const rto = item.rtoCount || 0;
    const rtoRate = total > 0 ? Number(((rto / total) * 100).toFixed(1)) : 0;

    return {
      location: item._id || "UNKNOWN",
      orders: total,
      rtoCount: rto,
      rtoRate,
      revenueLost: Math.round(item.revenueLost || 0),
    };
  });
}