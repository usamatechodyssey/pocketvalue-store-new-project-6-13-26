// import { NextResponse } from "next/server";
// import { getPayload } from "payload";
// import configPromise from "@payload-config";

// // 🔥 Next.js ko order do ke isay build time par render NA KAREIN (Only Runtime)
// export const dynamic = "force-dynamic";
// export const revalidate = 0;

// export async function GET() {
//   const baseUrl =
//     process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

//   try {
//     const payload = await getPayload({ config: configPromise });

//     // 1. Fetch Products from MongoDB (Payload)
//     const { docs: products } = await payload.find({
//       collection: "products",
//       limit: 1000,
//       depth: 1,
//     });

//     // 2. XML Boilerplate
//     let xml = `<?xml version="1.0" encoding="UTF-8"?>
//     <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
//       <channel>
//         <title>PocketValue - Official Product Feed</title>
//         <link>${baseUrl}</link>
//         <description>Premium quality products at best prices in Pakistan.</description>`;

//     // 3. Mapping Products to Google Format
//     products.forEach((p: any) => {
//       const variant = p.variants?.[0];
//       const price = variant?.salePrice || variant?.price || 0;
//       const image = variant?.images?.[0]?.url || "";
//       const brand = p.brand?.name || "PocketValue";
//       const availability =
//         variant?.stock > 0 && variant?.inStock ? "in stock" : "out of stock";

//       xml += `
//         <item>
//           <g:id>${p.id}</g:id>
//           <g:title>${escapeXml(p.title)}</g:title>
//           <g:description>${escapeXml(p.title)} available on PocketValue.</g:description>
//           <g:link>${baseUrl}/product/${p.slug}</g:link>
//           <g:image_link>${image}</g:image_link>
//           <g:condition>new</g:condition>
//           <g:availability>${availability}</g:availability>
//           <g:price>${price} PKR</g:price>
//           <g:brand>${escapeXml(brand)}</g:brand>
//           <g:google_product_category>Apparel &amp; Accessories</g:google_product_category>
//         </item>`;
//     });

//     xml += `</channel></rss>`;

//     return new NextResponse(xml, {
//       headers: {
//         "Content-Type": "application/xml",
//         "Cache-Control": "s-maxage=3600, stale-while-revalidate",
//       },
//     });
//   } catch (error) {
//     console.error("Google Shopping Feed error:", error);
//     return new NextResponse(
//       `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>PocketValue</title><description>Feed temporarily unavailable during build.</description></channel></rss>`,
//       { headers: { "Content-Type": "application/xml" } },
//     );
//   }
// }

// // XML characters safety helper
// function escapeXml(unsafe: string) {
//   return unsafe.replace(/[<>&"']/g, (c) => {
//     switch (c) {
//       case "<":
//         return "&lt;";
//       case ">":
//         return "&gt;";
//       case "&":
//         return "&amp;";
//       case '"':
//         return "&quot;";
//       case "'":
//         return "&apos;";
//       default:
//         return c;
//     }
//   });
// }
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { getPayloadReviewsForProduct } from "@/sanity/lib/payload/review.queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPayload({ config: configPromise });
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  const { docs: products } = await payload.find({
    collection: "products",
    limit: 1000,
    depth: 2,
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
      <title>PocketValue Official Feed</title>
      <link>${baseUrl}</link>
      <description>Premium E-commerce Feed with Dynamic Inventory & Ratings</description>`;

  // Products Loop
  for (const p of products as any) {
    // Note: Reviews fetch ho rahe hain taake system warmed-up rahe,
    // lekin XML mein inka koi direct field nahi hota.
    await getPayloadReviewsForProduct(p.id);

    p.variants?.forEach((variant: any, index: number) => {
      // ✅ FIX: 'price' variable ko yahan define aur neeche use kiya gaya hai
      const price = variant.price || 0;
      const salePrice = variant.salePrice;
      const image = variant.images?.[0]?.url || "";
      const color = variant.attributes?.find((a: any) =>
        ["color", "colour"].includes(a.name.toLowerCase()),
      )?.value;
      const size = variant.attributes?.find((a: any) =>
        ["size"].includes(a.name.toLowerCase()),
      )?.value;

      xml += `
      <item>
        <g:id>${variant.sku || `${p.id}-${index}`}</g:id>
        <g:item_group_id>${p.id}</g:item_group_id> 
        <g:title>${escapeXml(p.title)} ${size ? `- ${size}` : ""}</g:title>
        <g:description>${escapeXml(p.description?.root?.children?.[0]?.children?.[0]?.text || p.title)}</g:description>
        <g:link>${baseUrl}/product/${p.slug}</g:link>
        <g:image_link>${image}</g:image_link>
        <g:condition>new</g:condition>
        <g:availability>${variant.stock > 0 && variant.inStock ? "in stock" : "out of stock"}</g:availability>
        <g:price>${price} PKR</g:price>
        ${salePrice ? `<g:sale_price>${salePrice} PKR</g:sale_price>` : ""}
        <g:brand>${escapeXml(p.brand?.name || "PocketValue")}</g:brand>
        <g:google_product_category>${escapeXml(p.categories?.[0]?.name || "Apparel")}</g:google_product_category>
        
        <g:shipping>
          <g:country>PK</g:country>
          <g:service>Standard</g:service>
          <g:price>350 PKR</g:price>
        </g:shipping>

        ${color ? `<g:color>${escapeXml(color)}</g:color>` : ""}
        ${size ? `<g:size>${escapeXml(size)}</g:size>` : ""}
        <g:identifier_exists>${variant.sku ? "yes" : "no"}</g:identifier_exists>
        <g:ads_redirect>${baseUrl}/product/${p.slug}</g:ads_redirect>
      </item>`;
    });
  }

  xml += `</channel></rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}

function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&"']/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      default:
        return c;
    }
  });
}
