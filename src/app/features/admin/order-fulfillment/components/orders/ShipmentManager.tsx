// 📂 src/app/features/admin/order-fulfillment/components/orders/ShipmentManager.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useTransition, Fragment, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createShipment, getOrderShipments, getAvailableCouriers } from "../../actions/shipmentActions";
import { Loader2, Package, Truck, Plus, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";

interface ShipmentItem {
  productId: string;
  variantKey: string;
  name: string;
  quantity: number;
  maxQuantity: number;
  selected: boolean;
}

interface CourierOption {
  key: string;
  name: string;
  isDefault: boolean;
}

interface ShipmentManagerProps {
  orderId: string;
  orderProducts: Array<{
    productId: string;
    variantKey: string;
    name: string;
    quantity: number;
  }>;
}

export default function ShipmentManager({ orderId, orderProducts }: ShipmentManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shipments, setShipments] = useState<any[]>([]);
  const [loadingShipments, setLoadingShipments] = useState(false);
  const [courierOptions, setCourierOptions] = useState<CourierOption[]>([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);

  // Form state
  const [selectedItems, setSelectedItems] = useState<Record<string, ShipmentItem>>({});
  const [courierKey, setCourierKey] = useState<string>("manual");
  const [trackingId, setTrackingId] = useState("");

  // SSR Hydration safeguard registration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch couriers on mount
  useEffect(() => {
    const fetchCouriers = async () => {
      setLoadingCouriers(true);
      try {
        const result = await getAvailableCouriers();
        if (result.success) {
          setCourierOptions(result.couriers);
          const defaultCourier = result.couriers.find((c) => c.isDefault);
          if (defaultCourier) {
            setCourierKey(defaultCourier.key);
          } else if (result.couriers.length > 0) {
            setCourierKey(result.couriers[0].key);
          }
        }
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      } finally {
        setLoadingCouriers(false);
      }
    };
    fetchCouriers();
  }, []);

  // Fetch shipments
  const fetchShipments = async () => {
    setLoadingShipments(true);
    try {
      const result = await getOrderShipments(orderId);
      if (result.success) {
        setShipments(result.shipments || []);
      }
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
    } finally {
      setLoadingShipments(false);
    }
  };

  const handleOpen = () => {
    const initial: Record<string, ShipmentItem> = {};
    orderProducts.forEach((p) => {
      const key = `${p.productId}-${p.variantKey}`;
      initial[key] = {
        ...p,
        maxQuantity: p.quantity,
        selected: false,
        name: p.name,
      };
    });
    setSelectedItems(initial);
    setIsOpen(true);
    fetchShipments();
  };

  const toggleItem = (key: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], selected: !prev[key].selected },
    }));
  };

  const updateQuantity = (key: string, quantity: number) => {
    setSelectedItems((prev) => ({
      ...prev,
      [key]: { ...prev[key], quantity: Math.min(quantity, prev[key].maxQuantity) },
    }));
  };

  const handleSubmit = () => {
    const itemsToShip = Object.values(selectedItems)
      .filter((item) => item.selected && item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        variantKey: item.variantKey,
        quantity: item.quantity,
      }));

    if (itemsToShip.length === 0) {
      toast.error("Please select at least one item to ship.");
      return;
    }

    startTransition(async () => {
      const result = await createShipment({
        orderId,
        items: itemsToShip,
        courierKey: courierKey as any,
        trackingId: trackingId || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setIsOpen(false);
        fetchShipments();
        setTrackingId("");
        const defaultCourier = courierOptions.find((c) => c.isDefault);
        if (defaultCourier) {
          setCourierKey(defaultCourier.key);
        }
      } else {
        toast.error(result.message);
      }
    });
  };

  const selectedCount = Object.values(selectedItems).filter((i) => i.selected).length;

  return (
    <>
      {/* Shipments List HUD Container */}
      <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-150 dark:border-zinc-850">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono flex items-center gap-2">
            <Truck size={16} className="text-brand-primary" /> Shipments ({shipments.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={fetchShipments}
              disabled={loadingShipments}
              className="p-1.5 text-zinc-500 hover:text-brand-primary rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loadingShipments ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Plus size={14} /> Create Shipment
            </button>
          </div>
        </div>

        {shipments.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6 font-mono">
            No shipments created yet. Click "Create Shipment" to start partial fulfillment.
          </p>
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment, index) => (
              <div
                key={shipment.id || index}
                className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 bg-zinc-50/50 dark:bg-zinc-900/30"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {shipment.trackingId || "AWB Pending"}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Courier: {shipment.courierDisplayName || shipment.courierName || shipment.courier} • Items: {shipment.items?.length || 0}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
                      {mounted && shipment.createdAt
                        ? new Date(shipment.createdAt).toLocaleString("en-PK", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : shipment.createdAt?.split("T")[0] || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full ${
                      shipment.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : shipment.status === "In Transit"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : shipment.status === "RTO"
                        ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                        : shipment.status === "PickedUp"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }`}
                  >
                    {shipment.status || "Preparing"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                  {shipment.items?.map((item: any, i: number) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      {item.productId?.slice(-6)} (x{item.quantity})
                    </span>
                  ))}
                </div>
                {shipment.labelUrl && (
                  <div className="mt-2 pt-2 border-t border-zinc-150 dark:border-zinc-800">
                    <a
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline"
                    >
                      Download Label
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Shipment Dialog Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-2xl transition-all">
                  <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-mono uppercase tracking-wider">
                    <Package size={18} className="text-brand-primary" /> Create New Shipment
                  </DialogTitle>

                  <div className="mt-4 space-y-4">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Select items to ship. Stock will be automatically deducted in Payload CMS.
                    </p>

                    {/* Items Selection List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                      {Object.entries(selectedItems).map(([key, item]) => (
                        <div key={key} className="flex items-center gap-3 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(key)}
                            className="h-3.5 w-3.5 rounded border-zinc-300 dark:border-zinc-700 text-brand-primary focus:ring-brand-primary cursor-pointer"
                          />
                          <div className="grow min-w-0">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">
                              Available: {item.maxQuantity}
                            </p>
                          </div>
                          {item.selected && (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(key, parseInt(e.target.value) || 1)}
                              min={1}
                              max={item.maxQuantity}
                              className="w-16 p-1 text-xs font-mono font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Courier & Tracking Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Courier
                        </label>
                        <select
                          value={courierKey}
                          onChange={(e) => setCourierKey(e.target.value)}
                          disabled={loadingCouriers}
                          className="w-full p-2 text-xs font-semibold border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200"
                        >
                          {loadingCouriers ? (
                            <option value="">Loading...</option>
                          ) : (
                            courierOptions.map((c) => (
                              <option key={c.key} value={c.key}>
                                {c.name} {c.isDefault ? "(Default)" : ""}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
                          Tracking ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          placeholder="AWB-12345"
                          className="w-full p-2 text-xs font-mono border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      <CheckCircle size={12} className="inline mr-1 text-emerald-500" />
                      {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected for shipment.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending || selectedCount === 0}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10"
                    >
                      {isPending && <Loader2 className="animate-spin" size={14} />}
                      Create Shipment
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}