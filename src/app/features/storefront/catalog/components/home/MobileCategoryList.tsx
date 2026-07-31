
"use client";

import Link from "next/link";
import Image from "next/image";
import { SanityCategory } from "@/types";
import { urlFor } from "@/sanity/lib/image";

export default function MobileCategoryList({ categories }: { categories: SanityCategory[] }) {
  
  if (!categories || categories.length === 0) return null;
  
  return (
    // ✅ FIX: 'scrollbar-hide' class ab globals.css se aa rahi hai (No local CSS flash)
    <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide">
      
      {/* w-max allows the container to be as wide as all items combined */}
      <div className="flex items-start gap-4 w-max px-4">
        
        {categories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug}`}
            className="flex flex-col items-center gap-2 group snap-center"
          >
            {/* === IMAGE CIRCLE === */}
            <div className="relative w-18 h-18 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm group-active:scale-95 transition-transform duration-200">
              {category.image ? (
                <Image
                  src={urlFor(category.image).width(150).height(150).url()}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="72px"
                  loading="lazy"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
                  No Img
                </div>
              )}
            </div>

            {/* === TEXT === */}
            <span className="text-[11px] font-medium text-center text-gray-700 dark:text-gray-300 w-18 leading-tight truncate">
              {category.name}
            </span>
          </Link>
        ))}

      </div>
    </div>
  );
}
