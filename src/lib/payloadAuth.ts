// 📂 src/lib/payloadAuth.ts (MASTER PAYLOAD CMS STAFF AUTHENTICATOR WITH DEV FALLBACK)

import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { headers } from "next/headers";

// ================================================================
// ✅ ALLOWED STAFF ROLES (Payload CMS Database Aligned)
// ================================================================
export type StaffRole =
  | "admin"
  | "manager"
  | "editor"
  | "logistics"
  | "support"
  | "finance"
  | "Super Admin"
  | "Store Manager"
  | "Content Editor";

// ================================================================
// 🔧 HELPER: Normalizes Payload CMS staff roles
// Bridges database strings ("Super Admin") with action strings ("admin")
// ================================================================
function normalizeRole(role: string): string {
  if (!role) return "";
  const r = role.toLowerCase().trim();
  if (r === "super admin" || r === "admin") return "admin";
  if (r === "store manager" || r === "manager") return "manager";
  if (r === "content editor" || r === "editor") return "editor";
  return r;
}

// ================================================================
// 🛡️ UNIVERSAL STAFF VERIFIER (Payload CMS Auth + Dev Graceful Fallback)
// Used by all Admin Server Actions and Intelligence Modules
// ================================================================
export async function verifyStaff(allowedRoles: StaffRole[]): Promise<any> {
  let user: any = null;

  // 1. Authenticate via Payload CMS headers (payload-token cookie)
  try {
    const payload = await getSafePayload();
    const authResult = await payload.auth({ headers: await headers() });
    user = authResult.user;
  } catch (e) {
    // Session token expired or missing
  }

  // 🛡️ DEV-MODE FALLBACK: Localhost testing session auto-authentication
  if (!user && process.env.NODE_ENV === "development") {
    try {
      const payload = await getSafePayload();
      const devAdmins = await payload.find({
        collection: "users",
        where: { role: { in: ["admin", "Super Admin"] } },
        limit: 1,
      });
      if (devAdmins.docs.length > 0) {
        user = devAdmins.docs[0];
        console.log("🛠️ Dev Mode Security: Local admin staff session active.");
      }
    } catch (e) {
      // Dev fallback catch
    }
  }

  // 2. Reject if no user found in Production
  if (!user) {
    throw new Error("UNAUTHORIZED: Session expired. Please log in to Payload Admin.");
  }

  // 3. Normalize roles ("Super Admin" -> "admin")
  const normalizedUserRole = normalizeRole((user as any).role || "");
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  // 4. Super-User Bypass: "admin" / "Super Admin" is always authorized
  if (normalizedUserRole === "admin") {
    return user;
  }

  // 5. Verify permission match
  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    throw new Error(`FORBIDDEN: Role [${(user as any).role}] not authorized for this action.`);
  }

  return user;
}

// ================================================================
// 🛡️ MASTER SUPER ADMIN GUARD
// Used for high-privilege staff management actions
// ================================================================
export async function verifySuperAdmin(): Promise<any> {
  const user = await verifyStaff(["admin", "Super Admin"]);
  return user;
}