// 📂 src/app/features/admin/reports/actions/getSalesReportData.ts (FULLY HARDENED FOR PRODUCTION)

"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import UserEvent from "@/models/UserEvent";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyStaff } from "@/lib/payloadAuth";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { format } from "date-fns";

// ✅ SINGLE SOURCE OF TRUTH & SAFE SERIALIZE
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES
// ================================================================
export interface SalesReportRow {
  productId?: string;
  sku?: string;
  productName?: string;
  unitsSold?: number;
  revenue?: number;
  profit?: number;    
  margin?: number;
  roiPercent?: number; 
  stockLeft?: number;
  returnRate?: number;

  // Product Friction
  views?: number;
  addToCarts?: number;
  purchases?: number;
  viewToCart?: number;
  cartToOrder?: number;
  frictionType?: "LOW_INTEREST" | "PRICE_BARRIER" | "HEALTHY";

  // Coupons
  code?: string;
  redemptions?: number;
  totalDiscount?: number;
  roi?: number;
  date?: string;
}

export interface SalesReportResponse {
  data: SalesReportRow[];
  totals: {
    totalRevenue: number;
    totalUnits?: number;
    totalDiscounts?: number;
    totalProfit?: number; 
    redemptions?: number;
  };
  generatedAt: string;
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
    if (result === 1) console.log(`🔓 Sales Report Lock released (${requestId}).`);
  } catch (error) {
    console.error("Sales Report Lock release error:", error);
  }
};

const getFrictionType = (viewToCartRate: number, cartToOrderRate: number): "LOW_INTEREST" | "PRICE_BARRIER" | "HEALTHY" => {
  if (viewToCartRate < 10 && cartToOrderRate < 20) return "LOW_INTEREST";
  if (viewToCartRate >= 10 && cartToOrderRate < 20) return "PRICE_BARRIER";
  return "HEALTHY";
};

