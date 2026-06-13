// // // /src/app/search/page.tsx

// // import { Suspense } from "react";
// // import {
// //   GET_FILTER_DATA_FOR_PLP,
// //   searchProducts,
// //   getBreadcrumbs,
// // } from "@/sanity/lib/queries";
// // import ProductListingClient from "@/app/components/category/ProductListingClient";
// // import { Search, Loader2 } from "lucide-react";
// // import { generateBaseMetadata } from "@/utils/metadata";
// // import type { Metadata } from "next";
// // import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// // type SearchPageProps = {
// //   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// // };

// // export async function generateMetadata({
// //   searchParams: searchParamsPromise,
// // }: SearchPageProps): Promise<Metadata> {
// //   const searchParams = await searchParamsPromise;
// //   const q = (searchParams?.q as string) || "";
// //   const sort = (searchParams?.sort as string) || "best-match";
// //   const filter = (searchParams?.filter as string) || "";
// //   const isFeatured = filter === "isFeatured";

// //   let title = "Search Results";
// //   let description = "Find the best products on PocketValue.";

// //   if (q) {
// //     title = `Results for "${q}"`;
// //     description = `Search results for "${q}" on PocketValue. Find deals on a wide range of products.`;
// //   } else if (sort === "newest") {
// //     title = "New Arrivals";
// //     description = "Check out the latest products to arrive at PocketValue.";
// //   } else if (sort === "best-selling") {
// //     title = "Best Sellers";
// //     description = "Discover our most popular and best-selling products.";
// //   } else if (isFeatured) {
// //     title = "Featured Products";
// //     description = "Shop our curated collection of featured products.";
// //   }

// //   const baseMetadata = await generateBaseMetadata({
// //     title,
// //     description,
// //     path: "/search",
// //   });

// //   if (q) {
// //     baseMetadata.robots = {
// //       index: false,
// //       follow: true,
// //     };
// //   }

// //   return baseMetadata;
// // }

// // export default function SearchPage({ searchParams }: SearchPageProps) {
// //   return (
// //     <Suspense fallback={<SearchPageSkeleton />}>
// //       <SearchResults searchParamsPromise={searchParams} />
// //     </Suspense>
// //   );
// // }

// // async function SearchResults({
// //   searchParamsPromise,
// // }: {
// //   searchParamsPromise: SearchPageProps["searchParams"];
// // }) {
// //   const searchParams = await searchParamsPromise;
// //   const q = (searchParams?.q as string) || "";
// //   const sort = (searchParams?.sort as string) || "best-match";
// //   const filter = (searchParams?.filter as string) || "";
// //   const isFeatured = filter === "isFeatured";

// //   const filtersForSearch = { isFeatured: isFeatured };

// //   const [initialData, filterData, breadcrumbs] = await Promise.all([
// //     searchProducts({
// //       searchTerm: q,
// //       sortOrder: sort,
// //       filters: filtersForSearch,
// //       page: 1,
// //     }),
// //     GET_FILTER_DATA_FOR_PLP({
// //       searchTerm: q,
// //       sortOrder: sort,
// //       isFeatured: isFeatured,
// //     }),
// //     getBreadcrumbs("search"),
// //   ]);

// //   const { products: initialProducts, totalCount } = initialData;

// //   let title = "Search Results";
// //   if (!q && sort === "newest") title = "New Arrivals";
// //   if (!q && sort === "best-selling") title = "Best Sellers";
// //   if (!q && isFeatured) title = "Featured Products";

// //   const finalFilterData = filterData || {
// //     brands: [],
// //     attributes: [],
// //     priceRange: { min: 0, max: 0 },
// //   };

