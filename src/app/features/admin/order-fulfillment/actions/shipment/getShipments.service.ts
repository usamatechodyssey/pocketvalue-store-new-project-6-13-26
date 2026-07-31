// src/features/admin/order-fulfillment/actions/shipment/getShipments.service.ts
"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order from "@/models/Order";
import { verifyStaff } from "@/lib/payloadAuth";
import { getCourierDisplayName, type CourierKey } from "@/lib/adapters/courier/CourierFactory";
import type { GetShipmentsResult } from "./types";

// ================================================================
// 🚀 SERVICE: GET SHIPMENTS FOR ORDER
// ================================================================

/**
 * Get all shipments for a specific order with enhanced courier display names.
 * 
 * Enterprise Features:
 * - RBAC protected (admin, manager, logistics, editor can view)
 * - Lean query for performance
 * - Enhanced courier display names for UI
 * - Graceful error handling
 * 
 * @param orderId - The order ID to fetch shipments for
 * @returns GetShipmentsResult with success status and shipments array
 */
export async function getOrderShipments(
  orderId: string
): Promise<GetShipmentsResult> {
  try {
    // 🛡️ 1. RBAC Check
    await verifyStaff(["admin", "manager", "logistics", "editor"]);

    // 🛡️ 2. Fetch Order
    await connectMongoose();

    const order = await Order.findById(orderId).lean<{
      shipments?: any[];
      _id: string;
      orderId: string;
      status: string;
    }>();

    if (!order) {
      return {
        success: false,
        shipments: [],
        message: "Order not found.",
      };
    }

    // 🛡️ 3. Enhance Shipments with Courier Display Names
    const shipments = order.shipments || [];
    const enhancedShipments = shipments.map((s: any) => ({
      ...s,
      courierDisplayName: getCourierDisplayName(s.courier as CourierKey),
    }));

    return {
      success: true,
      shipments: enhancedShipments,
    };
  } catch (error: any) {
    console.error("Get Shipments Error:", error);
    return {
      success: false,
      shipments: [],
      message: error.message || "Failed to fetch shipments.",
    };
  }
}