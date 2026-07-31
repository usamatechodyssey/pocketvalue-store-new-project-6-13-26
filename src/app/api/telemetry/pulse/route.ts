// src/app/api/telemetry/pulse/route.ts

import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter"; // ✅ Only redis needed
import { getToken } from "next-auth/jwt";
import { PulsePayloadSchema } from "@/app/shared/lib/zodSchemas"; 

const QUEUE_MAX_LIMIT = 50000; 
const TELEMETRY_QUEUE_KEY = "tracking_pulse_queue";

export async function POST(req: NextRequest) {
  try {
    // ✅ REMOVED: ratelimiter and ipAddress (proxy handles rate limiting)

    // ✅ FIX: Safe check to bind both token.id and token.sub to support custom JWT contexts
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    const resolvedUserId = token?.id || token?.sub || null;
    
    const sessionId = req.cookies.get("pv_session_id")?.value;
    const visitorId = req.cookies.get("pv_visitor_id")?.value;

    if (!sessionId || !visitorId) {
      return NextResponse.json(
        { error: "Access Denied: Missing tracking parameters." },
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Malformatted JSON payload." },
        { status: 400 }
      );
    }
    
    const parsedData = PulsePayloadSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid telemetry payload shape injected." },
        { status: 400 }
      );
    }

    const pulsePayload = {
      sessionId,
      visitorId,
      ...parsedData.data,
      userId: resolvedUserId, 
      lastPulse: new Date().toISOString(),
    };

    try {
      const currentQueueLength = await redis.llen(TELEMETRY_QUEUE_KEY);

      if (currentQueueLength >= QUEUE_MAX_LIMIT) {
        console.warn(`[CONGESTION ALARM] Telemetry queue reached its limit of ${QUEUE_MAX_LIMIT}. Gracefully dropping pulse payload.`);
        return NextResponse.json(
          { success: true, queued: false, message: "Congestion drop triggered." },
          { status: 202 } 
        );
      }

      await redis.lpush(TELEMETRY_QUEUE_KEY, JSON.stringify(pulsePayload));
      return NextResponse.json({ success: true, queued: true }, { status: 200 });

    } catch (redisError: unknown) {
      const errorMsg = redisError instanceof Error ? redisError.message : "Redis connection error";
      console.error("[CRITICAL] Redis telemetry ingestion offline:", errorMsg);
      return NextResponse.json(
        { success: true, queued: false, message: "Ingestion offline, bypassed gracefully." },
        { status: 202 }
      );
    }

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "An unknown error occurred during telemetry queuing.";
    console.error("Critical API Queue Pulse Error:", errMsg);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}