// //   return (
// //     <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-8 py-8 md:py-12">
// //       <div className="max-w-480 mx-auto">
// //         <div className="mb-6 md:mb-8">
// //           <Breadcrumbs crumbs={breadcrumbs} />
// //           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">
// //             {title}
// //           </h1>
// //           {q && (
// //             <p className="text-gray-600 dark:text-gray-400 mt-2">
// //               Showing results for:{" "}
// //               {/* ✅ FIX: Replaced " with &quot; */}
// //               <span className="font-semibold text-brand-primary">
// //                 &quot;{q}&quot;
// //               </span>
// //             </p>
// //           )}
// //         </div>

// //         {initialProducts && initialProducts.length > 0 ? (
// //           <ProductListingClient
// //             key={q}
// //             initialProducts={initialProducts}
// //             filterData={finalFilterData}
// //             totalCount={totalCount || 0}
// //             context={{
// //               type: "search",
// //               value: q,
// //               sort: sort,
// //               filter: filter,
// //             }}
// //           />
// //         ) : (
// //           <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
// //             <Search size={48} className="mx-auto text-gray-400" />
// //             <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
// //               No Products Found
// //             </h3>
// //             <p className="text-gray-600 dark:text-gray-400 mt-2">
// //               {/* ✅ FIX: Replaced ' with &apos; */}
// //               We couldn&apos;t find anything matching your criteria. Try a
// //               different search or filter.
// //             </p>
// //           </div>
// //         )}
// //       </div>
// //     </main>
// //   );
// // }

// // function SearchPageSkeleton() {
// //   return (
// //     <main className="w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
// //       <div className="max-w-full mx-auto">
// //         <div className="mb-6 md:mb-8">
// //           <div className="h-10 bg-gray-200 rounded w-1/3 dark:bg-gray-700 animate-pulse"></div>
// //           <div className="h-4 bg-gray-200 rounded w-1/4 mt-4 dark:bg-gray-700 animate-pulse"></div>
// //         </div>
// //         <div className="flex justify-center items-center h-[50vh] text-center">
// //           <div>
// //             <Loader2 className="w-12 h-12 mx-auto animate-spin text-brand-primary" />
// //             <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
// //               Loading results...
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }
// // /src/app/search/page.tsx

// import { Suspense } from "react";
// // 🛑 OLD SANITY IMPORTS
// /*
// import {
//   GET_FILTER_DATA_FOR_PLP,
//   searchProducts,
//   getBreadcrumbs,
// } from "@/sanity/lib/queries";
// */

// // ✅ NEW PAYLOAD IMPORTS
// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
// import { SanityBrand } from "@/sanity/types/product_types"; // Typescript ke liye

// import ProductListingClient from "@/app/components/category/ProductListingClient";
// import { Search, Loader2 } from "lucide-react";
// import { generateBaseMetadata } from "@/utils/metadata";
// import type { Metadata } from "next";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

// type SearchPageProps = {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// };

// export async function generateMetadata({
//   searchParams: searchParamsPromise,
// }: SearchPageProps): Promise<Metadata> {
//   const searchParams = await searchParamsPromise;
//   const q = (searchParams?.q as string) || "";
//   const sort = (searchParams?.sort as string) || "best-match";
//   const filter = (searchParams?.filter as string) || "";
//   const isFeatured = filter === "isFeatured";

//   let title = "Search Results";
//   let description = "Find the best products on PocketValue.";

//   if (q) {
//     title = `Results for "${q}"`;
//     description = `Search results for "${q}" on PocketValue. Find deals on a wide range of products.`;
//   } else if (sort === "newest") {
//     title = "New Arrivals";
//     description = "Check out the latest products to arrive at PocketValue.";
//   } else if (sort === "best-selling") {
//     title = "Best Sellers";
//     description = "Discover our most popular and best-selling products.";
//   } else if (isFeatured) {
//     title = "Featured Products";
//     description = "Shop our curated collection of featured products.";
//   }

//   const baseMetadata = await generateBaseMetadata({
//     title,
//     description,
//     path: "/search",
//   });

//   if (q) {
//     baseMetadata.robots = {
//       index: false,
//       follow: true,
//     };
//   }

//   return baseMetadata;
// }

