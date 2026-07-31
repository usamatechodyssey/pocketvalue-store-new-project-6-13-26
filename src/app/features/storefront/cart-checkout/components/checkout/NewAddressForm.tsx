
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { LocateFixed, CheckCircle, Loader2 } from "lucide-react"; // Removed AlertCircle, Edit2
import dynamic from "next/dynamic";
import { StylesConfig } from "react-select";
// import { toast } from "react-hot-toast"; // Temporarily unused

// --- FIREBASE IMPORTS (DISABLED) ---
/*
import { auth } from "@/app/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import {
  updateUserPhone,
  checkPhoneVerificationStatus,
} from "@/app/actions/authActions";
*/
// import { isValidPhoneNumber } from "react-phone-number-input";

import AddressInputFields from "./AddressInputFields";
import AddressLocationSelectors from "./AddressLocationSelectors";

// --- Dynamic Import with Loading Skeleton ---
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-75 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
      <Loader2 className="animate-spin text-gray-400" />
    </div>
  ),
});

export interface ShippingInfo {
  fullName: string;
  phone: string;
  province: { value: string; label: string } | null;
  city: { value: string; label: string } | null;
  area: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface NewAddressFormProps {
  shippingInfo: ShippingInfo;
  onShippingInfoChange: (info: ShippingInfo) => void;
  errors: Partial<Record<keyof ShippingInfo, boolean>>;
  isPhoneVerified: boolean;
  onPhoneVerified: () => void;
  sessionVerifiedPhone?: string | null;
  onEditPhone: () => void;
}

// Helper to safely access window property
/*
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
*/

export default function NewAddressForm({
  shippingInfo,
  onShippingInfoChange,
  errors,
  isPhoneVerified, // Ye ab hamesha 'true' aayega parent se
  onPhoneVerified,
  sessionVerifiedPhone,
  onEditPhone,
}: NewAddressFormProps) {
  // const { data: session, update } = useSession();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // --- OTP STATES (DISABLED) ---
  /*
  const [otpUiState, setOtpUiState] = useState<
    "idle" | "sending" | "sent" | "verifying"
  >("idle");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  */

  useEffect(() => {
    setIsMounted(true);
    // Initialize Recaptcha only once (DISABLED)
    /*
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container-checkout",
        { size: "invisible" }
      );
    }
    */
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onShippingInfoChange({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value?: string) => {
    onShippingInfoChange({ ...shippingInfo, phone: value || "" });
  };

  const handleSelectChange = (name: "province" | "city", option: any) => {
    const newInfo = { ...shippingInfo, [name]: option };
    if (name === "province") newInfo.city = null;
    onShippingInfoChange(newInfo);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    onShippingInfoChange({ ...shippingInfo, lat, lng });
  };

  // --- OTP LOGIC (DISABLED) ---
  /*
  const handleSendOtp = async () => { ... };
  const handleVerifyOtp = async () => { ... };
  */

  const getErrorStyles = (hasError: boolean) => {
    return hasError ? "!border-red-500 !ring-red-500" : "";
  };

  const customSelectStyles = (hasError: boolean): StylesConfig => ({
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      borderColor: hasError
        ? "#ef4444"
        : state.isFocused
          ? "#f97316"
          : theme === "dark"
            ? "#4b5563"
            : "#d1d5db",
      minHeight: "42px",
      boxShadow: hasError
        ? "0 0 0 1px #ef4444"
        : state.isFocused
          ? "0 0 0 1px #f97316"
          : "none",
      transition: "border-color 0.2s, box-shadow 0.2s",
      "&:hover": {
        borderColor: hasError
          ? "#ef4444"
          : state.isFocused
            ? "#f97316"
            : theme === "dark"
              ? "#6b7280"
              : "#a5b4fc",
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#1f2937" : "white",
      zIndex: 20,
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
      "&:active": { backgroundColor: "#fb923c" },
    }),
    singleValue: (provided) => ({ ...provided, color: "inherit" }),
    input: (provided) => ({ ...provided, color: "inherit" }),
  });

  const inputStyles = `appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm`;

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Recaptcha Container (Ab Zaroorat Nahi) */}
      <div id="recaptcha-container-checkout"></div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        Enter a New Address
      </h2>

      <div className="space-y-4">
        <AddressInputFields
          shippingInfo={shippingInfo}
          handleInputChange={handleInputChange}
          onPhoneChange={handlePhoneChange}
          inputStyles={inputStyles}
          errors={errors}
          getErrorStyles={getErrorStyles}
          // Input Locked Nahi Hoga (Always False)
          disabled={false}
        />

        <AddressLocationSelectors
          shippingInfo={shippingInfo}
          handleSelectChange={handleSelectChange}
          customSelectStyles={customSelectStyles}
          isMounted={isMounted}
          errors={errors}
        />

        {/* --- VERIFICATION SECTION (MODIFIED) --- */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 mt-4">
          
          {/* Pehle Logic: Agar Verified hai to "Green Box", nahi to "OTP Box" */}
          {/* Ab Hum Sirf ek simple message dikhayenge ya box hi hata denge */}
          
          {/* 
            === OLD VERIFICATION UI (HIDDEN) ===
            Agar wapis on karna ho to yahan ka code uncomment karein 
            aur 'true' wali condition hata dein.
          */}
          
          {/* Naya UI: Sirf Ek Tasalli Wala Message (Optional) */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
             <CheckCircle size={16} />
             <span>Phone verification is currently optional.</span>
          </div>

        </div>
      </div>

      <div className="pt-2">
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-2"
          >
            <LocateFixed size={16} />{" "}
            {showMap ? "Hide Map" : "Pin Exact Location (Optional)"}
          </button>
          {shippingInfo.lat && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle size={14} /> Location Pinned!
            </p>
          )}
        </div>
        {showMap && isMounted && (
          <div className="mt-3 rounded-lg overflow-hidden border dark:border-gray-600 relative z-0">
            <LocationPicker onLocationSelect={handleLocationSelect} />
          </div>
        )}
      </div>
    </div>
  );
}