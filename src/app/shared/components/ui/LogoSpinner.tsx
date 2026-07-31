
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface LogoSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
}

export default function LogoSpinner({ size = "lg" }: LogoSpinnerProps) {
  // === CONFIGURATION ===
  // Mobile aur Desktop ke liye sizes ko tune kiya hai
  const config = {
    sm: { sizePx: 50, stroke: 3, padding: 8 },
    md: { sizePx: 80, stroke: 3, padding: 12 },
    lg: { sizePx: 120, stroke: 4, padding: 20 }, // Standard
    xl: { sizePx: 150, stroke: 5, padding: 24 },
  };

  const { sizePx, stroke, padding } = config[size];

  // Calculations
  const center = sizePx / 2;
  const radius = sizePx / 2 - stroke;
  const circumference = 2 * Math.PI * radius;

  // Inner Circle Size (Ring ke andar fit hone ke liye)
  const innerSize = sizePx - (stroke * 4); 

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: sizePx, height: sizePx }}
    >
      {/* 1. OUTER SPINNING RING (Brand Gradient) */}
      <motion.svg
        className="absolute inset-0 w-full h-full -rotate-90 z-0"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
        style={{ filter: "drop-shadow(0px 0px 6px rgba(255, 143, 50, 0.3))" }}
      >
        <defs>
          <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10589E" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#FF8F32" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF8F32" stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#spinnerGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25} // 25% Gap for sleek look
        />
      </motion.svg>

      {/* 2. INNER LOGO CONTAINER (Solid Background) */}
      <motion.div
        className="relative z-10 rounded-full flex items-center justify-center shadow-inner bg-white/50 dark:bg-gray-900"
        style={{
          width: innerSize,
          height: innerSize,
        }}
        // Halka sa "Breath" effect (Pulse)
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        {/* 3. THE LOGO */}
        <div className="relative w-full h-full" style={{ padding: padding }}>
          <Image
            src="/usamabrand.svg"
            alt="Loading..."
            fill
            className="object-contain"
            priority
            unoptimized // 👈 Ye zaroori hai local images (SVG/PNG) ke liye
          />
        </div>
      </motion.div>
    </div>
  );
}