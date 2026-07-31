


"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import SanityProduct, { CleanWishlistItem } from '@/types';
import { toastSuccess, toastError } from '@/app/shared/components/helpers/CustomToasts';
import { logUserEvent } from '@/app/features/admin/analytics-telemetry/action/trackingActions';

export function useWishlist() {
  const { data: session } = useSession();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState<CleanWishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Flag to prevent data wipe

  // Load wishlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const wishlistData = localStorage.getItem("PocketValue_wishlist");
        if (wishlistData) {
          setWishlistItems(JSON.parse(wishlistData));
        }
      } catch (error) {
        console.error("Failed to parse wishlist data from localStorage", error);
      } finally {
        setIsLoaded(true); // Data load hone ke baad hi flag true hoga
      }
    }
  }, []);

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    // FIX: Sirf tab save karo jab initial load complete ho chuka ho
    if (isLoaded) {
      localStorage.setItem("PocketValue_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const handleAddToWishlist = (product: SanityProduct) => {
    if (!session) {
      toastError("Please log in to manage your wishlist.");
      router.push("/login?callbackUrl=" + window.location.pathname);
      return;
    }

    const isAlreadyInWishlist = wishlistItems.some(item => item._id === product._id);
    const pathname = typeof window !== "undefined" ? window.location.pathname : "/";

    if (isAlreadyInWishlist) {
      const updatedWishlist = wishlistItems.filter(item => item._id !== product._id);
      setWishlistItems(updatedWishlist);

      // 🚀 TELEMETRY EVENT: Track Wishlist Removal cleanly
      logUserEvent('wishlist_remove', pathname, {
        productId: product._id,
        name: product.title,
      });

      toastError(`${product.title} removed from wishlist.`, "Wishlist Updated");
    } else {
      const defaultVariant = product.defaultVariant;
      const price = defaultVariant.salePrice ?? defaultVariant.price;
      const image = defaultVariant.images?.[0];

      if (!image) {
        toastError("Could not add item to wishlist. Image is missing.");
        return;
      }

      const newWishlistItem: CleanWishlistItem = {
        _id: product._id,
        name: product.title,
        price: price,
        slug: product.slug,
        image: image,
      };
      
      setWishlistItems(prev => [...prev, newWishlistItem]);

      // 🚀 TELEMETRY EVENT: Track Wishlist Addition with Price context
      logUserEvent('wishlist_add', pathname, {
        productId: product._id,
        name: product.title,
        price: price,
      });

      toastSuccess(`${product.title} added to wishlist!`, "Wishlist Updated");
    }
  };
  
  const clearWishlist = () => {
    setWishlistItems([]);
  };

  return {
    wishlistItems,
    handleAddToWishlist,
    clearWishlist,
  };
}