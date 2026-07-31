
// components/FeaturesSection.tsx

"use client";

import React from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const FeaturesSection: React.FC = () => (
  <section className="relative w-full py-20 md:py-24 overflow-hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
    
    {/* === 1. BACKGROUND ATMOSPHERE (The Glow) === */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
      {/* Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-brand-primary/5 dark:bg-brand-primary/10 blur-[100px] rounded-full" />
      {/* Decorative Icon Background */}
      <Mail 
        className="absolute top-10 right-10 w-64 h-64 text-gray-50 dark:text-white/5 -rotate-12 pointer-events-none select-none" 
        strokeWidth={0.5}
      />
    </div>

    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
      
      {/* === 2. HEADER SECTION === */}
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold uppercase tracking-widest">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
        </span>
        Newsletter
      </div>

      <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
        Join the <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">Inner Circle</span>
      </h2>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
        Be the first to know about new arrivals, exclusive drops, and secret sales. 
        We promise not to spam your inbox.
      </p>

      {/* === 3. PREMIUM INPUT FORM (The Star) === */}
      <form className="max-w-md mx-auto group">
        <div className="relative flex items-center p-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full shadow-lg hover:shadow-xl hover:border-brand-primary/30 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all duration-300">
          
          {/* Icon inside Input */}
          <div className="pl-4 text-gray-400 group-focus-within:text-brand-primary transition-colors">
            <Mail size={20} />
          </div>

          <input
            type="email"
            placeholder="Enter your email address..."
            className="w-full px-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none text-base"
            required
          />

          <button
            type="submit"
            className="
              shrink-0 flex items-center gap-2 
              px-6 py-3 rounded-full 
              bg-brand-primary hover:bg-brand-primary-hover 
              text-white font-bold text-sm uppercase tracking-wide
              transition-all duration-300 transform active:scale-95
              shadow-md hover:shadow-lg
            "
          >
            <span>Subscribe</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* === 4. TRUST BADGES === */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <span>No spam, ever</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-500" />
          <span>Unsubscribe anytime</span>
        </div>
      </div>

    </div>
  </section>
);

export default FeaturesSection;