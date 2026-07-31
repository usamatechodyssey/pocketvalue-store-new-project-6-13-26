// src/app/api/health/route.ts

import { NextResponse } from "next/server";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import { getSafePayload } from "@/app/shared/lib/payloadInstance";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
// ✅ REMOVED: import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const checks = {
    database: { status: "pending", details: "" },
    payload: { status: "pending", details: "" },
    redis: { status: "pending", details: "" },
    // ✅ REMOVED: cloudinary check
  };

  let overallStatus = 200;

  // 1. Check MongoDB (User DB - Transactions)
  try {
    const conn = await connectMongoose();
    if (conn.connection.readyState === 1) {
      checks.database.status = "healthy";
      checks.database.details = "Connected";
    } else {
      checks.database.status = "unhealthy";
      checks.database.details = `ReadyState: ${conn.connection.readyState}`;
      overallStatus = 503;
    }
  } catch (error: any) {
    checks.database.status = "critical";
    checks.database.details = error.message;
    overallStatus = 503;
  }

  // 2. Check Payload (Content DB)
  try {
    const payloadInstance = await getSafePayload();
    if (payloadInstance) {
      checks.payload.status = "healthy";
      checks.payload.details = "Payload initialized";
    } else {
      checks.payload.status = "unhealthy";
      overallStatus = 503;
    }
  } catch (error: any) {
    checks.payload.status = "critical";
    checks.payload.details = error.message;
    overallStatus = 503;
  }

  // 3. Check Upstash Redis (Rate Limiter)
  try {
    const pingResult = await redis.ping();
    if (pingResult === "PONG") {
      checks.redis.status = "healthy";
      checks.redis.details = "PONG received";
    } else {
      checks.redis.status = "unhealthy";
      checks.redis.details = `Unexpected response: ${pingResult}`;
      overallStatus = 503;
    }
  } catch (error: any) {
    checks.redis.status = "critical";
    checks.redis.details = error.message;
    overallStatus = 503;
  }

  // ================================================================
  // ✅ REMOVED: Cloudinary health check block
  // ================================================================

  // Calculate timestamp
  const timestamp = new Date().toISOString();

  return NextResponse.json(
    {
      status: overallStatus === 200 ? "ok" : "degraded",
      timestamp,
      services: checks,
    },
    { status: overallStatus }
  );
}