// export default function SearchPage({ searchParams }: SearchPageProps) {
//   return (
//     <Suspense fallback={<SearchPageSkeleton />}>
//       <SearchResults searchParamsPromise={searchParams} />
//     </Suspense>
//   );
// }

// async function SearchResults({
//   searchParamsPromise,
// }: {
//   searchParamsPromise: SearchPageProps["searchParams"];
// }) {
//   const searchParams = await searchParamsPromise;
//   const q = (searchParams?.q as string) || "";
//   const sort = (searchParams?.sort as string) || "best-match";
//   const filter = (searchParams?.filter as string) || "";
//   const isFeatured = filter === "isFeatured";

//   const filtersForSearch = { isFeatured: isFeatured };

//   // 🔥 SWITCH: Sanity se Payload Queries par shift
//   const [productData, breadcrumbs] = await Promise.all([
//     getPayloadProducts({
//       searchTerm: q,
//       sortOrder: sort,
//       filters: filtersForSearch,
//       page: 1,
//     }),
//     // breadcrumbs bhi Payload se aayenge
//     getPayloadBreadcrumbs("search"),
//   ]);

//   const { products: initialProducts, totalCount } = productData;

//   // 🔥 LOGIC: Filters (Brands/Price) ko products se calculate karna
//   // (Ye pehle GROQ query mein hota tha, ab hum JS mein kar rahe hain)
//   const brandMap = new Map();
//   let minPrice = Infinity;
//   let maxPrice = 0;
//   const attributes: any[] = [];

//   initialProducts.forEach((p: any) => {
//     // Brands Logic
//     if (p.brand && p.brand._id) {
//         brandMap.set(p.brand._id, p.brand);
//     }
//     // Price Logic
//     p.variants?.forEach((v: any) => {
//       if (v.price < minPrice) minPrice = v.price;
//       if (v.price > maxPrice) maxPrice = v.price;
//       // Attributes Logic
//       v.attributes?.forEach((attr: any) => {
//          attributes.push({ name: attr.name, value: attr.value });
//       });
//     });
//   });

//   if (minPrice === Infinity) minPrice = 0;
//   const brands = Array.from(brandMap.values()) as SanityBrand[];

//   const finalFilterData = {
//     brands,
//     attributes,
//     priceRange: { min: minPrice, max: maxPrice },
//   };

//   // Title Logic
//   let title = "Search Results";
//   if (!q && sort === "newest") title = "New Arrivals";
//   if (!q && sort === "best-selling") title = "Best Sellers";
//   if (!q && isFeatured) title = "Featured Products";

//   return (
//     <main className="w-full bg-gray-50 dark:bg-gray-950 px-2 md:px-8 py-8 md:py-12">
//       <div className="max-w-480 mx-auto">
//         <div className="mb-6 md:mb-8">
//           <Breadcrumbs crumbs={breadcrumbs} />
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">
//             {title}
//           </h1>
//           {q && (
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               Showing results for:{" "}
//               {/* ✅ FIX: Replaced " with &quot; */}
//               <span className="font-semibold text-brand-primary">
//                 &quot;{q}&quot;
//               </span>
//             </p>
//           )}
//         </div>

