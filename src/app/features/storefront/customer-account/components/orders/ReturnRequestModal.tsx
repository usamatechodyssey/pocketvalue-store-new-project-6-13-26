// "use client";

// import { useState, useTransition, Fragment, useEffect, useRef } from "react";
// import { usePathname } from "next/navigation";
// import { toast } from "react-hot-toast";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { Loader2 } from "lucide-react";
// import { createReturnRequestAction } from "@/app/features/storefront/customer-account/actions/returnActions";
// import { ClientOrderProduct } from "@/models/Order";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// // ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
// import { DEFAULT_RETURN_REASON } from "@/app/shared/utils/orderDisplayUtils";

// import ReturnableItem from "./ReturnableItem"; 

// const inputStyles =
//   "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   orderId: string;
//   orderNumber: string;
//   products: ClientOrderProduct[]; 
// }

// export default function ReturnRequestModal({
//   isOpen,
//   onClose,
//   orderId,
//   orderNumber,
//   products,
// }: Props) {
//   const [isPending, startTransition] = useTransition();
//   const [selectedItems, setSelectedItems] = useState<
//     Record<
//       string,
//       {
//         productId: string;
//         variantKey: string;
//         quantity: number;
//         reason: string;
//       }
//     >
//   >({});
//   const [comments, setComments] = useState("");
//   const pathname = usePathname();

//   const hasSubmittedRef = useRef(false);
//   const isOpenedRef = useRef(false);

//   useEffect(() => {
//     if (isOpen) {
//       hasSubmittedRef.current = false;
//       isOpenedRef.current = true;
      
//       logUserEvent('return_portal_drop', pathname, {
//         orderId,
//         orderNumber,
//         step: 'portal_opened'
//       });
//     } else if (isOpenedRef.current) {
//       isOpenedRef.current = false;
      
//       if (!hasSubmittedRef.current) {
//         logUserEvent('return_portal_drop', pathname, {
//           orderId,
//           orderNumber,
//           step: 'portal_abandoned',
//           selected_items_count: Object.keys(selectedItems).length,
//           comments_length: comments.trim().length
//         });
//       }
//     }
//   }, [isOpen, orderId, orderNumber, pathname, selectedItems, comments]);

//   const handleItemToggle = (product: ClientOrderProduct) => {
//     const { cartItemId, _id, variant } = product;
//     setSelectedItems((prev) => {
//       const newSelected = { ...prev };
//       if (newSelected[cartItemId]) {
//         delete newSelected[cartItemId];
//       } else {
//         newSelected[cartItemId] = {
//           productId: _id, 
//           variantKey: variant?._key || "",
//           quantity: 1,
//           reason: DEFAULT_RETURN_REASON,
//         };
//       }

//       logUserEvent('form_field_interaction', pathname, {
//         field_id: 'return_item_select_toggle',
//         interaction_type: 'change',
//         selected_count: Object.keys(newSelected).length
//       });

//       return newSelected;
//     });
//   };

//   const handleItemChange = (
//     cartItemId: string,
//     field: "quantity" | "reason",
//     value: string | number
//   ) => {
//     setSelectedItems((prev) => ({
//       ...prev,
//       [cartItemId]: { ...prev[cartItemId], [field]: value },
//     }));
//   };

//   const handleSubmit = () => {
//     const itemsToSubmit = Object.values(selectedItems);
//     if (itemsToSubmit.length === 0) {
//       toast.error("Please select at least one item to return.");
//       return;
//     }
//     startTransition(async () => {
//       const formData = new FormData();
//       formData.append("orderId", orderId);
//       formData.append("orderNumber", orderNumber);
//       formData.append("items", JSON.stringify(itemsToSubmit));
//       formData.append("customerComments", comments);
//       const result = await createReturnRequestAction(formData);
//       if (result.success) {
//         toast.success(result.message);
//         hasSubmittedRef.current = true;
        
//         logUserEvent('return_portal_drop', pathname, {
//           orderId,
//           orderNumber,
//           step: 'portal_submitted',
//           items_count: itemsToSubmit.length
//         });

//         onClose();
//       } else {
//         toast.error(result.message);
//       }
//     });
//   };

//   return (
//     <Transition appear show={isOpen} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={onClose}>
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-black/30" />
//         </TransitionChild>
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4 text-center">
//             <TransitionChild
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <DialogPanel className="w-full max-w-2xl transform rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
//                 <DialogTitle
//                   as="h3"
//                   className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100"
//                 >
//                   Request a Return
//                 </DialogTitle>
//                 <div className="mt-4 space-y-4">
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Select the items you wish to return and provide a reason for
//                     each.
//                   </p>

//                   <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
//                     {products.map((p) => (
//                       <ReturnableItem
//                         key={p.cartItemId}
//                         product={p} 
//                         isSelected={!!selectedItems[p.cartItemId]}
//                         selectedQuantity={
//                           selectedItems[p.cartItemId]?.quantity || 1
//                         }
//                         selectedReason={
//                           selectedItems[p.cartItemId]?.reason || DEFAULT_RETURN_REASON
//                         }
//                         onToggle={() => handleItemToggle(p)}
//                         onItemChange={(field, value) =>
//                           handleItemChange(p.cartItemId, field, value)
//                         }
//                       />
//                     ))}
//                   </div>

