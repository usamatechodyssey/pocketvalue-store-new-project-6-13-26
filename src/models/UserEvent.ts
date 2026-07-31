// src/models/UserEvent.ts

import { Schema, model, models, Document } from 'mongoose';
import { SECURE_TELEMETRY_EVENTS, SecureTelemetryEvent } from '@/types'; // ✅ Centralized import

export interface IUserEvent extends Document {
  sessionId: string;
  eventType: SecureTelemetryEvent;
  path: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const UserEventSchema = new Schema<IUserEvent>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: SECURE_TELEMETRY_EVENTS,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================================
// 🚀 ENTERPRISE INDEXES — Rocket Speed for Behavioral Intelligence
// =====================================================================

// 1. For filtering by date range (used in getBehavioralIntelligence.ts)
UserEventSchema.index({ createdAt: -1 });

// 2. For grouping by event type with date filter
UserEventSchema.index({ eventType: 1, createdAt: -1 });

// 3. For session-based event retrieval
UserEventSchema.index({ sessionId: 1, eventType: 1 });

// =====================================================================

const UserEvent = models.UserEvent || model<IUserEvent>('UserEvent', UserEventSchema);

export default UserEvent;