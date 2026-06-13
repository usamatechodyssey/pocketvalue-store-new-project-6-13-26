// // src/app/(main)/deals/[slug]/page.tsx
// import { notFound } from "next/navigation";
// import Image from "next/image";
// import { Metadata } from "next";
// import ProductListingClient from "@/app/components/category/ProductListingClient";

// // 🛑 OLD SANITY IMPORTS (Commented)
// // import { client } from "@/sanity/lib/client";
// // import { GET_CAMPAIGN_DATA } from "@/sanity/lib/queries";

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayload } from "payload";
// import configPromise from "@payload-config";
// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// import { SanityBrand, SanityCategory } from "@/sanity/types/product_types";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries"; // Breadcrumbs ke liye
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// export const dynamic = 'force-dynamic';

// type PageProps = {
//   params: Promise<{ slug: string }>;
// };

// // --- HELPER: Campaign Data Fetcher (Payload Version) ---
// async function getPayloadCampaignData(slug: string) {
//   const payload = await getPayload({ config: configPromise });

//   // 1. Campaign Fetch Karein
//   const campaignResult = await payload.find({
//     collection: "campaigns",
//     where: { slug: { equals: slug } },
//     depth: 1, // Banner image expand karne ke liye
//   });

//   const campaignDoc = campaignResult.docs[0];

//   if (!campaignDoc || !campaignDoc.isActive) return null;

//   // 2. Products Fetch Karein (PLP Engine se)
//   const productData = await getPayloadProducts({
//     campaignSlug: slug, // PLP Engine khud samajh jayega ke filter kaise lagana hai
//     page: 1,
//     sortOrder: "newest",
//   });

//   const products = productData.products;

//   // 3. Filters Calculate Karein
//   const brandMap = new Map();
//   let minPrice = Infinity;
//   let maxPrice = 0;
//   const attributes: any[] = [];

//   products.forEach((p: any) => {
//     if (p.brand && p.brand._id) brandMap.set(p.brand._id, p.brand);
//     p.variants?.forEach((v: any) => {
//       if (v.price < minPrice) minPrice = v.price;
//       if (v.price > maxPrice) maxPrice = v.price;
//       v.attributes?.forEach((attr: any) => { attributes.push({ name: attr.name, value: attr.value }); });
//     });
//   });

//   if (minPrice === Infinity) minPrice = 0;
//   const brands = Array.from(brandMap.values()) as SanityBrand[];

//   return {
//     title: campaignDoc.title,
//     description: campaignDoc.description,
//     // @ts-ignore
//     banner: (campaignDoc.banner as any)?.url || null,
//     products: products,
//     totalCount: productData.totalCount,
//     filterData: {
//       brands,
//       attributes,
//       priceRange: { min: minPrice, max: maxPrice }
//     }
//   };
// }

// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const { slug } = await params;
//   return {
//     title: `${slug.replace(/-/g, ' ').toUpperCase()} - PocketValue Deals`,
//     description: `Exclusive offers for ${slug}`,
//   };
// }

// export default async function CampaignPage({ params }: PageProps) {
//   const { slug } = await params;

//   // ✅ Switch to Payload
//   const data = await getPayloadCampaignData(slug);
//   const breadcrumbs = await getPayloadBreadcrumbs("deals", slug); // Breadcrumbs bhi Payload se

//   if (!data) return notFound();

//   const { title, description, banner, products, filterData, totalCount } = data;

//   return (
//     <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">

//       {/* === CAMPAIGN BANNER HEADER === */}
//       <div className="relative w-full h-50 md:h-75 bg-gray-800 flex items-center justify-center overflow-hidden">
//         {banner ? (
//             <Image src={banner} alt={title} fill className="object-cover opacity-60" />
//         ) : (
//             <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-secondary opacity-90" />
//         )}
//         <div className="relative z-10 text-center px-4">
//             <h1 className="text-4xl md:text-6xl font-clash font-bold text-white drop-shadow-lg uppercase tracking-wide">
//                 {title}
//             </h1>
//             {description && <p className="text-white/90 mt-2 text-lg max-w-2xl mx-auto">{description}</p>}
//         </div>
//       </div>

