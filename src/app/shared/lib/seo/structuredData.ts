// src/app/shared/lib/seo/structuredData.ts
// ================================================================
// 🏗️ ENTERPRISE STRUCTURED DATA ENGINE (UPGRADED — COMPLETE)
// ================================================================
// Centralized JSON-LD generator for all schema types.
// This eliminates code duplication across product, blog, and category pages.
//
// 🛡️ SUPPORTED SCHEMAS (2026 Updated):
// ✅ Product, ProductGroup, Offer, AggregateRating, Review
// ✅ MerchantListing, Pattern, Material (#125)
// ✅ Person (Author), Organization, Publisher (#87)
// ✅ VideoObject, Clip/SeekToAction (Video Key Moments) (#134)
// ✅ BreadcrumbList, WebPage, CollectionPage (#77)
// 🆕 Return Policy, Shipping Policy, Payment Method (#84, #85, #86)
// 🆕 Speakable Schema (#83)
// ================================================================

import  SanityProduct,{ ProductVariant, BreadcrumbItem, ProductReview } from "@/types";


// ================================================================
// 🔥 OPTIONS INTERFACES
// ================================================================

interface ProductSchemaOptions {
  product: SanityProduct;
  baseUrl: string;
  seo?: {
    material?: string;
    pattern?: string;
    merchantCategory?: string;
    enableProductGroup?: boolean;
    videoKeyMoment?: string;
    atomicAnswer?: string;
    faqQuestions?: { question: string; answer: string }[];
    // 🆕 Return Policy can come from product level
    returnPolicyDays?: number;
    returnPolicyDescription?: string;
  };
  reviews?: ProductReview[];
  breadcrumbs: BreadcrumbItem[];
  siteName: string;
  siteLogo?: string;
  selectedVariant?: ProductVariant;
  // 🆕 Settings for policies
  settings?: {
    shippingRules?: any[];
    paymentGateways?: any[];
    returnPolicy?: {
      days: number;
      description: string;
    };
  };
}

// ================================================================
// 🚀 1. PRODUCT SCHEMA (Complete with all 2026 updates)
// ================================================================

