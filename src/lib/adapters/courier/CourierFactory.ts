// // src/lib/adapters/courier/CourierFactory.ts
// "use server";

// import { getSafePayload } from "@/app/shared/lib/payloadInstance";
// import { ICourierProvider } from "@/models/Setting";

// // ================================================================
// // 🏭 COURIER FACTORY — Router & Configuration Manager
// // ================================================================

// // Type for all supported courier keys
// export type CourierKey = "tcs" | "leopards" | "postex" | "trax" | "manual";

// // Courier display names mapping
// export const COURIER_DISPLAY_NAMES: Record<CourierKey, string> = {
//   tcs: "TCS",
//   leopards: "Leopards",
//   postex: "PostEx",
//   trax: "Trax",
//   manual: "Manual Entry",
// };

// // Courier API status mapping (raw courier status -> system shipment status)
// export const COURIER_STATUS_MAP: Record<string, string> = {
//   // TCS / Leopards / Trax common statuses
//   "booked": "Preparing",
//   "picked_up": "PickedUp",
//   "in_transit": "In Transit",
//   "out_for_delivery": "In Transit",
//   "delivered": "Delivered",
//   "returned": "RTO",
//   "cancelled": "Cancelled",
//   // PostEx specific
//   "processing": "Preparing",
//   "shipped": "In Transit",
//   "completed": "Delivered",
//   "failed": "RTO",
//   // Manual
//   "manual": "Preparing",
// };

// // ================================================================
// // 📦 SETTINGS CACHE (Reduces Payload hits)
// // ================================================================

// let cachedCourierSettings: ICourierProvider[] | null = null;
// let cacheTimestamp: number = 0;
// const CACHE_TTL_MS = 60 * 1000; // 1 minute

// /**
//  * Fetch courier settings from Payload (cached)
//  */
// async function getCourierSettings(): Promise<ICourierProvider[]> {
//   const now = Date.now();
//   if (cachedCourierSettings && (now - cacheTimestamp) < CACHE_TTL_MS) {
//     return cachedCourierSettings;
//   }

//   const payload = await getSafePayload();
  
//   const settings = await payload.findGlobal({
//     slug: "settings",
//   });

//   const couriers = settings?.couriers || [];

//   // Ensure manual is always present
//   const hasManual = couriers.some((c: any) => c.key === 'manual');
//   if (!hasManual) {
//     couriers.push({
//       key: 'manual',
//       name: 'Manual Entry',
//       enabled: true,
//       isDefault: false,
//       credentials: {},
//     });
//   }

//   cachedCourierSettings = couriers;
//   cacheTimestamp = now;
  
//   return couriers;
// }

// /**
//  * Invalidate courier settings cache (call after admin updates settings)
//  */
// export function invalidateCourierCache() {
//   cachedCourierSettings = null;
//   cacheTimestamp = 0;
// }

// // ================================================================
// // 🚀 PUBLIC API (EXPORTED FUNCTIONS)
// // ================================================================

// /**
//  * Get all active couriers (enabled = true)
//  */
// export async function getActiveCouriers(): Promise<ICourierProvider[]> {
//   const all = await getCourierSettings();
//   return all.filter((c) => c.enabled === true);
// }

// /**
//  * Get the default courier (first enabled with isDefault = true, or first enabled)
//  */
// export async function getDefaultCourier(): Promise<ICourierProvider | null> {
//   const active = await getActiveCouriers();
//   if (active.length === 0) return null;
  
//   const defaultCourier = active.find((c) => c.isDefault === true);
//   return defaultCourier || active[0];
// }

// /**
//  * Get a specific courier provider by key
//  */
// export async function getCourierProvider(key: CourierKey): Promise<ICourierProvider | null> {
//   const all = await getCourierSettings();
//   return all.find((c) => c.key === key) || null;
// }

// /**
//  * Check if a courier is enabled
//  */
// export async function isCourierEnabled(key: CourierKey): Promise<boolean> {
//   const provider = await getCourierProvider(key);
//   return provider?.enabled === true;
// }

// /**
//  * Get credentials for a specific courier
//  */
// export async function getCourierCredentials(key: CourierKey): Promise<Record<string, string | undefined> | null> {
//   const provider = await getCourierProvider(key);
//   return provider?.credentials || null;
// }

