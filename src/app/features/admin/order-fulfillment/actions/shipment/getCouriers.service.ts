// src/features/admin/order-fulfillment/actions/shipment/getCouriers.service.ts
"use server";

import { verifyStaff } from "@/lib/payloadAuth";
import {
  getActiveCouriers,
  getDefaultCourier,
} from "@/lib/adapters/courier/CourierFactory";
import type { GetCouriersResult } from "./types";

// ================================================================
// 🚀 SERVICE: GET AVAILABLE COURIERS
// ================================================================

/**
 * Get all active couriers with their default status.
 * 
 * Enterprise Features:
 * - RBAC protected (admin, manager, logistics can view)
 * - Real-time data from database settings
 * - Default courier identification
 * - Used for UI dropdowns and auto-selection
 * 
 * @returns GetCouriersResult with success status and couriers array
 */
export async function getAvailableCouriers(): Promise<GetCouriersResult> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics"]);

    // 🛡️ 2. Fetch Active Couriers & Default
    const activeCouriers = await getActiveCouriers();
    const defaultCourier = await getDefaultCourier();

    // 🛡️ 3. Format Response
    const couriers = activeCouriers.map((c) => ({
      key: c.key,
      name: c.name,
      isDefault: c.key === defaultCourier?.key,
    }));

    return {
      success: true,
      couriers,
    };
  } catch (error: any) {
    console.error("Get Available Couriers Error:", error);
    return {
      success: false,
      couriers: [],
      message: error.message || "Failed to fetch available couriers.",
    };
  }
}