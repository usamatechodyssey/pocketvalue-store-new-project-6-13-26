// import { Schema, model, models, Document } from "mongoose";
// import { CleanCartItem } from "@/types";

// // ================================================================
// // 📦 SHIPMENT ITEM
// // ================================================================
// interface IShipmentItem {
//   productId: string;
//   variantKey: string;
//   quantity: number;
// }

// // ================================================================
// // 📦 SHIPMENT (Enhanced)
// // ================================================================
// export type ShipmentStatus = "Preparing" | "PickedUp" | "In Transit" | "Delivered" | "RTO" | "Cancelled";

// export interface IShipment {
//   id: string;
//   items: IShipmentItem[];
//   courier: "tcs" | "leopards" | "postex" | "trax" | "manual";
//   courierName: string;
//   trackingId: string;
//   awbNumber?: string;
//   courierStatus?: string;
//   labelUrl?: string;
//   status: ShipmentStatus;
//   createdAt: string;
//   updatedAt?: string;
//   weight?: number;
//   dimensions?: {
//     length?: number;
//     width?: number;
//     height?: number;
//   };
//   estimatedDelivery?: string;
//   deliveredAt?: string;
//   rtoReason?: string;
// }

// // ================================================================
// // 🔥 ORDER STATUS TYPES
// // ================================================================
// export type OrderStatus = 
//   | "Pending"
//   | "Payment Verified"
//   | "Processing"
//   | "Ready to Ship"
//   | "Shipped"
//   | "In Transit"
//   | "Delivered"
//   | "RTO"
//   | "Return Requested"
//   | "Return Approved"
//   | "Refund Initiated"
//   | "Auto-Restocked"
//   | "Completed"
//   | "Cancelled"
//   | "On Hold"
//   | "Fraud Hold"
//   | "Rejected";

// // ================================================================
// // 📄 IORDER INTERFACE
// // ================================================================
// interface IShippingAddress {
//   fullName: string;
//   email: string;
//   phone: string;
//   province: string;
//   city: string;
//   area: string;
//   address: string;
//   lat?: number | null;
//   lng?: number | null;
// }

// interface IOrderProduct extends Omit<CleanCartItem, "image"> {
//   productId: string;
//   cartItemId: string;
//   name: string;
//   price: number;
//   image: Record<string, unknown> | null;
//   slug: string;
//   quantity: number;
//   sku?: string;
//   categoryIds?: string[];
//   variant?: {
//     _key: string;
//     name: string;
//   };
//   costPrice?: number;
//   profit?: number;
//   fees?: number;
//   tax?: number;
//   capital?: number;
// }

// export interface IOrder extends Omit<Document, '_id'> {
//   _id: string;
//   orderId: string;
//   userId: string;
//   products: IOrderProduct[];
//   shippingAddress: IShippingAddress;
//   subtotal: number;
//   shippingCost: number;
//   coupon?: {
//     code: string;
//     amount: number;
//   };
//   totalPrice: number;
//   status: OrderStatus;
//   paymentMethod: string;
//   paymentStatus: "Paid" | "Unpaid" | "Refunded";
//   transactionId?: string;
//   trafficSource?: {
//     utmSource?: string;
//     utmMedium?: string;
//     utmCampaign?: string;
//   };
//   createdAt: Date;
//   updatedAt: Date;
//   shipments?: IShipment[];
//   warehouseDistance?: number;
// }

// // ================================================================
// // 🗂️ SCHEMAS
// // ================================================================

// const ShippingAddressSchema = new Schema<IShippingAddress>(
//   {
//     fullName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     province: { type: String, required: true },
//     city: { type: String, required: true },
//     area: { type: String, required: true },
//     address: { type: String, required: true },
//     lat: { type: Number, default: null },
//     lng: { type: Number, default: null },
//   },
//   { _id: false },
// );

