
// /src/app/components/home/FeaturedCategoryGrid.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { SanityCategory } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import { ArrowRight } from "lucide-react";

interface GridCategory {
  _key: string;
  discountText: string;
  category: SanityCategory;
}

interface Props {
  title: string;
  categories: GridCategory[];
}

export default function FeaturedCategoryGrid({ title, categories }: Props) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 md:py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-480 mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            {title || "Shop By Category"}
          </h2>
          <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 dark:text-gray-400">
            Explore our wide range of collections curated just for you.
          </p>
        </div>
        
        {/* === GRID LAYOUT (Finalized Breakpoints) === */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {categories.map((item, index) => {
            if (!item.category) return null;
            const uniqueKey = item._key || `cat-grid-${index}`;

            return (
              <Link
                key={uniqueKey} 
                href={`/category/${item.category.slug}`}
                className="group relative block w-full"
              >
                {/* CARD CONTAINER */}
                <div className="
                  relative w-full aspect-3/4 
                  overflow-hidden rounded-xl md:rounded-2xl 
                  bg-gray-100 dark:bg-gray-800 
                  shadow-md hover:shadow-xl dark:shadow-none
                  transition-all duration-500 ease-out
                  group-hover:-translate-y-1
                ">
                  
                  {/* IMAGE */}
                  {item.category.image ? (
                    <Image
                      src={urlFor(item.category.image).width(600).height(800).url()}
                      alt={item.category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                  ) : (
                    // Fallback
                    <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-800">
                      <span className="text-2xl font-bold text-gray-400 opacity-20 uppercase">
                        {item.category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  {/* GRADIENT OVERLAY */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-opacity duration-300" />
                  
                  {/* CONTENT */}
                  <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    
                    {/* Discount Tag */}
                    {item.discountText && (
                      <div className="inline-block mb-2 px-2 py-0.5 rounded text-[10px] md:text-xs font-bold bg-brand-primary text-white uppercase tracking-wider shadow-lg transform -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
                        {item.discountText}
                      </div>
                    )}

                    {/* Category Name */}
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="text-lg md:text-xl font-bold text-white leading-none tracking-wide drop-shadow-md">
                        {item.category.name}
                      </h3>
                      
                      {/* Arrow Icon */}
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}