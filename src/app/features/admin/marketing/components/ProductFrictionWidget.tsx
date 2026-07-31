// // 📂 src/app/features/admin/marketing/components/ProductFrictionWidget.tsx (TOP-TIER PRODUCT TITLES & LOST SALES SYNCED)

// "use client";

// import React from "react";
// import {
//   Eye,
//   ShoppingCart,
//   Package,
//   TrendingUp,
//   TrendingDown,
//   AlertTriangle,
//   Flame,
//   Banknote,
// } from "lucide-react";
// import { ProductFrictionResponse } from "../actions/getProductFriction";

// // ================================================================
// // ✅ HELPERS
// // ================================================================
// const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
// const formatCurrency = (value: number): string => `Rs. ${value.toLocaleString('en-PK')}`;

// const FrictionBadge = ({
//   type,
// }: {
//   type: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";
// }) => {
//   const config = {
//     CRITICAL_DROPOFF: {
//       label: "Critical Dropoff",
//       className: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse",
//       icon: <Flame size={11} className="text-red-500" />,
//     },
//     PRICE_BARRIER: {
//       label: "Price Barrier",
//       className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
//       icon: <AlertTriangle size={11} className="text-orange-500" />,
//     },
//     LOW_INTEREST: {
//       label: "Low Interest",
//       className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
//       icon: <TrendingDown size={11} className="text-yellow-500" />,
//     },
//     HEALTHY: {
//       label: "Healthy",
//       className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
//       icon: <TrendingUp size={11} className="text-emerald-500" />,
//     },
//   };

//   const { label, className, icon } = config[type] || config.HEALTHY;
//   return (
//     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${className}`}>
//       {icon}
//       {label}
//     </span>
//   );
// };

// // ================================================================
// // ✅ KPI Card Component
// // ================================================================
// const KPICard = ({
//   title,
//   value,
//   subtext,
//   icon: Icon,
//   color = "brand",
// }: {
//   title: string;
//   value: string;
//   subtext?: string;
//   icon: React.ElementType;
//   color?: "brand" | "yellow" | "red" | "blue" | "emerald";
// }) => {
//   const colorClasses = {
//     brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
//     emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
//     yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
//     red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
//     blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
//   };

//   return (
//     <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
//             {title}
//           </p>
//           <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 mt-1 font-mono tracking-tight">
//             {value}
//           </p>
//           {subtext && (
//             <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1 truncate">
//               {subtext}
//             </p>
//           )}
//         </div>
//         <div className={`p-2.5 rounded-xl border ${colorClasses[color]} shrink-0`}>
//           <Icon size={18} />
//         </div>
//       </div>
//     </div>
//   );
// };

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// interface ProductFrictionWidgetProps {
//   data: ProductFrictionResponse | null;
//   isLoading?: boolean;
// }

// export default function ProductFrictionWidget({
//   data,
//   isLoading = false,
// }: ProductFrictionWidgetProps) {
//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="p-6 space-y-6 animate-pulse bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
//           ))}
//         </div>
//         <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
//       </div>
//     );
//   }

//   // Empty State
//   if (!data || !data.data || data.data.length === 0) {
//     return (
//       <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-950 p-12 text-center animate-in fade-in duration-300">
//         <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
//           <div className="p-4 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl shadow-xs">
//             <Package size={24} className="stroke-[2px]" />
//           </div>
//           <div className="space-y-1">
//             <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
//               No Product Friction Detected
//             </h3>
//             <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
//               Once customers start viewing and adding products to cart, friction insights and dropoff analytics will appear here.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const totalProducts = data.totalFrictionCount || data.data.length;
//   const criticalDropoffs = data.data.filter((p) => p.frictionType === "CRITICAL_DROPOFF").length;
//   const priceBarriers = data.data.filter((p) => p.frictionType === "PRICE_BARRIER").length;
//   const totalLostSales = data.data.reduce((sum, item) => sum + (item.potentialLostRevenue || 0), 0);

//   return (
//     <div className="p-6 sm:p-8 space-y-6 w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800/80 shadow-2xl animate-in fade-in duration-300">
      
//       {/* SECTION HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
//         <div>
//           <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
//             <AlertTriangle className="text-red-500" size={20} /> Product Friction & Dropoff Audit
//           </h3>
//           <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
//             Identify High-Interest Listings with Checkout & Pricing Obstacles
//           </p>
//         </div>
//         <span className="text-[9px] font-mono font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full uppercase tracking-widest">
//           {totalProducts} FLAGGED ITEMS
//         </span>
//       </div>

