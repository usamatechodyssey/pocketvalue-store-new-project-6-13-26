// 📂 src/app/features/admin/shared/engines/skuPerformanceEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { Types } from "mongoose";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";

// ================================================================
// ✅ UNIFIED TYPES (100% COMPLETE & NO MISSING FIELDS)
// ================================================================
export interface UnifiedSkuPerformanceItem {
  sku: string;
  productId: string;
  productName: string;
  variantName: string;
  image: string | null;
  unitsSold: number;
  returnedUnits: number;
  grossRevenue: number;
  cogs: number;
  fees: number;
  tax: number;
  duties: number;
  adSpend: number;
  profit: number;
  marginPercent: number;
  roiPercent: number;
  returnRate: number;
  stockLeft: number;
}

export interface UnifiedSkuPerformanceSummary {
  totalRevenue: number;
  totalUnitsSold: number;
  totalReturnedUnits: number;
  totalProfit: number;
  totalCogs: number;
}

export interface UnifiedSkuPerformanceResponse {
  data: UnifiedSkuPerformanceItem[];
  summary: UnifiedSkuPerformanceSummary;
  generatedAt: string;
}

// ================================================================
// 🎨 IMAGE RESOLVER (Payload CMS Variant CDN/Media Image)
// ================================================================
const resolveVariantImage = (doc: any, targetSku: string): string | null => {
  if (!doc) return null;
  const matchedVariant = doc.variants?.find((v: any) => v.sku === targetSku) || doc.variants?.[0];

  if (matchedVariant?.cdnImages?.[0]?.url) return matchedVariant.cdnImages[0].url;
  if (matchedVariant?.images?.[0]?.url) return matchedVariant.images[0].url;
  if (doc.image?.url) return doc.image.url;
  return null;
};

