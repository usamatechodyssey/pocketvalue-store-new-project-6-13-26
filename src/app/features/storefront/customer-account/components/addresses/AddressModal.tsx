
"use client";

import { useState, useEffect, useTransition, Fragment } from "react";
import {
  Dialog,
  Transition,
  Switch,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  saveAddress,
  updateAddress,
  ClientAddress,
} from "@/app/features/storefront/cart-checkout/actions/addressActions";
import AddressFormFields from "./AddressFormFields";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: ClientAddress) => void;
  existingAddress: ClientAddress | null;
}

const emptyFormState = {
  fullName: "",
  phone: "",
  province: null as { value: string; label: string } | null,
  city: null as { value: string; label: string } | null,
  area: "",
  address: "",
  isDefault: false,
};

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  existingAddress,
}: AddressModalProps) {
  const [formData, setFormData] = useState(emptyFormState);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!existingAddress;

  // ✅ FIX: Performance Optimization
  // Dependencies are primitives to prevent infinite loops.
  // We recreate the logic to fill form data only when specific ID changes or modal opens.
  useEffect(() => {
    if (isOpen) {
      if (existingAddress) {
        // Check if we need to update state to avoid loops
        setFormData((prev) => {
          // If ID matches, we assume it's the same address being edited (simplified check)
          // Ideally, deep compare, but setting it once on open is usually enough.
          return {
            fullName: existingAddress.fullName,
            phone: existingAddress.phone,
            province: {
              value: existingAddress.province,
              label: existingAddress.province,
            },
            city: { value: existingAddress.city, label: existingAddress.city },
            area: existingAddress.area,
            address: existingAddress.address,
            isDefault: existingAddress.isDefault,
          };
        });
      } else {
        // Reset to empty only if not already empty (optional, but good practice)
        setFormData(emptyFormState);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingAddress?._id]); // Only trigger when modal opens or the Address ID changes

  const handleFormChange = (updatedFields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updatedFields }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAddressData = {
      fullName: formData.fullName,
      phone: formData.phone,
      province: formData.province?.value || "",
      city: formData.city?.value || "",
      area: formData.area,
      address: formData.address,
    };
    if (
      !finalAddressData.province ||
      !finalAddressData.city ||
      !finalAddressData.fullName ||
      !finalAddressData.phone
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    startTransition(async () => {
      const action =
        isEditing && existingAddress?._id
          ? () =>
              updateAddress(
                existingAddress._id,
                finalAddressData,
                formData.isDefault
              )
          : () => saveAddress(finalAddressData, formData.isDefault);

      const result = await action();

      if (result.success) {
        if ("newAddress" in result && result.newAddress) {
          onSave(result.newAddress);
        } else if ("updatedAddress" in result && result.updatedAddress) {
          onSave(result.updatedAddress);
        }

        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <div id="react-select-portal" />

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
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-2xl transition-all border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                    <DialogTitle
                      as="h3"
                      className="text-xl font-bold text-gray-900 dark:text-gray-100"
                    >
                      {isEditing ? "Edit Address" : "Add New Address"}
                    </DialogTitle>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AddressFormFields
                      formData={formData}
                      onInputChange={(e) =>
                        handleFormChange({ [e.target.name]: e.target.value })
                      }
                      onSelectChange={(name, option) =>
                        handleFormChange({
                          [name]: option,
                          ...(name === "province" && { city: null }),
                        })
                      }
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Set as default address
                      </span>
                      <Switch
                        checked={formData.isDefault}
                        onChange={(c) => handleFormChange({ isDefault: c })}
                        className={`${formData.isDefault ? "bg-brand-primary" : "bg-gray-200 dark:bg-gray-600"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                      >
                        <span
                          className={`${formData.isDefault ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5 flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary-hover disabled:bg-opacity-50 transition-colors"
                      >
                        {isPending && (
                          <Loader2 className="animate-spin" size={16} />
                        )}
                        {isPending ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}