//         {initialProducts && initialProducts.length > 0 ? (
//           <ProductListingClient
//             key={q}
//             initialProducts={initialProducts}
//             filterData={finalFilterData}
//             totalCount={totalCount || 0}
//             context={{
//               type: "search",
//               value: q,
//               sort: sort,
//               filter: filter,
//             }}
//           />
//         ) : (
//           <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
//             <Search size={48} className="mx-auto text-gray-400" />
//             <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
//               No Products Found
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mt-2">
//               {/* ✅ FIX: Replaced ' with &apos; */}
//               We couldn&apos;t find anything matching your criteria. Try a
//               different search or filter.
//             </p>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// function SearchPageSkeleton() {
//   return (
//     <main className="w-full bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 md:py-12">
//       <div className="max-w-full mx-auto">
//         <div className="mb-6 md:mb-8">
//           <div className="h-10 bg-gray-200 rounded w-1/3 dark:bg-gray-700 animate-pulse"></div>
//           <div className="h-4 bg-gray-200 rounded w-1/4 mt-4 dark:bg-gray-700 animate-pulse"></div>
//         </div>
//         <div className="flex justify-center items-center h-[50vh] text-center">
//           <div>
//             <Loader2 className="w-12 h-12 mx-auto animate-spin text-brand-primary" />
//             <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
//               Loading results...
//             </p>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }
// src/app/search/page.tsx
import { Suspense, cache } from "react";
import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { getPayloadBreadcrumbs } from "@/sanity/lib/payload/category.queries";
import ProductListingClient from "@/app/components/category/ProductListingClient";
import { Search, Loader2 } from "lucide-react";
import { generateBaseMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";

type SearchPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 🔥 CACHED DATA FETCHER
const getCachedSearchResults = cache(
  async (query: string, slugs: string[], sort: string, page: number) => {
    // Case A: Visual Search Results (By Slugs)
    if (slugs.length > 0) {
      const products = await getPayloadProductsBySlugs(slugs);
      return {
        products,
        totalCount: products.length,
        filterData: null, // Visual search par filters hide rakhte hain specificity ke liye
        title: "Visual Search Results",
      };
    }

    // Case B: Regular Text Search
    const productData = await getPayloadProducts({
      searchTerm: query,
      sortOrder: sort,
      page: page,
    });

    return {
      products: productData.products,
      totalCount: productData.totalCount,
      filterData: productData.filterData, // 🔥 Now using engine's global filter data
      title: query ? `Results for "${query}"` : "Explore Products",
    };
  },
);

export async function generateMetadata({
  searchParams: sp,
}: SearchPageProps): Promise<Metadata> {
  const searchParams = await sp;
  const q = (searchParams?.q as string) || "";
  const slugs =
    typeof searchParams?.slugs === "string"
      ? searchParams.slugs.split(",")
      : [];

  const baseMetadata = await generateBaseMetadata({
    title: q
      ? `Search: ${q}`
      : slugs.length > 0
        ? "Visual Search Results"
        : "Search Results",
    description: "Find the best deals on PocketValue.",
    path: "/search",
  });

  baseMetadata.robots = { index: false, follow: true };
  return baseMetadata;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchResultsContainer searchParamsPromise={searchParams} />
    </Suspense>
  );
}

async function SearchResultsContainer({
  searchParamsPromise,
}: {
  searchParamsPromise: SearchPageProps["searchParams"];
}) {
  const searchParams = await searchParamsPromise;
  const q = (searchParams?.q as string) || "";
  const sort = (searchParams?.sort as string) || "best-match";
  const page = Number(searchParams?.page) || 1;
  const slugs =
    typeof searchParams?.slugs === "string"
      ? searchParams.slugs.split(",")
      : [];

  const [data, breadcrumbs] = await Promise.all([
    getCachedSearchResults(q, slugs, sort, page),
    getPayloadBreadcrumbs("search"),
  ]);

  const { products, totalCount, filterData, title } = data;
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  // SEO Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: totalCount,
      itemListElement: products.slice(0, 10).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/product/${p.slug}`,
      })),
    },
  };

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950 px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-480 mx-auto">
        <div className="mb-8">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-3xl md:text-4xl font-bold mt-4">{title}</h1>
        </div>

        {products.length > 0 ? (
          <ProductListingClient
            key={`${q}-${slugs.join("")}`}
            initialProducts={products}
            filterData={
              filterData || {
                brands: [],
                attributes: [],
                priceRange: { min: 0, max: 0 },
              }
            }
            totalCount={totalCount}
            context={{ type: "search", value: q }}
          />
        ) : (
          <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold">No Products Found</h3>
            <p className="text-gray-500">
              Try a different keyword or check your spelling.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
      <p className="text-gray-500 font-medium">Searching our warehouse...</p>
    </div>
  );
}