// ================================================================
// 🚀 MAIN CENTRAL SKU PERFORMANCE ENGINE
// ================================================================
export async function buildSkuPerformanceMatrix(
  range: { startDate: Date; endDate: Date },
  options: { limit?: number; minUnitsSold?: number } = {}
): Promise<UnifiedSkuPerformanceResponse> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;

  const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "Cancelled", "RTO", "Rejected"]));

  // 1. Mongoose Aggregation grouped strictly by $products.sku
  const aggregation = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end },
        status: { $in: STATUS_QUERY },
      },
    },
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.sku",
        productId: { $first: "$products.productId" },
        productName: { $first: "$products.name" },
        variantName: {
          $first: { $ifNull: ["$products.variant.name", "$products.variantName", "Default Variant"] },
        },
        sku: { $first: "$products.sku" },
        unitsSold: {
          $sum: {
            $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.quantity", 0] }, 0],
          },
        },
        grossRevenue: {
          $sum: {
            $cond: [
              { $in: ["$status", REVENUE_STATUSES] },
              { $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] },
              0,
            ],
          },
        },
        profit: {
          $sum: {
            $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.profit", 0] }, 0],
          },
        },
        cogs: {
          $sum: {
            $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.capital", 0] }, 0],
          },
        },
        fees: {
          $sum: {
            $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.fees", 0] }, 0],
          },
        },
        tax: {
          $sum: {
            $cond: [{ $in: ["$status", REVENUE_STATUSES] }, { $ifNull: ["$products.tax", 0] }, 0],
          },
        },
        totalDuties: {
          $sum: {
            $cond: [
              { $in: ["$status", REVENUE_STATUSES] },
              { $multiply: [{ $ifNull: ["$products.capital", 0] }, { $divide: [{ $ifNull: ["$products.appliedDutiesRate", 0] }, 100] }] },
              0,
            ],
          },
        },
        totalAdSpend: {
          $sum: {
            $cond: [
              { $in: ["$status", REVENUE_STATUSES] },
              { $multiply: [{ $multiply: [{ $ifNull: ["$products.price", 0] }, { $ifNull: ["$products.quantity", 0] }] }, { $divide: [{ $ifNull: ["$products.appliedAdSpendRate", 0] }, 100] }] },
              0,
            ],
          },
        },
        returnedUnits: {
          $sum: {
            $cond: [{ $in: ["$status", ["Cancelled", "RTO", "Rejected"]] }, { $ifNull: ["$products.quantity", 0] }, 0],
          },
        },
      },
    },
    { $sort: { grossRevenue: -1 } },
  ]);

  // 2. Fetch Stock & Media Metadata from Payload CMS
  const rawProductIds = aggregation.map((p) => p.productId).filter(Boolean);
  const validObjectIds = rawProductIds.filter((id) => Types.ObjectId.isValid(String(id)));

  const stockMap = new Map<string, number>();
  const payloadDocMap = new Map<string, any>();

  if (validObjectIds.length > 0) {
    try {
      const payload = await getSafePayload();
      let payloadPage = 1;
      const payloadLimit = 100;
      let hasMore = true;

      while (hasMore && payloadPage <= 500) {
        const productsResult = await payload.find({
          collection: "products",
          where: { id: { in: validObjectIds } },
          depth: 1,
          page: payloadPage,
          limit: payloadLimit,
          select: { id: true, title: true, variants: true },
        });

        for (const prod of productsResult.docs) {
          if (prod.id) payloadDocMap.set(String(prod.id), prod);
          if ((prod as any)._id) payloadDocMap.set(String((prod as any)._id), prod);

          for (const variant of prod.variants || []) {
            if (variant.sku) {
              stockMap.set(variant.sku, variant.stock || 0);
            }
          }
        }

        hasMore = productsResult.hasNextPage ?? false;
        payloadPage++;
      }
    } catch (cmsErr) {
      console.warn("⚠️ SKU Performance Engine CMS fetch warning:", cmsErr);
    }
  }

  // 3. Process complete SKU performance row mapping
  let items: UnifiedSkuPerformanceItem[] = aggregation.map((item: any) => {
    const skuKey = item.sku || "N/A";
    const pDoc = payloadDocMap.get(String(item.productId));

    const grossRevenue = item.grossRevenue || 0;
    const profit = item.profit || 0;
    const cogs = item.cogs || 0;
    const fees = item.fees || 0;
    const tax = item.tax || 0;
    const duties = Math.round(item.totalDuties || 0);
    const adSpend = Math.round(item.totalAdSpend || 0);

    const marginPercent = grossRevenue > 0 ? Number(((profit / grossRevenue) * 100).toFixed(1)) : 0;
    const roiPercent = cogs > 0 ? Number(((profit / cogs) * 100).toFixed(1)) : 0;

    const totalHandledUnits = item.unitsSold + item.returnedUnits;
    const returnRate = totalHandledUnits > 0 ? Number(((item.returnedUnits / totalHandledUnits) * 100).toFixed(1)) : 0;

    const resolvedStock = stockMap.has(skuKey)
      ? stockMap.get(skuKey)!
      : pDoc?.variants?.find((v: any) => v.sku === skuKey)?.stock || 0;

    return {
      sku: skuKey,
      productId: String(item.productId || ""),
      productName: item.productName || pDoc?.title || "Unknown Product",
      variantName: item.variantName || "Default Variant",
      image: resolveVariantImage(pDoc, skuKey),
      unitsSold: item.unitsSold || 0,
      returnedUnits: item.returnedUnits || 0,
      grossRevenue,
      cogs,
      fees,
      tax,
      duties,
      adSpend,
      profit,
      marginPercent,
      roiPercent,
      returnRate,
      stockLeft: resolvedStock,
    };
  });

  if (options.minUnitsSold) {
    items = items.filter((i) => i.unitsSold >= options.minUnitsSold!);
  }

  const finalItems = options.limit ? items.slice(0, options.limit) : items;

  const summary: UnifiedSkuPerformanceSummary = {
    totalRevenue: items.reduce((s, i) => s + i.grossRevenue, 0),
    totalUnitsSold: items.reduce((s, i) => s + i.unitsSold, 0),
    totalReturnedUnits: items.reduce((s, i) => s + i.returnedUnits, 0),
    totalProfit: items.reduce((s, i) => s + i.profit, 0),
    totalCogs: items.reduce((s, i) => s + i.cogs, 0),
  };

  return {
    data: finalItems,
    summary,
    generatedAt: new Date().toISOString(),
  };
}