// src/app/shared/lib/zodSchemas/courierSchemas.ts
import { z } from "zod";

// ================================================================
// 🛡️ ZOD SCHEMAS FOR COURIER SETTINGS
// ================================================================

const CourierCredentialsSchema = z.object({
  tcsApiKey: z.string().optional(),
  tcsSecret: z.string().optional(),
  tcsMerchantId: z.string().optional(),
  leopardsApiKey: z.string().optional(),
  leopardsSecret: z.string().optional(),
  postExApiKey: z.string().optional(),
  postExSecret: z.string().optional(),
  postExMerchantId: z.string().optional(),
  traxApiKey: z.string().optional(),
  traxSecret: z.string().optional(),
  apiUrl: z.string().url().optional().or(z.literal('')),
  username: z.string().optional(),
  password: z.string().optional(),
});

const CourierProviderSchema = z.object({
  key: z.enum(['tcs', 'leopards', 'postex', 'trax', 'manual']),
  name: z.string().min(1, "Courier name is required."),
  enabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  credentials: CourierCredentialsSchema.optional(),
});

export const UpdateCourierSettingsSchema = z
  .array(CourierProviderSchema)
  .min(1, "At least one courier provider must be configured.")
  .refine(
    (couriers) => {
      const defaultCouriers = couriers.filter((c) => c.isDefault === true);
      return defaultCouriers.length <= 1;
    },
    {
      message: "Only one courier can be set as default.",
    }
  )
  .refine(
    (couriers) => {
      const enabledCouriers = couriers.filter((c) => c.enabled === true);
      return enabledCouriers.length >= 1;
    },
    {
      message: "At least one courier must be enabled.",
    }
  );

export type UpdateCourierSettingsArgs = z.infer<typeof UpdateCourierSettingsSchema>;