// const OrderProductSchema = new Schema<IOrderProduct>(
//   {
//     productId: { type: String, required: true, index: true },
//     cartItemId: { type: String, required: true },
//     name: { type: String, required: true },
//     price: { type: Number, required: true },
//     image: { type: Schema.Types.Mixed, default: null },
//     slug: { type: String, required: true },
//     quantity: { type: Number, required: true },
//     sku: { type: String },
//     categoryIds: [{ type: String }],
//     variant: {
//       _key: { type: String },
//       name: { type: String }
//     },
//     costPrice: { type: Number, default: null },
//     profit: { type: Number, default: null },
//     fees: { type: Number, default: null },
//     tax: { type: Number, default: null },
//     capital: { type: Number, default: null }
//   },
//   { _id: false }
// );

// const ShipmentSchema = new Schema<IShipment>(
//   {
//     id: { type: String, required: true },
//     items: {
//       type: [
//         {
//           productId: { type: String, required: true },
//           variantKey: { type: String, required: true },
//           quantity: { type: Number, required: true },
//         },
//       ],
//       required: true,
//     },
//     courier: {
//       type: String,
//       required: true,
//       enum: ['tcs', 'leopards', 'postex', 'trax', 'manual'],
//       default: 'manual',
//     },
//     courierName: { type: String, required: true },
//     trackingId: { type: String, required: true },
//     awbNumber: { type: String },
//     courierStatus: { type: String },
//     labelUrl: { type: String },
//     status: {
//       type: String,
//       enum: ['Preparing', 'PickedUp', 'In Transit', 'Delivered', 'RTO', 'Cancelled'],
//       default: 'Preparing',
//     },
//     createdAt: { type: String, default: () => new Date().toISOString() },
//     updatedAt: { type: String },
//     weight: { type: Number },
//     dimensions: {
//       length: { type: Number },
//       width: { type: Number },
//       height: { type: Number },
//     },
//     estimatedDelivery: { type: String },
//     deliveredAt: { type: String },
//     rtoReason: { type: String },
//   },
//   { _id: false }
// );

// const OrderSchema = new Schema<IOrder>(
//   {
//     _id: { type: String, required: true },
//     orderId: { type: String, required: true, unique: true, index: true },
//     userId: { type: String, ref: "User", required: true, index: true },
//     products: { type: [OrderProductSchema], required: true },
//     shippingAddress: { type: ShippingAddressSchema, required: true },
//     subtotal: { type: Number, required: true },
//     shippingCost: { type: Number, required: true },
//     coupon: { code: String, amount: Number },
//     totalPrice: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: [
//         "Pending", "Payment Verified", "Processing", "Ready to Ship",
//         "Shipped", "In Transit", "Delivered", "RTO",
//         "Return Requested", "Return Approved", "Refund Initiated",
//         "Auto-Restocked", "Completed", "Cancelled", "On Hold",
//         "Fraud Hold", "Rejected"
//       ],
//       default: "Pending",
//       required: true,
//     },
//     paymentMethod: { type: String, default: "Pending", required: true },
//     paymentStatus: {
//       type: String,
//       enum: ["Paid", "Unpaid", "Refunded"],
//       default: "Unpaid",
//       required: true,
//     },
//     transactionId: { type: String },
//     trafficSource: {
//       utmSource: String,
//       utmMedium: String,
//       utmCampaign: String,
//     },
//     shipments: { type: [ShipmentSchema], default: [] },
//     // ✅ FIX: Removed `index: true` from field (schema.index() handles it below)
//     warehouseDistance: { type: Number, default: null },
//   },
//   {
//     timestamps: true,
//     _id: false,
//   },
// );

// // =====================================================================
// // ⚡ ENTERPRISE INDEXES
// // =====================================================================

// OrderSchema.index({ createdAt: -1 });
// OrderSchema.index({ userId: 1, createdAt: -1 });
// OrderSchema.index({ status: 1, paymentStatus: 1 });
// OrderSchema.index({ transactionId: 1 }, { sparse: true });
// OrderSchema.index({ "shipments.trackingId": 1 }, { sparse: true });
// OrderSchema.index({ "shipments.courier": 1 });
// OrderSchema.index({ createdAt: -1, status: 1 });

// // Warehouse Distance indexes
// OrderSchema.index({ warehouseDistance: 1 });
// OrderSchema.index({ warehouseDistance: 1, status: 1 });

