// src/models/OperationalTrend.ts

import { Schema, model, models } from "mongoose";

// ================================================================
// ✅ ENTERPRISE FIX: Simple Interface (No extends Document)
// ================================================================
export interface IOperationalTrend {
  _id: string; // Date-based primary key (e.g., "2024-07-16")
  date: string;
  totalOrders: number;
  deliveredCount: number;
  cancelledCount: number;
  limboRevenue: number;
  pendingCount: number;
  fulfillmentRate: number;
  leakageRate: number;
  generatedAt: Date;
}

// ================================================================
// 🗂️ SCHEMA
// ================================================================
const OperationalTrendSchema = new Schema<IOperationalTrend>(
  {
    _id: { type: String, required: true },
    date: { type: String, required: true, index: true },
    totalOrders: { type: Number, default: 0 },
    deliveredCount: { type: Number, default: 0 },
    cancelledCount: { type: Number, default: 0 },
    limboRevenue: { type: Number, default: 0 },
    pendingCount: { type: Number, default: 0 },
    fulfillmentRate: { type: Number, default: 0 },
    leakageRate: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    _id: false,
  }
);

// =====================================================================
// ⚡ INDEXES
// =====================================================================
OperationalTrendSchema.index({ date: -1 });

// ================================================================
// 🚀 SINGLETON EXPORT
// ================================================================
export const OperationalTrend =
  models.OperationalTrend ||
  model<IOperationalTrend>("OperationalTrend", OperationalTrendSchema);