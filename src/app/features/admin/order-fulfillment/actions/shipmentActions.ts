// src/features/admin/order-fulfillment/actions/shipmentActions.ts


export { createShipment } from "./shipment/createShipment.service";
export { updateShipmentStatus } from "./shipment/updateShipmentStatus.service";
export { bulkCreateShipments } from "./shipment/bulkShipment.service";
export { getOrderShipments } from "./shipment/getShipments.service";
export { getAvailableCouriers } from "./shipment/getCouriers.service";
export { trackShipment } from "./shipment/trackShipment.service";

// ================================================================
// 📦 Types (Optional — Client-Side Safe)
// ================================================================
export type {
  CreateShipmentInput,
  UpdateShipmentStatusInput,
  BulkShipmentResult,
  GetShipmentsResult,
  GetCouriersResult,
  TrackShipmentResult,
} from "./shipment/types";