//                   <div>
//                     <label
//                       htmlFor="return-comments"
//                       className="text-sm font-medium text-gray-700 dark:text-gray-300"
//                     >
//                       Comments (Optional)
//                     </label>
//                     <textarea
//                       id="return-comments"
//                       value={comments}
//                       onChange={(e) => setComments(e.target.value)}
//                       rows={3}
//                       placeholder="Provide more details about your return request..."
//                       className={`${inputStyles} mt-1`}
//                     />
//                   </div>
//                 </div>
//                 <div className="mt-6 flex justify-end gap-4">
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleSubmit}
//                     disabled={isPending}
//                     className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400"
//                   >
//                     {isPending && (
//                       <Loader2 className="animate-spin" size={16} />
//                     )}
//                     Submit Request
//                   </button>
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }
"use client";

import { useState, useTransition, Fragment, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Loader2 } from "lucide-react";
import { createReturnRequestAction } from "@/app/features/storefront/customer-account/actions/returnActions";
import { ClientOrderProduct } from "@/models/Order";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";
// ✅ FIX: IMPORT FROM CENTRALIZED UTILITY
import { DEFAULT_RETURN_REASON } from "@/app/shared/utils/orderDisplayUtils";

import ReturnableItem from "./ReturnableItem";

const inputStyles =
  "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  products: ClientOrderProduct[];
}

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  products,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedItems, setSelectedItems] = useState<
    Record<
      string,
      {
        productId: string;
        variantKey: string;
        quantity: number;
        reason: string;
      }
    >
  >({});
  const [comments, setComments] = useState("");
  const pathname = usePathname();

  const hasSubmittedRef = useRef(false);
  const isOpenedRef = useRef(false);

  // ✅ FIX: Wrap logUserEvent calls in setTimeout to prevent React render warning
  useEffect(() => {
    if (isOpen) {
      hasSubmittedRef.current = false;
      isOpenedRef.current = true;

      setTimeout(() => {
        logUserEvent("return_portal_drop", pathname, {
          orderId,
          orderNumber,
          step: "portal_opened",
        });
      }, 0);
    } else if (isOpenedRef.current) {
      isOpenedRef.current = false;

      if (!hasSubmittedRef.current) {
        setTimeout(() => {
          logUserEvent("return_portal_drop", pathname, {
            orderId,
            orderNumber,
            step: "portal_abandoned",
            selected_items_count: Object.keys(selectedItems).length,
            comments_length: comments.trim().length,
          });
        }, 0);
      }
    }
  }, [isOpen, orderId, orderNumber, pathname, selectedItems, comments]);

  const handleItemToggle = (product: ClientOrderProduct) => {
    const { cartItemId, _id, variant } = product;
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      if (newSelected[cartItemId]) {
        delete newSelected[cartItemId];
      } else {
        newSelected[cartItemId] = {
          productId: _id,
          variantKey: variant?._key || "",
          quantity: 1,
          reason: DEFAULT_RETURN_REASON,
        };
      }

      logUserEvent("form_field_interaction", pathname, {
        field_id: "return_item_select_toggle",
        interaction_type: "change",
        selected_count: Object.keys(newSelected).length,
      });

      return newSelected;
    });
  };

  const handleItemChange = (
    cartItemId: string,
    field: "quantity" | "reason",
    value: string | number
  ) => {
    setSelectedItems((prev) => ({
      ...prev,
      [cartItemId]: { ...prev[cartItemId], [field]: value },
    }));
  };

  const handleSubmit = () => {
    const itemsToSubmit = Object.values(selectedItems);
    if (itemsToSubmit.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("orderNumber", orderNumber);
      formData.append("items", JSON.stringify(itemsToSubmit));
      formData.append("customerComments", comments);
      const result = await createReturnRequestAction(formData);
      if (result.success) {
        toast.success(result.message);
        hasSubmittedRef.current = true;

        logUserEvent("return_portal_drop", pathname, {
          orderId,
          orderNumber,
          step: "portal_submitted",
          items_count: itemsToSubmit.length,
        });

        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                <DialogTitle
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 dark:text-gray-100"
                >
                  Request a Return
                </DialogTitle>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select the items you wish to return and provide a reason for
                    each.
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {products.map((p) => (
                      <ReturnableItem
                        key={p.cartItemId}
                        product={p}
                        isSelected={!!selectedItems[p.cartItemId]}
                        selectedQuantity={
                          selectedItems[p.cartItemId]?.quantity || 1
                        }
                        selectedReason={
                          selectedItems[p.cartItemId]?.reason ||
                          DEFAULT_RETURN_REASON
                        }
                        onToggle={() => handleItemToggle(p)}
                        onItemChange={(field, value) =>
                          handleItemChange(p.cartItemId, field, value)
                        }
                      />
                    ))}
                  </div>

                  <div>
                    <label
                      htmlFor="return-comments"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Comments (Optional)
                    </label>
                    <textarea
                      id="return-comments"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      placeholder="Provide more details about your return request..."
                      className={`${inputStyles} mt-1`}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary-hover disabled:bg-gray-400"
                  >
                    {isPending && <Loader2 className="animate-spin" size={16} />}
                    Submit Request
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}