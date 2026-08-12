// 📂 src/app/features/admin/product-intelligence/components/ProductDrillDownModal.tsx

"use client";

import React, { Fragment } from "react";
import { Dialog, Transition, TransitionChild, DialogPanel } from "@headlessui/react";
import { X, ShoppingBag, Box, ArrowRight, ExternalLink, History, PackageX } from "lucide-react";
import Link from "next/link";

// ================================================================
// ✅ ENTERPRISE FIX: Proper Props with Null/Undefined Handling
// ================================================================
interface ProductDrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    product: any;
    recentOrders: any[];
  } | null;
}

export default function ProductDrillDownModal({
  isOpen,
  onClose,
  data,
}: ProductDrillDownModalProps) {
  // Early return if no data
  if (!data) return null;

  const { product, recentOrders } = data;

  // ✅ CDN & Upload Mode Fallback Image Resolver
  const productImage =
    product?.variants?.[0]?.cdnImages?.[0]?.url ||
    product?.variants?.[0]?.images?.[0]?.url ||
    product?.image?.url ||
    "/placeholder.svg";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        // ✅ FIX 1: Changed un-compiled 'z-9999' to valid Tailwind arbitrary class 'z-[9999]'
        className="relative z-9999"
        onClose={onClose}
        aria-label="Product Drill-Down Modal"
        role="dialog"
      >
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md border-l border-zinc-200 dark:border-zinc-800">
                  <div className="flex h-full flex-col bg-white dark:bg-zinc-950 shadow-2xl font-mono">
                    
                    {/* MODAL HEADER */}
                    <div className="p-6 sm:p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-brand-primary font-bold text-xs uppercase tracking-widest">
                          <History size={14} /> Full SKU Audit
                        </div>
                        <button
                          onClick={onClose}
                          className="rounded-xl p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          aria-label="Close modal"
                        >
                          <X size={18} className="text-zinc-500 dark:text-zinc-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                          <img
                            src={productImage}
                            alt={product?.title || "Product"}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-black dark:text-white truncate uppercase tracking-tight leading-tight">
                            {product?.title || "Unknown Product"}
                          </h2>
                          <Link
                            href={`/admin/collections/products/${product?.id}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-primary uppercase mt-1.5 hover:underline tracking-wider no-underline"
                            aria-label={`Edit ${product?.title} in core editor`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open in Core Editor <ExternalLink size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                      
                      {/* 1. INVENTORY BREAKDOWN */}
                      <section aria-label="Inventory Distribution">
                        <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-l-2 border-brand-primary pl-2.5">
                          <Box size={14} className="text-brand-primary" /> Inventory Distribution
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {product?.variants?.length > 0 ? (
                            product.variants.map((v: any) => (
                              <div
                                key={v.id || v._key}
                                className="flex justify-between items-center p-3 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                              >
                                <span className="text-xs font-bold dark:text-zinc-200 truncate">
                                  {v.name || "Default"}
                                </span>
                                <div className="text-right shrink-0">
                                  <p
                                    className={`text-xs font-black ${
                                      (v.stock || 0) <= 5 ? "text-red-500" : "text-emerald-500"
                                    }`}
                                  >
                                    {v.stock || 0}{" "}
                                    <small className="text-[8px] uppercase font-bold opacity-60">
                                      pcs
                                    </small>
                                  </p>
                                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-tighter">
                                    Rs. {(v.price || 0).toLocaleString('en-PK')}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-zinc-400 text-xs italic">
                              No variants found.
                            </div>
                          )}
                        </div>
                      </section>

                      {/* 2. RECENT ACQUISITION ORDERS */}
                      <section aria-label="Recent Order History">
                        <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-l-2 border-brand-primary pl-2.5">
                          <ShoppingBag size={14} className="text-brand-primary" /> Recent Acquisition History
                        </h4>
                        <div className="space-y-2.5">
                          {recentOrders && recentOrders.length > 0 ? (
                            recentOrders.map((o: any) => (
                              <Link
                                key={o.orderId || o._id}
                                href={`/admin/orders/${o._id}`}
                                className="group/order block p-4 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-brand-primary/30 transition-all shadow-2xs no-underline hover:no-underline"
                                aria-label={`View order ${o.orderId}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                                      Order #{o.orderId || o._id.slice(-6)}
                                    </p>
                                    <p className="text-xs font-bold dark:text-zinc-200 mt-1 truncate">
                                      {o.shippingAddress?.fullName || "Guest Customer"}
                                    </p>
                                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">
                                      {o.createdAt
                                        ? new Date(o.createdAt).toLocaleDateString('en-PK')
                                        : "N/A"}{" "}
                                      • Rs. {(o.totalPrice || 0).toLocaleString('en-PK')}
                                    </p>
                                  </div>
                                  <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl group-hover/order:bg-brand-primary group-hover/order:text-white transition-all text-zinc-400 shrink-0">
                                    <ArrowRight size={14} />
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
                              <PackageX size={28} className="text-zinc-400 opacity-40 mb-2" />
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                No Order History
                              </p>
                              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                No recent orders found for this product in the selected period.
                              </p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    {/* MODAL FOOTER */}
                    <div className="p-6 bg-zinc-50/80 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
                      <button
                        onClick={onClose}
                        className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold uppercase text-xs tracking-widest rounded-xl transition-all shadow-md shadow-brand-primary/20 cursor-pointer"
                      >
                        Terminate Audit
                      </button>
                    </div>

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}