export function generateProductStructuredData(
  options: ProductSchemaOptions
): Record<string, any> {
  const {
    product,
    baseUrl,
    seo,
    reviews = [],
    breadcrumbs,
    siteName,
    siteLogo,
    selectedVariant,
    settings,
  } = options;

  const productUrl = `${baseUrl}/product/${product.slug}`;
  const variant = selectedVariant || product.defaultVariant || product.variants?.[0];

  // --- Price & Availability ---
  const price = variant?.salePrice ?? variant?.price ?? 0;
  const availability = variant?.inStock && (variant?.stock ?? 0) > 0
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";

  // --- Aggregate Rating ---
  const avgRating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const hasRating = reviewCount > 0 && avgRating > 0;

  // --- Material & Pattern (#125) ---
  const material = seo?.material || "";
  const pattern = seo?.pattern || "";

  // --- Merchant Category (#88) ---
  const merchantCategory = seo?.merchantCategory || product.categories?.[0]?.name || "Apparel & Accessories";

  // --- ProductGroup Schema (#38) ---
  const enableProductGroup = seo?.enableProductGroup !== false;
  const hasVariants = (product.variants?.length ?? 0) > 1;

  // --- Video Key Moments (#134) ---
  const hasVideo = product.videoUrl && product.videoUrl.trim() !== "";
  const videoKeyMoment = seo?.videoKeyMoment || "00:00";

  // --- Brand Logo ---
  const brandLogo = product.brand?.logo?.url || siteLogo || "";

  // --- Reviews (limited to 5 for schema) ---
  const reviewList = reviews.slice(0, 5).map((r) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: r.user?.name || "Anonymous",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
    },
    reviewBody: r.comment,
    datePublished: r._createdAt,
  }));

  // ================================================================
  // 🆕 TASK #84: RETURN POLICY SCHEMA
  // ================================================================
  const returnPolicyDays = seo?.returnPolicyDays || settings?.returnPolicy?.days || 30;
  const returnPolicyDescription =
    seo?.returnPolicyDescription ||
    settings?.returnPolicy?.description ||
    "30-day return policy. Items must be unused and in original packaging.";

  // ================================================================
  // 🆕 TASK #85: SHIPPING POLICY SCHEMA (from settings)
  // ================================================================
  const shippingRules = settings?.shippingRules || [];
  const defaultShippingCost = shippingRules.length > 0
    ? shippingRules[0]?.cost || 350
    : 350;

  // ================================================================
  // 🆕 TASK #86: PAYMENT METHOD SCHEMA
  // ================================================================
  const paymentGateways = settings?.paymentGateways || [];
  const acceptedPaymentMethods = paymentGateways.length > 0
    ? paymentGateways.map((gw: any) => gw.name || "Credit Card")
    : ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "EasyPaisa", "JazzCash"];

  // ================================================================
  // 🆕 TASK #83: SPEAKABLE SCHEMA
  // ================================================================
  const productDescription = product.description
    ? (product.description as any)?.root?.children?.[0]?.children?.[0]?.text || ""
    : "";

  // --- Build Graph ---
  const graph: Record<string, any>[] = [];

  // 1. Breadcrumb
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.href.startsWith("/") ? crumb.href : "/" + crumb.href}`,
    })),
  });

  // 2. Product or ProductGroup
  if (enableProductGroup && hasVariants) {
    graph.push({
      "@type": "ProductGroup",
      "@id": `${productUrl}/#product-group`,
      name: product.title,
      description: productDescription || "",
      url: productUrl,
      brand: {
        "@type": "Brand",
        name: product.brand?.name || siteName,
        ...(brandLogo && { logo: brandLogo }),
      },
      ...(material && { material }),
      ...(pattern && { pattern }),
      image: variant?.images?.[0]?.url || product.defaultVariant?.images?.[0]?.url || "",
      hasVariant: product.variants?.map((v) => ({
        "@type": "Product",
        name: `${product.title} - ${v.name}`,
        sku: v.sku || undefined,
        image: v.images?.[0]?.url || variant?.images?.[0]?.url || "",
        offers: {
          "@type": "Offer",
          priceCurrency: "PKR",
          price: v.salePrice ?? v.price,
          availability: v.inStock && (v.stock ?? 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${productUrl}?variant=${v._key}`,
        },
      })),
      ...(hasRating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount: reviewCount,
        },
      }),
      ...(reviewList.length > 0 && { review: reviewList }),
      // 🆕 Return Policy (#84)
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: returnPolicyDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        description: returnPolicyDescription,
      },
    });
  } else {
    graph.push({
      "@type": "Product",
      "@id": `${productUrl}/#product`,
      name: product.title,
      description: productDescription || "",
      url: productUrl,
      sku: variant?.sku || product._id,
      brand: {
        "@type": "Brand",
        name: product.brand?.name || siteName,
        ...(brandLogo && { logo: brandLogo }),
      },
      ...(material && { material }),
      ...(pattern && { pattern }),
      image: variant?.images?.[0]?.url || product.defaultVariant?.images?.[0]?.url || "",
      offers: {
        "@type": "Offer",
        priceCurrency: "PKR",
        price: price,
        availability: availability,
        url: productUrl,
        priceValidUntil: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ).toISOString().split("T")[0],
        // 🆕 Shipping Policy (#85)
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: defaultShippingCost,
            currency: "PKR",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "PK",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 2,
              maxValue: 5,
              unitCode: "DAY",
            },
          },
        },
        // 🆕 Return Policy (#84)
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "PK",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: returnPolicyDays,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
          description: returnPolicyDescription,
        },
        // 🆕 Payment Method (#86)
        acceptedPaymentMethod: acceptedPaymentMethods.map((method: string) => ({
          "@type": "PaymentMethod",
          name: method,
        })),
      },
      ...(hasRating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: avgRating.toFixed(1),
          reviewCount: reviewCount,
        },
      }),
      ...(reviewList.length > 0 && { review: reviewList }),
    });
  }

  // 3. Merchant Listing (#88)
  const merchantItem: Record<string, any> = {
    "@type": "Product",
    "@id": `${productUrl}/#merchant-product`,
    name: product.title,
    description: productDescription || "",
    image: variant?.images?.[0]?.url || product.defaultVariant?.images?.[0]?.url || "",
    sku: variant?.sku || product._id,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || siteName,
      ...(brandLogo && { logo: brandLogo }),
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: price,
      availability: availability,
      url: productUrl,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: defaultShippingCost,
          currency: "PKR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: returnPolicyDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        description: returnPolicyDescription,
      },
      acceptedPaymentMethod: acceptedPaymentMethods.map((method: string) => ({
        "@type": "PaymentMethod",
        name: method,
      })),
    },
  };

  if (merchantCategory) merchantItem.category = merchantCategory;
  if (material) merchantItem.material = material;
  if (pattern) merchantItem.pattern = pattern;
  graph.push(merchantItem);

  // 4. VideoObject + Video Key Moments (#134)
  if (hasVideo) {
    const videoObject: Record<string, any> = {
      "@type": "VideoObject",
      "@id": `${productUrl}/#video`,
      name: `${product.title} - Official Video`,
      description: `Watch features of ${product.title}`,
      thumbnailUrl: variant?.images?.[0]?.url || product.defaultVariant?.images?.[0]?.url || "",
      contentUrl: product.videoUrl,
      uploadDate: product._createdAt || new Date().toISOString(),
    };

    if (videoKeyMoment && videoKeyMoment !== "00:00") {
      videoObject.hasPart = {
        "@type": "Clip",
        name: `${product.title} Highlight`,
        startOffset: videoKeyMoment,
        endOffset: videoKeyMoment,
      };
      videoObject.potentialAction = {
        "@type": "SeekToAction",
        target: `${product.videoUrl}?t={seek_to_second_number}`,
        "startOffset-input": "required name=seek_to_second_number",
      };
    }
    graph.push(videoObject);
  }

  // 🆕 5. Speakable Schema (#83) — Add as separate entry
  if (productDescription) {
    graph.push({
      "@type": "SpeakableSpecification",
      "@id": `${productUrl}/#speakable`,
      cssSelector: ".product-description",
      headline: product.title,
      datePublished: product._createdAt || new Date().toISOString(),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

// ================================================================
// 🧑 2. PERSON / AUTHOR SCHEMA (#87)
// ================================================================

interface PersonSchemaOptions {
  name: string;
  image?: string;
  bio?: string;
  sameAs?: string[];
  baseUrl: string;
  slug: string;
}

export function generatePersonStructuredData(
  options: PersonSchemaOptions
): Record<string, any> {
  const { name, image, bio, sameAs, baseUrl, slug } = options;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${baseUrl}/author/${slug}/#person`,
    name: name,
    ...(image && { image }),
    ...(bio && { description: bio }),
    ...(sameAs && sameAs.length > 0 && { sameAs: sameAs }),
    url: `${baseUrl}/author/${slug}`,
  };
}

// ================================================================
// 🍞 3. BREADCRUMB LIST SCHEMA (#77)
// ================================================================

interface BreadcrumbSchemaOptions {
  breadcrumbs: BreadcrumbItem[];
  baseUrl: string;
}

export function generateBreadcrumbStructuredData(
  options: BreadcrumbSchemaOptions
): Record<string, any> {
  const { breadcrumbs, baseUrl } = options;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.href.startsWith("/") ? crumb.href : "/" + crumb.href}`,
    })),
  };
}

// ================================================================
// 📚 4. FAQ PAGE SCHEMA (#72)
// ================================================================

interface FaqSchemaOptions {
  items: { question: string; answer: string }[];
  baseUrl: string;
}

export function generateFaqStructuredData(
  options: FaqSchemaOptions
): Record<string, any> {
  const { items, baseUrl } = options;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${baseUrl}/faq/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ================================================================
// 🌐 5. COLLECTION PAGE SCHEMA (#67, #77)
// ================================================================

interface CollectionSchemaOptions {
  name: string;
  description?: string;
  url: string;
  baseUrl: string;
  breadcrumbs: BreadcrumbItem[];
}

export function generateCollectionStructuredData(
  options: CollectionSchemaOptions
): Record<string, any> {
  const { name, description, url, baseUrl, breadcrumbs } = options;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}/#webpage`,
        url: url,
        name: name,
        description: description || `Shop for ${name} online.`,
        breadcrumb: { "@id": `${url}/#breadcrumb` },
        inLanguage: "en-US",
        publisher: {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}/#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${baseUrl}${crumb.href.startsWith("/") ? crumb.href : "/" + crumb.href}`,
        })),
      },
    ],
  };
}