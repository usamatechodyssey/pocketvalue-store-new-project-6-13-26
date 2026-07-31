
// /src/models/UserSession.ts

import { Schema, model, models, Document } from "mongoose";

export interface IUserSession extends Omit<Document, "_id"> {
  _id: string; 
  visitorId: string;   
  sessionId: string;   
  userId?: string;     
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  device: "mobile" | "desktop" | "tablet";
  os: string;
  browser: string;
  city?: string;
  country?: string;
  isActive: boolean; // ✅ ADDED: Type-safe interface field
  lastPulse: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    visitorId: { 
      type: String, 
      required: true, 
      index: true 
    }, 
    sessionId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    userId: { 
      type: String, 
      ref: "User", 
      index: true 
    },
    utmSource: { 
      type: String, 
      default: "Direct",
      index: true 
    },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    device: { 
      type: String, 
      enum: ["mobile", "desktop", "tablet"], 
      default: "desktop" 
    },
    os: { type: String, required: true },
    browser: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    // ✅ ADDED: Database field schema registration to prevent silent drops
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    lastPulse: { 
      type: Date, 
      default: Date.now,
      index: true
    },
  },
  { 
    timestamps: true 
  }
);

UserSessionSchema.index({ userId: 1, lastPulse: -1 });
UserSessionSchema.index({ visitorId: 1, lastPulse: -1 });
UserSessionSchema.index({ utmSource: 1, createdAt: -1 });

export default models.UserSession || model<IUserSession>("UserSession", UserSessionSchema);