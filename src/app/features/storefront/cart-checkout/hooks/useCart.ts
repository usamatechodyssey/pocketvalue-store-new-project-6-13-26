
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import SanityProduct, {
  CleanCartItem,
  ProductVariant,
  SanityImageObject,
} from "@/types";
import {
  toastSuccess,
  toastError,
} from "@/app/shared/components/helpers/CustomToasts";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";


import { fetchServerCartAction } from "@/app/features/storefront/cart-checkout/actions/cartActions";

export interface CartItemWithStock extends CleanCartItem {
  variantStock?: number; 
}

export function useCart() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [mainCartItems, setMainCartItems] = useState<CartItemWithStock[]>([]);
  const [buyNowItem, setBuyNowItem] = useState<CartItemWithStock | null>(null);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [isBuyNowMode, setIsBuyNowMode] = useState(false);
  const isNavigatingToCheckout = useRef(false);

  // Ref to track session changes for dynamic cart merge logging
  const prevSessionRef = useRef<any>(session);

  // Debounce refs
  const qtyTrackTimeout = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const qtyChangeAccumulator = useRef<{ [key: string]: number }>({});

  // === 1. LOAD DATA & TRACK REHYDRATION ===
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cartData = localStorage.getItem("PocketValue_cart");
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          const loadedItems = parsedCart.items || [];
          setMainCartItems(loadedItems);

          if (loadedItems.length > 0) {
            logUserEvent('cart_rehydrated', pathname, {
              total_items: loadedItems.length,
              subtotal: parsedCart.subtotal || 0
            });
          }
        }

        const buyNowData = localStorage.getItem("PocketValue_buyNow");
        const buyNowFlag =
          localStorage.getItem("PocketValue_isBuyNowMode") === "true";

        if (buyNowData && buyNowFlag) {
          setBuyNowItem(JSON.parse(buyNowData));
          setIsBuyNowMode(true);
        }
      } catch (error) {
        console.error("Failed to parse cart data", error);
      } finally {
        setIsCartLoaded(true);
      }
    }
  }, []);

  // === 2. PERSISTENCE ===
  useEffect(() => {
    if (isCartLoaded) {
      const mainTotals = mainCartItems.reduce(
        (acc, item) => ({
          sub: acc.sub + item.price * item.quantity,
          qty: acc.qty + item.quantity,
        }),
        { sub: 0, qty: 0 },
      );
      localStorage.setItem(
        "PocketValue_cart",
        JSON.stringify({
          items: mainCartItems,
          subtotal: mainTotals.sub,
          totalQuantities: mainTotals.qty,
        }),
      );
    }
  }, [mainCartItems, isCartLoaded]);

  useEffect(() => {
    if (isCartLoaded) {
      if (buyNowItem) {
        localStorage.setItem("PocketValue_buyNow", JSON.stringify(buyNowItem));
      } else {
        localStorage.removeItem("PocketValue_buyNow");
      }
    }
  }, [buyNowItem, isCartLoaded]);

  // =================================================================
  // 🚀 FIX 2: CROSS-DEVICE CART SYNC ON LOGIN
  // =================================================================
  useEffect(() => {
    const fetchAndMergeServerCart = async () => {
      // Sirf tab run karo jab user logged-in ho aur cart load ho chuka ho
      if (!session?.user?.id) return;
      if (!isCartLoaded) return;

      // Agar local cart khali hai, toh server se cart lao
      if (mainCartItems.length === 0) {
        try {
      
          const serverCart = await fetchServerCartAction();
          if (serverCart && serverCart.items.length > 0) {
            setMainCartItems(serverCart.items);
            logUserEvent('cart_rehydrated', pathname, {
              total_items: serverCart.items.length,
              subtotal: serverCart.subtotal || 0,
              source: 'server_fetch_on_login'
            });
          }
          console.log("🔜 Server cart fetch will be implemented in File 2.");
        } catch (error) {
          console.error("Failed to fetch server cart:", error);
        }
      }
    };

    fetchAndMergeServerCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id, isCartLoaded]); // ✅ Sirf login par trigger ho

  // =================================================================
  // MULTI-TAB CART STATE DESYNC & AUTOMATED RECONCILIATION
  // =================================================================
  useEffect(() => {
    if (!isCartLoaded) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "PocketValue_cart" && e.newValue) {
        try {
          const parsedNewCart = JSON.parse(e.newValue);
          const currentLocalSnapshot = JSON.stringify(mainCartItems);
          const incomingLocalSnapshot = JSON.stringify(parsedNewCart.items || []);

          if (currentLocalSnapshot !== incomingLocalSnapshot) {
            logUserEvent('cart_desync_error', pathname, {
              mismatch_type: 'tab_state_out_of_sync',
              current_item_count: mainCartItems.length,
              incoming_item_count: (parsedNewCart.items || []).length
            });

            setMainCartItems(parsedNewCart.items || []);
            console.log("📡 [Tab Sync] Successfully reconciled out-of-sync multi-tab cart state.");
          }
        } catch (err) {
          console.error("Multi-tab storage sync parsing failed:", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mainCartItems, isCartLoaded, pathname]);

  // === CONCURRENT CART MERGING ===
  useEffect(() => {
    if (isCartLoaded) {
      if (!prevSessionRef.current && session && mainCartItems.length > 0) {
        const totalMergeSubtotal = mainCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        logUserEvent('cart_merged', pathname, {
          total_items: mainCartItems.length,
          subtotal: totalMergeSubtotal
        });
        
        console.log(`📡 Cart Merged: Authenticated session merged ${mainCartItems.length} active items.`);
      }
      prevSessionRef.current = session;
    }
  }, [session, mainCartItems, isCartLoaded, pathname]);

  // === CHECKOUT CLEANUP ===
  useEffect(() => {
    if (!isCartLoaded) return;
    const isCheckoutFlow =
      pathname === "/checkout" ||
      pathname.startsWith("/checkout/") ||
      pathname === "/payment" ||
      pathname.startsWith("/order-success");
    const isCartPage = pathname === "/cart";

    if (isCheckoutFlow) {
      isNavigatingToCheckout.current = false;
    }

    if ((!isCheckoutFlow || isCartPage) && !isNavigatingToCheckout.current) {
      if (buyNowItem || isBuyNowMode) {
        setBuyNowItem(null);
        setIsBuyNowMode(false);
        localStorage.removeItem("PocketValue_isBuyNowMode");
      }
      localStorage.removeItem("PocketValue_isMainCartCheckout");
    }
  }, [pathname, isBuyNowMode, buyNowItem, isCartLoaded]);

  const showBuyNow = isBuyNowMode && pathname !== "/cart";
  const activeCartItems = showBuyNow
    ? buyNowItem
      ? [buyNowItem]
      : []
    : mainCartItems;

  const { subtotal, totalQuantities } = useMemo(() => {
    return activeCartItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.price * item.quantity,
        totalQuantities: acc.totalQuantities + item.quantity,
      }),
      { subtotal: 0, totalQuantities: 0 },
    );
  }, [activeCartItems]);

  // =================================================================
  // 🚀 FIX 4: GUEST ADD TO CART (if (!session) GUARD HATAYA)
  // =================================================================
  const onAdd = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
    source?: string,
  ): boolean => {
    // ✅ GUEST USERS AB CART MEIN ITEM ADD KAR SAKTE HAIN
    // if (!session) { ... } // <-- ISSE COMPLETELY HATA DIYA HAI

    const stockLimit = variant.stock ?? 999;
    const cartItemId = `${product._id}-${variant._key}`;
    const existingItem = mainCartItems.find(
      (item) => item.cartItemId === cartItemId,
    );
    const newQty = (existingItem?.quantity || 0) + quantity;

    if (newQty > stockLimit) {
      toastError(
        `Cannot add more. Total in cart (${newQty}) exceeds available stock (${stockLimit}).`,
      );
      return false;
    }

    if (existingItem) {
      setMainCartItems((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item,
        ),
      );
    } else {
      const effectivePrice = variant.salePrice ?? variant.price;
      const effectiveImage = (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject;

      const newCartItem: CartItemWithStock = {
        _id: product._id,
        cartItemId,
        name: `${product.title} (${variant.name})`,
        price: effectivePrice,
        quantity,
        slug: product.slug,
        image: effectiveImage,
        variant: { _key: variant._key, name: variant.name },
        categoryIds: product.categoryIds,
        variantStock: stockLimit, 
        sku: variant.sku || "N/A", 
      };
      setMainCartItems((prev) => [...prev, newCartItem]);
    }

    logUserEvent("add_to_cart", pathname, {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
      source: source || "direct_pdp"
    });

    toastSuccess(`${quantity} x ${product.title} added.`);
    return true;
  };

  const toggleCartItemQuantity = (cartItemId: string, value: "inc" | "dec") => {
    if (isBuyNowMode && buyNowItem && buyNowItem.cartItemId === cartItemId) {
      if (value === "dec" && buyNowItem.quantity <= 1) return; 

      if (value === "inc") {
        const limit = buyNowItem.variantStock ?? 999;
        if (buyNowItem.quantity >= limit) {
          toastError(`Limit reached. Only ${limit} available.`);
          return;
        }
      }

      setBuyNowItem((prev) => {
        if (!prev) return null;
        const targetQty = value === "inc" ? prev.quantity + 1 : prev.quantity - 1;
        debounceQuantityTrack(prev._id, prev.sku || "N/A", prev.price, value);
        return { ...prev, quantity: targetQty };
      });
      return;
    }

    const item = mainCartItems.find((i) => i.cartItemId === cartItemId);
    if (!item) return;

    if (value === "dec" && item.quantity <= 1) return;

    if (value === "inc") {
      const limit = item.variantStock ?? 999;
      if (item.quantity >= limit) {
        toastError(`Maximum available stock (${limit}) reached.`);
        return;
      }
    }

    setMainCartItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId === cartItemId) {
          const targetQty = value === "inc" ? i.quantity + 1 : i.quantity - 1;
          debounceQuantityTrack(i._id, i.sku || "N/A", i.price, value);
          return { ...i, quantity: targetQty };
        }
        return i;
      })
    );
  };

  const debounceQuantityTrack = (
    productId: string,
    sku: string,
    price: number,
    direction: "inc" | "dec"
  ) => {
    const trackingKey = `${productId}-${sku}`;
    const currentAccumulation = qtyChangeAccumulator.current[trackingKey] || 0;
    qtyChangeAccumulator.current[trackingKey] =
      direction === "inc" ? currentAccumulation + 1 : currentAccumulation - 1;

    if (qtyTrackTimeout.current[trackingKey]) {
      clearTimeout(qtyTrackTimeout.current[trackingKey]);
    }

    qtyTrackTimeout.current[trackingKey] = setTimeout(() => {
      const finalDiff = qtyChangeAccumulator.current[trackingKey];
      if (finalDiff !== 0) {
        if (finalDiff > 0) {
          logUserEvent("add_to_cart", pathname, {
            productId,
            sku,
            price,
            quantity: finalDiff,
          });
        } else {
          logUserEvent("remove_from_cart", pathname, {
            productId,
            sku,
            price,
            quantity: Math.abs(finalDiff),
          });
        }
      }
      delete qtyChangeAccumulator.current[trackingKey];
      delete qtyTrackTimeout.current[trackingKey];
    }, 1500);
  };

  const buyNow = (
    product: SanityProduct,
    variant: ProductVariant,
    quantity: number,
  ) => {
    // ✅ GUEST USERS KO BUYNOW ALLOW KARO
    // if (!session) { ... } // <-- HATAYA

    const stockLimit = variant.stock ?? 999;
    if (quantity > stockLimit) {
      toastError(`Only ${stockLimit} units available.`);
      return;
    }

    const tempItem: CartItemWithStock = {
      _id: product._id,
      cartItemId: `${product._id}-${variant._key}`,
      name: `${product.title} (${variant.name})`,
      price: variant.salePrice ?? variant.price,
      quantity,
      slug: product.slug,
      image: (variant.images?.[0] ||
        product.defaultVariant.images?.[0]) as SanityImageObject,
      variant: { _key: variant._key, name: variant.name },
      categoryIds: product.categoryIds,
      variantStock: stockLimit,
      sku: variant.sku || "N/A", 
    };

    setBuyNowItem(tempItem);
    setIsBuyNowMode(true);
    localStorage.setItem("PocketValue_isBuyNowMode", "true");
    isNavigatingToCheckout.current = true;

    logUserEvent("add_to_cart", pathname, {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
    });
    
    logUserEvent("checkout_start", "/checkout", {
      productId: product._id,
      sku: variant.sku || "N/A",
      price: variant.salePrice ?? variant.price,
      quantity,
    });

    router.push("/checkout");
  };

  const onRemove = (item: CleanCartItem) => {
    setMainCartItems((prev) =>
      prev.filter((i) => i.cartItemId !== item.cartItemId),
    );

    logUserEvent("remove_from_cart", pathname, {
      productId: item._id,
      sku: item.sku || "N/A",
      price: item.price,
      quantity: item.quantity,
    });

    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    }
  };

  const clearCart = () => {
    if (isBuyNowMode) {
      setBuyNowItem(null);
      setIsBuyNowMode(false);
      localStorage.removeItem("PocketValue_isBuyNowMode");
    } else {
      setMainCartItems([]);
    }
    localStorage.removeItem("PocketValue_isMainCartCheckout");
  };

  return {
    cartItems: activeCartItems,
    subtotal,
    totalQuantities,
    onAdd,
    onRemove,
    toggleCartItemQuantity,
    clearCart,
    buyNow,
    isBuyNowMode: showBuyNow,
    isCartLoaded,
  };
}