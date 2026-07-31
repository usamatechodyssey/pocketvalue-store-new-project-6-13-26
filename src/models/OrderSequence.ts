//app/models/OrderSequence.ts
import { Schema, model, models, Document } from 'mongoose';

// ✅ FIXED COMPILER TYPING: Omit default ObjectId '_id' to allow custom string identifier
export interface IOrderSequence extends Omit<Document, '_id'> {
  _id: string; // The constant unique key (e.g., "order_id_counter")
  sequence_value: number; // Holds the last allocated incremental index offset
}

const OrderSequenceSchema = new Schema<IOrderSequence>({
  _id: { 
    type: String, 
    required: true 
  },
  sequence_value: { 
    type: Number, 
    default: 1000, // Starts counter allocation from 1001
    required: true
  },
}, {
  timestamps: true, // Auto updatedAt/createdAt to track last counter increments times
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Using models.OrderSequence to prevent model re-registration crashes on Next.js HMR hot-reloads
const OrderSequence = models.OrderSequence || model<IOrderSequence>('OrderSequence', OrderSequenceSchema);

export default OrderSequence;