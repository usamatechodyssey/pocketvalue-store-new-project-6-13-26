"use server";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";

export async function verifyAdminAccess(): Promise<boolean> {
  const session = await auth();
  if (
    session?.user?.role &&
    ["Super Admin", "Store Manager"].includes(session.user.role)
  ) {
    return true;
  }

  // Use connection-safe client from the global cache singleton
  const payload = await getSafePayload();
  const { user } = await payload.auth({ headers: await headers() });
  if (user) return true;

  throw new Error(
    "Unauthorized: Intelligence access restricted to Admins only.",
  );
}