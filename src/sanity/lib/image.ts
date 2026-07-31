
// // // src/sanity/lib/image.ts

import createImageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"; 
import { dataset, projectId } from '../env';

const builder = createImageUrlBuilder({ projectId, dataset });

// ====================================================================
// 🛡️ TYPE DEFINITIONS FOR MOCK BUILDER PATTERN
// ====================================================================
export interface ImageUrlBuilderMock {
  width: (w: number) => ImageUrlBuilderMock;
  height: (h: number) => ImageUrlBuilderMock;
  fit: (f: string) => ImageUrlBuilderMock;
  crop: (c: string) => ImageUrlBuilderMock;
  auto: (a: string) => ImageUrlBuilderMock;
  format: (f: string) => ImageUrlBuilderMock;
  quality: (q: number) => ImageUrlBuilderMock;
  url: () => string;
}

interface PayloadImagePayload {
  url?: string;
  id?: string;
  asset?: {
    _ref?: string;
    _type?: string;
  };
}

// ====================================================================
// 🛡️ URL SANITIZER (Prevents XSS)
// ====================================================================
const sanitizeUrl = (url: string): string => {
  if (!url) return '/placeholder.png';
  
  // Trim whitespace
  const trimmed = url.trim();
  
  // ✅ Block javascript: protocol
  if (/^javascript:/i.test(trimmed)) {
    console.warn('Blocked javascript: URL in image source');
    return '/placeholder.png';
  }
  
  // ✅ Block data: protocol (can contain HTML)
  if (/^data:/i.test(trimmed)) {
    console.warn('Blocked data: URL in image source');
    return '/placeholder.png';
  }
  
  // ✅ Block vbscript: protocol
  if (/^vbscript:/i.test(trimmed)) {
    console.warn('Blocked vbscript: URL in image source');
    return '/placeholder.png';
  }
  
  // ✅ Block file: protocol
  if (/^file:/i.test(trimmed)) {
    console.warn('Blocked file: URL in image source');
    return '/placeholder.png';
  }
  
  // ✅ For http/https, validate URL structure
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed); // ✅ Validates URL structure
      return trimmed;
    } catch {
      console.warn('Invalid URL structure:', trimmed);
      return '/placeholder.png';
    }
  }
  
  // ✅ For relative paths (starting with /), allow
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  
  // ✅ For Sanity image references (image-...), allow
  if (trimmed.startsWith('image-')) {
    return trimmed;
  }
  
  // ❌ Unknown/unsafe format
  console.warn('Unrecognized URL format:', trimmed);
  return '/placeholder.png';
};

// UNIVERSAL MOCK BUILDER IMPLEMENTATION
const createMockBuilder = (finalUrl: string): ImageUrlBuilderMock => {
  // ✅ Sanitize the URL before creating mock
  const safeUrl = sanitizeUrl(finalUrl);
  
  const mockBuilder: ImageUrlBuilderMock = {
    width: () => mockBuilder,
    height: () => mockBuilder,
    fit: () => mockBuilder,
    crop: () => mockBuilder,
    auto: () => mockBuilder,
    format: () => mockBuilder,
    quality: () => mockBuilder,
    url: () => safeUrl, 
  };
  return mockBuilder;
};

// ====================================================================
// ✅ THE BULLETPROOF TYPE-SAFE ADAPTER (WITH SECURITY FIX)
// ====================================================================
export const urlFor = (source: unknown): ImageUrlBuilderMock | ReturnType<typeof builder.image> => {
  // 1. Agar source undefined, null, ya empty hai
  if (!source) {
    return createMockBuilder('/placeholder.png');
  }

  // 2. String check (e.g. direct Cloudinary URL ya Sanity image ID reference)
  if (typeof source === 'string') {
    // ✅ Sanitize before using
    const sanitized = sanitizeUrl(source);
    
    if (sanitized.startsWith('image-')) {
       return builder.image(sanitized as SanityImageSource);
    }
    return createMockBuilder(sanitized);
  }

  // 3. Structured objects handling safely (Payload CMS images mappings)
  if (typeof source === 'object' && source !== null) {
    const obj = source as PayloadImagePayload;
    
    if (obj.url) {
      // ✅ Sanitize the URL from Payload
      const sanitized = sanitizeUrl(obj.url);
      return createMockBuilder(sanitized);
    }

    if (obj.asset?._ref && !obj.asset._ref.startsWith('image-')) {
      return createMockBuilder('/placeholder.png');
    }
  }

  // Fallback to native builder if compatible with Sanity sources schema structures
  try {
    return builder.image(source as SanityImageSource);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Sanity URL Builder Error (Ignored, falling back):", errorMsg);
    return createMockBuilder('/placeholder.png');
  }
};