

"use client";

import { useState, useTransition, useMemo } from "react";
// --- THE ARCHITECTURAL FIX IS HERE ---
import {
  deleteAddress,
  setDefaultAddress,
  ClientAddress,
} from "@/app/features/storefront/cart-checkout/actions/addressActions"; // <-- Import the new, SAFE ClientAddress type
import { MapPin, Plus, Trash2, Edit, Star, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import AddressModal from "./AddressModal";

interface AddressClientProps {
  initialAddresses: ClientAddress[]; // <-- Use the ClientAddress type for props
}

export default function AddressClient({
  initialAddresses,
}: AddressClientProps) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(
    null
  ); // <-- Use ClientAddress for state

  const [isPending, startTransition] = useTransition();

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: ClientAddress) => {
    // <-- Use ClientAddress for function parameters
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = (addressId: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    startTransition(async () => {
      const result = await deleteAddress(addressId);
      if (result.success) {
        // Since _id is already a string, no .toString() is needed
        setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleSetDefault = (addressId: string) => {
    startTransition(async () => {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr._id === addressId, // No .toString() needed
          }))
        );
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleSaveAddress = (savedAddress: ClientAddress) => {
    // <-- Use ClientAddress
    const isEditing = addresses.some((addr) => addr._id === savedAddress._id);

    let updatedAddresses = [...addresses];

    if (isEditing) {
      updatedAddresses = updatedAddresses.map((addr) =>
        addr._id === savedAddress._id ? savedAddress : addr
      );
    } else {
      updatedAddresses.push(savedAddress);
    }

    if (savedAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({
        ...addr,
        isDefault: addr._id === savedAddress._id,
      }));
    }

    setAddresses(updatedAddresses);
  };

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) =>
      a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
    );
  }, [addresses]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-bold text-sm rounded-lg shadow-md hover:bg-brand-primary-hover transition-colors"
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {isPending && (
        <div className="flex justify-center my-8">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      )}

      {!isPending && sortedAddresses.length === 0 ? (
        <div className="text-center py-20 px-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <MapPin
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            strokeWidth={1.5}
          />
          <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">
            No Saved Addresses
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add an address to make your future checkouts faster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedAddresses.map((addr) => (
            <div
              key={addr._id} // No .toString() needed
              className={`relative bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border ${addr.isDefault ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-gray-200 dark:border-gray-700"}`}
            >
              {addr.isDefault && (
                <div className="absolute top-0 right-0 flex items-center gap-1.5 text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-bl-lg rounded-tr-lg">
                  <Star size={12} fill="currentColor" /> Default
                </div>
              )}
              <p className="font-bold text-gray-800 dark:text-gray-100 pr-20">
                {addr.fullName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {addr.phone}
              </p>
              <address className="text-sm text-gray-500 dark:text-gray-400 mt-3 not-italic">
                {addr.address}, {addr.area},<br />
                {addr.city}, {addr.province}
              </address>
              <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 flex items-center justify-between gap-2">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    disabled={isPending}
                    className="text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-50"
                  >
                    Set as Default
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(addr)}
                    disabled={isPending}
                    className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                    aria-label="Edit address"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    disabled={isPending}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    aria-label="Delete address"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAddress}
          existingAddress={editingAddress}
        />
      )}
    </>
  );
}
