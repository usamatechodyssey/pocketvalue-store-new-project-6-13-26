
// // export default Referral;
// import { Schema, model, models, Document, Types } from "mongoose";

// // ====================================================================
// // 🛡️ STRICT COMPILER TYPE DEFINITIONS
// // ====================================================================
// export interface IReferral extends Omit<Document, "_id"> {
//   _id: Types.ObjectId;
//   referrerId: Types.ObjectId;
//   referredUserId: Types.ObjectId;
//   referralCode: string;
//   status: "pending" | "converted" | "paid";
//   orderId?: string | null;
//   meta?: {
//     ip?: string;
//     userAgent?: string;
//   };
//   convertedAt?: Date | null;
//   paidAt?: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

// // ====================================================================
// // 📋 MONGOOSE SCHEMA
// // ====================================================================
// const ReferralSchema = new Schema<IReferral>(
//   {
//     referrerId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Referrer ID is required."],
//       index: true,
//     },
//     referredUserId: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "Referred User ID is required."],
//       unique: true, // ✅ FIXED: Removed duplicate 'index: true' as 'unique: true' natively indexes it
//     },
//     referralCode: {
//       type: String,
//       required: [true, "Referral code is required."],
//       trim: true,
//       uppercase: true,
//       index: true, // ✅ FIXED: Declared directly here to avoid dual schema index warnings
//     },
//     status: {
//       type: String,
//       enum: ["pending", "converted", "paid"],
//       default: "pending",
//       required: true,
//       index: true,
//     },
//     orderId: {
//       type: String,
//       ref: "Order",
//       default: null,
//     },
//     meta: {
//       ip: { type: String, default: "" },
//       userAgent: { type: String, default: "" },
//     },
//     convertedAt: {
//       type: Date,
//       default: null,
//     },
//     paidAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ====================================================================
// // ⚡ HIGH-PERFORMANCE ENTERPRISE INDEXES
// // ====================================================================

// // 1. Compound index for admin payouts & leaderboard queries
// ReferralSchema.index({ referrerId: 1, status: 1 });

// // 2. Chronological sorting for audit logs
// ReferralSchema.index({ createdAt: -1 });

// // 3. Lookup by orderId (conversion tracking)
// ReferralSchema.index({ orderId: 1 }, { sparse: true });

// // 4. Compound index for referrer + referred (fraud detection)
// ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

// // ✅ FIXED: Removed redundant 'ReferralSchema.index({ referralCode: 1 })' from here

// // ====================================================================
// // 🧠 STATIC HELPER METHODS
// // ====================================================================

// ReferralSchema.statics = {
//   async hasPendingReferral(referredUserId: Types.ObjectId): Promise<boolean> {
//     const existing = await this.findOne({
//       referredUserId,
//       status: { $in: ["pending", "converted"] },
//     });
//     return !!existing;
//   },

//   async getConversionsForReferrer(
//     referrerId: Types.ObjectId
//   ): Promise<{ total: number; converted: number; paid: number }> {
//     const [converted, paid] = await Promise.all([
//       this.countDocuments({ referrerId, status: "converted" }),
//       this.countDocuments({ referrerId, status: "paid" }),
//     ]);
//     return {
//       total: converted + paid,
//       converted,
//       paid,
//     };
//   },

//   async markAsConverted(
//     referralId: Types.ObjectId,
//     orderId: string
//   ): Promise<IReferral | null> {
//     return this.findByIdAndUpdate(
//       referralId,
//       {
//         $set: {
//           status: "converted",
//           orderId,
//           convertedAt: new Date(),
//         },
//       },
//       { new: true }
//     );
//   },

//   async markAsPaid(referralId: Types.ObjectId): Promise<IReferral | null> {
//     return this.findByIdAndUpdate(
//       referralId,
//       {
//         $set: {
//           status: "paid",
//           paidAt: new Date(),
//         },
//       },
//       { new: true }
//     );
//   },
// };

// // ================================================================
// // 🚀 MODEL REGISTRATION
// // ================================================================
// const Referral = models.Referral || model<IReferral>("Referral", ReferralSchema);

// export default Referral;
import { Schema, model, models, Document, Types } from "mongoose";

// ====================================================================
// 🛡️ STRICT COMPILER TYPE DEFINITIONS
// ====================================================================
export interface IReferral extends Omit<Document, "_id"> {
  _id: Types.ObjectId;
  referrerId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  referralCode: string;
  status: "pending" | "converted" | "paid";
  orderId?: string | null;
  meta?: {
    ip?: string;
    userAgent?: string;
  };
  convertedAt?: Date | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ====================================================================
// 📋 MONGOOSE SCHEMA
// ====================================================================
const ReferralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Referrer ID is required."],
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Referred User ID is required."],
      unique: true, // Removed duplicate 'index: true' as 'unique: true' natively indexes it
    },
    referralCode: {
      type: String,
      required: [true, "Referral code is required."],
      trim: true,
      uppercase: true,
      index: true, // Declared directly here to avoid dual schema index warnings
    },
    status: {
      type: String,
      enum: ["pending", "converted", "paid"],
      default: "pending",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      ref: "Order",
      default: null,
    },
    meta: {
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
    convertedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ====================================================================
// ⚡ HIGH-PERFORMANCE ENTERPRISE INDEXES
// ====================================================================

// 1. Compound index for admin payouts & leaderboard queries
ReferralSchema.index({ referrerId: 1, status: 1 });

// 2. Chronological sorting for audit logs
ReferralSchema.index({ createdAt: -1 });

// 3. Lookup by orderId (conversion tracking)
ReferralSchema.index({ orderId: 1 }, { sparse: true });

// 4. Compound index for referrer + referred (fraud detection)
ReferralSchema.index({ referrerId: 1, referredUserId: 1 }, { unique: true });

// ====================================================================
// 🧠 STATIC HELPER METHODS
// ====================================================================

ReferralSchema.statics = {
  async hasPendingReferral(referredUserId: Types.ObjectId): Promise<boolean> {
    const existing = await this.findOne({
      referredUserId,
      status: { $in: ["pending", "converted"] },
    });
    return !!existing;
  },

  async getConversionsForReferrer(
    referrerId: Types.ObjectId
  ): Promise<{ total: number; converted: number; paid: number }> {
    const [converted, paid] = await Promise.all([
      this.countDocuments({ referrerId, status: "converted" }),
      this.countDocuments({ referrerId, status: "paid" }),
    ]);
    return {
      total: converted + paid,
      converted,
      paid,
    };
  },

  async markAsConverted(
    referralId: Types.ObjectId,
    orderId: string
  ): Promise<IReferral | null> {
    return this.findByIdAndUpdate(
      referralId,
      {
        $set: {
          status: "converted",
          orderId,
          convertedAt: new Date(),
        },
      },
      { new: true }
    );
  },

  async markAsPaid(referralId: Types.ObjectId): Promise<IReferral | null> {
    return this.findByIdAndUpdate(
      referralId,
      {
        $set: {
          status: "paid",
          paidAt: new Date(),
        },
      },
      { new: true }
    );
  },
};

const Referral = models.Referral || model<IReferral>("Referral", ReferralSchema);

export default Referral;