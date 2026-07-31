//app/models/AbandonedCart
import { Schema, model, models, Document } from 'mongoose';
import { CleanCartItem } from '@/types';

// Strict Type-Safe interface for abandoned items (eliminates 'any' mapping)
interface IAbandonedCartItem extends Omit<CleanCartItem, "image"> {
  productId: string;
  cartItemId: string;
  name: string;
  price: number;
  image: Record<string, unknown> | null; // Typed object safely encapsulated
  slug: string;
  quantity: number;
  sku?: string;
  categoryIds?: string[];
  variant?: {
    _key: string;
    name: string;
  };
}

export interface IAbandonedCart extends Omit<Document, '_id'> {
  _id: string; // Explicit string ID binding
  sessionId: string;
  userId: string; // ✅ STRICT BOUNDARY: Authenticated userId is now strictly mandatory (required)
  items: IAbandonedCartItem[]; // ✅ FIXED: Strictly validated items array (Zero 'any')
  subtotal: number;
  contactCaptured: boolean; // Captured during checkout address phase
  email: string; // Mandated from authenticated User session
  phone?: string;
  isRecovered: boolean;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AbandonedCartItemSchema = new Schema<IAbandonedCartItem>({
  productId: { type: String, required: true },
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
  }
}, { _id: false });

const AbandonedCartSchema = new Schema<IAbandonedCart>({
  _id: { type: String, required: true }, // Custom string identifier mapping
  sessionId: { type: String, required: true, unique: true, index: true },
  userId: { 
    type: String, 
    ref: 'User', 
    required: true, // ✅ STRICT BOUNDARY: Enforced system-wide auth
    index: true 
  },
  items: { 
    type: [AbandonedCartItemSchema], 
    required: true 
  },
  subtotal: { type: Number, default: 0, required: true },
  contactCaptured: { type: Boolean, default: false, required: true },
  email: { 
    type: String, 
    required: true, // Auto populated from active authenticated session
    trim: true,
    lowercase: true
  },
  phone: { type: String },
  isRecovered: { type: Boolean, default: false, required: true },
  lastUpdated: { type: Date, default: Date.now, required: true },
}, { 
  timestamps: true 
});

// =====================================================================
// ⚡ CRON & QUERY SPEED OPTIMIZATION INDEXES
// =====================================================================

// 1. High-throughput scan for automated recovery email CRON jobs
AbandonedCartSchema.index({ isRecovered: 1, lastUpdated: -1 });

// 2. Fast retrieval of a user's active abandoned cart
AbandonedCartSchema.index({ userId: 1, isRecovered: 1 });


export default models.AbandonedCart || model<IAbandonedCart>('AbandonedCart', AbandonedCartSchema);