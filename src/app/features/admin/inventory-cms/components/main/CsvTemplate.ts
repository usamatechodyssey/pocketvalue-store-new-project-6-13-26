// === THE FINAL, 100% FLEXIBLE & SCHEMA-ACCURATE CSV TEMPLATE ===

const CSV_TEMPLATE_HEADERS = [
  // Parent Product Columns (Columns A-M)
  "title", "slug", "videoUrl", "description", "brand", "categories", "specifications", "shippingAndReturns", "rating", "isBestSeller", "isNewArrival", "isFeatured", "isOnDeal",
  
  // Variant Columns (Columns N onwards)
  "variant_name", "variant_sku", "variant_price", "variant_salePrice", "variant_stock", "variant_inStock", "variant_images", "variant_weight", "variant_height", "variant_width", "variant_depth",
  "attribute1_name", "attribute1_value", "attribute2_name", "attribute2_value", "attribute3_name", "attribute3_value",
].join(",");

// --- CASE 1: STANDARD FORMAT (PARENT ROW + CHILD ROWS) ---
// Row 1: Main info only. Row 2: Variant info only. (Best for Multi-variant products)
const P1_PARENT = `"Mughal Art Coffee Mug","mughal-art-mug",,,"Home Decor","Home & Living","Material:Ceramic|Capacity:325ml",,4.9,FALSE,TRUE,FALSE,FALSE,,,,,,,,,,,,,,,,,,,`;
const P1_VARIANT = `,,,,,,,,,,,,,"Standard Mug","MUG-001",799,,50,TRUE,"https://example.com/mug1.jpg",0.2,10,8,8,,,,,,`;

// --- CASE 2: MERGED FORMAT (PARENT & VARIANT IN ONE ROW) ---
// Row 1: Main info AND Variant info together. (Best for Single-variant/Simple products)
const P2_MERGED = `"Premium Leather Wallet","leather-wallet-01",,"Pure buffalo leather wallet.","LeatherX","Fashion","Material:Leather|Color:Brown",,4.5,TRUE,FALSE,TRUE,FALSE,"Classic Brown","LW-01",1500,1200,30,TRUE,"https://example.com/wallet.jpg",0.1,10,12,2,,,,,,`;

// --- CASE 3: MIXED FORMAT (PARENT + 1st VARIANT ON ROW 1, OTHERS ON ROW 2,3...) ---
// Row 1: Main Info + Variant 1. Row 2: Variant 2 info.
const P3_ROW1 = `"Cotton Polo Shirt","polo-cotton-shirt",,"100% Pima Cotton.","Zindagi","Men,T-Shirts","Fabric:Cotton",,4.8,TRUE,TRUE,TRUE,TRUE,"Small / Blue","POLO-S-BL",2500,1999,100,TRUE,"https://img.com/p1.jpg",0.3,30,20,5,"Color","Blue","Size","S"`;
const P3_ROW2 = `,,,,,,,,,,,,,"Medium / Blue","POLO-M-BL",2500,1999,75,TRUE,"https://img.com/p2.jpg",0.3,30,20,5,"Color","Blue","Size","M"`;


export const CSV_TEMPLATE = [
  CSV_TEMPLATE_HEADERS,
  "",
  "// --- IMPORTANT INSTRUCTIONS (SYSTEM FLEXIBILITY) ---",
  "// 1. CASE 1 (Standard): Use Row 1 for product details and Row 2+ for variants. (Parent rows with empty variants are allowed).",
  "// 2. CASE 2 (Merged): You can put product details and the FIRST variant on the same line. System will handle it.",
  "// 3. CASE 3 (Mixed): Product details + 1st Variant on Row 1, and extra variants on subsequent rows (with parent columns empty).",
  "// 4. EMPTY ROWS: Any row that has no variant price, sku, or name will be automatically ignored by the system.",
  "// 5. DEFAULT NAME: If you leave 'variant_name' empty, the system will automatically name it 'Standard'.",
  "",
  "// --- EXAMPLE 1: STANDARD PARENT-CHILD ---",
  P1_PARENT,
  P1_VARIANT,
  "",
  "// --- EXAMPLE 2: MERGED (SIMPLE PRODUCT) ---",
  P2_MERGED,
  "",
  "// --- EXAMPLE 3: MIXED (MULTI-VARIANT) ---",
  P3_ROW1,
  P3_ROW2,
  "",
].join("\n");