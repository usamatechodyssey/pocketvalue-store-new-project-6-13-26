// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { urlFor } from "@/sanity/lib/image";
// import { ChevronDown, ChevronRight, Edit3 } from "lucide-react";
// import CopyButton from "@/app/shared/components/helpers/CopyButton";

// export interface Variant {
//   _key: string;
//   name: string;
//   sku?: string;
//   price?: number;
//   inStock: boolean;
//   stock?: number;
// }

// export interface AdminProductListItem {
//   _id: string;
//   title: string;
//   slug: string;
//   price?: number;
//   stock?: number;
//   inStock?: boolean;
//   mainImage?: any;
//   variantsCount: number;
//   variants: Variant[];
// }

// const formatPrice = (price?: number) => price != null ? `Rs. ${price.toLocaleString()}` : "N/A";

// export default function ProductsTable({ products }: { products: AdminProductListItem[] }) {
//   const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

//   return (
//     <div className="hidden lg:block overflow-x-auto">
//       <table className="w-full table-auto border-collapse text-sm">
//         <thead className="bg-gray-50 dark:bg-gray-900/50">
//           <tr className="text-gray-500 dark:text-gray-400">
//             <th className="w-12 px-4 py-3"></th>
//             <th className="w-20 px-6 py-3 text-left">Image</th>
//             <th className="px-6 py-3 text-left">Product Details</th>
//             <th className="w-40 px-6 py-3 text-left">Price (Min)</th>
//             <th className="w-40 px-6 py-3 text-left">Inventory</th>
//             <th className="w-28 px-6 py-3 text-right">Action</th>
//           </tr>
//         </thead>
//         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//           {products.map((product) => {
//             const isExpanded = expandedRowId === product._id;
//             return (
//               <React.Fragment key={product._id}>
//                 <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
//                   <td className="px-4 py-4 text-center">
//                     <button onClick={() => setExpandedRowId(isExpanded ? null : product._id)} className="p-1 hover:text-brand-primary">
//                       {isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border dark:border-gray-700">
//                       {product.mainImage ? <Image src={urlFor(product.mainImage).url()} alt="" fill className="object-contain p-1" /> : null}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.title}</div>
//                     <div className="text-[10px] mt-1 flex items-center font-mono opacity-60 uppercase">
//                       ID: {product._id.slice(-8)} <CopyButton textToCopy={product._id} />
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 font-bold text-brand-primary">{formatPrice(product.price)}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                       {product.stock} Units
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     {/* ✅ FIX: Path points to Payload Collection Editor */}
//                     <Link href={`/admin/collections/products/${product._id}`} className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:underline">
//                       <Edit3 size={14}/> Edit
//                     </Link>
//                   </td>
//                 </tr>
//                 {isExpanded && (
//                   <tr>
//                     <td colSpan={6} className="bg-gray-50/50 dark:bg-gray-900/20 px-8 py-4">
//                       <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
//                         <table className="w-full text-xs">
//                           <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500">
//                             <tr>
//                               <th className="p-2 text-left">Variant Name & ID</th>
//                               <th className="p-2 text-left">SKU</th>
//                               <th className="p-2 text-left">Price</th>
//                               <th className="p-2 text-right">Stock</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {product.variants.map((v) => (
//                               <tr key={v._key} className="border-t dark:border-gray-700">
//                                 <td className="p-2">
//                                   <div className="font-bold">{v.name}</div>
//                                   <div className="text-[9px] opacity-50 flex items-center gap-1">KEY: {v._key} <CopyButton textToCopy={v._key} /></div>
//                                 </td>
//                                 <td className="p-2 font-mono">{v.sku || "---"}</td>
//                                 <td className="p-2 font-bold">{formatPrice(v.price)}</td>
//                                 <td className="p-2 text-right">
//                                    <span className={v.inStock ? "text-green-600" : "text-red-500"}>{v.stock} pcs</span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// src/app/features/admin/inventory-cms/components/payload-products/ProductsTable.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import { ChevronDown, ChevronRight, Edit3 } from "lucide-react";
import CopyButton from "@/app/shared/components/helpers/CopyButton";

export interface Variant {
  _key: string;
  name: string;
  sku?: string;
  price?: number;
  inStock: boolean;
  stock?: number;
}

export interface AdminProductListItem {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  mainImage?: any;
  variantsCount: number;
  variants: Variant[];
}

const formatPrice = (price?: number) => price != null ? `Rs. ${price.toLocaleString()}` : "N/A";

export default function ProductsTable({ products }: { products: AdminProductListItem[] }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900/50">
          <tr className="text-gray-500 dark:text-gray-400">
            <th className="w-12 px-4 py-3"></th>
            <th className="w-20 px-6 py-3 text-left">Image</th>
            <th className="px-6 py-3 text-left">Product Details</th>
            <th className="w-40 px-6 py-3 text-left">Price (Min)</th>
            <th className="w-40 px-6 py-3 text-left">Inventory</th>
            <th className="w-28 px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((product) => {
            const isExpanded = expandedRowId === product._id;
            return (
              <React.Fragment key={product._id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => setExpandedRowId(isExpanded ? null : product._id)} className="p-1 hover:text-brand-primary">
                      {isExpanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative h-12 w-12 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden border dark:border-gray-700">
                      {product.mainImage ? (
                        <Image 
                          src={urlFor(product.mainImage).url()} 
                          alt="" 
                          fill 
                          // ✅ ENTERPRISE UPGRADE: Added sizes prop to force Next.js to only request small WebP thumbnails instead of heavy 4K (3840px) assets.
                          // This completely silences browser console performance warnings and optimizes admin dashboard load speeds.
                          sizes="48px" 
                          className="object-contain p-1" 
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.title}</div>
                    <div className="text-[10px] mt-1 flex items-center font-mono opacity-60 uppercase">
                      ID: {product._id.slice(-8)} <CopyButton textToCopy={product._id} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-primary">{formatPrice(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.stock} Units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* ✅ FIX: Path points to Payload Collection Editor */}
                    <Link href={`/admin/collections/products/${product._id}`} className="inline-flex items-center gap-1.5 font-bold text-brand-primary hover:underline">
                      <Edit3 size={14}/> Edit
                    </Link>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="bg-gray-50/50 dark:bg-gray-900/20 px-8 py-4">
                      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-100 dark:bg-gray-800 text-gray-500">
                            <tr>
                              <th className="p-2 text-left">Variant Name & ID</th>
                              <th className="p-2 text-left">SKU</th>
                              <th className="p-2 text-left">Price</th>
                              <th className="p-2 text-right">Stock</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.variants.map((v) => (
                              <tr key={v._key} className="border-t dark:border-gray-700">
                                <td className="p-2">
                                  <div className="font-bold">{v.name}</div>
                                  <div className="text-[9px] opacity-50 flex items-center gap-1">KEY: {v._key} <CopyButton textToCopy={v._key} /></div>
                                </td>
                                <td className="p-2 font-mono">{v.sku || "---"}</td>
                                <td className="p-2 font-bold">{formatPrice(v.price)}</td>
                                <td className="p-2 text-right">
                                   <span className={v.inStock ? "text-green-600" : "text-red-500"}>{v.stock} pcs</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}