// // Courier performance indexes
// OrderSchema.index({ "shippingAddress.city": 1, "shipments.courier": 1, "shipments.status": 1 });
// OrderSchema.index({ "shipments.courier": 1, "shipments.deliveredAt": 1 });

// const Order = models.Order || model<IOrder>("Order", OrderSchema);

// export default Order;

// // ================================================================
// // 🚀 CLIENT-SIDE TYPES
// // ================================================================
// export type ClientOrderProduct = {
//   _id: string;
//   cartItemId: string;
//   name: string;
//   price: number;
//   quantity: number;
//   slug: string;
//   image: any;
//   variant?: { _key: string; name: string; }
//   costPrice?: number;
//   profit?: number;
//   fees?: number;
//   tax?: number;
//   capital?: number;
// };

// export type ClientOrder = {
//   _id: string;
//   orderId: string;
//   userId: string;
//   totalPrice: number;
//   status: OrderStatus;
//   createdAt: string;
//   products: ClientOrderProduct[];
//   shippingAddress: any;
//   paymentMethod: string;
//   paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
//   subtotal: number;
//   shippingCost: number;
//   trafficSource?: {
//     source?: string | null;
//     medium?: string | null;
//     campaign?: string | null;
//   };
// };
// 📂 src/models/Order.ts (MASTER LOCKED & HARDENED FOR PRODUCTION)

import { Schema, model, models, Document } from "mongoose";
import { CleanCartItem } from "@/types";

// ================================================================
// 📦 SHIPMENT ITEM INTERFACE
// ================================================================
interface IShipmentItem {
  productId: string;
  variantKey: string;
  quantity: number;
}

// ================================================================
// 📦 SHIPMENT STATUS & INTERFACE
// ================================================================
export type ShipmentStatus = 
  | "Preparing" 
  | "PickedUp" 
  | "In Transit" 
  | "Delivered" 
  | "RTO" 
  | "Cancelled";

export interface IShipment {
  id: string;
  items: IShipmentItem[];
  courier: "tcs" | "leopards" | "postex" | "trax" | "manual";
  courierName: string;
  trackingId: string;
  awbNumber?: string;
  courierStatus?: string;
  labelUrl?: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  estimatedDelivery?: string;
  deliveredAt?: string;
  rtoReason?: string;
}

// ================================================================
// 🔥 ENTERPRISE STATE MACHINE: 17 STATUSES
// ================================================================
export type OrderStatus = 
  | "Pending"
  | "Payment Verified"
  | "Processing"
  | "Ready to Ship"
  | "Shipped"
  | "In Transit"
  | "Delivered"
  | "RTO"
  | "Return Requested"
  | "Return Approved"
  | "Refund Initiated"
  | "Auto-Restocked"
  | "Completed"
  | "Cancelled"
  | "On Hold"
  | "Fraud Hold"
  | "Rejected";

// ================================================================
// 📄 ADDRESS & PRODUCT SUB-INTERFACES
// ================================================================
interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

interface IOrderProduct extends Omit<CleanCartItem, "image"> {
  productId: string;
  cartItemId: string;
  name: string;
  price: number;
  image: Record<string, unknown> | null;
  slug: string;
  quantity: number;
  sku?: string;
  categoryIds?: string[];
  variant?: {
    _key: string;
    name: string;
  };
  // ✅ SNAPSHOT AMOUNTS (FREEZING PKR VALUES)
  costPrice?: number; // Unit Base Cost
  profit?: number;    // Total line profit
  fees?: number;      // Total line fees
  tax?: number;       // Total line tax
  capital?: number;   // Total line capital (COGS)
  
  // ✅ NEW: SNAPSHOT RATES (AUDIT TRAIL LOGIC)
  appliedGstRate?: number;     // Snapshotted GST %
  appliedDutiesRate?: number;  // Snapshotted Duties %
  appliedFeeRate?: number;     // Snapshotted Total Fixed Fee %
  appliedProfitRate?: number;  // Snapshotted Target Profit %
  appliedAdSpendRate?: number; // Snapshotted Ad Spend %
  appliedRtoRate?: number; // 👈 NEW: Snapshotted RTO Estimation %
}

