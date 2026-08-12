
// src/app/api/filter/route.ts

import { getPayloadProducts } from "@/sanity/lib/payload/plp";
import { NextRequest, NextResponse } from "next/server";
import { FilterRequestSchema } from "@/app/shared/lib/zodSchemas";
import { QueryOptions } from "@/sanity/lib/payload/plp/queryBuilder";

export async function POST(request: NextRequest) {
  try {
    // ================================================================
    // 🔥 STEP 1: RAW BODY LOG (Sab se pehle)
    // ================================================================
    const rawBody = await request.text();
    console.log("📦 [API Filter] RAW BODY RECEIVED:", rawBody);

    // ================================================================
    // 🔥 STEP 2: PARSE JSON
    // ================================================================
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("❌ [API Filter] JSON PARSE FAILED:", parseError);
      return NextResponse.json(
        { message: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    // ================================================================
    // 🔥 STEP 3: STRUCTURED LOG
    // ================================================================
    console.log("🔍 [API Filter] PARSED BODY:", JSON.stringify(body, null, 2));

    // ================================================================
    // 🔥 STEP 4: CONTEXT SPECIFIC LOG (YAHAN SE ISSUE PAKADNA HAI)
    // ================================================================
    console.log("🧠 [API Filter] CONTEXT OBJECT:");
    console.log("  - typeof context:", typeof body.context);
    console.log("  - context:", body.context);
    if (body.context) {
      console.log("  - context.type:", body.context.type);
      console.log("  - typeof context.type:", typeof body.context.type);
      console.log("  - context.value:", body.context.value);
    } else {
      console.error("❌ [API Filter] context IS MISSING!");
    }

    // ================================================================
    // 🔥 STEP 5: VALIDATION (With extra logging)
    // ================================================================
    const parsed = FilterRequestSchema.safeParse(body);
    if (!parsed.success) {
      console.error("❌ [API Filter] VALIDATION FAILED:", JSON.stringify(parsed.error.issues, null, 2));
      
      // ✅ Extra check: Agar type invalid hai toh exact value batao
      const typeIssue = parsed.error.issues.find(i => i.path.includes('type'));
      if (typeIssue) {
        console.error(`🚨 [API Filter] INVALID CONTEXT TYPE: "${body.context?.type}"`);
        console.error(`   Expected one of: "category", "search", "deals"`);
      }

      return NextResponse.json(
        {
          message: "Invalid request payload.",
          errors: parsed.error.issues.map(i => ({
            path: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    // ================================================================
    // ✅ SUCCESS: Proceed
    // ================================================================
    const {
      context,
      filters = {},
      priceRange,
      page,
      sortOrder: bodySort,
    } = parsed.data;

    console.log("✅ [API Filter] VALIDATION SUCCESS! Context type:", context.type);

    const finalSortOrder = bodySort || context.sort || "best-match";

    let finalFilters = { ...filters };
    if (context.filter === "isFeatured") {
      finalFilters.isFeatured = true;
    }

    const options = {
      searchTerm: context.type === "search" ? context.value : undefined,
      categorySlug: context.type === "category" ? context.value : undefined,
      isDeal: context.type === "deals" && !context.value,
      campaignSlug: context.type === "deals" && context.value ? context.value : undefined,
      filters: finalFilters as QueryOptions['filters'],
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      sortOrder: finalSortOrder,
      page: page || 1,
    };

    console.log("📤 [API Filter] OPTIONS:", JSON.stringify(options, null, 2));

    const results = await getPayloadProducts(options);
    return NextResponse.json(results);

  } catch (error) {
    console.error("❌ [API Filter] UNHANDLED ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Error processing filter request.", error: errorMessage },
      { status: 500 }
    );
  }
}