// /**
//  * Map raw courier API status to our internal shipment status
//  */
// export function mapCourierStatus(rawStatus: string): string {
//   const normalized = rawStatus.toLowerCase().trim();
//   return COURIER_STATUS_MAP[normalized] || "Preparing";
// }

// /**
//  * Get display name for a courier key
//  */
// export function getCourierDisplayName(key: CourierKey): string {
//   return COURIER_DISPLAY_NAMES[key] || key;
// }

// /**
//  * Get all courier keys with display names (for UI dropdowns)
//  */
// export function getCourierOptions(): Array<{ value: CourierKey; label: string }> {
//   return Object.entries(COURIER_DISPLAY_NAMES).map(([value, label]) => ({
//     value: value as CourierKey,
//     label,
//   }));
// }
// src/lib/adapters/courier/CourierFactory.ts
// ✅ REMOVED: "use server" from top — synchronous functions are not server actions

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { ICourierProvider } from "@/models/Setting";

// ================================================================
// 🏭 COURIER FACTORY — Router & Configuration Manager
// ================================================================

export type CourierKey = "tcs" | "leopards" | "postex" | "trax" | "manual";

export const COURIER_DISPLAY_NAMES: Record<CourierKey, string> = {
  tcs: "TCS",
  leopards: "Leopards",
  postex: "PostEx",
  trax: "Trax",
  manual: "Manual Entry",
};

export const COURIER_STATUS_MAP: Record<string, string> = {
  "booked": "Preparing",
  "picked_up": "PickedUp",
  "in_transit": "In Transit",
  "out_for_delivery": "In Transit",
  "delivered": "Delivered",
  "returned": "RTO",
  "cancelled": "Cancelled",
  "processing": "Preparing",
  "shipped": "In Transit",
  "completed": "Delivered",
  "failed": "RTO",
  "manual": "Preparing",
};

// ================================================================
// 📦 SETTINGS CACHE
// ================================================================

let cachedCourierSettings: ICourierProvider[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 1000;

async function getCourierSettings(): Promise<ICourierProvider[]> {
  const now = Date.now();
  if (cachedCourierSettings && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedCourierSettings;
  }

  const payload = await getSafePayload();
  const settings = await payload.findGlobal({ slug: "settings" });
  const couriers = settings?.couriers || [];

  const hasManual = couriers.some((c: any) => c.key === 'manual');
  if (!hasManual) {
    couriers.push({
      key: 'manual',
      name: 'Manual Entry',
      enabled: true,
      isDefault: false,
      credentials: {},
    });
  }

  cachedCourierSettings = couriers;
  cacheTimestamp = now;
  return couriers;
}

// ✅ This is a synchronous function — it just clears cache, no server action needed
export function invalidateCourierCache() {
  cachedCourierSettings = null;
  cacheTimestamp = 0;
}

// ✅ These are synchronous helpers — no "use server" needed
export function mapCourierStatus(rawStatus: string): string {
  const normalized = rawStatus.toLowerCase().trim();
  return COURIER_STATUS_MAP[normalized] || "Preparing";
}

export function getCourierDisplayName(key: CourierKey): string {
  return COURIER_DISPLAY_NAMES[key] || key;
}

export function getCourierOptions(): Array<{ value: CourierKey; label: string }> {
  return Object.entries(COURIER_DISPLAY_NAMES).map(([value, label]) => ({
    value: value as CourierKey,
    label,
  }));
}

// ✅ These are async functions that call Payload — they need to be async
export async function getActiveCouriers(): Promise<ICourierProvider[]> {
  const all = await getCourierSettings();
  return all.filter((c) => c.enabled === true);
}

export async function getDefaultCourier(): Promise<ICourierProvider | null> {
  const active = await getActiveCouriers();
  if (active.length === 0) return null;
  const defaultCourier = active.find((c) => c.isDefault === true);
  return defaultCourier || active[0];
}

export async function getCourierProvider(key: CourierKey): Promise<ICourierProvider | null> {
  const all = await getCourierSettings();
  return all.find((c) => c.key === key) || null;
}

export async function isCourierEnabled(key: CourierKey): Promise<boolean> {
  const provider = await getCourierProvider(key);
  return provider?.enabled === true;
}

export async function getCourierCredentials(key: CourierKey): Promise<Record<string, string | undefined> | null> {
  const provider = await getCourierProvider(key);
  return provider?.credentials || null;
}