// ================================================================
// 🏆 MAIN IORDER INTERFACE
// ================================================================
export interface IOrder extends Omit<Document, '_id'> {
  _id: string;
  orderId: string;
  userId: string;
  products: IOrderProduct[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  coupon?: {
    code: string;
    amount: number;
  };
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  transactionId?: string;
  trafficSource?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  shipments?: IShipment[];
  warehouseDistance?: number; // For Geospatial Intelligence
}

// ================================================================
// 🗂️ MONGOOSE SCHEMAS
// ================================================================

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false },
);

const OrderProductSchema = new Schema<IOrderProduct>(
  {
    productId: { type: String, required: true, index: true },
    cartItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: Schema.Types.Mixed, default: null },
    slug: { type: String, required: true },
    quantity: { type: Number, required: true },
    sku: { type: String },
    categoryIds: [{ type: String }],
    variant: {
      _key: { type: String },
      name: { type: String }
    },
    // Amount Snapshots
    costPrice: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    capital: { type: Number, default: 0 },
    // Rate Snapshots (The Auditor's Guard)
    appliedGstRate: { type: Number, default: 0 },
    appliedDutiesRate: { type: Number, default: 0 },
    appliedFeeRate: { type: Number, default: 0 },
    appliedProfitRate: { type: Number, default: 0 },
    appliedAdSpendRate: { type: Number, default: 0 },
    appliedRtoRate: { type: Number, default: 0 } // 👈 SNAPSHOT STAMP
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    id: { type: String, required: true },
    items: [{
      productId: String,
      variantKey: String,
      quantity: Number,
      _id: false
    }],
    courier: {
      type: String,
      required: true,
      enum: ['tcs', 'leopards', 'postex', 'trax', 'manual'],
      default: 'manual',
    },
    courierName: { type: String, required: true },
    trackingId: { type: String, required: true },
    awbNumber: { type: String },
    courierStatus: { type: String },
    labelUrl: { type: String },
    status: {
      type: String,
      enum: ['Preparing', 'PickedUp', 'In Transit', 'Delivered', 'RTO', 'Cancelled'],
      default: 'Preparing',
    },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String },
    weight: { type: Number },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    estimatedDelivery: { type: String },
    deliveredAt: { type: String },
    rtoReason: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    _id: { type: String, required: true },
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, ref: "User", required: true, index: true },
    products: { type: [OrderProductSchema], required: true },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    coupon: { code: String, amount: Number },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending", "Payment Verified", "Processing", "Ready to Ship",
        "Shipped", "In Transit", "Delivered", "RTO",
        "Return Requested", "Return Approved", "Refund Initiated",
        "Auto-Restocked", "Completed", "Cancelled", "On Hold",
        "Fraud Hold", "Rejected"
      ],
      default: "Pending",
      required: true,
    },
    paymentMethod: { type: String, default: "Pending", required: true },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Refunded"],
      default: "Unpaid",
      required: true,
    },
    transactionId: { type: String },
    trafficSource: {
      utmSource: String,
      utmMedium: String,
      utmCampaign: String,
    },
    shipments: { type: [ShipmentSchema], default: [] },
    warehouseDistance: { type: Number, default: null },
  },
  {
    timestamps: true,
    _id: false,
  },
);

// =====================================================================
// ⚡ ENTERPRISE INDEXES (ZERO-LATENCY PERFORMANCE)
// =====================================================================
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ "products.productId": 1 });
OrderSchema.index({ "trafficSource.utmCampaign": 1 }, { sparse: true });
OrderSchema.index({ warehouseDistance: 1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);
export default Order;

// ================================================================
// 🚀 DTO TYPES FOR CLIENT-SIDE
// ================================================================
export type ClientOrderProduct = IOrderProduct;
export type ClientOrder = {
  _id: string;
  orderId: string;
  userId: string;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  products: ClientOrderProduct[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  subtotal: number;
  shippingCost: number;
  trafficSource?: IOrder['trafficSource'];
  warehouseDistance?: number;
};