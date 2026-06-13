// //HeroSection.tsx

import { getPayload } from "payload";
import configPromise from "@payload-config";
import HeroCarousel from "./HeroCarousel";
import { HeroCarouselSlide } from "@/sanity/types/product_types"; 

// 🛑 OLD SANITY IMPORTS (Commented)
// import { client } from "@/sanity/lib/client";
// import { HERO_CAROUSEL_QUERY } from "@/sanity/lib/queries";

export default async function HeroSection() {
  
  // ✅ NEW PAYLOAD FETCH
  const payload = await getPayload({ config: configPromise });
  
  const result = await payload.find({
    collection: 'heroCarousel',
    sort: 'createdAt',
    // 🔥 FIX: Limit ko 0 kar diya, iska matlab hai "Sab le aao", ya 'pagination: false' bhi likh sakte hain
    pagination: false, // 10 ki pabandi khatam!
    depth: 1, 
  });

  if (!result.docs || result.docs.length === 0) return null;

  // Map Payload data to match frontend interface
  const banners: HeroCarouselSlide[] = result.docs.map((doc: any) => ({
    _id: doc.id,
    title: doc.title,
    subtitle: doc.subtitle || undefined,
    buttonText: doc.buttonText,
    link: doc.link,
    // Safely extract URLs from the populated media objects
    desktopImage: doc.desktopImage?.url || '',
    mobileImage: doc.mobileImage?.url || '',
  }));

  return <HeroCarousel banners={banners} />;
}