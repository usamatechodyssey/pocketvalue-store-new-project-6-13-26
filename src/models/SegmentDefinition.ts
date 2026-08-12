// // 📂 src/models/SegmentDefinition.ts

// import { Schema, model, models, Document, Types } from "mongoose";

// // ================================================================
// // ✅ TYPES
// // ================================================================

// // Single filter condition (e.g., "totalSpend > 5000")
// export interface FilterCondition {
//   field: string; // e.g., "totalSpend", "orderCount", "lastOrderDate"
//   operator:
//     | "equals"
//     | "not_equals"
//     | "greater_than"
//     | "less_than"
//     | "greater_than_equal"
//     | "less_than_equal"
//     | "contains"
//     | "not_contains"
//     | "in"
//     | "not_in"
//     | "exists";
//   value: string | number | boolean | string[] | null;
// }

// // Nested filter group with AND/OR logic
// export interface SegmentGroup {
//   logic: "AND" | "OR";
//   conditions: FilterCondition[];
//   groups?: SegmentGroup[]; // Nested groups for complex queries
// }

// // Segment definition document
// export interface ISegmentDefinition extends Omit<Document, "_id"> {
//   _id: Types.ObjectId;
//   name: string;
//   description?: string;
//   filters: SegmentGroup; // Root filter group
//   createdBy: Types.ObjectId; // Reference to Payload/Admin user
//   createdAt: Date;
//   updatedAt: Date;
//   lastRunAt?: Date; // When this segment was last executed
//   lastRunCount?: number; // How many customers matched
//   isActive: boolean;
// }

// // ================================================================
// // 📋 SCHEMA DEFINITIONS
// // ================================================================

// // Condition schema (embedded)
// const FilterConditionSchema = new Schema<FilterCondition>(
//   {
//     field: { type: String, required: true },
//     operator: {
//       type: String,
//       enum: [
//         "equals",
//         "not_equals",
//         "greater_than",
//         "less_than",
//         "greater_than_equal",
//         "less_than_equal",
//         "contains",
//         "not_contains",
//         "in",
//         "not_in",
//         "exists",
//       ],
//       required: true,
//     },
//     value: { type: Schema.Types.Mixed, required: true },
//   },
//   { _id: false }
// );

// // Segment group schema (nested)
// const SegmentGroupSchema = new Schema<SegmentGroup>(
//   {
//     logic: { type: String, enum: ["AND", "OR"], required: true },
//     conditions: { type: [FilterConditionSchema], default: [] },
//     groups: { type: [Schema.Types.Mixed], default: [] }, // Self-referencing nested groups
//   },
//   { _id: false }
// );

// // Main segment definition schema
// const SegmentDefinitionSchema = new Schema<ISegmentDefinition>(
//   {
//     name: {
//       type: String,
//       required: true,
//       index: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: "",
//       trim: true,
//     },
//     filters: {
//       type: SegmentGroupSchema,
//       required: true,
//     },
//     createdBy: {
//       type: Schema.Types.ObjectId,
//       ref: "users", // Payload Users collection (Cluster B)
//       required: true,
//       index: true,
//     },
//     lastRunAt: {
//       type: Date,
//       default: null,
//     },
//     lastRunCount: {
//       type: Number,
//       default: 0,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//       index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // ================================================================
// // ⚡ ENTERPRISE INDEXES
// // ================================================================

// // 1. For listing segments by creator
// SegmentDefinitionSchema.index({ createdBy: 1, createdAt: -1 });

// // 2. For active segment lookups
// SegmentDefinitionSchema.index({ isActive: 1, lastRunAt: -1 });

// // 3. For name search
// SegmentDefinitionSchema.index({ name: "text" });

// // ================================================================
// // 🧠 STATIC HELPERS
// // ================================================================

