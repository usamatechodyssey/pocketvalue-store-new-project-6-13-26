
"use client";

import Link from "next/link";
import Image from "next/image";
import { SanityCategory } from "@/types";
import { urlFor } from "@/sanity/lib/image";
import "@/app/shared/styles/CategoryCarousel.css"; 

interface Props {
  title: string;
  categories: SanityCategory[];
}

export default function CategoryCarousel({ title, categories }: Props) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Double tracks for seamless infinite scroll
  const tracks = [0, 1];

  return (
    <section className="w-full py-4 md:py-0 overflow-hidden bg-white dark:bg-gray-950">
      
      <div className="category-carousel-container relative">
        
        <div className="category-carousel-scroller flex hover:pause-animation">
          {tracks.map((trackIndex) => (
            <div
              key={trackIndex}
              className="category-carousel-track flex gap-6 px-3 py-6"
              aria-hidden={trackIndex === 1} // Accessibility: Hide duplicate track
            >
              {categories.map((category) => (
                <div 
                  key={`${trackIndex}-${category._id}`} 
                  // Responsive Sizing
                  className="category-item-wrapper shrink-0 w-37.5 lg:w-42.5 xl:w-47.5 2xl:w-52.5"
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className="group flex flex-col items-center gap-4"
                  >
                    {/* === CIRCLE IMAGE === */}
                    <div
                      className="
                          relative aspect-square w-full rounded-full 
                          overflow-hidden transition-all duration-500 ease-out
                          bg-gray-50 dark:bg-gray-800
                          border-2 border-gray-200 dark:border-gray-700
                          group-hover:border-brand-primary
                          group-hover:shadow-xl group-hover:shadow-brand-primary/20
                          group-hover:-translate-y-2
                        "
                    >
                      {category.image ? (
                        <Image
                          src={urlFor(category.image).width(400).height(400).url()}
                          alt={category.name}
                          fill
                          sizes="20vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No Img
                        </div>
                      )}
                    </div>

                    {/* === TEXT === */}
                    <h3 className="text-sm xl:text-base font-bold text-center text-gray-700 dark:text-gray-300 group-hover:text-brand-primary transition-colors leading-tight px-1">
                      {category.name}
                    </h3>
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}