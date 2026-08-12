

// next.config.ts

import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  
  // ================================================================
  // 📁 1. OUTPUT & TRACING
  // ================================================================
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/fonts/**/*'], 
  },
  
  // ================================================================
  // 📦 2. SERVER EXTERNAL PACKAGES (No bundling)
  // ================================================================
  serverExternalPackages: [
    '@react-pdf/renderer', 
    'mongoose', 
    'mongodb', 
    'bcryptjs',
    'nodemailer',
    'sharp'
  ],

  // ================================================================
  // ⚛️ 3. REACT & COMPILER
  // ================================================================
  reactStrictMode: true, 

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
    styledComponents: true, 
  },

  // ================================================================
  // 🧪 4. EXPERIMENTAL (Server Actions, Optimizations)
  // ================================================================
  experimental: {
    webpackBuildWorker: false, 
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      'lodash', 
      'react-icons', 
      '@headlessui/react',
      'recharts',
      'date-fns',
      'gsap',
      'swiper',
      'react-select',
      'react-leaflet',
      'leaflet',
      '@tiptap/react'
    ],
  },

  // ================================================================
  // 🔧 5. WEBPACK (Optimized Bundling)
  // ================================================================
  webpack: (config, { isServer }) => {
    if (!isServer) {
      if (!config.optimization.splitChunks) {
          config.optimization.splitChunks = {};
      }
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxInitialRequests: 20,
        maxAsyncRequests: 20,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name(module: any) { 
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/|$])/)?.[1];
              return packageName ? `npm.${packageName.replace('@', '')}` : null;
            },
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
      config.optimization.runtimeChunk = 'single';
    }
    return config;
  },

  // ================================================================
  // 🖼️ 6. IMAGES (Enterprise Universal Loader)
  // ================================================================
  images: {
    // ✅ ENTERPRISE FIX: Universal custom loader
    // Automatically supports ANY CDN/Platform (ImgBB, R2, Cloudinary, Sanity, Markaz, HHC, etc.)
    // No need to add `remotePatterns` ever again!
    loaderFile: './image-loader.ts',
    
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95],
    
    // ✅ ENTERPRISE FIX: REMOVED remotePatterns
    // Custom loader bypasses Next.js remotePatterns restriction completely.
    // This ensures zero maintenance for future CDN additions.
    // remotePatterns: [], // <-- Intentionally empty or omitted
  },

  // ================================================================
  // 📦 7. TRANSPILE PACKAGES
  // ================================================================
  transpilePackages: ['papaparse'],
};

// ================================================================
// 📱 8. PWA CONFIGURATION
// ================================================================
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", 
  workboxOptions: {
    disableDevLogs: true,
  },
});

// ================================================================
// 🚀 9. EXPORT (With Payload + PWA)
// ================================================================
export default withPayload(withPWA(nextConfig));