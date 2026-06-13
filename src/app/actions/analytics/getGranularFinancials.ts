// @/app/actions/analytics/getGranularFinancials.ts
"use server";

import connectMongoose from "@/app/lib/mongoose";
import Order from "@/models/Order";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { verifyAdminAccess } from "./verifyAdminAccess";

interface DateRange {
  from: Date;
  to: Date;
}

export async function getGranularFinancialsPayload(range: DateRange) {
  try {
    await verifyAdminAccess();
    await connectMongoose();
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: "settings" });

    const totalFixedFeePercent = (settings.globalFixedFees || []).reduce(
      (sum: number, f: any) => sum + (f.percentage || 0),
      0,
    );
    const pricingTiers = settings.pricingLogicTiers || [];

    // 🚀 THE FINANCIAL SURGERY PIPELINE: Compute all margins inside the DB in parallel
    const financials = await Order.aggregate([
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
                tRevenue: { $sum: "$totalPrice" },
                tShip: { $sum: "$shippingCost" },
                tDiscounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
              },
            },
          ],
          breakdown: [
            { $unwind: "$products" },
            {
              $project: {
                price: { $ifNull: ["$products.price", 0] },
                qty: { $ifNull: ["$products.quantity", 0] },
                profitPercent: {
                  $switch: {
                    branches: pricingTiers.map((tier: any) => ({
                      case: {
                        $and: [
                          {
                            $gte: [
                              { $ifNull: ["$products.price", 0] },
                              tier.minCost,
                            ],
                          },
                          {
                            $lte: [
                              { $ifNull: ["$products.price", 0] },
                              tier.maxCost,
                            ],
                          },
                        ],
                      },
                      then: tier.profitPercent || 0,
                    })),
                    default: pricingTiers[0]?.profitPercent || 0,
                  },
                },
                adSpendPercent: {
                  $switch: {
                    branches: pricingTiers.map((tier: any) => ({
                      case: {
                        $and: [
                          {
                            $gte: [
                              { $ifNull: ["$products.price", 0] },
                              tier.minCost,
                            ],
                          },
                          {
                            $lte: [
                              { $ifNull: ["$products.price", 0] },
                              tier.maxCost,
                            ],
                          },
                        ],
                      },
                      then: tier.adSpendPercent || 0,
                    })),
                    default: pricingTiers[0]?.adSpendPercent || 0,
                  },
                },
              },
            },
            {
              $project: {
                price: 1,
                qty: 1,
                profit: {
                  $multiply: [
                    "$price",
                    { $divide: ["$profitPercent", 100] },
                    "$qty",
                  ],
                },
                ads: {
                  $multiply: [
                    "$price",
                    { $divide: ["$adSpendPercent", 100] },
                    "$qty",
                  ],
                },
                fees: {
                  $multiply: ["$price", totalFixedFeePercent / 100, "$qty"],
                },
                // residual calculation: capital = (price - profit - ads - fees) * qty
                capital: {
                  $multiply: [
                    {
                      $subtract: [
                        "$price",
                        {
                          $add: [
                            {
                              $multiply: [
                                "$price",
                                { $divide: ["$profitPercent", 100] },
                              ],
                            },
                            {
                              $multiply: [
                                "$price",
                                { $divide: ["$adSpendPercent", 100] },
                              ],
                            },
                            {
                              $multiply: ["$price", totalFixedFeePercent / 100],
                            },
                          ],
                        },
                      ],
                    },
                    "$qty",
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalProfit: { $sum: "$profit" },
                totalAds: { $sum: "$ads" },
                totalFees: { $sum: "$fees" },
                totalCapital: { $sum: "$capital" },
              },
            },
          ],
        },
      },
    ]);

    const totals = financials[0]?.totals[0] || {
      tRevenue: 0,
      tShip: 0,
      tDiscounts: 0,
    };
    const breakdown = financials[0]?.breakdown[0] || {
      totalProfit: 0,
      totalAds: 0,
      totalFees: 0,
      totalCapital: 0,
    };

    const tRevenue = totals.tRevenue;
    const discounts = totals.tDiscounts;
    const pureProfit = breakdown.totalProfit - discounts;

    return {
      originalPrice: breakdown.totalCapital,
      adSpend: breakdown.totalAds,
      platformFees: breakdown.totalFees,
      operationalExpenses: breakdown.totalAds + breakdown.totalFees,
      shipping: totals.tShip,
      pureProfit: pureProfit,
      grossTotal: tRevenue,
      marginPercent: tRevenue > 0 ? (pureProfit / tRevenue) * 100 : 0,
    };
  } catch (error: any) {
    console.error("Surgeon Error:", error.message);
    return null;
  }
}
