//// /src/app/lib/checkout/order_sequence
import connectMongoose from "./mongoose";
import OrderSequence from "@/models/OrderSequence";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";

const ORDER_ID_PREFIX = "PV";
const COUNTER_ID = "order_id_counter";
const REDIS_COUNTER_KEY = "counters:order_sequence";

export async function generateNextOrderId(): Promise<string> {
  try {
    const exists = await redis.exists(REDIS_COUNTER_KEY);

    if (!exists) {
      const initLockKey = "locks:counters:order_sequence_init";
      const initLockToken = `lock_init_${Date.now()}`;
      
      const holdsLock = await redis.set(initLockKey, initLockToken, { nx: true, px: 5000 });

      if (holdsLock) {
        try {
          const doubleCheckExists = await redis.exists(REDIS_COUNTER_KEY);
          if (!doubleCheckExists) {
            await connectMongoose();
            const counterDoc = await OrderSequence.findById(COUNTER_ID);
            const currentDbVal = counterDoc ? counterDoc.sequence_value : 1000;
            
            await redis.set(REDIS_COUNTER_KEY, currentDbVal);
          }
        } finally {
          const activeLockVal = await redis.get(initLockKey);
          if (activeLockVal === initLockToken) {
            await redis.del(initLockKey);
          }
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return generateNextOrderId();
      }
    }

    const val = await redis.incr(REDIS_COUNTER_KEY);

    // ✅ SCALE-OPTIMIZATION: Chronological write blocks completely resolved!
    // Mongoose sequence synchronization ko async non-blocking execution callback loop mein transfer kiya gaya hai
    // taake high concurrent transactional state par threads database row-level locking se choke na hoon.
    connectMongoose().then(() => {
      OrderSequence.findByIdAndUpdate(
        COUNTER_ID,
        { $set: { sequence_value: val } },
        { upsert: true }
      ).catch(mongoWriteError => {
        console.error("LAZY-SYNC-ERROR: Mongoose order sequence update aborted:", mongoWriteError);
      });
    }).catch(connError => {
      console.error("LAZY-SYNC-ERROR: Connection failure inside background sync loop:", connError);
    });

    return `${ORDER_ID_PREFIX}-${val}`;

  } catch (cacheError: unknown) {
    const errorMsg = cacheError instanceof Error ? cacheError.message : String(cacheError);
    console.warn("CIRCUIT WARNING: Redis counter failed. Falling back to Mongo:", errorMsg);

    await connectMongoose();
    const counter = await OrderSequence.findByIdAndUpdate(
      COUNTER_ID,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error("Could not increment fallback Mongo sequence.");
    }

    return `${ORDER_ID_PREFIX}-${counter.sequence_value}`;
  }
}