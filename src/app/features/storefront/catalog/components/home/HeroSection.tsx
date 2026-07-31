import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import HeroCarousel from "./HeroCarousel";
import { HeroCarouselSlide } from "@/types"; 



export default async function HeroSection() {
  
  // Use connection-safe client from the global cache singleton
  const payload = await getSafePayload();
  
  const result = await payload.find({
    collection: "heroCarousel",
    sort: "createdAt",
    pagination: false, // Disables default limit constraint to retrieve all items
    depth: 1, 
  });

  if (!result.docs || result.docs.length === 0) return null;

  // Map Payload data to match frontend interface (Explicit parameter typing maintained)
  const banners: HeroCarouselSlide[] = result.docs.map((doc: any) => ({
    _id: doc.id,
    title: doc.title,
    subtitle: doc.subtitle || undefined,
    buttonText: doc.buttonText,
    link: doc.link,
    // Safely extract URLs from the populated media objects
    desktopImage: doc.desktopImage?.url || "",
    mobileImage: doc.mobileImage?.url || "",
  }));

  return <HeroCarousel banners={banners} />;
}