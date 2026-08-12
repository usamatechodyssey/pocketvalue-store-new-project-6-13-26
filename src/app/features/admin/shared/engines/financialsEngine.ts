// 📂 src/app/features/admin/shared/engines/financialsEngine.ts

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import ReturnRequest from "@/models/ReturnRequest";
import { SystemStats } from "@/models/SystemStats";
import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import { REVENUE_STATUSES } from "@/app/shared/constants/analytics";
import { differenceInDays, format, startOfDay, endOfDay, subDays, eachDayOfInterval } from "date-fns";

// ================================================================
// ✅ TYPES
// ================================================================

export interface UnifiedExecutiveSummary {
  revenue: {
    gross: number;
    netCashCollected: number;
    netProfitEstimate: number;
    growthPercentage: number;
    deliveredCash: number;
    courierVault: number;
    pipelineCapital: number;
    totalDiscounts: number;
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

export interface UnifiedFinancesReportRow {
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
  appliedGstRate?: number;
  gstAmount?: number;
  fbrReference?: string;
  method?: string;
  totalOrders?: number;
  appliedFeeRate?: number;
  gatewayFees?: number;
  netReceivable?: number;
}

export interface UnifiedFinancesReportResponse {
  data: UnifiedFinancesReportRow[];
  totals: Record<string, number>;
  generatedAt: string;
}

export interface UnifiedGranularFinancialsResult {
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

export interface UnifiedComparativeChartPoint {
  dayIndex: number;
  currentLabel: string;
  revenue: number;
  orders: number;
  compareLabel: string;
  compareRevenue: number;
  compareOrders: number;
}

// ================================================================
// 🔧 HELPERS
// ================================================================
function formatHourLabel(h: number): string {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

function calculateReportTotals(data: UnifiedFinancesReportRow[]): Record<string, number> {
  const totals: Record<string, number> = {};
  if (data.length === 0) return totals;

  const keysToExclude = [
    "date", "method", "fbrReference", "appliedGstRate", "appliedFeeRate", 
    "marginPercent", "roiPercent", "avgUnitCostPrice"
  ];

  const numericKeys = Object.keys(data[0]).filter((k) => !keysToExclude.includes(k));

  numericKeys.forEach((key) => {
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

// ================================================================
// 🚀 ENGINE 1: EXECUTIVE KPI SUMMARY
// ================================================================
export async function buildExecutiveSummaryMatrix(
  range: { startDate: Date; endDate: Date; compareStartDate: Date; compareEndDate: Date; compare: boolean }
): Promise<UnifiedExecutiveSummary | null> {
  await connectMongoose();

  const start = range.startDate;
  const end = range.endDate;
  const prevFrom = range.compareStartDate;
  const prevTo = range.compareEndDate;

  const daysDiff = differenceInDays(end, start) + 1;

  let inventoryStats = await SystemStats.findOne({ _id: "inventory" }).lean();
  const invData = (inventoryStats || { totalVariants: 0, criticalStockCount: 0, outOfStockCount: 0 }) as {
    totalVariants: number;
    criticalStockCount: number;
    outOfStockCount: number;
  };

  const [currentMetricsRes, prevMetricsRes, totalUsers, newUsers] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
      {
        $group: {
          _id: null,
          grossSales: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
              }
            }
          },
          netCashCollected: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
          discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
          totalProfit: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
              },
            },
          },
          deliveredCash: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalPrice", 0] },
          },
          courierVault: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "Delivered"] }, { $eq: ["$paymentStatus", "Unpaid"] }] },
                "$totalPrice",
                0,
              ],
            },
          },
          pipelineCapital: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$status", "Delivered"] },
                    { $ne: ["$status", "Completed"] },
                    { $ne: ["$status", "Cancelled"] },
                    { $ne: ["$status", "Rejected"] },
                  ],
                },
                "$totalPrice",
                0,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: prevFrom, $lte: prevTo }, status: { $in: REVENUE_STATUSES } } },
      {
        $group: {
          _id: null,
          grossSales: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
              }
            }
          },
        },
      },
    ]),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ createdAt: { $gte: start, $lte: end }, role: "customer" }),
  ]);

  const currentTotals = currentMetricsRes[0] || {
    grossSales: 0,
    netCashCollected: 0,
    totalOrders: 0,
    discounts: 0,
    totalProfit: 0,
    deliveredCash: 0,
    courierVault: 0,
    pipelineCapital: 0,
  };
  const prevGross = prevMetricsRes[0]?.grossSales || 0;

  const currentRevenue = currentTotals.grossSales;
  const discounts = currentTotals.discounts;
  const pureProfit = currentTotals.totalProfit;

  const growth = prevGross > 0 ? ((currentRevenue - prevGross) / prevGross) * 100 : currentRevenue > 0 ? 100 : 0;
  const velocity = currentTotals.totalOrders / ((daysDiff * 24) || 1);

  return {
    revenue: {
      gross: currentRevenue,
      netCashCollected: currentTotals.netCashCollected,
      netProfitEstimate: Math.round(pureProfit),
      growthPercentage: Number(growth.toFixed(2)),
      deliveredCash: currentTotals.deliveredCash,
      courierVault: currentTotals.courierVault,
      pipelineCapital: currentTotals.pipelineCapital,
      totalDiscounts: discounts,
    },
    orders: {
      total: currentTotals.totalOrders,
      velocity: Number(velocity.toFixed(2)),
      avgOrderValue: currentTotals.totalOrders > 0 ? Math.round(currentTotals.netCashCollected / currentTotals.totalOrders) : 0,
    },
    customers: { total: totalUsers, newToday: newUsers },
    inventory: {
      totalVariants: invData.totalVariants,
      criticalStockCount: invData.criticalStockCount,
      outOfStockCount: invData.outOfStockCount,
    },
  };
}

