// src/models/SystemStats.ts

import { Schema, model, models } from "mongoose";

export interface ISystemStats {
  _id: "inventory"; // ✅ Fixed string literal (not ObjectId)
  totalVariants: number;
  criticalStockCount: number;
  outOfStockCount: number;
  lastUpdated: Date;
}

const SystemStatsSchema = new Schema<ISystemStats>({
  _id: { type: String, default: "inventory" },
  totalVariants: { type: Number, default: 0 },
  criticalStockCount: { type: Number, default: 0 },
  outOfStockCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

// ✅ Singleton Pattern: Sirf ek document hamesha exist karega
export const SystemStats = models.SystemStats || model<ISystemStats>("SystemStats", SystemStatsSchema);