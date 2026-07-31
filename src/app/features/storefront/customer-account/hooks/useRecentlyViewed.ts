"use client";

import { useState, useEffect, useCallback } from "react";
import SanityProduct from "@/types";

export interface SimplifiedRecentProduct {
  _id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: any;
  categorySlugs: string[]; // Dynamic targeting ke liye slugs store karenge
}

const STORAGE_KEY = "pocketvalue_recently_viewed_history";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [history, setHistory] = useState<SimplifiedRecentProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setHistory(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to parse recently viewed history:", error);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // 2. Add product to history
  const addToHistory = useCallback((product: SanityProduct) => {
    if (!product || !product._id) return;

    setHistory((prev) => {
      const price = product.defaultVariant?.salePrice ?? product.defaultVariant?.price ?? 0;
      const salePrice = product.defaultVariant?.salePrice;
      const image = product.defaultVariant?.images?.[0] || product.variants?.[0]?.images?.[0];
      
      const categorySlugs = product.categories?.map(c => c.slug).filter(Boolean) as string[] || [];

      const simplifiedItem: SimplifiedRecentProduct = {
        _id: product._id,
        title: product.title,
        slug: product.slug,
        price,
        salePrice,
        image,
        categorySlugs,
      };

      // Purane duplicates ko nikalen aur naye item ko top par rakh kar filter karen (Limit 10)
      const filtered = [
        simplifiedItem,
        ...prev.filter((item) => item._id !== product._id),
      ].slice(0, MAX_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
  }, []);

  return {
    history,
    addToHistory,
    isLoaded,
  };
}