// ================================================================
// 🚀 ENGINE 2: DETAILED FINANCIAL REPORTS (P&L, GST Tax, Payments)
// ================================================================
export async function buildFinancesReportMatrix(
  range: { startDate: Date; endDate: Date },
  slug: "profit-loss" | "fbr-gst-sales-tax" | "payment-breakdown"
): Promise<UnifiedFinancesReportResponse> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);
  const diffDays = differenceInDays(end, start) + 1;
  const timezone = "+05:00"; // Pakistan Time

  const dateGroupingFormat = diffDays <= 1 ? "%Y-%m-%d %H:00" : diffDays <= 31 ? "%Y-%m-%d" : "%Y-%m";
  const groupByString = { $dateToString: { format: dateGroupingFormat, date: "$createdAt", timezone } };

  if (slug === "profit-loss") {
    const aggregation = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
      {
        $group: {
          _id: groupByString,
          totalOrders: { $sum: 1 },
          grossSales: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
              }
            }
          },
          discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
          netSales: { $sum: "$totalPrice" },
          shipping: { $sum: "$shippingCost" },
          totalQuantity: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] } } } },
          costOfGoods: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] } } } },
          fees: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] } } } },
          tax: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
          targetProfit: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.targetProfit", { $ifNull: ["$$this.profit", 0] }] }] }
              }
            }
          },
          pureProfit: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] }
              }
            }
          },
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
          },
          totalAdSpend: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: [{ $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }, { $divide: [{ $ifNull: ["$$this.appliedAdSpendRate", 0] }, 100] }] }
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data: UnifiedFinancesReportRow[] = aggregation.map((item: any) => {
      const grossSales = item.grossSales || 0;
      const discounts = item.discounts || 0;
      const productNetSales = grossSales - discounts;
      const shipping = item.shipping || 0;
      const totalRevenue = productNetSales + shipping;

      const cogs = item.costOfGoods || 0;
      const grossProfit = grossSales - cogs;
      const targetProfit = item.targetProfit || 0;
      const pureProfit = item.pureProfit || 0;

      return {
        date: item._id,
        totalOrders: item.totalOrders || 0,
        grossSales,
        discounts,
        netSales: productNetSales,
        shipping,
        totalRevenue,
        costOfGoods: cogs,
        avgUnitCostPrice: item.totalQuantity > 0 ? Math.round(cogs / item.totalQuantity) : 0,
        duties: Math.round(item.totalDuties || 0),
        fees: item.fees || 0,
        tax: item.tax || 0,
        adSpend: Math.round(item.totalAdSpend || 0),
        grossProfit,
        targetProfit,
        netProfit: pureProfit,
        marginPercent: productNetSales > 0 ? Number(((pureProfit / productNetSales) * 100).toFixed(1)) : 0,
        roiPercent: cogs > 0 ? Number(((pureProfit / cogs) * 100).toFixed(1)) : 0,
      };
    });

    return { data, totals: calculateReportTotals(data), generatedAt: new Date().toISOString() };
  }

  if (slug === "fbr-gst-sales-tax") {
    const aggregation = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
      {
        $group: {
          _id: groupByString,
          grossSales: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
              }
            }
          },
          discounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
          gstAmount: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] } } } },
          gstRate: {
            $avg: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.appliedGstRate", 0] }] }
              }
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data: UnifiedFinancesReportRow[] = aggregation.map((item: any) => {
      const grossSales = item.grossSales || 0;
      const discounts = item.discounts || 0;
      const netSales = grossSales - discounts;

      return {
        date: item._id,
        grossSales,
        discounts,
        netSales,
        appliedGstRate: item.gstRate ? Number(item.gstRate.toFixed(1)) : 15.0,
        gstAmount: item.gstAmount || 0,
        fbrReference: `FBR-${item._id.replace(/[- :]/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      };
    });

    return { data, totals: calculateReportTotals(data), generatedAt: new Date().toISOString() };
  }

  // Payment analysis
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
            $reduce: {
              input: "$products",
              initialValue: 0,
              in: { $add: ["$$value", { $ifNull: ["$$this.appliedFeeRate", 0] }] }
            }
          }
        }
      }
    }
  ]);

  const fromStr = format(start, "yyyy-MM-dd");
  const toStr = format(end, "yyyy-MM-dd");

  const data: UnifiedFinancesReportRow[] = aggregation.map((item: any) => ({
    date: `${fromStr} to ${toStr}`,
    method: item._id ? String(item._id).toUpperCase() : "COD",
    totalOrders: item.totalOrders,
    totalRevenue: item.totalRevenue,
    appliedFeeRate: item.feeRate ? Number(item.feeRate.toFixed(1)) : 3.0,
    gatewayFees: item.gatewayFees,
    netReceivable: Math.round(item.totalRevenue - item.gatewayFees)
  }));

  return { data, totals: calculateReportTotals(data), generatedAt: new Date().toISOString() };
}

// ================================================================
// 🚀 ENGINE 3: GRANULAR FINANCIAL SURGERY
// ================================================================
export async function buildGranularFinancialsMatrix(
  range: { startDate: Date; endDate: Date }
): Promise<UnifiedGranularFinancialsResult | null> {
  await connectMongoose();

  const start = startOfDay(range.startDate);
  const end = endOfDay(range.endDate);

  let settings: any = {};
  try {
    settings = await getCachedSettings();
  } catch (e) {
    settings = {};
  }

  const globalFeesArray = settings.globalFixedFees || [];
  const fixedFeePercent = globalFeesArray.reduce((sum: number, fee: any) => sum + (fee.percentage || 0), 0);
  const gstPercent = settings.taxSettings?.standardGstPercent ?? 0;
  const dutiesPercent = settings.pricingSettings?.estimatedDutiesPercent ?? 0;

  const STATUS_QUERY = Array.from(new Set([...REVENUE_STATUSES, "RTO"]));

  const [financials, actualRtoAgg] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: REVENUE_STATUSES } } },
      {
        $group: {
          _id: null,
          grossSales: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }] }
              }
            }
          },
          totalShipping: { $sum: "$shippingCost" },
          totalDiscounts: { $sum: { $ifNull: ["$coupon.amount", 0] } },
          totalQuantity: { $sum: { $reduce: { input: "$products", initialValue: 0, in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] } } } },
          targetProfit: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.targetProfit", { $ifNull: ["$$this.profit", 0] }] }] },
              },
            },
          },
          pureProfit: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.profit", 0] }] },
              },
            },
          },
          totalFees: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.fees", 0] }] },
              },
            },
          },
          totalTax: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.tax", 0] }] },
              },
            },
          },
          totalCapital: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.capital", 0] }] },
              },
            },
          },
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
            },
          },
          totalAdSpend: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    { $multiply: [{ $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] }, { $divide: [{ $ifNull: ["$$this.appliedAdSpendRate", 0] }, 100] }] }
                  ]
                }
              }
            },
          },
          totalRtoReserve: {
            $sum: {
              $reduce: {
                input: "$products",
                initialValue: 0,
                in: {
                  $add: [
                    "$$value",
                    {
                      $multiply: [
                        { $multiply: [{ $ifNull: ["$$this.price", 0] }, { $ifNull: ["$$this.quantity", 0] }] },
                        { $divide: [{ $ifNull: ["$$this.appliedRtoRate", 0] }, 100] }
                      ]
                    }
                  ]
                }
              }
            },
          },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: "RTO" } },
      { $group: { _id: null, actualRtoLoss: { $sum: { $multiply: ["$shippingCost", 2] } } } },
    ]),
  ]);

  const result = financials[0] || {
    grossSales: 0,
    totalShipping: 0,
    totalDiscounts: 0,
    totalQuantity: 0,
    targetProfit: 0,
    pureProfit: 0,
    totalFees: 0,
    totalTax: 0,
    totalCapital: 0,
    totalDuties: 0,
    totalRtoReserve: 0,
    totalAdSpend: 0,
  };

  const actualRtoLoss = actualRtoAgg[0]?.actualRtoLoss || 0;

  const grossSales = result.grossSales || 0;
  const discounts = result.totalDiscounts || 0;
  const netSales = grossSales - discounts;

  const cogs = result.totalCapital || 0;
  const targetProfit = result.targetProfit || 0;
  const pureProfit = result.pureProfit || 0;

  const totalFees = result.totalFees || 0;
  const totalTax = result.totalTax || 0;
  const totalDuties = Math.round(result.totalDuties || 0);
  const totalRtoReserve = Math.round(result.totalRtoReserve || 0);
  const totalAdSpend = Math.round(result.totalAdSpend || 0);
  const totalItemsSold = result.totalQuantity || 0;

  const avgUnitCostPrice = totalItemsSold > 0 ? Math.round(cogs / totalItemsSold) : 0;
  const operationalExpenses = Math.round(totalFees + totalTax + totalDuties + totalAdSpend);

  const marginPercent = netSales > 0 ? (pureProfit / netSales) * 100 : 0;
  const roiPercent = cogs > 0 ? (pureProfit / cogs) * 100 : 0;

  return {
    originalPrice: cogs,
    avgUnitCostPrice,
    totalItemsSold,
    adSpend: totalAdSpend,
    platformFees: totalFees,
    taxes: totalTax,
    duties: totalDuties,
    actualRtoLoss,
    rtoLoss: totalRtoReserve,
    operationalExpenses,
    shipping: result.totalShipping,
    targetProfit,
    pureProfit,
    grossTotal: grossSales,
    discounts,
    netRevenue: netSales,
    marginPercent: Number(marginPercent.toFixed(1)),
    roiPercent: Number(roiPercent.toFixed(1)),
    pricingTiers: settings.pricingLogicTiers || [],
    gstPercent,
    dutiesPercent,
    fixedFeePercent,
  };
}

// ================================================================
// 🚀 ENGINE 4: COMPARATIVE HOURLY/DAILY TRAJECTORY
// ================================================================
export async function buildSalesChartMatrix(
  range: { startDate: Date; endDate: Date; compareStartDate: Date; compareEndDate: Date; compare: boolean }
): Promise<UnifiedComparativeChartPoint[]> {
  await connectMongoose();

  const isSingleDay = differenceInDays(range.endDate, range.startDate) === 0;
  const timezone = process.env.PKT_TIMEZONE || "+05:00";

  let chartData: UnifiedComparativeChartPoint[] = [];

  if (isSingleDay) {
    const [currentHourly, compareHourly] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: range.startDate, $lte: range.endDate }, status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: { $hour: { date: "$createdAt", timezone } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      range.compare
        ? Order.aggregate([
            { $match: { createdAt: { $gte: range.compareStartDate, $lte: range.compareEndDate }, status: { $in: REVENUE_STATUSES } } },
            { $group: { _id: { $hour: { date: "$createdAt", timezone } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
        : Promise.resolve([]),
    ]);

    const currentMap = new Map(currentHourly.map((i) => [i._id, i]));
    const compareMap = new Map(compareHourly.map((i) => [i._id, i]));

    for (let h = 0; h < 24; h++) {
      const currentMetrics = currentMap.get(h);
      const compareMetrics = compareMap.get(h);
      const hourLabel = formatHourLabel(h);

      chartData.push({
        dayIndex: h,
        currentLabel: hourLabel,
        revenue: currentMetrics ? currentMetrics.revenue : 0,
        orders: currentMetrics ? currentMetrics.orders : 0,
        compareLabel: hourLabel,
        compareRevenue: compareMetrics ? compareMetrics.revenue : 0,
        compareOrders: compareMetrics ? compareMetrics.orders : 0,
      });
    }
  } else {
    const [currentResult, compareResult] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: range.startDate, $lte: range.endDate }, status: { $in: REVENUE_STATUSES } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      range.compare
        ? Order.aggregate([
            { $match: { createdAt: { $gte: range.compareStartDate, $lte: range.compareEndDate }, status: { $in: REVENUE_STATUSES } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ])
        : Promise.resolve([]),
    ]);

    const currentDataMap = new Map(currentResult.map((i) => [i._id, i]));
    const compareDataMap = new Map(compareResult.map((i) => [i._id, i]));

    const currentDays = eachDayOfInterval({ start: range.startDate, end: range.endDate });
    const compareDays = eachDayOfInterval({ start: range.compareStartDate, end: range.compareEndDate });

    const daysCount = currentDays.length;

    for (let i = 0; i < daysCount; i++) {
      const currentDay = currentDays[i];
      const compareDay = compareDays[i];

      const currentStr = format(currentDay, "yyyy-MM-dd");
      const compareStr = compareDay ? format(compareDay, "yyyy-MM-dd") : "";

      const currentMetrics = currentDataMap.get(currentStr);
      const compareMetrics = compareStr ? compareDataMap.get(compareStr) : null;

      chartData.push({
        dayIndex: i,
        currentLabel: format(currentDay, "MMM dd"),
        revenue: currentMetrics ? currentMetrics.revenue : 0,
        orders: currentMetrics ? currentMetrics.orders : 0,
        compareLabel: compareDay ? format(compareDay, "MMM dd") : "",
        compareRevenue: compareMetrics ? compareMetrics.revenue : 0,
        compareOrders: compareMetrics ? compareMetrics.orders : 0,
      });
    }
  }

  return chartData;
}