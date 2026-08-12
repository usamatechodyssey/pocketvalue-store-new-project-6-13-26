// 📂 src/app/features/admin/staff-management/actions/payloadAdminActions.ts (FINAL PRODUCTION LOCK)

"use server";

import { revalidatePath } from "next/cache";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { verifySuperAdmin } from "@/lib/payloadAuth"; 
import crypto from "crypto";
import { headers } from "next/headers";

export type AllowedRole = "admin" | "manager" | "editor" | "Super Admin" | "Store Manager" | "Content Editor";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: AllowedRole;
  createdAt: string;
}

/**
 * 👥 Fetch all staff members from Payload CMS users collection
 */
export async function getStaffMembers(): Promise<StaffUser[]> {
  try {
    await verifySuperAdmin();
    const payload = await getSafePayload();
    const result = await payload.find({ collection: "users", limit: 100, sort: "name" });
    
    return result.docs.map((user: any) => ({
      id: String(user.id),
      name: user.name || "Admin User",
      email: user.email,
      role: user.role as AllowedRole,
      createdAt: new Date(user.createdAt).toISOString(),
    }));
  } catch (error: any) {
    console.error("Fetch Staff Error:", error.message);
    return [];
  }
}

/**
 * 🔄 Update staff member role (Prevents self-demotion)
 */
export async function updateStaffRole(userId: string, newRole: string) {
  try {
    await verifySuperAdmin();
    const payload = await getSafePayload();
    
    // 🛡️ Security Check: Prevent self-demotion
    const { user } = await payload.auth({ headers: await headers() });
    if (user?.id === userId) throw new Error("Security: You cannot modify your own role.");

    await payload.update({ 
      collection: "users", 
      id: userId, 
      data: { role: newRole as any } 
    });

    revalidatePath("/admin/staff-management");
    return { success: true, message: "Staff role updated successfully." };
  } catch (error: any) {
    console.error("Update Staff Role Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * ➕ Create a new staff member with a cryptographically secure temp password
 */
export async function createStaffMember(data: { name: string; email: string; role: string }) {
  try {
    await verifySuperAdmin();
    const payload = await getSafePayload();

    // 🛡️ Security Check: Cryptographically secure temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex") + "aA1!";

    await payload.create({
      collection: "users",
      data: {
        name: data.name,
        email: data.email,
        role: data.role as any,
        password: tempPassword,
      },
    });

    revalidatePath("/admin/staff-management");
    return { success: true, message: `Staff added. Temp password: ${tempPassword}` };
  } catch (error: any) {
    console.error("Create Staff Member Error:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * ❌ Remove staff member (Prevents self-deletion)
 */
export async function removeStaffMember(userId: string) {
  try {
    await verifySuperAdmin();
    const payload = await getSafePayload();

    // 🛡️ Security Check: Prevent self-deletion
    const { user } = await payload.auth({ headers: await headers() });
    if (user?.id === userId) throw new Error("Security: You cannot delete your own account.");

    await payload.delete({ collection: "users", id: userId });

    revalidatePath("/admin/staff-management");
    return { success: true, message: "Staff member removed successfully." };
  } catch (error: any) {
    console.error("Remove Staff Member Error:", error.message);
    return { success: false, message: error.message };
  }
}