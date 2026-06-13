// @/app/actions/analytics/getExecutiveAnalytics.ts
"use server";

import { getPayload } from "payload";
import configPromise from "@payload-config";
import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import { differenceInDays, subDays } from "date-fns";
import { verifyAdminAccess } from "./verifyAdminAccess";

export interface ExecutiveSummary {
  revenue: {
    gross: number;
    netProfitEstimate: number;
    growthPercentage: number;
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
}

export async function getExecutiveAnalyticsPayload(
  range: DateRange,
): Promise<ExecutiveSummary | null> {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });

    // 1. Fetch CMS Settings globally (extremely light)
    const settings = await payload.findGlobal({ slug: "settings" });
    const pricingTiers = settings.pricingLogicTiers || [];
    const lowStockThreshold = settings.inventorySettings?.lowStockThreshold ?? 5;

    // 2. Calculate Comparison Periods
    const daysDiff = differenceInDays(range.to, range.from) + 1;
    const prevRangeFrom = subDays(range.from, daysDiff);
    const prevRangeTo = subDays(range.to, daysDiff);

    // 🚀 ELITE DATABASE ENGINE: Aggregation and counting running in parallel
    const [currentMetricsRes, prevMetricsRes, totalUsers, newUsers, payloadProducts] =
      await Promise.all([
        // current metrics aggregation inside MongoDB
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: range.from, $lte: range.to },
              status: { $ne: "Cancelled" },
            },
          },
          {
            $facet: {
              totals: [
                {
                  $group: {
                    _id: null,
                    gross: { $sum: "$totalPrice" },
                    totalOrders: { $sum: 1 },
                    discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
                  },
                },
              ],
              profitCalculation: [
                { $unwind: "$products" },
                {
                  $project: {
                    profit: {
                      $multiply: [
                        { $ifNull: ["$products.price", 0] },
                        { $ifNull: ["$products.quantity", 0] },
                        {
                          $divide: [
                            {
                              $switch: {
                                branches: pricingTiers.map((tier: any) => ({
                                  case: {
                                    $and: [
                                      { $gte: [{ $ifNull: ["$products.price", 0] }, tier.minCost] },
                                      { $lte: [{ $ifNull: ["$products.price", 0] }, tier.maxCost] },
                                    ],
                                  },
                                  then: tier.profitPercent || 0,
                                })),
                                default: pricingTiers[0]?.profitPercent || 0,
                              },
                            },
                            100,
                          ],
                        },
                      ],
                    },
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalProfit: { $sum: "$profit" },
                  },
                },
              ],
            },
          },
        ]),
        // previous metrics aggregation (very light)
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: prevRangeFrom, $lte: prevRangeTo },
              status: { $ne: "Cancelled" },
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
          createdAt: { $gte: range.from, $lte: range.to },
          role: "customer",
        }),
        // ✅ Optimization: select only 'variants' field to avoid full payload size overhead
        payload.find({ 
          collection: "products", 
          limit: 5000, 
          depth: 0,
          select: { variants: true } 
        }),
      ]);

    // Format Aggregation Outputs safely
    const currentTotals = currentMetricsRes[0]?.totals[0] || { gross: 0, totalOrders: 0, discounts: 0 };
    const currentProfit = currentMetricsRes[0]?.profitCalculation[0]?.totalProfit || 0;
    const prevGross = prevMetricsRes[0]?.gross || 0;

    const currentRevenue = currentTotals.gross;
    const discounts = currentTotals.discounts;

    // Growth calculation
    const growth =
      prevGross > 0
        ? ((currentRevenue - prevGross) / prevGross) * 100
        : currentRevenue > 0
          ? 100
          : 0;

    // Process Stock metrics locally from lightweight selected variants array
    let totalVariants = 0,
      criticalStock = 0,
      outOfStock = 0;

    payloadProducts.docs.forEach((product: any) => {
      product.variants?.forEach((v: any) => {
        totalVariants++;
        const s = v.stock ?? 0;
        if (s <= 0) outOfStock++;
        else if (s <= lowStockThreshold) criticalStock++;
      });
    });

    return {
      revenue: {
        gross: currentRevenue,
        netProfitEstimate: currentProfit - discounts,
        growthPercentage: Number(growth.toFixed(2)),
      },
      orders: {
        total: currentTotals.totalOrders,
        velocity: Number((currentTotals.totalOrders / 24).toFixed(2)),
        avgOrderValue:
          currentTotals.totalOrders > 0 ? currentRevenue / currentTotals.totalOrders : 0,
      },
      customers: { total: totalUsers, newToday: newUsers },
      inventory: {
        totalVariants,
        criticalStockCount: criticalStock,
        outOfStockCount: outOfStock,
      },
    };
  } catch (error: any) {
    console.error("Executive Engine Error:", error.message);
    return null;
  }
}