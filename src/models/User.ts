// // /src/models/User.ts (VERIFIED & CLEANED)

// import { Schema, model, models, Document, Types } from 'mongoose';

// // Interface for the Address sub-document
// export interface IAddress extends Document {
//   _id: Types.ObjectId;
//   fullName: string;
//   phone: string;
//   province: string;
//   city: string;
//   area: string;
//   address: string;
//   isDefault: boolean;
//   lat?: number | null;
//   lng?: number | null;
// }

// // Main User interface, extending Mongoose's Document
// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password?: string;
//   image?: string;
//   role: 'customer' | 'Store Manager' | 'Super Admin' | 'Content Editor';
//   emailVerified?: Date | null;
//   phone?: string;
//   phoneVerified?: Date | null;
//   addresses: IAddress[];
//   // Fields for verification and password reset
//   verificationOtp?: string;
//   verificationOtpExpires?: Date;
//   passwordResetToken?: string;
//   passwordResetExpires?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // Schema for the Address sub-document
// const AddressSchema = new Schema<IAddress>({
//   fullName: { type: String, required: true, trim: true },
//   phone: { type: String, required: true },
//   province: { type: String, required: true },
//   city: { type: String, required: true },
//   area: { type: String, required: true, trim: true },
//   address: { type: String, required: true, trim: true },
//   isDefault: { type: Boolean, default: false },
//   lat: { type: Number, default: null },
//   lng: { type: Number, default: null },
// });

// // Main User Schema
// const UserSchema = new Schema<IUser>({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true, index: true },
//   password: { type: String },
//   image: { type: String },
//   role: {
//     type: String,
//     enum: ['customer', 'Store Manager', 'Super Admin', 'Content Editor'],
//     default: 'customer',
//   },
//   emailVerified: { type: Date, default: null },
//   phone: { type: String },
//   phoneVerified: { type: Date, default: null },
//   addresses: [AddressSchema],
//   verificationOtp: { type: String },
//   verificationOtpExpires: { type: Date },
//   passwordResetToken: { type: String }, // Field for password reset
//   passwordResetExpires: { type: Date },   // Field for password reset
// }, {
//   timestamps: true // Automatically manage createdAt and updatedAt
// });

// const User = models.User || model<IUser>('User', UserSchema);

// export default User;

// // --- SUMMARY OF CHANGES ---
// // - Added `passwordResetToken` and `passwordResetExpires` to the IUser interface and UserSchema. This was missing but is used in your `authActions.ts` file, ensuring complete type safety.
// // - No other logical changes were needed. The file is already well-structured for our new architecture.
// /src/models/User.ts (VERIFIED & CLEANED)

import { Schema, model, models, Document, Types } from "mongoose";

// Interface for the Address sub-document
export interface IAddress extends Document {
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

// Main User interface, extending Mongoose's Document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "customer" | "Store Manager" | "Super Admin" | "Content Editor";
  emailVerified?: Date | null;
  phone?: string;
  phoneVerified?: Date | null;
  addresses: IAddress[];
  // Fields for verification and password reset
  verificationOtp?: string;
  verificationOtpExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the Address sub-document
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
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ["customer", "Store Manager", "Super Admin", "Content Editor"],
      default: "customer",
    },
    emailVerified: { type: Date, default: null },
    phone: { type: String },
    phoneVerified: { type: Date, default: null },
    addresses: [AddressSchema],
    verificationOtp: { type: String },
    verificationOtpExpires: { type: Date },
    passwordResetToken: { type: String }, // Field for password reset
    passwordResetExpires: { type: Date }, // Field for password reset
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

// 🔥 PERFORMANCE FIXES FOR ANALYTICS:
// 1. Single Index on createdAt for registration tracking
UserSchema.index({ createdAt: -1 });

// 2. Compound Index on role and createdAt to exclude admins from customer growth reports
UserSchema.index({ role: 1, createdAt: -1 });

const User = models.User || model<IUser>("User", UserSchema);

export default User;

// --- SUMMARY OF CHANGES ---
// - Added `passwordResetToken` and `passwordResetExpires` to the IUser interface and UserSchema. This was missing but is used in your `authActions.ts` file, ensuring complete type safety.
// - No other logical changes were needed. The file is already well-structured for our new architecture.
// - [ADDED] Added single index on `createdAt` and a compound index on `role` and `createdAt` to optimize customer acquisition reporting and exclude admin accounts from business analytics.
