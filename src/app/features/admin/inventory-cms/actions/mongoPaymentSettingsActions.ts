// src/app/actions/mongoPaymentSettingsActions.ts
"use server";

import connectMongoose from "@/app/shared/lib/checkout/mongoose"; // Aapka Mongoose connection utility
import SettingModel, { IGateway, ISetting } from "@/models/Setting"; // Aapka Mongoose model
import { UpdatePaymentGatewaysSchema } from "@/app/shared/lib/zodSchemas"; // Zod schema for validation
import { z } from "zod"; // Zod type
import { verifyStaff } from "@/lib/payloadAuth";

// Type definition for function arguments
type UpdatePaymentGatewaysArgs = z.infer<typeof UpdatePaymentGatewaysSchema>;

// === ACTION #1: FETCH ALL PAYMENT GATEWAYS FROM MONGODB ===
// Yeh function sirf payment gateways fetch karega, kisi bhi UI (Payload ya NextAuth) ke liye.
export async function getPaymentGatewaysFromMongo(): Promise<IGateway[]> {
  try {
     // 🛡️ SECURITY LOCK: Sensitive credentials ko sirf Admin aur Manager hi dekh sakte hain
    await verifyStaff(['admin', 'manager']);
    
    await connectMongoose(); 
    const settingsDoc = await SettingModel.findById<ISetting>('payment_gateways').lean();
    return settingsDoc ? settingsDoc.gateways : [];
  } catch (error: any) {
    console.error("Failed to fetch payment gateways from MongoDB:", error);
    // Agar MongoDB down ho ya koi masla ho, toh khali array return karein taake app crash na ho
    return []; 
  }
}

// === ACTION #2: UPDATE PAYMENT GATEWAYS IN MONGODB ===
// Yeh function payment gateways ko MongoDB mein update karega.
export async function updatePaymentGatewaysInMongo(gateways: UpdatePaymentGatewaysArgs): Promise<{ success: boolean; message: string }> {
  // Zod validation (jo aapke schema mein hai)
   // 🛡️ SECURITY LOCK: Configuration change sirf Admin aur Manager kar sakte hain
  await verifyStaff(['admin', 'manager']);
  const validation = UpdatePaymentGatewaysSchema.safeParse(gateways);
  if (!validation.success) {
      return { success: false, message: validation.error.issues[0].message };
  }
  const validatedGateways = validation.data;

  try {
    await connectMongoose(); 
    await SettingModel.findOneAndUpdate(
      { _id: 'payment_gateways' },
      { $set: { gateways: validatedGateways } },
      { upsert: true, new: true } // Upsert: Agar document nahi hai to bana dega
    );
    // Revalidation ki zaroorat nahi hai, kyunke yeh sirf MongoDB mein save ho raha hai.
    // Frontend ko reload karna hoga.

    return { success: true, message: "Payment gateways updated successfully in MongoDB!" };
  } catch (error: any) {
    console.error("Failed to update payment gateways in MongoDB:", error);
    return { success: false, message: error.message || "An unexpected error occurred while updating payment gateways." };
  }
}