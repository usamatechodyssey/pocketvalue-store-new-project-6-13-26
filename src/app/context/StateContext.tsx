
"use client";

import { createContext, useContext, ReactNode, useState, useMemo, useCallback } from "react";
import { useCart } from "../features/storefront/cart-checkout/hooks/useCart";
import { useWishlist } from "../features/storefront/customer-account/hooks/useWishlist";
import { useCheckout } from "../features/storefront/cart-checkout/hooks/useCheckout";

type StateContextType = ReturnType<typeof useCart> &
  ReturnType<typeof useWishlist> &
  ReturnType<typeof useCheckout> & {
    isProfileSidebarOpen: boolean;
    openProfileSidebar: () => void;
    closeProfileSidebar: () => void;
    toggleProfileSidebar: () => void;
  };

const StateContext = createContext<StateContextType | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const cart = useCart();
  const wishlist = useWishlist();
  
  // Checkout hook uses active cart logic from useCart
  const checkout = useCheckout(cart.subtotal, cart.cartItems);

  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  const openProfileSidebar = useCallback(() => setIsProfileSidebarOpen(true), []);
  const closeProfileSidebar = useCallback(() => setIsProfileSidebarOpen(false), []);
  const toggleProfileSidebar = useCallback(() => setIsProfileSidebarOpen((prev) => !prev), []);

  const clearCartAndCheckout = useCallback(() => {
    // Step 1: Cart clear karo (Smart logic inside useCart handles 'BuyNow' vs 'MainCart')
    cart.clearCart(); 
    // Step 2: Checkout form reset karo
    checkout.clearCheckoutState();
  }, [cart, checkout]); 

  const contextValue = useMemo<StateContextType>(() => ({
    ...cart,
    ...wishlist,
    ...checkout,
    clearCart: clearCartAndCheckout, // Overwritten with combined wrapper
    isProfileSidebarOpen,
    openProfileSidebar,
    closeProfileSidebar,
    toggleProfileSidebar,
  }), [
    cart, 
    wishlist, 
    checkout, 
    clearCartAndCheckout, 
    isProfileSidebarOpen, 
    openProfileSidebar, 
    closeProfileSidebar, 
    toggleProfileSidebar
  ]);

  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useStateContext must be used within an AppStateProvider");
  }
  return context;
};