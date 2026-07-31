// src/lib/payloadAuth.ts

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { headers } from "next/headers";

// ================================================================
// 🛡️ ENTERPRISE ROLES (Strict Type Union)
// ================================================================
// ✅ UPDATED: "logistics", "support", aur "finance" roles bhi add kar diye
// taake shipmentActions.ts aur future modules seamlessly kaam karein.
export type StaffRole = 
  | "admin" 
  | "manager" 
  | "editor" 
  | "logistics" 
  | "support" 
  | "finance";

/**
 * 🛡️ UNIVERSAL STAFF VERIFIER
 * This function must be executed at the beginning of Server Actions.
 * 
 * @param allowedRoles - List of roles that are authorized to perform the action.
 * @returns The validated user document from Payload.
 * @throws Error if user is not authenticated or role is not authorized.
 */
export async function verifyStaff(
  allowedRoles: StaffRole[],
): Promise<any> {
  // Use connection-safe client from the global cache singleton
  const payload = await getSafePayload();

  // 1. Perform Payload Auth check using cookie sessions
  const { user } = await payload.auth({ headers: await headers() });

  // 2. Validate user presence
  if (!user) {
    throw new Error(
      "UNAUTHORIZED: Aapka Payload session expire ho chuka hai. Dobara login karein.",
    );
  }

  // 3. Confirm appropriate permission level
  const userRole = (user as any).role;
  if (!allowedRoles.includes(userRole)) {
    throw new Error(
      `FORBIDDEN: Aapka role [${userRole}] is action ke liye authorized nahi hai.`,
    );
  }

  return user; // Return validated user document
}