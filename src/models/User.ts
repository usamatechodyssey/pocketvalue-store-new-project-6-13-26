// // 📂 src/models/User.ts

import { Schema, model, models, Document, Types } from "mongoose";

// ====================================================================
// 🛡️ STRICT COMPILER TYPE DEFINITIONS
// ====================================================================

// Interface for the Address sub-document
export interface IAddress extends Omit<Document, '_id'> {
  _id: Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  area: string;
  address: string;
  isDefault: boolean;
  lat?: number | null;
  lng?: number | null;
}

// Main User interface
export interface IUser extends Omit<Document, '_id'> {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "customer" | "Store Manager" | "Super Admin" | "Content Editor";
  emailVerified?: Date | null;
  phone?: string;
  phoneVerified?: Date | null;
  addresses: IAddress[];
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Enterprise Referral Fields
  referralCode?: string;
  referredBy?: Types.ObjectId | null;
  referralClicks?: number;

  // REACTIVATION TRACKING FIELDS
  inactiveSince?: Date | null;          
  lastReactivationEmailSent?: Date | null; 
  reactivationEmailCount?: number;      
}

// ====================================================================
// 📋 SCHEMAS
// ====================================================================

// Address Sub-schema
const AddressSchema = new Schema<IAddress>({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
});

// Main User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      trim: true,
      lowercase: true
    },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["customer", "Store Manager", "Super Admin", "Content Editor"],
      default: "customer",
    },
    emailVerified: { type: Date, default: null },
    phone: { 
      type: String, 
      index: { sparse: true } 
    },
    phoneVerified: { type: Date, default: null },
    addresses: [AddressSchema],
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },

    // Enterprise Referral Fields (Natively unique and sparse)
    referralCode: { 
      type: String, 
      unique: true, 
      sparse: true,
      trim: true
    },
    referredBy: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      default: null,
    },
    referralClicks: { 
      type: Number, 
      default: 0 
    },

    // REACTIVATION TRACKING FIELDS
    inactiveSince: { 
      type: Date, 
      default: null, 
      index: true  
    },
    lastReactivationEmailSent: { 
      type: Date, 
      default: null 
    },
    reactivationEmailCount: { 
      type: Number, 
      default: 0 
    },
  },
  {
    timestamps: true,
  },
);

// =====================================================================
// ⚡ HIGH-PERFORMANCE ENTERPRISE INDEXES
// =====================================================================

// 1. User acquisition reports
UserSchema.index({ createdAt: -1 });

// 2. Exclude admins from customer growth stats
UserSchema.index({ role: 1, createdAt: -1 });

// 3. Password reset lookups
UserSchema.index({ passwordResetToken: 1 }, { sparse: true });

// 4. Verification code lookups
UserSchema.index({ verificationOtp: 1 }, { sparse: true });

// ✅ FIXED: Duplicate 'referralCode: 1' index removed from here as it is already defined inline in the schema properties

// 5. Referrer analytics queries
UserSchema.index({ referredBy: 1 }, { sparse: true });

// 6. Inactive customers queries (Phase 2.2)
UserSchema.index({ role: 1, inactiveSince: 1 });

// =====================================================================
// 🚀 MODEL REGISTRATION
// =====================================================================

const User = models.User || model<IUser>("User", UserSchema);

export default User;