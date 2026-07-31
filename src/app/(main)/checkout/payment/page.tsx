
// // src/app/checkout/payment/page.tsx (UPGRADED WITH REDIRECTION VISIBILITY LATENCY TRACKER)

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useStateContext } from "@/app/context/StateContext";
// import { toastError } from "@/app/shared/components/helpers/CustomToasts";
// import { Loader2, ShieldCheck } from "lucide-react";

// import ShippingSummary from "../../../features/storefront/cart-checkout/components/checkout/ShippingSummary";
// import PaymentMethodSelector from "../../../features/storefront/cart-checkout/components/checkout/PaymentMethodSelector";
// import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// export default function PaymentPage() {
//   const router = useRouter();
//   const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout/payment";
  
//   const { cartItems, grandTotal, shippingAddress, appliedCoupon } = useStateContext();

//   const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
  
//   // 🚀 Gap #48: Tracking external redirect latency via browser tab focus states
//   const redirectTimestamp = useRef<number | null>(null);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       if (!shippingAddress) {
//         router.replace("/checkout");
//       } else if (
//         cartItems.length === 0 &&
//         !window.location.pathname.startsWith("/order-success")
//       ) {
//         router.replace("/cart");
//       }
//     }
//   }, [shippingAddress, cartItems, router]);

//   // 🚀 Gap #48 listener: Tracks focus behaviors on return
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === "visible" && redirectTimestamp.current) {
//         const outOfTabDuration = Date.now() - redirectTimestamp.current;
//         // Logs how long user was absent on redirect portal before returning or failing
//         logUserEvent('form_field_interaction', pathname, {
//           field_id: 'redirection_tab_loss',
//           interaction_type: 'tab_regained_focus',
//           absent_duration_ms: outOfTabDuration
//         });
//         redirectTimestamp.current = null; // Clear timer
//       }
//     };
//     document.addEventListener("visibilitychange", handleVisibilityChange);
//     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
//   }, [pathname]);

//   const handlePlaceOrder = async () => {
//     if (!shippingAddress || !selectedGateway) {
//       toastError("Please select a payment method.");
      
//       logUserEvent('checkout_error', pathname, {
//         error_type: 'payment_method_missing',
//         error_message: 'Please select a payment method.'
//       });
//       return;
//     }
//     setIsProcessing(true);
//     let orderId = "";

//     try {
//       // Step 1: Create Order
//       const orderRes = await fetch("/api/orders/create", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           shippingAddress,
//           cartItems,
//           totalPrice: grandTotal,
//           couponCode: appliedCoupon ? appliedCoupon.code : undefined,
//         }),
//       });
//       const orderData = await orderRes.json();
//       if (!orderRes.ok)
//         throw new Error(orderData.message || "Failed to create order.");

//       orderId = orderData.orderId;

//       // Step 2: Initiate Payment
//       const paymentRes = await fetch("/api/payment/initiate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ orderId, gatewayKey: selectedGateway }),
//       });
//       const paymentData = await paymentRes.json();
//       if (!paymentRes.ok)
//         throw new Error(paymentData.message || "Payment initiation failed.");

//       // Step 3: Handle Response & Redirect
//       if (paymentData.redirectUrl) {
//         // External Gateway (Stripe, Easypaisa, Jazzcash, etc.)
        
//         await logUserEvent('gateway_redirect_initiated', pathname, {
//           orderId: orderId,
//           selected_gateway: selectedGateway,
//           redirect_destination: paymentData.redirectUrl
//         });

//         // 🚀 Set timestamp for visibility latency tracking (Gap #48)
//         redirectTimestamp.current = Date.now();
        
//         window.location.href = paymentData.redirectUrl;
//       } else if (paymentData.success) {
//         // Internal Gateways (COD, Bank Transfer)
//         const verifyRes = await fetch(
//           `/api/payment/verify/${selectedGateway}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ orderId, ...paymentData.data }),
//           }
//         );

//         const verifyData = await verifyRes.json();

//         if (verifyRes.ok && verifyData.success && verifyData.redirectUrl) {
//           window.location.href = verifyData.redirectUrl;
//         } else {
//           throw new Error(
//             verifyData.message || "Failed to finalize your order."
//           );
//         }
//       } else {
//         throw new Error("An unknown error occurred during payment initiation.");
//       }
//     } catch (error: any) {
//       console.error("Checkout Error:", error);
//       toastError(
//         error.message || "An unexpected error occurred.",
//         "Order Failed"
//       );
      
//       logUserEvent('checkout_error', pathname, {
//         error_type: 'order_placement_failed',
//         error_message: error.message || 'Unknown network or database transaction failure during place order step.'
//       });

//       setIsProcessing(false);
//     }
//   };

//   if (!shippingAddress || cartItems.length === 0) {
//     return (
//       <div className="flex items-center justify-center p-8 min-h-75">
//         <Loader2 className="animate-spin text-brand-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <ShippingSummary />

//       <PaymentMethodSelector
//         selectedGateway={selectedGateway}
//         onGatewaySelect={setSelectedGateway}
//       />

//       <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
//         <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
//           <ShieldCheck size={16} />
//           <span>Secure SSL Encrypted Payment</span>
//         </div>
//         <button
//           onClick={handlePlaceOrder}
//           disabled={isProcessing || !selectedGateway}
//           className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400"
//         >
//           {isProcessing ? (
//             <Loader2 className="animate-spin" size={24} />
//           ) : (
//             `Pay Rs. ${grandTotal.toLocaleString()}`
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/checkout/payment/page.tsx (UPGRADED WITH HYDRATION, IDEMPOTENCY KEY & ADVANCED ERROR PARSING)

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStateContext } from "@/app/context/StateContext";
import { toastError } from "@/app/shared/components/helpers/CustomToasts";
import { Loader2, ShieldCheck } from "lucide-react";

