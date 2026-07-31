// src/models/Setting.ts

import mongoose, { Schema, Document } from 'mongoose';

// ================================================================
// 🏦 PAYMENT GATEWAY CREDENTIALS
// ================================================================

export interface IGatewayCredentials {
  [key: string]: string | undefined;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  storeId?: string;
  hashKey?: string;
  merchantId?: string;
  password?: string;
  integritySalt?: string;
}

export interface IGateway {
  key: string;
  name: string;
  enabled: boolean;
  credentials?: IGatewayCredentials;
}

// ================================================================
// 📦 COURIER CREDENTIALS & PROVIDER
// ================================================================

export interface ICourierCredentials {
  [key: string]: string | undefined;
  // TCS
  tcsApiKey?: string;
  tcsSecret?: string;
  tcsMerchantId?: string;
  // Leopards
  leopardsApiKey?: string;
  leopardsSecret?: string;
  // PostEx
  postExApiKey?: string;
  postExSecret?: string;
  postExMerchantId?: string;
  // Trax
  traxApiKey?: string;
  traxSecret?: string;
  // General
  apiUrl?: string;
  username?: string;
  password?: string;
}

export interface ICourierProvider {
  key: 'tcs' | 'leopards' | 'postex' | 'trax' | 'manual';
  name: string;
  enabled: boolean;
  isDefault: boolean; // ✅ REQUIRED — matches Zod schema
  credentials?: ICourierCredentials;
}

// ================================================================
// 🧩 MAIN SETTINGS DOCUMENT (UNION TYPE)
// ================================================================

export interface ISetting extends Omit<Document, '_id'> {
  _id: 'payment_gateways' | 'service_settings';
  gateways?: IGateway[];
  couriers?: ICourierProvider[];
}

// ================================================================
// 🗂️ SCHEMAS
// ================================================================

// ---------- PAYMENT SCHEMAS ----------
const GatewayCredentialsSchema = new Schema(
  {
    bankName: { type: String },
    accountTitle: { type: String },
    accountNumber: { type: String },
    iban: { type: String },
    storeId: { type: String },
    hashKey: { type: String },
    merchantId: { type: String },
    password: { type: String },
    integritySalt: { type: String },
  },
  { _id: false }
);

const GatewaySchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    credentials: { type: GatewayCredentialsSchema, default: {} },
  },
  { _id: false }
);

// ---------- COURIER SCHEMAS ----------
const CourierCredentialsSchema = new Schema(
  {
    tcsApiKey: { type: String },
    tcsSecret: { type: String },
    tcsMerchantId: { type: String },
    leopardsApiKey: { type: String },
    leopardsSecret: { type: String },
    postExApiKey: { type: String },
    postExSecret: { type: String },
    postExMerchantId: { type: String },
    traxApiKey: { type: String },
    traxSecret: { type: String },
    apiUrl: { type: String },
    username: { type: String },
    password: { type: String },
  },
  { _id: false }
);

const CourierProviderSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      enum: ['tcs', 'leopards', 'postex', 'trax', 'manual'],
    },
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false, required: true },
    credentials: { type: CourierCredentialsSchema, default: {} },
  },
  { _id: false }
);

// ---------- MAIN SETTINGS SCHEMA ----------
const SettingSchema = new Schema<ISetting>(
  {
    _id: {
      type: String,
      required: true,
      default: 'payment_gateways',
    },
    gateways: {
      type: [GatewaySchema],
      required: false,
      default: [],
    },
    couriers: {
      type: [CourierProviderSchema],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'settings',
  }
);

// ---------- INDEXES ----------
SettingSchema.index({ _id: 1 });

// ================================================================
// 🚀 MODEL EXPORT
// ================================================================

export default mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema, 'settings');