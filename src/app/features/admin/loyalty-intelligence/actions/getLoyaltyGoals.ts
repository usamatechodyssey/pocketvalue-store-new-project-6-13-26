// 📂 src/app/features/admin/loyalty-intelligence/actions/getLoyaltyGoals.ts

"use server";

import { getCachedSettings } from "@/app/shared/lib/cache/settings";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Referral from "@/models/Referral";
import { redis } from "@/app/shared/lib/telemetry/rate-limiter";
import { verifyAdminAccess } from "@/app/features/admin/analytics-telemetry/action/verifyAdminAccess";
import { startOfMonth, endOfMonth, format } from "date-fns";

// ✅ SAFE SERIALIZE UTILITIES
import { safeParse, safeStringify } from "@/app/shared/lib/utils/safeSerialize";

// ================================================================
// ✅ TYPES (100% Preserved)
// ================================================================
export interface LoyaltyGoalData {
  target: number;
  current: number;
  month: string;
  percentage: number;
  isOverachieved: boolean;
  remaining: number;
}

// ================================================================
// 🛡️ CACHE STAMPEDE PROTECTION (Lua Script)
// ================================================================
const LUA_RELEASE_LOCK = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

const releaseLock = async (lockKey: string, requestId: string): Promise<void> => {
  try {
    const result = await redis.eval(LUA_RELEASE_LOCK, [lockKey], [requestId]);
    if (result === 1) console.log(`🔓 Goal Lock released (${requestId}).`);
  } catch (error) {
    console.error("Goal Lock release error:", error);
  }
};

// ================================================================
// 🚀 MAIN FUNCTION — Enterprise Ready
// ================================================================
export async function getLoyaltyGoals(): Promise<{
  success: boolean;
  data?: LoyaltyGoalData;
  error?: string;
}> {
  const cacheKey = "analytics_loyalty_goals_v3";

  try {
    await verifyAdminAccess();
    await connectMongoose();

    // 1. Cache Check (using safeParse)
    const cachedData = await redis.get(cacheKey);
    const parsed = safeParse<LoyaltyGoalData>(cachedData as string | null);
    if (parsed) {
      console.log("⚡ Redis Cache Hit: Loyalty Goals");
      return { success: true, data: parsed };
    }

    // 2. Cache Stampede Lock
    const LOCK_TTL = 30;
    const lockKey = `lock:${cacheKey}`;
    const requestId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lockAcquired = await redis.set(lockKey, requestId, { nx: true, ex: LOCK_TTL });

    if (!lockAcquired) {
      console.log("⏳ Cache Stampede Detected. Waiting 500ms...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const retryCache = await redis.get(cacheKey);
      const retryParsed = safeParse<LoyaltyGoalData>(retryCache as string | null);
      if (retryParsed) {
        return { success: true, data: retryParsed };
      }
    }

    try {
      console.log(`🔒 Goal Lock acquired (${requestId}). Generating goal progress...`);

      // 3. Fetch Goal Target from Settings (Tab 8)
      const settings = await getCachedSettings();
      const target = settings?.referralGoalTarget ?? 0;

      // 4. Fetch Current Month Conversions
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const current = await Referral.countDocuments({
        status: { $in: ["converted", "paid"] },
        convertedAt: { $gte: monthStart, $lte: monthEnd },
      });

      // 5. Calculate Metrics
      const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      const isOverachieved = target > 0 && current >= target;
      const remaining = Math.max(0, target - current);

      const response: LoyaltyGoalData = {
        target,
        current,
        month: format(now, "MMMM yyyy"),
        percentage: Number(percentage.toFixed(1)),
        isOverachieved,
        remaining,
      };

      // 6. Cache for 5 Minutes (using safeStringify)
      await redis.set(cacheKey, safeStringify(response), { ex: 300 });
      console.log("✅ Loyalty Goals Cached.");

      return { success: true, data: response };
    } finally {
      await releaseLock(lockKey, requestId);
    }
  } catch (error: any) {
    console.error("Loyalty Goals Engine Error:", error.message);
    return { success: false, error: error.message };
  }
}