//       {/* KPI ROW (4 Dynamic Cards) */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <KPICard
//           title="Friction Products"
//           value={totalProducts.toString()}
//           subtext="Total flagged listings"
//           icon={Package}
//           color="brand"
//         />
//         <KPICard
//           title="Critical Dropoffs"
//           value={criticalDropoffs.toString()}
//           subtext="Carted but 0 purchases"
//           icon={Flame}
//           color="red"
//         />
//         <KPICard
//           title="Price Barriers"
//           value={priceBarriers.toString()}
//           subtext="High carting, low checkout"
//           icon={ShoppingCart}
//           color="yellow"
//         />
//         <KPICard
//           title="Est. Lost Sales"
//           value={formatCurrency(totalLostSales)} // ✅ Total PKR Lost Revenue Sum
//           icon={Banknote}
//           color="emerald"
//         />
//       </div>

//       {/* TABLE CONTAINER */}
//       <div className="bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs flex flex-col">
//         <div className="overflow-auto max-h-87.5 custom-scrollbar">
//           <table className="w-full border-collapse text-left text-xs relative">
//             <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800">
//               <tr className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-bold tracking-wider">
//                 <th className="py-3.5 px-4">Product Name</th> {/* ✅ Real product title column */}
//                 <th className="py-3.5 px-4 text-center">Views</th>
//                 <th className="py-3.5 px-4 text-center">Adds</th>
//                 <th className="py-3.5 px-4 text-center">Orders</th>
//                 <th className="py-3.5 px-4 text-center">View → Cart</th>
//                 <th className="py-3.5 px-4 text-center">Cart → Order</th>
//                 <th className="py-3.5 px-4 text-right">Est. Lost Sales</th> {/* ✅ PKR Lost Revenue Column */}
//                 <th className="py-3.5 px-4 text-center">Friction Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white/50 dark:bg-zinc-950/50">
//               {data.data.map((product) => (
//                 <tr
//                   key={product.productId}
//                   className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors"
//                 >
//                   <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
//                     {product.productName} {/* ✅ Real Product Title from Payload CMS */}
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300">
//                     {product.views.toLocaleString('en-PK')}
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300">
//                     {product.addToCarts.toLocaleString('en-PK')}
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
//                     {product.purchasedQty.toLocaleString('en-PK')}
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-bold">
//                     <span
//                       className={`${
//                         product.viewToCartRate > 20
//                           ? "text-emerald-500"
//                           : product.viewToCartRate > 10
//                           ? "text-yellow-600 dark:text-yellow-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       {formatPercent(product.viewToCartRate)}
//                     </span>
//                   </td>
//                   <td className="py-3.5 px-4 text-center font-mono font-bold">
//                     <span
//                       className={`${
//                         product.cartToOrderRate > 30
//                           ? "text-emerald-500"
//                           : product.cartToOrderRate > 15
//                           ? "text-yellow-600 dark:text-yellow-500"
//                           : "text-red-500"
//                       }`}
//                     >
//                       {formatPercent(product.cartToOrderRate)}
//                     </span>
//                   </td>
//                   <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
//                     {formatCurrency(product.potentialLostRevenue || 0)}
//                   </td>
//                   <td className="py-3.5 px-4 text-center">
//                     <FrictionBadge type={product.frictionType} />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/marketing/components/ProductFrictionWidget.tsx (TOP-TIER PRODUCT TITLES & LOST SALES SYNCED)

"use client";

import React from "react";
import {
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  Banknote,
} from "lucide-react";
import { ProductFrictionResponse } from "../actions/getProductFriction";

// ================================================================
// ✅ HELPERS
// ================================================================
const formatPercent = (value: number): string => `${(value || 0).toFixed(1)}%`;
const formatCurrency = (value: number): string => `Rs. ${(value || 0).toLocaleString('en-PK')}`;

