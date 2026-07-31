// src/app/api/cron/flush-pulses/route.ts

import { NextResponse } from 'next/server';
import { redis } from "@/app/shared/lib/telemetry/rate-limiter"; 
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import UserSession from "@/models/UserSession";

// ✅ Define PulsePayload type
interface PulsePayload {
  sessionId: string;
  visitorId: string;
  userId?: string;
  device?: string;
  os?: string;
  browser?: string;
  city?: string;
  country?: string;
  lastPulse?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function GET(request: Request) {
  // Security Cron Check
  const authHeader = request.headers.get('authorization');
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await connectMongoose();

    const queueLength = await redis.llen("tracking_pulse_queue");
    if (queueLength === 0) {
      return NextResponse.json({ success: true, message: "Queue is empty. No pulses to flush." });
    }

    const maxBatch = 1000;
    const batchSize = Math.min(queueLength, maxBatch);

    console.log(`📡 Redis Queue: Found ${queueLength} pulses. Processing atomic batch size of ${batchSize}.`);

    const pipeline = redis.pipeline();
    for (let i = 0; i < batchSize; i++) {
      pipeline.rpop("tracking_pulse_queue");
    }
    const rawPulses = await pipeline.exec();
    
    // ✅ FIX: Explicit type for parsed pulses
    const parsedPulses: PulsePayload[] = rawPulses
      .filter(Boolean)
      .map((item) => (typeof item === 'string' ? JSON.parse(item) : item));

    if (parsedPulses.length === 0) {
      return NextResponse.json({ success: true, message: "No valid pulses decoded in batch." });
    }

    const bulkOps = parsedPulses.map((pulse) => {
      const { sessionId, visitorId } = pulse;
      const pulseTime = new Date(pulse.lastPulse || Date.now());

      const setFields: any = {
        visitorId,
        device: pulse.device || "desktop",
        os: pulse.os || "Other",
        browser: pulse.browser || "Other",
        city: pulse.city || null,
        country: pulse.country || null,
        lastPulse: pulseTime,
        isActive: true, 
      };

      if (pulse.userId) {
        setFields.userId = pulse.userId;
      }

      return {
        updateOne: {
          filter: { sessionId },
          update: {
            $set: setFields,
            $setOnInsert: {
              createdAt: pulseTime, 
              utmSource: pulse.utmSource || "Direct",
              utmMedium: pulse.utmMedium || "None",
              utmCampaign: pulse.utmCampaign || "None",
            }
          },
          upsert: true, 
        },
      };
    });

    const bulkWriteResult = await UserSession.bulkWrite(bulkOps, { timestamps: false });

    console.log(`💾 DB Engine: Batch flush successful. Processed ${bulkWriteResult.upsertedCount + bulkWriteResult.modifiedCount} sessions to MongoDB.`);

    return NextResponse.json({
      success: true,
      flushedCount: parsedPulses.length,
      remainingInQueue: queueLength - batchSize,
      dbResults: {
        upserted: bulkWriteResult.upsertedCount,
        modified: bulkWriteResult.modifiedCount,
      }
    });

  } catch (error: any) {
    console.error("Cron Job Error (Flush Pulses Failure):", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}