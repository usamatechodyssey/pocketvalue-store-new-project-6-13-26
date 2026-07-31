

"use client";

import { useRef } from "react";
import { ShippingInfo } from '@/app/features/storefront/cart-checkout/components/checkout/NewAddressForm'
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

interface AddressInputFieldsProps {
  shippingInfo: ShippingInfo;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value?: string) => void;
  inputStyles: string;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
  getErrorStyles: (hasError: boolean) => string;
  disabled?: boolean;
}

const CustomCountrySelect = ({ icon, ...rest }: any) => {
  return (
    <div className="flex items-center pl-3 pr-2 pointer-events-none">
      <img 
        src="https://flagcdn.com/pk.svg" 
        alt="Pakistan Flag"
        className="w-6 h-4 object-cover border border-gray-200 shadow-sm rounded-xs"
      />
      <span className="text-gray-500 font-semibold text-sm ml-2">+92</span>
    </div>
  );
};

export default function AddressInputFields({
  shippingInfo,
  handleInputChange,
  onPhoneChange,
  inputStyles,
  errors,
  getErrorStyles,
  disabled = false, 
}: AddressInputFieldsProps) {
  
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout";
  
  // Gap #61: Tracking autofill intervals
  const keyPressTimestamps = useRef<{ [key: string]: number }>({});

  const handleFocusTracking = (fieldId: string) => {
    keyPressTimestamps.current[fieldId] = Date.now(); 
    logUserEvent('form_field_interaction', pathname, { field_id: fieldId, interaction_type: 'focus' });
  };

  const handleBlurTracking = (fieldId: string, value: string, hasError: boolean) => {
    const focusTime = keyPressTimestamps.current[fieldId] || Date.now();
    const interactionDuration = Date.now() - focusTime;
    
    // Autofill delta calculation logic
    const isAutofill = value.length > 3 && interactionDuration < 50;

    logUserEvent('form_field_interaction', pathname, {
      field_id: fieldId,
      interaction_type: 'blur',
      has_error: hasError,
      is_autofill: isAutofill,
      interaction_duration_ms: interactionDuration
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={shippingInfo.fullName}
            onChange={handleInputChange}
            required
            className={`${inputStyles} ${getErrorStyles(!!errors.fullName)}`}
            onFocus={() => handleFocusTracking('fullName')}
            onBlur={(e) => handleBlurTracking('fullName', e.target.value, !!errors.fullName)}
          />
        </div>

        {/* Phone Number Field */}
        <div className={`phone-input-container`}> 
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <PhoneInput
            defaultCountry="PK"
            countries={['PK']} 
            international={false}
            withCountryCallingCode={false}
            countrySelectComponent={CustomCountrySelect} 
            value={shippingInfo.phone}
            onChange={onPhoneChange}
            disabled={false}      
            className={`${inputStyles} ${getErrorStyles(!!errors.phone)} flex items-center py-0! px-0! overflow-hidden bg-white dark:bg-gray-900`} 
            numberInputProps={{
                className: "bg-transparent border-none focus:ring-0 grow h-full py-2.5 pl-2 pr-3 outline-none text-gray-900 dark:text-white placeholder:text-gray-400 w-full",
                required: true,
                placeholder: "300 1234567",
                maxLength: 12,
                onFocus: () => handleFocusTracking('phone'),
                // 🚀 FIXED: Added explicit ': any' typing to 'e' to resolve linter error ts(7006)
                onBlur: (e: any) => handleBlurTracking('phone', e.target.value, !!errors.phone)
            }}
          />
        </div>
      </div>

      {/* Area / Locality Field */}
      <div>
        <label htmlFor="area" className="block text-sm font-medium mb-1">
          Area / Locality
        </label>
        <input
          id="area"
          name="area"
          type="text"
          value={shippingInfo.area}
          onChange={handleInputChange}
          required
          className={`${inputStyles}`}
          placeholder="e.g. DHA Phase 6, Johar Town"
          onFocus={() => handleFocusTracking('area')}
          onBlur={(e) => handleBlurTracking('area', e.target.value, false)}
        />
      </div>

      {/* Address Field */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium mb-1">
          Street Address & House No.
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={shippingInfo.address}
          onChange={handleInputChange}
          required
          className={`${inputStyles} ${getErrorStyles(!!errors.address)}`}
          placeholder="e.g. House #123, Street 4"
          onFocus={() => handleFocusTracking('address')}
          onBlur={(e) => handleBlurTracking('address', e.target.value, !!errors.address)}
        />
      </div>

      <style jsx global>{`
        .PhoneInputCountrySelectArrow { display: none !important; }
        .PhoneInputInput { outline: none; border: none; }
      `}</style>
    </div>
  );
}