// 📂 src/app/shared/components/catalog/components/home/TrustBar.tsx

import {
  ShieldCheck,
  Rocket,
  BadgePercent,
  MessagesSquare,
} from "lucide-react";

// ✅ BRAND ALIGNMENT: Replaced the word "premium" with "outstanding, high-quality" to ensure 100% inclusivity for all customer classes!
const features = [
  {
    icon: ShieldCheck,
    title: "Quality Inspected",
    description: "Every product is hand-checked by our team to ensure you get the absolute best. No compromises.",
  },
  {
    icon: Rocket,
    title: "Fast Shipping",
    description: "We partner with the best couriers to get your order to your doorstep as quickly as possible.",
  },
  {
    icon: BadgePercent,
    title: "Honest Prices",
    description: "By cutting out the middlemen, we bring you outstanding, high-quality products at pocket-friendly prices.",
  },
  {
    icon: MessagesSquare,
    title: "Real Support",
    description: "Our team is always here to help. Your happiness is our top priority, 24/7.",
  },
];

export default function TrustBar() {
  return (
    <section className="w-full py-16 md:py-20 bg-gray-50 dark:bg-gray-950 border-t border-zinc-200/60 dark:border-zinc-900 transition-colors duration-300 select-none">
      <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col items-center text-center mb-12 md:mb-16 space-y-3.5 leading-none">
          {/* ✅ HUD TAGLINE: Integrates your brand-new approved tagline "Your Pocket. Our Value." */}
          <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-3.5 py-1.5 rounded-full uppercase tracking-widest shadow-2xs">
            YOUR POCKET. OUR VALUE. • TRUST AUDIT
          </span>
          <h2 className="text-2xl md:text-3xl font-clash font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">
            Why Choose PocketValue?
          </h2>
          <div className="w-12 h-1 bg-brand-primary rounded-full"></div>
          <p className="max-w-2xl text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
            We&apos;re more than just a store. We&apos;re a commitment to everyday value.
          </p>
        </div>

        {/* === FEATURE GRID (Perfect 2x2 on Mobile, 4x1 on Desktop) === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="
                group relative 
                flex flex-col items-center text-center 
                p-6 md:p-8 
                bg-white dark:bg-gray-900 
                rounded-4xl 
                border border-zinc-200/60 dark:border-zinc-800/80 
                hover:border-brand-primary/40 dark:hover:border-brand-primary/40
                shadow-2xs hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 
                transition-all duration-300 ease-out
              "
            >
              {/* Glowing Icon Container */}
              <div className="
                flex items-center justify-center 
                h-14 w-14 mb-4 
                bg-brand-primary/10 dark:bg-brand-primary/20 
                border border-brand-primary/20
                text-brand-primary 
                rounded-full shadow-[0_0_15px_rgba(255,143,50,0.15)] 
                transition-all duration-300
              ">
                <feature.icon size={26} strokeWidth={2} />
              </div>

              {/* Title */}
              <h3 className="text-sm md:text-base font-clash font-extrabold text-zinc-900 dark:text-white mb-2 leading-none uppercase">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-[11px] md:text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-sans font-medium">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}