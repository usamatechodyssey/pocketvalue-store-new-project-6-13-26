
// src/app/components/admin/CategoryCsvTemplate.ts

// === CATEGORY CSV TEMPLATE HEADERS ===
// Yeh headers CSV file mein columns ke naam define karte hain.
// Har category ke liye 'name' aur 'slug' lazmi hain.
// 'parent_slug' optional hai aur isse parent-child relationship banti hai.
// 'image_url' bhi optional hai, jahan aap category icon/banner ki image URL de sakte hain.
export const CATEGORY_CSV_HEADERS = [
  "name",
  "slug",
  "parent_slug",
  "image_url",
].join(",");

// --- EXAMPLE 1: TOP-LEVEL CATEGORIES ---
// Jin categories ka koi parent nahi hota, unka 'parent_slug' column khali chora jata hai.
const CAT_TOP_LEVEL_1 = `"Electronics","electronics",,https://example.com/images/electronics-icon.png`;
const CAT_TOP_LEVEL_2 = `"Fashion","fashion",,`; // Image URL optional hai
const CAT_TOP_LEVEL_3 = `"Home & Decor","home-decor",,`;

// --- EXAMPLE 2: SUB-CATEGORIES ---
// 'parent_slug' column mein us parent category ka 'slug' likha jata hai jiski yeh sub-category hai.
const CAT_SUB_LEVEL_1 = `"Smartphones","smartphones","electronics",https://example.com/images/smartphones-banner.jpg`;
const CAT_SUB_LEVEL_2 = `"Laptops","laptops","electronics",`;
const CAT_SUB_LEVEL_3 = `"Men's Clothing","mens-clothing","fashion",`;
const CAT_SUB_LEVEL_4 = `"Women's Clothing","womens-clothing","fashion",`;
const CAT_SUB_LEVEL_5 = `"Kitchenware","kitchenware","home-decor",`;

// --- EXAMPLE 3: NESTED SUB-CATEGORIES (Grandchildren) ---
// Yahan 'parent_slug' mein 'mens-clothing' ka slug diya gaya hai.
const CAT_NESTED_1 = `"T-Shirts","t-shirts","mens-clothing",`;
const CAT_NESTED_2 = `"Jeans","jeans","mens-clothing",`;

// === FINAL CATEGORY CSV TEMPLATE STRING ===
// Yeh string download kiye jane wale CSV file ka mukammal content hai.
// Comments (`//`) ko filter kar diya jayega download se pehle.
export const CATEGORY_CSV_TEMPLATE = [
  CATEGORY_CSV_HEADERS,
  "",
  "// --- INSTRUCTIONS ---",
  "// 1. Har category ke liye 'name' aur 'slug' lazmi hain.",
  "// 2. 'slug' unique hona chahiye aur sirf lowercase letters, numbers, aur hyphens (-) par mushtamil ho.",
  "// 3. 'parent_slug' column mein parent category ka slug dalein, agar woh kisi aur category ki sub-category hai.",
  "// 4. 'image_url' optional hai, jahan aap category ka icon ya banner image ka direct URL de sakte hain.",
  "// 5. Parent categories ko pehle define karna zaroori nahi. System khud unhe link kar lega.",
  "",
  "// --- EXAMPLE: Top-Level Categories ---",
  CAT_TOP_LEVEL_1,
  CAT_TOP_LEVEL_2,
  CAT_TOP_LEVEL_3,
  "",
  "// --- EXAMPLE: Sub-Categories ---",
  CAT_SUB_LEVEL_1,
  CAT_SUB_LEVEL_2,
  CAT_SUB_LEVEL_3,
  CAT_SUB_LEVEL_4,
  CAT_SUB_LEVEL_5,
  "",
  "// --- EXAMPLE: Nested Sub-Categories ---",
  CAT_NESTED_1,
  CAT_NESTED_2,
].join("\n");