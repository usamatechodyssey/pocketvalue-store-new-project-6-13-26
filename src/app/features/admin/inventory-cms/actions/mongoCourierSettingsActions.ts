// src/features/admin/inventory-cms/actions/mongoCourierSettingsActions.ts
"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import SettingModel, { ICourierProvider } from "@/models/Setting";
import { verifyStaff } from "@/lib/payloadAuth";
// ✅ Import schema from separate file
import { UpdateCourierSettingsSchema, UpdateCourierSettingsArgs } from "@/app/shared/lib/zodSchemas/courierSchemas";

// ================================================================
// 🚀 ACTION #1: FETCH ALL COURIER PROVIDERS FROM MONGODB
// ================================================================

export async function getCourierProvidersFromMongo(): Promise<ICourierProvider[]> {
  try {
    await verifyStaff(['admin', 'manager']);
    await connectMongoose();

    const settingsDoc = await SettingModel.findById('service_settings').lean<{
      _id: string;
      couriers?: ICourierProvider[];
    } | null>();

    if (!settingsDoc || !settingsDoc.couriers || settingsDoc.couriers.length === 0) {
      return getDefaultCourierProviders();
    }

    return settingsDoc.couriers;
  } catch (error: any) {
    console.error("Failed to fetch courier providers from MongoDB:", error);
    return getDefaultCourierProviders();
  }
}

// ================================================================
// 🚀 ACTION #2: UPDATE COURIER PROVIDERS IN MONGODB
// ================================================================

export async function updateCourierProvidersInMongo(
  couriers: UpdateCourierSettingsArgs
): Promise<{ success: boolean; message: string }> {
  try {
    await verifyStaff(['admin', 'manager']);

    const validation = UpdateCourierSettingsSchema.safeParse(couriers);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Invalid courier configuration.",
      };
    }

    const validatedCouriers = validation.data;

    // Ensure manual is always present and enabled
    const hasManual = validatedCouriers.some((c) => c.key === 'manual');
    if (!hasManual) {
      validatedCouriers.push({
        key: 'manual',
        name: 'Manual Entry',
        enabled: true,
        isDefault: false,
        credentials: {},
      });
    }

    // Ensure only one default courier
    let defaultSet = false;
    validatedCouriers.forEach((c) => {
      if (c.isDefault) {
        if (defaultSet) {
          c.isDefault = false;
        } else {
          defaultSet = true;
        }
      }
    });
    if (!defaultSet) {
      const firstEnabled = validatedCouriers.find((c) => c.enabled === true);
      if (firstEnabled) {
        firstEnabled.isDefault = true;
      }
    }

    await connectMongoose();

    await SettingModel.findOneAndUpdate(
      { _id: 'service_settings' },
      {
        $set: {
          couriers: validatedCouriers,
        },
        $setOnInsert: {
          _id: 'service_settings',
        },
      },
      { upsert: true, new: true }
    );

    // Invalidate cache
    try {
      const { invalidateCourierCache } = await import("@/lib/adapters/courier/CourierFactory");
      invalidateCourierCache();
    } catch (cacheError) {
      console.warn("Could not invalidate courier cache:", cacheError);
    }

    return {
      success: true,
      message: "Courier settings updated successfully in MongoDB!",
    };
  } catch (error: any) {
    console.error("Failed to update courier providers in MongoDB:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred while updating courier settings.",
    };
  }
}

// ================================================================
// 🔧 HELPER: DEFAULT COURIER PROVIDERS
// ================================================================

function getDefaultCourierProviders(): ICourierProvider[] {
  return [
    {
      key: 'tcs',
      name: 'TCS',
      enabled: true,
      isDefault: true,
      credentials: {},
    },
    {
      key: 'leopards',
      name: 'Leopards',
      enabled: true,
      isDefault: false,
      credentials: {},
    },
    {
      key: 'postex',
      name: 'PostEx',
      enabled: true,
      isDefault: false,
      credentials: {},
    },
    {
      key: 'trax',
      name: 'Trax',
      enabled: false,
      isDefault: false,
      credentials: {},
    },
    {
      key: 'manual',
      name: 'Manual Entry',
      enabled: true,
      isDefault: false,
      credentials: {},
    },
  ];
}