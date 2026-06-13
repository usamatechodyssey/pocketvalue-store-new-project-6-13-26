// // /src/app/api/filter/route.ts

// import { getPayloadProducts } from "@/sanity/lib/payload/plp";
// // import { searchProducts } from "@/sanity/lib/queries";
// import { NextRequest, NextResponse } from "next/server";

// interface FilterRequestBody {
//   page?: number;
//   sortOrder?: string;
//   filters?: {
//     brands?: string[];
//     categories?: string[];
//     isFeatured?: boolean;
//     availability?: string[]; // ✨ ADDED
//     isOnSale?: boolean;      // ✨ ADDED
//     minRating?: number;      // ✨ ADDED
//     [key: string]: any;
//   };
//   priceRange?: {
//     min?: number;
//     max?: number;
//   };
//   context: {
//     type: 'category' | 'search' | 'deals';
//     value?: string;
//     sort?: string;
//     filter?: string;
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body: FilterRequestBody = await request.json();

//     const sortOrder = body.sortOrder || body.context.sort || 'best-match';
//     const filters = body.filters || {};

//     // Legacy context filter support
//     if (body.context.filter === 'isFeatured') {
//       filters.isFeatured = true;
//     }

//     const options: any = {
//       searchTerm: body.context.type === 'search' ? body.context.value : undefined,
//       categorySlug: body.context.type === 'category' ? body.context.value : undefined,

//       // Legacy Deals Logic
//       isDeal: body.context.type === 'deals' && !body.context.value,
//       // Campaign Logic
//       campaignSlug: body.context.type === 'deals' ? body.context.value : undefined,

//       // Pass the Full Filters Object (including new fields)
//       filters: filters,

//       minPrice: body.priceRange?.min,
//       maxPrice: body.priceRange?.max,
//       sortOrder: sortOrder,
//       page: body.page || 1,
//     };

//     // const results = await searchProducts(options);
//     // ✅ Switch to Payload Query Engine
//     const results = await getPayloadProducts(options);

//     return NextResponse.json(results);

//   } catch (error) {
//     console.error("API Filter Error:", error);
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     return new NextResponse(
//       JSON.stringify({ message: "Error processing filter request.", error: errorMessage }),
//       { status: 500 }
//     );
//   }
// }
// /src/app/api/filter/route.ts
import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { NextRequest, NextResponse } from "next/server";

interface FilterRequestBody {
  page?: number;
  sortOrder?: string;
  filters?: {
    brands?: string[];
    categories?: string[];
    isFeatured?: boolean;
    availability?: string[];
    isOnSale?: boolean;
    minRating?: number;
    [key: string]: any;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  context: {
    type: "category" | "search" | "deals";
    value?: string;
    sort?: string;
    filter?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FilterRequestBody = await request.json();

    // 🔥 FIX 1: Safety Check for Body & Context (Prevents Crash)
    if (!body || !body.context) {
      return NextResponse.json(
        { message: "Invalid request: Context is missing." },
        { status: 400 },
      );
    }

    const {
      context,
      filters = {},
      priceRange,
      page,
      sortOrder: bodySort,
    } = body;

    // Sort logic consolidation
    const finalSortOrder = bodySort || context.sort || "best-match";

    // Legacy support
    if (context.filter === "isFeatured") {
      filters.isFeatured = true;
    }

    // 🔥 FIX 2: Type-Safe Options Mapping
    const options: any = {
      searchTerm: context.type === "search" ? context.value : undefined,
      categorySlug: context.type === "category" ? context.value : undefined,

      // Legacy Deals vs Campaign Logic
      isDeal: context.type === "deals" && !context.value,
      campaignSlug:
        context.type === "deals" && context.value ? context.value : undefined,

      filters: filters,

      // 🔥 FIX 3: Explicit Price Handling (Avoids 0 being ignored)
      minPrice:
        typeof priceRange?.min === "number" ? priceRange.min : undefined,
      maxPrice:
        typeof priceRange?.max === "number" ? priceRange.max : undefined,

      sortOrder: finalSortOrder,
      page: page || 1,
    };

    // Execute Payload Query
    const results = await getPayloadProducts(options);

    // 🔥 FIX 4: Consistent JSON Response
    return NextResponse.json(results);
  } catch (error) {
    console.error("API Filter Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { message: "Error processing filter request.", error: errorMessage },
      { status: 500 },
    );
  }
}
