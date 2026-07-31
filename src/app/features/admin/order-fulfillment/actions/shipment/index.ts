// src/features/admin/order-fulfillment/actions/shipment/index.ts
// ================================================================
// 📦 BARREL EXPORTS — Central entry point for all shipment services
// ================================================================
// 
// This file re-exports the modular shipment services.
// All functions are already marked "use server" inside their respective files.
// No "use server" directive here — it would break re-exports of types.
// 
// Example:
//   import { createShipment } from "@/features/admin/order-fulfillment/actions/shipmentActions";
//   ✅ Works!
// ================================================================

// ================================================================
// 🚀 SERVICES (Public API)
// ================================================================

export { createShipment } from "./createShipment.service";
export { updateShipmentStatus } from "./updateShipmentStatus.service";
export { bulkCreateShipments } from "./bulkShipment.service";
export { getOrderShipments } from "./getShipments.service";
export { getAvailableCouriers } from "./getCouriers.service";
export { trackShipment } from "./trackShipment.service";

// ================================================================
// 📦 TYPES & SCHEMAS (For TypeScript consumers)
// ================================================================

export type {
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  BulkShipmentResult,
  GetShipmentsResult,
  GetCouriersResult,
  TrackShipmentResult,
  ProductVariantPayload,
} from "./types";

export {
  CreateShipmentSchema,
  UpdateShipmentStatusSchema,
} from "./types";

// ================================================================
// 🔧 HELPERS (Advanced usage)
// ================================================================

export {
  getCourierAdapter,
  deductVariantStock,
  restoreVariantStock,
  verifyOrderShippable,
  buildShipmentData,
  createShipmentRecord,
} from "./helpers";