import ShippingSummary from "../../../features/storefront/cart-checkout/components/checkout/ShippingSummary";
import PaymentMethodSelector from "../../../features/storefront/cart-checkout/components/checkout/PaymentMethodSelector";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

export default function PaymentPage() {
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/checkout/payment";
  
  const { cartItems, grandTotal, shippingAddress, appliedCoupon } = useStateContext();

  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ✅ 1. Hydration checking state to ensure zero HTML mismatch on first load
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🚀 Gap #48: Tracking external redirect latency via browser tab focus states
  const redirectTimestamp = useRef<number | null>(null);

  useEffect(() => {
    if (isMounted) {
      if (!shippingAddress) {
        router.replace("/checkout");
      } else if (
        cartItems.length === 0 &&
        !window.location.pathname.startsWith("/order-success")
      ) {
        router.replace("/cart");
      }
    }
  }, [isMounted, shippingAddress, cartItems, router]);

  // 🚀 Gap #48 listener: Tracks focus behaviors on return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && redirectTimestamp.current) {
        const outOfTabDuration = Date.now() - redirectTimestamp.current;
        // Logs how long user was absent on redirect portal before returning or failing
        logUserEvent('form_field_interaction', pathname, {
          field_id: 'redirection_tab_loss',
          interaction_type: 'tab_regained_focus',
          absent_duration_ms: outOfTabDuration
        });
        redirectTimestamp.current = null; // Clear timer
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname]);

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !selectedGateway) {
      toastError("Please select a payment method.");
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'payment_method_missing',
        error_message: 'Please select a payment method.'
      });
      return;
    }
    setIsProcessing(true);
    let orderId = "";

    try {
      // ✅ Generate secure unique Idempotency Key per order attempt
      const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Step 1: Create Order
      const orderRes = await fetch("/api/checkout/orders/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey // ✅ Added Idempotency Key
        },
        body: JSON.stringify({
          shippingAddress,
          cartItems,
          totalPrice: grandTotal,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        // ✅ Log the exact validation error returned by your backend schema to browser console
        console.error("❌ Order Creation API Error Response:", orderData);
        // ✅ UPGRADED ERROR PARSER: Support both 'message' and 'error' formats (e.g. Rate Limiter errors)
        throw new Error(orderData.message || orderData.error || "Failed to create order.");
      }

      orderId = orderData.orderId;

      // Step 2: Initiate Payment
      const paymentRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, gatewayKey: selectedGateway }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentRes.ok)
        throw new Error(paymentData.message || "Payment initiation failed.");

      // Step 3: Handle Response & Redirect
      if (paymentData.redirectUrl) {
        // External Gateway (Stripe, Easypaisa, Jazzcash, etc.)
        
        await logUserEvent('gateway_redirect_initiated', pathname, {
          orderId: orderId,
          selected_gateway: selectedGateway,
          redirect_destination: paymentData.redirectUrl
        });

        // 🚀 Set timestamp for visibility latency tracking (Gap #48)
        redirectTimestamp.current = Date.now();
        
        window.location.href = paymentData.redirectUrl;
      } else if (paymentData.success) {
        // Internal Gateways (COD, Bank Transfer)
        const verifyRes = await fetch(
          `/api/payment/verify/${selectedGateway}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, ...paymentData.data }),
          }
        );

        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success && verifyData.redirectUrl) {
          window.location.href = verifyData.redirectUrl;
        } else {
          throw new Error(
            verifyData.message || "Failed to finalize your order."
          );
        }
      } else {
        throw new Error("An unknown error occurred during payment initiation.");
      }
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toastError(
        error.message || "An unexpected error occurred.",
        "Order Failed"
      );
      
      logUserEvent('checkout_error', pathname, {
        error_type: 'order_placement_failed',
        error_message: error.message || 'Unknown network or database transaction failure during place order step.'
      });

      setIsProcessing(false);
    }
  };

  // ✅ 2. Show loader on Server side or until Hydration completes to prevent React mismatch crash
  if (!isMounted || !shippingAddress || cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 min-h-75">
        <Loader2 className="animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ShippingSummary />

      <PaymentMethodSelector
        selectedGateway={selectedGateway}
        onGatewaySelect={setSelectedGateway}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ShieldCheck size={16} />
          <span>Secure SSL Encrypted Payment</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || !selectedGateway}
          className="w-full h-12 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold text-lg rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            `Pay Rs. ${grandTotal.toLocaleString()}`
          )}
        </button>
      </div>
    </div>
  );
}