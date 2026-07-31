// /src/app/account/profile/_actions/profileActions.ts (REFACTORED WITH ZOD)

"use server";

import { auth } from "@/app/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User from "@/models/User";
// === THE FIX IS HERE: Import Zod and our new schemas ===
import { z } from "zod";
import { UpdateNameSchema, UpdatePasswordSchema } from "@/app/shared/lib/zodSchemas";


interface ServerResponse {
  success: boolean;
  message: string;
}

// Infer the data types directly from our Zod schemas
type UpdateNameData = z.infer<typeof UpdateNameSchema>;
type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;

// === Action #1: Update User Profile Name (Refactored with Zod) ===
export async function updateProfile(data: UpdateNameData): Promise<ServerResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated." };
  }

  // --- Step 1: Validate with Zod ---
  const validatedFields = UpdateNameSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues[0].message,
    };
  }
  // From here on, we use the clean, validated data
  const { name } = validatedFields.data;

  try {
    await connectMongoose();
    const user = await User.findById(session.user.id);
    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.name === name) { // No .trim() needed, Zod handles strings
        return { success: true, message: "No changes were made." };
    }

    user.name = name;
    await user.save();
    
    revalidatePath("/account");

    return { success: true, message: "Profile updated successfully!" };

  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Failed to update profile." };
  }
}

// === Action #2: Update User Password (Refactored with Zod) ===
export async function updatePassword(data: UpdatePasswordData): Promise<ServerResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated." };
  }

  // --- Step 1: Validate with Zod ---
  const validatedFields = UpdatePasswordSchema.safeParse(data);
  if (!validatedFields.success) {
    return {
      success: false,
      message: validatedFields.error.issues[0].message,
    };
  }
  const { currentPassword, newPassword } = validatedFields.data;

  try {
    await connectMongoose();
    const user = await User.findById(session.user.id);

    if (!user) {
      return { success: false, message: "User not found." };
    }
    if (!user.password) {
      return { success: false, message: "Password cannot be changed for social media accounts." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return { success: false, message: "Incorrect current password." };
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { success: true, message: "Password updated successfully! Please log in again with your new password." };

  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, message: "Failed to update password due to a server error." };
  }
}