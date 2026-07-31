

"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { getShippingRulesAction } from '@/app/features/storefront/cart-checkout/actions/shippingActions';
import { calculateShipping, ShippingCalculation } from '@/app/shared/lib/checkout/shipping-calculator';
import { ShippingRule } from '@/types';
import { CleanCartItem } from '@/types';
import { toastSuccess, toastError } from '@/app/shared/components/helpers/CustomToasts';
import { logUserEvent } from '@/app/features/admin/analytics-telemetry/action/trackingActions';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

interface AppliedCoupon {
  code: string;
  amount: number;
  type: 'percentage' | 'fixed' | 'freeShipping';
  value?: number;
  maximumDiscount?: number;
}

const calculateOptimisticDiscount = (subtotal: number, coupon: AppliedCoupon): number => {
    if (coupon.type === 'freeShipping') return 0;

    let discountAmount = 0;
    if (coupon.type === 'percentage' && coupon.value) {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maximumDiscount && discountAmount > coupon.maximumDiscount) {
            discountAmount = coupon.maximumDiscount;
        }
    } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(coupon.value || 0, subtotal);
    }
    return Math.round(discountAmount);
};

// Helper function to read client-side cookies safely
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to delete client-side cookies safely
function deleteCookie(name: string) {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
}

export function useCheckout(subtotal: number, cartItems: CleanCartItem[]) {
  const [shippingAddress, setShippingAddressState] = useState<ShippingAddress | null>(null);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  
  const isInitialMount = useRef(true);
  const loggedProximityRef = useRef<number | null>(null); // Prevents redundant threshold logs
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout";

  // 1. Load Data with dynamic Auto-Coupon application checks
  useEffect(() => {
    async function loadData() {
        const rules = await getShippingRulesAction();
        setShippingRules(rules);

        if (typeof window !== "undefined") {
            try {
                const addressData = localStorage.getItem("PocketValue_shippingAddress");
                if (addressData) setShippingAddressState(JSON.parse(addressData));
                
                const couponData = localStorage.getItem("PocketValue_coupon");
                let activeCoupon = null;

                if (couponData) {
                  activeCoupon = JSON.parse(couponData);
                  setAppliedCoupon(activeCoupon);
                }

                // AUTO-APPLY LOGIC: If a campaign persistent cookie exists, apply it in background
                const autoAppliedCode = getCookie("pv_auto_coupon");
                if (autoAppliedCode && !activeCoupon && subtotal > 0) {
                    deleteCookie("pv_auto_coupon"); 
                    
                    const applyResult = await applyCoupon(autoAppliedCode);
                    if (applyResult && applyResult.success) {
                      logUserEvent('coupon_auto_applied', pathname, {
                        code: autoAppliedCode,
                        subtotal: subtotal
                      });
                    }
                }
            } catch (error) {
                console.error("Failed to parse checkout data", error);
            }
        }
    }
    loadData();
  }, [subtotal]);

  // 2. Persistence with custom RTO Risk Analysis check on Address update (Gap #32)
  const setShippingAddress = (address: ShippingAddress | null) => {
    setShippingAddressState(address);
    if (address) {
      localStorage.setItem("PocketValue_shippingAddress", JSON.stringify(address));

      // =================================================================
      // 🚀 GAP #32: ADAPTIVE RTO (Return to Origin) RISK ANALYSIS ENGINE
      // =================================================================
      const riskReasons: string[] = [];
      
      // Verification 1: Phone length check (Pakistan formats validation)
      const cleanPhone = address.phone.replace(/\D/g, "");
      if (cleanPhone.length !== 11 && !address.phone.startsWith("+")) {
        riskReasons.push("invalid_phone_number_length");
      }
      
      // Verification 2: Suspicious/Fake name structure check (Short or contains numbers)
      const cleanName = address.fullName.trim();
      if (cleanName.length < 3) {
        riskReasons.push("name_suspiciously_short");
      }
      if (/^[0-9\W]+$/.test(cleanName)) {
        riskReasons.push("name_contains_illegal_characters");
      }

      // Verification 3: Address structural completeness parameters (Too short)
      if (address.address.trim().length < 10) {
        riskReasons.push("incomplete_shipping_street_address");
      }

      // If at least one risk metric is met, log secure RTO Alert
      if (riskReasons.length > 0) {
        logUserEvent('rto_risk_flagged', pathname, {
          rto_reasons: riskReasons,
          shipping_city: address.city,
          shipping_province: address.province,
          is_high_risk: riskReasons.length >= 2 // High risk if 2 or more metrics triggered
        });
        console.log(`⚠️ [RTO Risk Alert] Sourcing address has triggered ${riskReasons.length} risk metrics.`);
      }
      // =================================================================
    } else {
      localStorage.removeItem("PocketValue_shippingAddress");
    }
  };

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem("PocketValue_coupon", JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem("PocketValue_coupon");
    }
  }, [appliedCoupon]);

  // =================================================================
  // 🚀 GAP #27: FREE SHIPPING DELIVERY THRESHOLD PROXIMITY ENGINE
  // =================================================================
  useEffect(() => {
    if (shippingRules.length === 0 || subtotal <= 0) return;

    // Dynamically locate the free shipping rule (where cost === 0)
    const freeShippingRule = shippingRules.find(rule => rule.cost === 0 && !rule.isOnCall);
    if (!freeShippingRule) return;

    const proximityAmount = freeShippingRule.minAmount - subtotal;

    // If customer is within Rs. 500 proximity of free shipping, trigger telemetry nudge
    if (proximityAmount > 0 && proximityAmount <= 500) {
      if (loggedProximityRef.current !== proximityAmount) {
        logUserEvent('shipping_threshold_proximity', pathname, {
          remaining_to_free_shipping: proximityAmount,
          current_subtotal: subtotal,
          free_shipping_minimum: freeShippingRule.minAmount
        });
        loggedProximityRef.current = proximityAmount; // Prevents redundant event spamming
      }
    } else {
      loggedProximityRef.current = null;
    }
  }, [subtotal, shippingRules, pathname]);
  // =================================================================

  // 3. Derived State
  const { shippingDetails, discountAmount, grandTotal } = useMemo(() => {
    let details: ShippingCalculation = { cost: 0, displayText: "Calculating...", isFree: false };
    let finalDiscount = 0;
    let finalTotal = 0;

    if (shippingRules.length === 0 && subtotal > 0) {
        return { shippingDetails: { cost: -1, displayText: "...", isFree: false }, discountAmount: 0, grandTotal: subtotal };
    }

    const baseShipping = (subtotal > 0)
        ? calculateShipping(subtotal, shippingRules)
        : { cost: 0, displayText: "FREE", isFree: true, ruleName: 'empty_cart' };

    let monetaryDiscount = 0;
    let shippingDiscount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'freeShipping') {
        shippingDiscount = baseShipping.cost; 
      } else {
        monetaryDiscount = calculateOptimisticDiscount(subtotal, appliedCoupon);
      }
    }
    
    finalDiscount = monetaryDiscount + shippingDiscount;

    const finalShippingCost = baseShipping.cost - shippingDiscount;
    let finalDisplayText = "FREE";
    
    if (baseShipping.isOnCall) {
        finalDisplayText = baseShipping.displayText;
    } else {
        finalDisplayText = finalShippingCost > 0 ? `Rs. ${finalShippingCost.toLocaleString()}` : "FREE";
    }

    details = { 
        ...baseShipping, 
        cost: finalShippingCost, 
        displayText: finalDisplayText, 
        isFree: finalShippingCost === 0,
    };

    const totalCalc = subtotal - monetaryDiscount + finalShippingCost;
    finalTotal = totalCalc > 0 ? Math.round(totalCalc) : 0;

    return { shippingDetails: details, discountAmount: finalDiscount, grandTotal: finalTotal };

  }, [subtotal, appliedCoupon, shippingRules]);


  // 4. Coupon Handlers
  const applyCoupon = async (code: string) => {
    const response = await fetch("/api/cart/verify-coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, cart: { items: cartItems, subtotal } }),
    });
    const result = await response.json();
    
    if (result.success) {
      setAppliedCoupon(result.finalDiscount);
      toastSuccess(result.message);

      logUserEvent('coupon_applied', pathname, {
        code: code,
        status: 'success',
        amount: result.finalDiscount?.amount || 0,
        discount_type: result.finalDiscount?.type || 'unknown'
      });

    } else {
      setAppliedCoupon(null);
      toastError(result.message);

      logUserEvent('coupon_applied', pathname, {
        code: code,
        status: 'failed',
        error_message: result.message || 'Invalid coupon code.'
      });
    }
    return result;
  };

  const removeCoupon = () => {
    const previousCode = appliedCoupon?.code;
    setAppliedCoupon(null);
    toastError("Your coupon has been removed.", "Coupon Removed");

    if (previousCode) {
      logUserEvent('coupon_removed', pathname, {
        code: previousCode,
      });
    }
  };
  
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const revalidate = async () => {
      if (!appliedCoupon) return;
      const result = await fetch("/api/cart/verify-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedCoupon.code, cart: { items: cartItems, subtotal } }),
      });
      const data = await result.json();
      
      if(!data.success) {
        setAppliedCoupon(null);
        toastError(data.message, `Coupon "${appliedCoupon.code}" Removed`);

        logUserEvent('coupon_removed', pathname, {
          code: appliedCoupon.code,
          auto_removed: true,
          reason: data.message || 'Cart mutations invalidated requirements.'
        });
      }
    };

    const handler = setTimeout(revalidate, 1000);
    return () => clearTimeout(handler);
  }, [subtotal, cartItems]); 

  const clearCheckoutState = () => {
    setShippingAddressState(null);
    setAppliedCoupon(null);
  };

  return {
    shippingAddress,
    setShippingAddress, // ✅ Maps upgraded RTO wrapper safely
    shippingDetails,
    appliedCoupon,
    discountAmount,
    grandTotal,
    applyCoupon,
    removeCoupon,
    clearCheckoutState,
  };
}