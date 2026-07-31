import { Schema, model, models, Document } from 'mongoose';

// Main Customer Request interface (Eliminates 'any')
export interface ICustomerRequest extends Omit<Document, '_id'> {
  productId?: string;
  requestedProductName?: string; // Universal Product Request
  requestType: 'restock' | 'missing_variant' | 'missing_product'; 
  email: string;
  phone?: string;
  selectedAttributes?: Record<string, string>; // Strictly typed key-value pairs
  customDetails?: string;
  urgencyLevel: 'normal' | 'urgent';
  status: 'pending' | 'notified' | 'ignored';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerRequestSchema = new Schema<ICustomerRequest>(
  {
    productId: { 
      type: String, 
      required: false, 
      index: true 
    },
    requestedProductName: { 
      type: String, 
      required: false 
    },
    requestType: { 
      type: String, 
      enum: ['restock', 'missing_variant', 'missing_product'], 
      required: true 
    },
    email: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true,
      index: true
    },
    phone: { 
      type: String, 
      required: false, 
      trim: true 
    },
    selectedAttributes: { 
      type: Schema.Types.Mixed, // Safely encapsulated key-value map
      required: false 
    },
    customDetails: { 
      type: String, 
      required: false 
    },
    urgencyLevel: { 
      type: String, 
      enum: ['normal', 'urgent'], 
      default: 'normal',
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'notified', 'ignored'], 
      default: 'pending',
      required: true,
      index: true
    }
  },
  { 
    timestamps: true 
  }
);

// =====================================================================
// ⚡ ANTI-SPAM COMPOSITE INDEXES & PARTIAL FILTER EXPRESSIONS
// =====================================================================

// 1. Prevents duplicate 'pending' restock requests per product/user (Saves DB space & blocks bot floods)
CustomerRequestSchema.index(
  { email: 1, productId: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      status: 'pending', 
      productId: { $exists: true } 
    } 
  }
);

// 2. High-speed lookup for admin panels grouping requests by type and urgency levels
CustomerRequestSchema.index({ requestType: 1, urgencyLevel: 1, status: 1 });


const CustomerRequest = models.CustomerRequest || model<ICustomerRequest>('CustomerRequest', CustomerRequestSchema);

export default CustomerRequest;