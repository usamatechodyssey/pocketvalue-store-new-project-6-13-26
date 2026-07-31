// src/app/shared/lib/telemetry/rate-limiter.ts
import { Redis } from "@upstash/redis";

// Strongly typed global scope declaration to prevent TypeScript errors in development HMR
declare global {
  var globalRedisInstance: Redis | undefined;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error(
    "CRITICAL ARCHITECTURAL ERROR: Upstash Redis credentials are not configured in your .env.local file. " +
    "Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set."
  );
}

/**
 * Singleton Redis connection setup to prevent connection leaks
 * during Next.js Hot Module Replacement (HMR) reloads.
 */
export const redis = process.env.NODE_ENV === "production"
  ? new Redis({ url: redisUrl, token: redisToken })
  : (global.globalRedisInstance || (global.globalRedisInstance = new Redis({ url: redisUrl, token: redisToken })));