//       <div className="max-w-480 mx-auto px-2 md:px-4 py-8 md:py-12">
//         {/* Breadcrumbs bhi CampaignPage par show karo */}
//         <div className="mb-8">
//           <Breadcrumbs crumbs={breadcrumbs} />
//         </div>

//         <ProductListingClient
//             initialProducts={products || []}
//             filterData={filterData}
//             totalCount={totalCount || 0}
//             context={{ type: "deals", value: slug }}
//             categoryTree={undefined} // Campaign page par categoryTree nahi hota
//         />
//       </div>

//     </main>
//   );
// }
// src/app/(main)/deals/[slug]/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { cache } from "react"; // 🔥 Added for deduplication
import ProductListingClient from "@/app/components/category/ProductListingClient";

// ✅ PAYLOAD IMPORTS
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
// import { urlFor } from "@/sanity/lib/image";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>; // 🔥 Added searchParams
};

// =========================================================================
// 🔥 CACHED CAMPAIGN DATA FETCHER
// =========================================================================
const getCachedCampaignData = cache(
  async (slug: string, page: number, sort?: string) => {
    const payload = await getPayload({ config: configPromise });

    // 1. Campaign Fetch Karein
    const campaignResult = await payload.find({
      collection: "campaigns",
      where: { slug: { equals: slug } },
      depth: 1,
    });

    const campaignDoc = campaignResult.docs[0];
    if (!campaignDoc || !campaignDoc.isActive) return null;

    // 2. Products & Global Filters Fetch Karein (Using PLP Engine)
    const productData = await getPayloadProducts({
      campaignSlug: slug,
      page: page,
      sortOrder: sort || "newest",
    });

    return {
      title: campaignDoc.title,
      description: campaignDoc.description,
      // @ts-ignore
      banner: campaignDoc.banner?.url || null,
      products: productData.products,
      totalCount: productData.totalCount,
      filterData: productData.filterData, // 🔥 Global Filters from PLP Engine
      slug: campaignDoc.slug,
    };
  },
);

// =========================================================================
// 🔥 METADATA
// =========================================================================
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCachedCampaignData(slug, 1);

  if (!data) return { title: "Deal Not Found" };

  return {
    title: `${data.title} - PocketValue Exclusive Deals`,
    description: data.description || `Exclusive offers for ${data.title}`,
    openGraph: {
      images: data.banner ? [{ url: data.banner }] : [],
    },
  };
}

// =========================================================================
// 🛒 CAMPAIGN DETAIL PAGE
// =========================================================================
export default async function CampaignPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page, sort } = await searchParams;

  const currentPage = Number(page) || 1;

  // Parallel Fetching
  const [data, breadcrumbs] = await Promise.all([
    getCachedCampaignData(slug, currentPage, sort),
    getPayloadBreadcrumbs("deals", slug),
  ]);

  if (!data) return notFound();

  const { title, description, banner, products, filterData, totalCount } = data;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // 🔥 SEO: Breadcrumb & Sale Event Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: { "@id": `${siteUrl}${crumb.href}`, name: crumb.name },
        })),
      },
      {
        "@type": "SaleEvent",
        name: title,
        description: description,
        image: banner,
        url: `${siteUrl}/deals/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="relative w-full h-60 md:h-80 bg-gray-800 flex items-center justify-center overflow-hidden">
          {banner ? (
            <Image
              src={banner}
              alt={title}
              fill
              className="object-cover opacity-60"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-orange-600 opacity-90" />
          )}
          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-white/90 mt-3 text-lg max-w-2xl mx-auto line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="max-w-480 mx-auto px-4 py-8 md:py-12">
          <div className="mb-8">
            <Breadcrumbs crumbs={breadcrumbs} />
          </div>

          <ProductListingClient
            key={`${slug}-${currentPage}`} // 🔥 Force reset on navigation
            initialProducts={products || []}
            filterData={filterData}
            totalCount={totalCount || 0}
            context={{ type: "deals", value: slug }}
            categoryTree={undefined}
          />
        </div>
      </main>
    </>
  );
}
