
"use client";

import { useState } from "react";
import { SanityBrand } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface BrandShowcaseProps {
  brands: SanityBrand[];
}

const INITIAL_VISIBLE_BRANDS = 14; 

export default function BrandShowcase({ brands }: BrandShowcaseProps) {
  const [showAll, setShowAll] = useState(false);

  if (!brands || brands.length === 0) return null;

  const visibleBrands = showAll ? brands : brands.slice(0, INITIAL_VISIBLE_BRANDS);

  return (
    <section className="w-full py-12 md:py-16 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-480 mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            Official Partners
          </h2>
          <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 dark:text-gray-400">
            We collaborate with the world's best brands for guaranteed quality.
          </p>
        </div>

        {/* BRAND GRID */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-4 md:gap-6">
          {visibleBrands.map((brand) => (
            <Link
              key={brand._id}
              href={`/search?brand=${brand.slug}`}
              className="group block"
            >
              <div 
                className="
                  relative w-full aspect-4/3 
                  bg-white dark:bg-gray-800 
                  rounded-xl border border-gray-200 dark:border-gray-700 
                  flex items-center justify-center p-0 /* Padding removed from outer div */
                  overflow-hidden transition-all duration-300 
                  hover:shadow-xl hover:border-brand-primary/30
                  group-hover:-translate-y-1
                "
              >
                {/* LOGO: BRIGHT & CONTAIN */}
                <Image
                  src={urlFor(brand.logo).url()}
                  alt={`${brand.name} Logo`}
                  fill
                  className="
                    /* 🔥 FIX 1: Grayscale & Opacity Hata Diye */
                    object-contain p-2 /* 🔥 FIX 2: Halka Sa Padding for Contain */
                    transition-all duration-500 ease-in-out
                  "
                  sizes="(max-width: 640px) 33vw, 15vw" 
                />
                
              </div>
              <p className="mt-3 text-center text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-primary transition-colors">
                {brand.name}
              </p>
            </Link>
          ))}
        </div>

        {/* LOAD MORE BUTTON */}
        {brands.length > INITIAL_VISIBLE_BRANDS && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="
                group relative inline-flex items-center gap-2 
                px-8 py-3 
                bg-white dark:bg-gray-900 
                text-gray-900 dark:text-white 
                font-bold text-sm uppercase tracking-widest 
                rounded-full border border-gray-200 dark:border-gray-800 
                hover:border-brand-primary dark:hover:border-brand-primary 
                hover:text-brand-primary dark:hover:text-brand-primary 
                transition-all duration-300 shadow-sm hover:shadow-md
              "
            >
              <span>{showAll ? "Show Less" : "View All Brands"}</span>
              {showAll ? (
                <FiChevronUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <FiChevronDown size={18} className="group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
