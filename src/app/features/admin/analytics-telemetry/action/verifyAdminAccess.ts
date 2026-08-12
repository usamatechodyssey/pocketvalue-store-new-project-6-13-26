// 📂 src/features/admin/analytics-telemetry/action/verifyAdminAccess.ts (HARDENED TELEMETRY GUARD)

"use server";

import { verifyStaff } from "@/lib/payloadAuth";

/**
 * 🛡️ Verifies administrative staff access for high-density intelligence telemetry
 * Uses normalized role matching ("Super Admin" / "Store Manager" -> "admin" / "manager")
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    await verifyStaff(["admin", "manager"]);
    return true;
  } catch (error: any) {
    throw new Error(error.message || "Unauthorized: Intelligence access restricted to Admins only.");
  }
}