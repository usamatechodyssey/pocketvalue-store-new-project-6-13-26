
// src/components/home/TrustBar.tsx

import {
  ShieldCheck,
  Rocket,
  BadgePercent,
  MessagesSquare,
} from "lucide-react";

const features = [
  // ... (Features data same) ...
  {
    icon: ShieldCheck,
    title: "Quality Inspected",
    description: "Every product is hand-checked by our team to ensure you get the best. No compromises.",
  },
  {
    icon: Rocket,
    title: "Fast Shipping",
    description: "We partner with the best couriers to get your order to your doorstep as quickly as possible.",
  },
  {
    icon: BadgePercent,
    title: "Honest Prices",
    description: "By cutting out the middlemen, we bring you premium products at pocket-friendly prices.",
  },
  {
    icon: MessagesSquare,
    title: "Real Support",
    description: "Our team is always here to help. Your happiness is our top priority, 24/7.",
  },
];

export default function TrustBar() {
  return (
    <section className="w-full py-12 md:py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-sans font-bold text-gray-900 dark:text-white uppercase tracking-tight">
            Why Choose PocketValue?
          </h2>
          <div className="w-16 h-1 bg-brand-primary mt-3 rounded-full"></div>
          <p className="mt-4 max-w-2xl text-sm md:text-base text-gray-500 dark:text-gray-400">
            We&apos;re more than just a store. We&apos;re a promise.
          </p>
        </div>

        {/* === FEATURE GRID (Perfect 2x2 on Mobile, 4x1 on Desktop) === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                group relative 
                flex flex-col items-center text-center 
                p-6 md:p-8 
                bg-white dark:bg-gray-800 
                rounded-2xl 
                border border-gray-200 dark:border-gray-700 
                hover:border-brand-primary/50 dark:hover:border-brand-primary/50
                hover:shadow-lg hover:-translate-y-1 
                transition-all duration-300 ease-out
              "
            >
              {/* Icon Container with Primary Color */}
              <div className="
                flex items-center justify-center 
                h-14 w-14 mb-4 
                bg-brand-primary/10 dark:bg-brand-primary/20 
                text-brand-primary 
                rounded-full shadow-sm 
                transition-all duration-300
              ">
                <feature.icon size={28} strokeWidth={2} />
              </div>

              {/* Title */}
              <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-xs md:text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}