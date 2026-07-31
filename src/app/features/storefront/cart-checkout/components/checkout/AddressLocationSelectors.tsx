


"use client";

import { useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { provinces, citiesByProvince } from "@/app/shared/lib/pakistan-location-data";
import { ShippingInfo } from "./NewAddressForm";
import { StylesConfig } from "react-select";

interface AddressLocationSelectorsProps {
  shippingInfo: ShippingInfo;
  handleSelectChange: (name: "province" | "city", option: any) => void;
  customSelectStyles: (hasError: boolean) => StylesConfig;
  isMounted: boolean;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
}

export default function AddressLocationSelectors({
  shippingInfo,
  handleSelectChange,
  customSelectStyles,
  isMounted,
  errors,
}: AddressLocationSelectorsProps) {
  const availableCities = useMemo(() => {
    if (!shippingInfo.province) return [];
    return citiesByProvince[shippingInfo.province.value] || [];
  }, [shippingInfo.province]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Province</label>
        {isMounted ? (
          <CreatableSelect
            styles={customSelectStyles(!!errors.province)}
            name="province"
            instanceId="province-select"
            options={provinces}
            value={shippingInfo.province}
            onChange={(option) => handleSelectChange("province", option)}
            required
          />
        ) : (
          <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">City</label>
        {isMounted ? (
          <CreatableSelect
            styles={customSelectStyles(!!errors.city)}
            name="city"
            instanceId="city-select"
            options={availableCities}
            value={shippingInfo.city}
            onChange={(option) => handleSelectChange("city", option)}
            required
            isDisabled={!shippingInfo.province}
            placeholder={
              !shippingInfo.province
                ? "Select province first"
                : "Select or type city..."
            }
          />
        ) : (
          <div className="mt-1 h-10.5 w-full rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
        )}
      </div>
    </div>
  );
}

// --- SUMMARY OF CHANGES ---
// - No changes were required. This component is a well-structured presentational component for location selection and does not need any modifications for our new authentication flow.
