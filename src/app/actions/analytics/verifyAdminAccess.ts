// @/app/actions/analytics/verifyAdminAccess.ts
"use server";

import { auth } from "@/app/auth";
import { headers } from "next/headers";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export async function verifyAdminAccess(): Promise<boolean> {
  const session = await auth();
  if (
    session?.user?.role &&
    ["Super Admin", "Store Manager"].includes(session.user.role)
  ) {
    return true;
  }

  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: await headers() });
  if (user) return true;

  throw new Error(
    "Unauthorized: Intelligence access restricted to Admins only.",
  );
}