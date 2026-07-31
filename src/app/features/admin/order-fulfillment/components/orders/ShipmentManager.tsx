// src/features/admin/order-fulfillment/components/orders/ShipmentManager.tsx
"use client";

import { useState, useTransition, Fragment, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createShipment, getOrderShipments, getAvailableCouriers } from "../../actions/shipmentActions";
import { Loader2, Package, Truck, Plus, X, CheckCircle, RefreshCw } from "lucide-react";
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

  // Fetch couriers on mount
  useEffect(() => {
    const fetchCouriers = async () => {
      setLoadingCouriers(true);
      try {
        const result = await getAvailableCouriers();
        if (result.success) {
          setCourierOptions(result.couriers);
          // Set default courier
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

  // Fetch shipments on mount
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
    // Initialize selected items with all available products
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
      // ✅ FIXED: Use courierKey instead of courier
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
        // Reset form
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
      {/* Shipments List */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Truck size={18} /> Shipments ({shipments.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={fetchShipments}
              disabled={loadingShipments}
              className="p-2 text-gray-500 hover:text-brand-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={16} className={loadingShipments ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleOpen}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover"
            >
              <Plus size={16} /> Create Shipment
            </button>
          </div>
        </div>

        {shipments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
            No shipments created yet. Click "Create Shipment" to start partial fulfillment.
          </p>
        ) : (
          <div className="space-y-3">
            {shipments.map((shipment, index) => (
              <div
                key={shipment.id || index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                      {shipment.trackingId || "AWB Pending"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Courier: {shipment.courierDisplayName || shipment.courierName || shipment.courier} • Items: {shipment.items?.length || 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {shipment.createdAt ? new Date(shipment.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded-full ${
                      shipment.status === "Delivered"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : shipment.status === "In Transit"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : shipment.status === "RTO"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : shipment.status === "PickedUp"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {shipment.status || "Preparing"}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {shipment.items?.map((item: any, i: number) => (
                    <span key={i}>
                      {i > 0 && ", "}
                      {item.productId?.slice(-6)} (x{item.quantity})
                    </span>
                  ))}
                </div>
                {shipment.labelUrl && (
                  <div className="mt-2">
                    <a
                      href={shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-primary hover:underline"
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

      {/* Create Shipment Modal */}
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
            <div className="fixed inset-0 bg-black/30" />
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
                <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Package size={20} /> Create New Shipment
                  </DialogTitle>

                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select items to ship. Stock will be automatically deducted.
                    </p>

                    {/* Items List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border rounded-lg p-3">
                      {Object.entries(selectedItems).map(([key, item]) => (
                        <div key={key} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleItem(key)}
                            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <div className="grow">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
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
                              className="w-16 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Courier Selection - ✅ FIXED: Using courierKey */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">
                          Courier
                        </label>
                        <select
                          value={courierKey}
                          onChange={(e) => setCourierKey(e.target.value)}
                          disabled={loadingCouriers}
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
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
                        <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">
                          Tracking ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={trackingId}
                          onChange={(e) => setTrackingId(e.target.value)}
                          placeholder="AWB-12345"
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle size={12} className="inline mr-1" />
                      {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected for shipment.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isPending || selectedCount === 0}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400"
                    >
                      {isPending && <Loader2 className="animate-spin" size={16} />}
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