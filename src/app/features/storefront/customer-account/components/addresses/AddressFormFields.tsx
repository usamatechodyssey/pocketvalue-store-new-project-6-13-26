
// /src/app/account/addresses/_components/AddressFormFields.tsx (FINAL & OPTIMIZED)

"use client";

import { useMemo, useState } from "react"; // Removed useEffect
import CreatableSelect from "react-select/creatable";
import { StylesConfig } from "react-select";
import { useTheme } from "next-themes";
import { provinces, citiesByProvince } from "@/app/shared/lib/pakistan-location-data";

// --- Type Definitions ---
interface FormData {
  fullName: string;
  phone: string;
  province: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  area: string;
  address: string;
}
interface AddressFormFieldsProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, option: any) => void;
}

// === Main Form Fields Component (FINAL FIX) ===
export default function AddressFormFields({
  formData,
  onInputChange,
  onSelectChange,
}: AddressFormFieldsProps) {
  const { theme } = useTheme();

  // --- CRITICAL FIX: Removed useEffect/useState and used simple Mount Check ---
  // isMounted is primarily for hydration, setting it in useEffect causes the warning.
  // The simplest fix is to just check the environment or assume mounting is fast.
  const [isMounted] = useState(true); // Keeping isMounted just in case for Select component.

  const availableCities = useMemo(
    () =>
      formData.province ? citiesByProvince[formData.province.value] || [] : [],
    [formData.province]
  );

  const customSelectStyles: StylesConfig = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      borderColor: state.isFocused
        ? "#f97316"
        : theme === "dark"
          ? "#4b5563"
          : "#d1d5db",
      minHeight: "42px",
      boxShadow: state.isFocused ? "0 0 0 1px #f97316" : "none",
      "&:hover": { borderColor: state.isFocused ? "#f97316" : "#a5b4fc" },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      zIndex: 100,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#f97316"
        : state.isFocused
          ? theme === "dark"
            ? "#374151"
            : "#f3f4f6"
          : "transparent",
      color: "inherit",
    }),
  };

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={onInputChange}
            required
            className={inputStyles}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onInputChange}
            required
            className={inputStyles}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Province</label>
          {isMounted ? (
            <CreatableSelect
              styles={customSelectStyles}
              name="province"
              instanceId="province-select"
              options={provinces}
              value={formData.province}
              onChange={(o) => onSelectChange("province", o)}
              required
              menuPosition={"fixed"}
              menuPlacement={"auto"}
            />
          ) : (
            <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          {isMounted ? (
            <CreatableSelect
              styles={customSelectStyles}
              name="city"
              instanceId="city-select"
              options={availableCities}
              value={formData.city}
              onChange={(o) => onSelectChange("city", o)}
              required
              isDisabled={!formData.province}
              placeholder={
                !formData.province
                  ? "Select province first"
                  : "Select or type..."
              }
              menuPosition={"fixed"}
              menuPlacement={"auto"}
            />
          ) : (
            <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Area / Locality
        </label>
        <input
          name="area"
          type="text"
          value={formData.area}
          onChange={onInputChange}
          required
          className={inputStyles}
          placeholder="e.g. DHA Phase 6"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Street Address & House No.
        </label>
        <input
          name="address"
          type="text"
          value={formData.address}
          onChange={onInputChange}
          required
          className={inputStyles}
          placeholder="e.g. House #123, Street 4"
        />
      </div>
    </div>
  );
}