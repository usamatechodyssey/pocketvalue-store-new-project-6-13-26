// --- Reusable Interfaces ---
export interface SanityImageObject {
  url: any;
  _type: 'image';
  asset: { _ref: string; _type: 'reference'; };
}

// === NEW INTERFACE FOR BREADCRUMBS ===
export interface BreadcrumbItem {
  name: string;
  href: string;
}
export interface VariantAttribute {
  _key: string;
  name: string;
  value: string;
}
// === NAYI INTERFACE: SHIPPING DIMENSIONS KE LIYE ===
export interface Dimension {
  height?: number;
  width?: number;
  depth?: number;
}


// === SUPERCHARGED INTERFACE: YEH MUKAMMAL TOR PAR NAYI HAI ===
// Yeh ab har variant ki mukammal details rakhegi.
export interface ProductVariant {
  _key: string;
  name: string;
  sku?: string;
  
  // Pricing & Stock (ab variant level par)
  price: number;
  salePrice?: number;
  inStock: boolean;
   stock?: number;   // === YEH NAYI LINE MISSING THI ===

  // Media (ab variant level par)
  images?: SanityImageObject[];
  
  // Attributes & Physical Details
  attributes: VariantAttribute[];
  weight?: number;
  dimensions?: Dimension;
}
export interface ProductReview {
  _id: string;
  rating: number;
  comment: string;
  _createdAt: string;

  // NAYA: 'userName' ki jagah poora 'user' object
  user: {
    name: string;
    image?: string; // User ki profile picture ka URL (optional ho sakta hai)
  };
  
  // NAYA: Review ke saath di gayi image (optional)
  reviewImage?: SanityImageObject;
}

export interface Specification {
  _key: string;
  label: string;
  value: string;
}

// --- Main Document Interfaces ---

// === SUPERCHARGED INTERFACE (THE FINAL CORRECTED VERSION) ===
export default interface SanityProduct {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  // === YAHAN NAYA FIELD ADD HUA HAI ===
  videoUrl?: string; // Optional video URL
  // Variants array ab LAZMI hai
  variants: ProductVariant[];

  // === NAYA FIELD #1: YEH FIELD QUERIES.TS SE AA RAHA HAI ===
  // Yeh hamesha product ke pehle variant ko hold karega.
  defaultVariant: ProductVariant; 

  // Common details
  description?: any;
  brand?: SanityBrand;
  categories?: SanityCategory[];

  // === NAYA FIELD #2: YEH BHI QUERIES.TS SE AA RAHA HAI ===
  // Yeh sirf category IDs ka ek aasan array hai filtering ke liye.
  categoryIds?: string[];
  
  specifications?: Specification[];
  shippingAndReturns?: any;
  
  // Marketing & Reviews
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviews?: ProductReview[];
  reviewCount?: number;
}


export interface SanityBrand {
  _id: string;
  name: string;
  slug: string;
  logo: SanityImageObject;
}
export interface SanityCategory {
  parent: any;
  _id: string;
  name: string;
  slug: string;
  image?: string; 
  subCategories?: SanityCategory[];
  products?: SanityProduct[]; // products optional ho sakte hain
 // === FIELDS UPDATE HUAY HAIN ===
  desktopBanner?: SanityImageObject; // `banner` ke bajaye
  mobileBanner?: SanityImageObject;  // Naya field
  description?: string;
}

// Yeh nayi type hai jo hamari query return karegi
export interface CategoryPageData {
  currentCategory: SanityCategory;
  categoryTree: SanityCategory;
}
export interface HeroCarouselSlide {
    _id: string;
    title: string;
    subtitle?: string;
    buttonText: string;
    link: string;
    desktopImage: string;
    mobileImage: string;
}

export interface HomepageData {
  featuredProductsTitle?: string;
  featuredProducts: SanityProduct[];
  featuredCategoriesTitle?: string;
  featuredCategories: SanityCategory[];
  bestSellersTitle?: string;
  bestSellers: SanityProduct[];
  newArrivalsTitle?: string;
  newArrivals: SanityProduct[];
}



