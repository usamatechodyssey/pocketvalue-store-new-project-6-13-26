// // /src/models/Order.ts/OrderSequence.ts/ReturnRequest.ts/Setting.ts/User.ts

// import { Schema, model, models, Document, Types } from 'mongoose';
// import { CleanCartItem } from '@/sanity/types/product_types';

// // Interface defining the structure of the shipping address sub-document
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

// // Main Order interface for type safety, extending Mongoose's Document
// export interface IOrder extends Document {
//   _id: string; // Will be our custom human-readable ID
//   orderId: string; // The same human-readable ID, indexed for fast lookups
//   userId: string;
//   products: (CleanCartItem & { productId: string })[];
//   shippingAddress: IShippingAddress;
//   subtotal: number;
//   shippingCost: number;
//   coupon?: {
//     code: string;
//     amount: number;
//   };
//   totalPrice: number;
//   status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'On Hold';
//   paymentMethod: string;
//   paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
//   transactionId?: string;
//   trafficSource?: {
//     source?: string;
//     medium?: string;
//     campaign?: string;
//   };
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Schema for the nested shippingAddress object
// const ShippingAddressSchema = new Schema<IShippingAddress>({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   province: { type: String, required: true },
//   city: { type: String, required: true },
//   area: { type: String, required: true },
//   address: { type: String, required: true },
//   lat: { type: Number, default: null },
//   lng: { type: Number, default: null },
// }, { _id: false });

// // Main Order Schema
// const OrderSchema = new Schema<IOrder>({
//   _id: {
//     type: String,
//     required: true,
//   },
//   orderId: {
//     type: String,
//     required: true,
//     unique: true,
//     index: true, // Indexed for fast lookups in admin panel
//   },
//   userId: {
//     type: String, // Explicitly defined as String
//     ref: 'User', // Reference to the User model
//     required: true,
//     index: true,
//   },
//   products: [{
//     type: Schema.Types.Mixed, // Storing CleanCartItem which is a flexible object
//     required: true,
//   }],
//   shippingAddress: {
//     type: ShippingAddressSchema,
//     required: true,
//   },
//   subtotal: { type: Number, required: true },
//   shippingCost: { type: Number, required: true },
//   coupon: {
//     code: String,
//     amount: Number,
//   },
//   totalPrice: { type: Number, required: true },
//   status: {
//     type: String,
//     enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'On Hold'],
//     default: 'Pending',
//     required: true,
//   },
//   paymentMethod: { type: String, default: 'Pending', required: true },
//   paymentStatus: {
//     type: String,
//     enum: ['Paid', 'Unpaid', 'Refunded'],
//     default: 'Unpaid',
//     required: true,
//   },
//   transactionId: { type: String },
//   trafficSource: {
//     source: String,
//     medium: String,
//     campaign: String,
//   },
// }, {
//   timestamps: true, // Automatically manage createdAt and updatedAt
//   _id: false, // Disable default _id generation, as we are setting it manually
// });

// const Order = models.Order || model<IOrder>('Order', OrderSchema);

// export default Order;

// // --- SUMMARY OF CHANGES ---
// // - Created a new, dedicated Mongoose model file for `Order`, establishing a single source of truth for the data structure.
// // - Implemented the "Smart Adapter" pattern by defining `_id` as a `String`.
// // - Added the new `orderId` field, making it `required`, `unique`, and `indexed` for performance.
// // - Added strict `enum` validation for the `status` and `paymentStatus` fields to prevent invalid data.
// // - Enabled automatic `timestamps` to handle `createdAt` and `updatedAt`, which is a Mongoose best practice.
// // - Disabled Mongoose's default `_id` generation (`_id: false`) because we will be providing our own custom string ID.
// /src/models/Order.ts

import { Schema, model, models, Document, Types } from "mongoose";
import { CleanCartItem } from "@/sanity/types/product_types";

// Interface defining the structure of the shipping address sub-document
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

// Main Order interface for type safety, extending Mongoose's Document
export interface IOrder extends Document {
  _id: string; // Will be our custom human-readable ID
  orderId: string; // The same human-readable ID, indexed for fast lookups
  userId: string;
  products: (CleanCartItem & { productId: string })[];
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingCost: number;
  coupon?: {
    code: string;
    amount: number;
  };
  totalPrice: number;
  status:
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "On Hold";
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid" | "Refunded";
  transactionId?: string;
  trafficSource?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the nested shippingAddress object
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

// Main Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    _id: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Indexed for fast lookups in admin panel
    },
    userId: {
      type: String, // Explicitly defined as String
      ref: "User", // Reference to the User model
      required: true,
      index: true,
    },
    products: [
      {
        type: Schema.Types.Mixed, // Storing CleanCartItem which is a flexible object
        required: true,
      },
    ],
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    coupon: {
      code: String,
      amount: Number,
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "On Hold",
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
      source: String,
      medium: String,
      campaign: String,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    _id: false, // Disable default _id generation, as we are setting it manually
  },
);

// 🔥 PERFORMANCE FIX FOR ANALYTICS: Index on createdAt for fast date-range queries
OrderSchema.index({ createdAt: -1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;

// --- SUMMARY OF CHANGES ---
// - Created a new, dedicated Mongoose model file for `Order`, establishing a single source of truth for the data structure.
// - Implemented the "Smart Adapter" pattern by defining `_id` as a `String`.
// - Added the new `orderId` field, making it `required`, `unique`, and `indexed` for performance.
// - Added strict `enum` validation for the `status` and `paymentStatus` fields to prevent invalid data.
// - Enabled automatic `timestamps` to handle `createdAt` and `updatedAt`, which is a Mongoose best practice.
// - Disabled Mongoose's default `_id` generation (`_id: false`) because we will be providing our own custom string ID.
// - [ADDED] Added a high-performance descending index on `createdAt` to optimize date-range aggregation inside Analytics Dashboard.