const FrictionBadge = ({
  type,
}: {
  type: "CRITICAL_DROPOFF" | "PRICE_BARRIER" | "LOW_INTEREST" | "HEALTHY";
}) => {
  const config = {
    CRITICAL_DROPOFF: {
      label: "Critical Dropoff",
      className: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse",
      icon: <Flame size={11} className="text-red-500" />,
    },
    PRICE_BARRIER: {
      label: "Price Barrier",
      className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
      icon: <AlertTriangle size={11} className="text-orange-500" />,
    },
    LOW_INTEREST: {
      label: "Low Interest",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      icon: <TrendingDown size={11} className="text-yellow-500" />,
    },
    HEALTHY: {
      label: "Healthy",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: <TrendingUp size={11} className="text-emerald-500" />,
    },
  };

  const { label, className, icon } = config[type] || config.HEALTHY;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${className}`}>
      {icon}
      {label}
    </span>
  );
};

// ================================================================
// ✅ HIGH-DENSITY KPI CARD
// ================================================================
const KPICard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = "brand",
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  color?: "brand" | "yellow" | "red" | "blue" | "emerald";
}) => {
  const colorClasses = {
    brand: "bg-brand-primary/10 text-brand-primary border-brand-primary/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  };

  return (
    <div className="p-4 bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] uppercase font-mono font-bold text-zinc-500 dark:text-zinc-400 tracking-wider leading-tight wrap-break-word">
          {title}
        </p>
        <div className={`p-2 rounded-xl border ${colorClasses[color]} shrink-0 shadow-2xs`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight leading-none">
          {value}
        </p>
        {subtext && (
          <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium mt-1 leading-tight wrap-break-word">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
interface ProductFrictionWidgetProps {
  data: ProductFrictionResponse | null;
  isLoading?: boolean;
}

export default function ProductFrictionWidget({
  data,
  isLoading = false,
}: ProductFrictionWidgetProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
          ))}
        </div>
        <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800" />
      </div>
    );
  }

  // Empty State (Synchronized Height)
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-2xl">
            <Package size={32} />
          </div>
          <h3 className="text-base font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
            No Product Friction Detected
          </h3>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 max-w-md">
            Once customers start viewing and adding products to cart, friction insights and dropoff analytics will appear here.
          </p>
        </div>
      </div>
    );
  }

  const totalProducts = data.totalFrictionCount || data.data.length;
  const criticalDropoffs = data.data.filter((p) => p.frictionType === "CRITICAL_DROPOFF").length;
  const priceBarriers = data.data.filter((p) => p.frictionType === "PRICE_BARRIER").length;
  const totalLostSales = data.data.reduce((sum, item) => sum + (item.potentialLostRevenue || 0), 0);

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* KPI ROW (4 Dynamic Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Friction Products"
          value={totalProducts.toString()}
          subtext="Total Flagged Listings"
          icon={Package}
          color="brand"
        />
        <KPICard
          title="Critical Dropoffs"
          value={criticalDropoffs.toString()}
          subtext="Carted 0 Purchases"
          icon={Flame}
          color="red"
        />
        <KPICard
          title="Price Barriers"
          value={priceBarriers.toString()}
          subtext="Low Checkout Conv."
          icon={ShoppingCart}
          color="yellow"
        />
        <KPICard
          title="Est. Lost Sales"
          value={formatCurrency(totalLostSales)}
          subtext="Potential Lost Revenue"
          icon={Banknote}
          color="emerald"
        />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-95 custom-scrollbar">
          <table className="w-full min-w-175 border-collapse text-left text-xs relative">
            <thead className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
              <tr className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3 px-4 whitespace-nowrap">Product Name</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Views</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Adds</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Orders</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">View → Cart</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Cart → Order</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Est. Lost Sales</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Friction Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white/40 dark:bg-zinc-950/40">
              {data.data.map((product) => (
                <tr
                  key={product.productId}
                  className="hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 max-w-xs truncate whitespace-nowrap">
                    {product.productName}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {product.views.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                    {product.addToCarts.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {product.purchasedQty.toLocaleString('en-PK')}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={`${
                        product.viewToCartRate > 20
                          ? "text-emerald-500"
                          : product.viewToCartRate > 10
                          ? "text-yellow-600 dark:text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatPercent(product.viewToCartRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold whitespace-nowrap">
                    <span
                      className={`${
                        product.cartToOrderRate > 30
                          ? "text-emerald-500"
                          : product.cartToOrderRate > 15
                          ? "text-yellow-600 dark:text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatPercent(product.cartToOrderRate)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(product.potentialLostRevenue || 0)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <FrictionBadge type={product.frictionType} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}