// Yeh cart item ab variant ki details bhi save karega
export interface CleanCartItem {
    _id: string; // Product ID
    cartItemId: string; // Unique ID for this cart item (e.g., productID-variantKey)
    name: string; // "T-Shirt (Red / L)"
    price: number;
    image: SanityImageObject;
    slug: string;
    quantity: number;
    // Variant ki details
       // === YEH NAYI LINE ADD HUI HAI ===
    categoryIds?: string[]; // Product ki categories ke IDs
    variant?: {
      _key: string;
      name: string;
    }
}

export interface CleanWishlistItem {
    _id: string;
    name: string;
    price: number;
    image: any;
    slug: string;
}

export interface Author {
  _type: 'author';
  name: string;
  slug: { current: string };
  image: SanityImageObject;
  bio?: any;
}

export interface PortableTextBlock {
  _key: string;
  _type: 'block';
  children: {
    _key: string;
    _type: 'span';
    marks: string[];
    text: string;
  }[];
  markDefs: any[]; // Links waghera ke liye
  style: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote';
}


// Ab `Post` interface mein `any` ke bajaye is nayi type ko use karein
export interface Post {
  _updatedAt: string | number | Date;
  _id: string;
  title: string;
  slug: string; // Isay simple string kar diya hai, kyunke hum query mein ".current" use kar rahe hain
  
  // getSinglePost ke liye
  author?: Author;
  body?: PortableTextBlock[];
  
  // getAllPosts ke liye (yeh optional honge)
  authorName?: string;
  authorImage?: SanityImageObject;
  
  mainImage: SanityImageObject;
  categories?: SanityCategory[]; // Optional banaya
  publishedAt: string;
  excerpt: string;
}

// ... (aapki saari purani interfaces wesi hi rahengi)

// === NAYI INTERFACES START HERE ===

// Interface for the Lifestyle Banner data
export interface LifestyleBanner {
  _id: string;
  title: string;
  subtitle?: string;
  link: string;
  buttonText?: string;
  mediaType: 'image' | 'video';
  
  // Image URLs
  desktopImage?: string;
  mobileImage?: string;  

  // --- HYBRID VIDEO FIELDS ---
  // Option 1: Direct Upload (Sanity se aane wale URLs)
  desktopVideoFile?: string;
  mobileVideoFile?: string;  
  
  // Option 2: External URL (Cloudinary URL)
  desktopVideoUrl?: string;
  mobileVideoUrl?: string;   
}


// Interface for a single informational page
export interface Page {
  _id: string;
  title: string;
  body: any; // PortableText `any` rakha hai, isko @portabletext/react handle karega
}

// Interface for a single FAQ item
export interface FaqItem {
  _key: string;
  question: string;
  answer: any; // PortableText
}

// Interface for the entire FAQ Page data
export interface FaqPage {
  _id: string;
  title: string;
  faqList: FaqItem[];
}// ... (aapki saari purani interfaces wesi hi rahengi)

// === NAYI INTERFACES START HERE ===

// Interface for the Lifestyle Banner data
// ... baaki saari interfaces ...

export interface LifestyleBanner {
  _id: string;
  title: string;
  subtitle?: string;
  link: string;
  buttonText?: string;
  mediaType: 'image' | 'video';
  desktopImage?: string; // Optional (string URL)
  mobileImage?: string;  // Optional (string URL)
  desktopVideo?: string; // Optional (string URL)
  mobileVideo?: string;  // Optional (string URL)
}

// Interface for a single informational page
export interface Page {
  _id: string;
  title: string;
  body: any; // PortableText `any` rakha hai, isko @portabletext/react handle karega
}

// Interface for a single FAQ item
export interface FaqItem {
  _key: string;
  question: string;
  answer: any; // PortableText
}

// Interface for the entire FAQ Page data
export interface FaqPage {
  _id: string;
  title: string;
  faqList: FaqItem[];
}


export interface FlashSaleData {
  title: string;
  endDate: string; // ISO date string
  products: SanityProduct[];
}

export interface Coupon {
  _id: string;
  _type: 'coupon';
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'freeShipping';
  discountValue?: number;
  maximumDiscount?: number;
  isActive: boolean;
  minimumPurchaseAmount?: number;
  startDate?: string;
  expiryDate?: string;
  totalUsageLimit?: number;
  usageLimitPerUser?: number;
  forNewCustomersOnly?: boolean;
  applicableProducts?: {_ref: string, _type: 'reference'}[];
  applicableCategories?: {_ref: string, _type: 'reference'}[];
  isStackable?: boolean;
}