// ================================================================
// 🚀 MAIN REPORT COMPILER
// ================================================================
export async function getSalesReportData(
  range: { startDate: Date; endDate: Date },
  slug: "best-sellers-sku" | "product-friction" | "coupons-performance"
): Promise<{ success: boolean; data?: SalesReportResponse; error?: string }> {
  const fromStr = format(new Date(range.startDate), "yyyy-MM-dd");
  const toStr = format(new Date(range.endDate), "yyyy-MM-dd");
  const cacheKey = `analytics_sales_v5_${slug}_${fromStr}_${toStr}`;

  try {
    await verifyStaff(["admin", "manager", "editor"]);

    // 1. Cache Read
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<SalesReportResponse>(cachedData as string | null);
    if (parsed) {
      console.log(`⚡ Redis Cache Hit: Sales Report (${slug})`);
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
      const retryParsed = safeParse<SalesReportResponse>(retryCache as string | null);
      if (retryParsed) return { success: true, data: retryParsed };
      return { success: false, error: "Report generation in progress." };
    }

    try {
      await connectMongoose();
      const start = new Date(range.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(range.endDate);
      end.setHours(23, 59, 59, 999);

      let result: SalesReportResponse;

      // ================================================================
      // 📊 REPORT 1: BEST SELLERS (SKU PERFORMANCE)
      // ================================================================
      if (slug === "best-sellers-sku") {
        const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "Cancelled", "RTO", "Rejected"]));
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: STATUS_QUERY } } },
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.productId",
              productName: { $first: "$products.name" },
              sku: { $first: "$products.sku" },
              unitsSold: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.quantity", 0] }, 0] } },
              revenue: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] }, 0] } },
              profit: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.profit", 0] }, 0] } },
              capital: { $sum: { $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.capital", 0] }, 0] } },
              returnedUnits: { $sum: { $cond: [{ $in: ["$status", ["Cancelled", "RTO", "Rejected"]] }, { $ifNull: ["$products.quantity", 0] }, 0] } }
            }
          },
          { $sort: { revenue: -1 } }
        ]);

        const productIds = aggregation.map((p) => p._id).filter(Boolean);
        const stockMap = new Map<string, number>();

        if (productIds.length > 0) {
            const payload = await getSafePayload();
            
            // ✅ ENTERPRISE BATCH LOOP: Prevents Payload max query truncation limits
            let payloadPage = 1;
            const payloadLimit = 100;
            let hasMore = true;

            while (hasMore && payloadPage <= 500) {
              const productsResult = await payload.find({ 
                collection: "products", 
                where: { id: { in: productIds } }, 
                depth: 0, 
                page: payloadPage,
                limit: payloadLimit 
              });

              for (const prod of productsResult.docs) {
                const stock = prod.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                stockMap.set(prod.id, stock);
              }

              hasMore = productsResult.hasNextPage ?? false;
              payloadPage++;
            }
        }

        const data: SalesReportRow[] = aggregation.map((item) => {
          const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
          const roi = item.capital > 0 ? (item.profit / item.capital) * 100 : 0;
          const totalUnits = item.unitsSold + item.returnedUnits;
          const returnRate = totalUnits > 0 ? (item.returnedUnits / totalUnits) * 100 : 0;

          return {
            sku: item.sku || "N/A",
            productName: item.productName || "Unknown",
            unitsSold: item.unitsSold || 0,
            revenue: item.revenue || 0,
            profit: item.profit || 0,
            margin: Number(margin.toFixed(1)),
            roiPercent: Number(roi.toFixed(1)),
            stockLeft: stockMap.get(item._id) || 0,
            returnRate: Number(returnRate.toFixed(1))
          };
        });

        result = { 
          data, 
          totals: { 
            totalRevenue: data.reduce((s, r) => s + (r.revenue || 0), 0), 
            totalUnits: data.reduce((s, r) => s + (r.unitsSold || 0), 0), 
            totalProfit: data.reduce((s, r) => s + (r.profit || 0), 0) 
          }, 
          generatedAt: new Date().toISOString() 
        };
      }

      // ================================================================
      // 📊 REPORT 2: PRODUCT FRICTION (PDP FUNNEL DROPS)
      // ================================================================
      else if (slug === "product-friction") {
        const [viewsAgg, addsAgg, purchasesAgg] = await Promise.all([
          UserEvent.aggregate([{ $match: { eventType: "page_view", createdAt: { $gte: start, $lte: end } } }, { $group: { _id: "$metadata.productId", views: { $sum: 1 } } }, { $match: { views: { $gte: 5 } } }]),
          UserEvent.aggregate([{ $match: { eventType: "add_to_cart", createdAt: { $gte: start, $lte: end } } }, { $group: { _id: "$metadata.productId", adds: { $sum: 1 } } }]),
          Order.aggregate([{ $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } }, { $unwind: "$products" }, { $group: { _id: "$products.productId", buys: { $sum: { $ifNull: ["$products.quantity", 0] } } } }])
        ]);

        const viewMap = new Map(viewsAgg.map(v => [v._id, v.views]));
        const addMap = new Map(addsAgg.map(a => [a._id, a.adds]));
        const buyMap = new Map(purchasesAgg.map(p => [p._id, p.buys]));

        const allIds = Array.from(new Set([...viewMap.keys(), ...addMap.keys(), ...buyMap.keys()])).filter(Boolean);
        const titleMap = new Map<string, string>();

        if (allIds.length > 0) {
          const payload = await getSafePayload();

          // ✅ ENTERPRISE BATCH LOOP: Prevents query truncation of product titles
          let payloadPage = 1;
          const payloadLimit = 100;
          let hasMore = true;

          while (hasMore && payloadPage <= 500) {
            const cmsProducts = await payload.find({ 
              collection: "products", 
              where: { id: { in: allIds } }, 
              depth: 0, 
              page: payloadPage,
              limit: payloadLimit 
            });

            for (const p of cmsProducts.docs) {
              titleMap.set(String(p.id), String(p.title || ""));
            }

            hasMore = cmsProducts.hasNextPage ?? false;
            payloadPage++;
          }
        }

        const data: SalesReportRow[] = allIds.map(id => {
          const v = viewMap.get(id) || 0;
          const a = addMap.get(id) || 0;
          const b = buyMap.get(id) || 0;
          const v2c = v > 0 ? (a / v) * 100 : 0;
          const c2o = a > 0 ? (b / a) * 100 : 0;
          const type = getFrictionType(v2c, c2o);
          
          const name = titleMap.get(id) || `Product #${id.slice(-6)}`;

          return {
            productName: name, 
            views: v,
            addToCarts: a,
            purchases: b,
            viewToCart: Number(v2c.toFixed(1)),
            cartToOrder: Number(c2o.toFixed(1)),
            frictionType: type !== "HEALTHY" ? type : undefined
          };
        }).filter(d => d.frictionType).sort((a, b) => (b.views || 0) - (a.views || 0));

        result = { data, totals: { totalRevenue: 0 }, generatedAt: new Date().toISOString() };
      }

      // ================================================================
      // 📊 REPORT 3: COUPONS PERFORMANCE (COUPON ROI)
      // ================================================================
      else if (slug === "coupons-performance") {
        const aggregation = await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES }, "coupon.code": { $exists: true, $ne: null } } },
          { $group: { _id: "$coupon.code", count: { $sum: 1 }, discount: { $sum: { $ifNull: ["$coupon.amount", 0] } }, revenue: { $sum: "$totalPrice" } } }
        ]);

        const data: SalesReportRow[] = aggregation.map(item => ({
          code: item._id,
          redemptions: item.count,
          totalDiscount: item.discount,
          revenue: item.revenue,
          roi: item.discount > 0 ? Number(((item.revenue / item.discount) * 100).toFixed(1)) : 0
        }));

        result = { 
          data, 
          totals: { 
            totalRevenue: data.reduce((s, r) => s + (r.revenue || 0), 0), 
            redemptions: data.reduce((s, r) => s + (r.redemptions || 0), 0) 
          }, 
          generatedAt: new Date().toISOString() 
        };
      } else {
        return { success: false, error: "Invalid report slug specified." };
      }

      // Cache safely for 5 minutes
      await redis.set(cacheKey, safeStringify(result), { ex: 300 });
      console.log(`✅ Sales Report "${slug}" compiled and cached successfully.`);

      return { success: true, data: result };
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("❌ Sales Report Engine Exception:", error.message);
    return { success: false, error: error.message };
  }
}