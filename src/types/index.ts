import { Mongoose } from "mongoose";

/**
 * @description Cached connection object structure used to maintain 
 * database connection state across hot reloads in development environments.
 */
export interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * @description Represents a single shipping rule 
 * This is used to calculate shipping costs across the application.
 */
export interface ShippingRule {
  _id: string;      
  name: string;     
  minAmount: number; 
  cost: number;     
  isOnCall?: boolean;
}

// ✅ Single source of truth for telemetry events
export const SECURE_TELEMETRY_EVENTS = [
  'page_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'search', 'lock_session',
  'wishlist_add', 'wishlist_remove', 'purchase', 'checkout_step_view', 'checkout_error',
  'shipping_method_selected', 'payment_method_selected', 'coupon_applied', 'coupon_removed',
  'form_field_interaction', 'auth_session_expired', 'gateway_redirect_initiated', 'coupon_auto_applied',
  'auth_attempt', 'login_prompt_triggered', 'identity_merge', 'cart_rehydrated', 'cart_merged',
  'profile_fields_updated', 'back_in_stock_subscription', 'filter_applied', 'pdp_interaction',
  'search_result_click', 'product_impression', 'product_click', 'variant_price_compared',
  'pdp_media_interaction', 'exit_intent_triggered', 'js_exception', 'performance_metric',
  'rage_click_detected', 'cart_desync_error', 'banner_click', 'oos_attempt', 'session_start',
  'crm_sync', 'support_engagement_click', 'policy_page_view', 'shipping_threshold_proximity',
  'scarcity_exposure', 'experiment_variant_exposed', 'rto_risk_flagged', 'return_portal_drop',
  'product_shared', 'logistics_delay', 'cookie_consent_toggled', 'pwa_prompt_metric',
  'recovered_cart_conversions', 's2s_purchase','visual_search_toggle',
  'banner_impression','campaign_sent',
  'payment_success', 'payment_failed', 'gateway_redirect_completed', 'webhook_received', 'webhook_processing_error'
] as const;

export type SecureTelemetryEvent = typeof SECURE_TELEMETRY_EVENTS[number];

export interface SecureTrackingIds {
  sessionId?: string;
  visitorId?: string;
}

export interface LiveProductVariant {
  _key: string;
  id?: string;
  price: number;
  salePrice?: number;
}

export interface LiveProduct {
  _id: string;
  variants?: LiveProductVariant[];
}

export interface SanityImageObject {
  url: string;
  _type: 'image';
  asset: { 
    _ref: string; 
    _type: 'reference'; 
  };
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export interface VariantAttribute {
  _key: string;
  name: string;
  value: string;
}

export interface Dimension {
  height?: number;
  width?: number;
  depth?: number;
}

export interface ProductVariant {
  _key: string;
  name: string;
  sku?: string;
  price: number;
  salePrice?: number;
  inStock: boolean;
  stock?: number; 
  images?: SanityImageObject[];
  attributes: VariantAttribute[];
  weight?: number;
  dimensions?: Dimension;
}

export interface ProductReview {
  isVerifiedPurchase: boolean;
  _id: string;
  rating: number;
  comment: string;
  _createdAt: string;
  user: {
    name: string;
    image?: string; 
  };
  reviewImage?: SanityImageObject;
}

export interface Specification {
  _key: string;
  label: string;
  value: string;
}

export interface SanityBrand {
  _id: string;
  name: string;
  slug: string;
  logo: SanityImageObject;
}

// ✅ FIX 2: Proper SEO interface for categories
export interface CategorySEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImageObject | string;
}

// ✅ FIX 2: Updated SanityCategory with proper seo type
export interface SanityCategory {
  seo?: CategorySEO;
  parent: string | SanityCategory | null;
  _id: string;
  name: string;
  slug: string;
  image?: string; 
  subCategories?: SanityCategory[];
  products?: SanityProduct[]; 
  desktopBanner?: SanityImageObject; 
  mobileBanner?: SanityImageObject;  
  description?: string;
}

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

// ====================================================================
// 🛒 STANDARDIZED CART & WISHLIST MODELS
// ====================================================================

export interface CleanCartItem {
  _id: string;
  cartItemId: string;
  name: string; 
  price: number;
  image: SanityImageObject;
  slug: string;
  quantity: number;
  sku?: string; 
  categoryIds?: string[]; 
  variant?: {
    _key: string;
    name: string;
  };
}

export interface CleanWishlistItem {
  _id: string;
  name: string;
  price: number;
  image: SanityImageObject | string;
  slug: string;
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
  markDefs: Record<string, unknown>[];
  style: 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote';
}

export interface FaqItem {
  _key: string;
  question: string;
  answer: PortableTextBlock[] | null; // ✅ FIX 3: Proper type, no @ts-ignore
}

// ✅ FIX 1: Added seo field to SanityProduct
export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImageObject | string;
}

// === SUPERCHARGED ROOT PRODUCT SCHEMA ===
export default interface SanityProduct {
  _id: string;
  _createdAt: string;
  title: string;
  slug: string;
  videoUrl?: string; 
  variants: ProductVariant[];
  defaultVariant: ProductVariant; 
  description?: PortableTextBlock[] | null; // ✅ FIX 3: No @ts-ignore, proper type
  brand?: SanityBrand;
  categories?: SanityCategory[];
  categoryIds?: string[];
  specifications?: Specification[];
  shippingAndReturns?: PortableTextBlock[] | null; // ✅ FIX 3: No @ts-ignore, proper type
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isOnDeal?: boolean;
  rating?: number;
  reviews?: ProductReview[];
  reviewCount?: number;
  seo?: ProductSEO; // ✅ FIX 1: Added seo field
}