// SegmentDefinitionSchema.statics = {
//   /**
//    * Get all active segments for a user (for dropdowns)
//    */
//   async getActiveSegments(createdBy: Types.ObjectId): Promise<ISegmentDefinition[]> {
//     return this.find({ createdBy, isActive: true })
//       .sort({ name: 1 })
//       .lean();
//   },

//   /**
//    * Update last run stats for a segment
//    */
//   async updateLastRun(
//     segmentId: Types.ObjectId,
//     count: number
//   ): Promise<ISegmentDefinition | null> {
//     return this.findByIdAndUpdate(
//       segmentId,
//       {
//         $set: {
//           lastRunAt: new Date(),
//           lastRunCount: count,
//         },
//       },
//       { new: true }
//     );
//   },
// };

// // ================================================================
// // 🚀 MODEL REGISTRATION
// // ================================================================

// const SegmentDefinition =
//   models.SegmentDefinition ||
//   model<ISegmentDefinition>("SegmentDefinition", SegmentDefinitionSchema);

// export default SegmentDefinition;
// 📂 src/models/SegmentDefinition.ts

import { Schema, model, models, Document, Types } from "mongoose";
import User from "./User"; // ✅ PERMANENT FIX: Forces Mongoose to register 'User' model before populate executes anywhere in Next.js!

// ================================================================
// ✅ TYPES
// ================================================================

export interface FilterCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "greater_than"
    | "less_than"
    | "greater_than_equal"
    | "less_than_equal"
    | "contains"
    | "not_contains"
    | "in"
    | "not_in"
    | "exists";
  value: string | number | boolean | string[] | null;
}

export interface SegmentGroup {
  logic: "AND" | "OR";
  conditions: FilterCondition[];
  groups?: SegmentGroup[];
}

export interface ISegmentDefinition extends Omit<Document, "_id"> {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  filters: SegmentGroup;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  lastRunCount?: number;
  isActive: boolean;
}

// ================================================================
// 📋 SCHEMA DEFINITIONS
// ================================================================

const FilterConditionSchema = new Schema<FilterCondition>(
  {
    field: { type: String, required: true },
    operator: {
      type: String,
      enum: [
        "equals",
        "not_equals",
        "greater_than",
        "less_than",
        "greater_than_equal",
        "less_than_equal",
        "contains",
        "not_contains",
        "in",
        "not_in",
        "exists",
      ],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const SegmentGroupSchema = new Schema<SegmentGroup>(
  {
    logic: { type: String, enum: ["AND", "OR"], required: true },
    conditions: { type: [FilterConditionSchema], default: [] },
    groups: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const SegmentDefinitionSchema = new Schema<ISegmentDefinition>(
  {
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    filters: {
      type: SegmentGroupSchema,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: User.modelName || "User", // ✅ PERMANENT FIX: Bound directly to User.modelName ("User")
      required: true,
      index: true,
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    lastRunCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ================================================================
// ⚡ ENTERPRISE INDEXES
// ================================================================

SegmentDefinitionSchema.index({ createdBy: 1, createdAt: -1 });
SegmentDefinitionSchema.index({ isActive: 1, lastRunAt: -1 });
SegmentDefinitionSchema.index({ name: "text" });

// ================================================================
// 🧠 STATIC HELPERS
// ================================================================

SegmentDefinitionSchema.statics = {
  async getActiveSegments(createdBy: Types.ObjectId): Promise<ISegmentDefinition[]> {
    return this.find({ createdBy, isActive: true })
      .sort({ name: 1 })
      .lean();
  },

  async updateLastRun(
    segmentId: Types.ObjectId,
    count: number
  ): Promise<ISegmentDefinition | null> {
    return this.findByIdAndUpdate(
      segmentId,
      {
        $set: {
          lastRunAt: new Date(),
          lastRunCount: count,
        },
      },
      { new: true }
    );
  },
};

const SegmentDefinition =
  models.SegmentDefinition ||
  model<ISegmentDefinition>("SegmentDefinition", SegmentDefinitionSchema);

export default SegmentDefinition;