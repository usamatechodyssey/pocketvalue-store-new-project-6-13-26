// src/hooks/auditUtils.ts
import type { PayloadRequest } from 'payload';

/**
 * 🛡️ Security: Sensitive fields to exclude from logs (passwords, tokens, etc.)
 */
const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordResetToken',
  'verificationOtp',
  'hashKey',
  'integritySalt',
  'resetToken',
]);

/**
 * Sanitizes an object by removing sensitive fields.
 * ✅ FIX 3: Properly typed to return Partial<T>
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  if (!data) return {};
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!SENSITIVE_FIELDS.has(key)) {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  return result;
}

/**
 * Generates a human-readable diff string between two objects.
 */
export function generateDiff(previous: any, current: any): string {
  if (!previous || !current) return 'Document created or deleted.';
  const oldData = sanitizeData(previous);
  const newData = sanitizeData(current);
  const changes: string[] = [];

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  for (const key of allKeys) {
    if (key === 'id' || key === '_id' || key === 'createdAt' || key === 'updatedAt') continue;
    const oldVal = (oldData as Record<string, any>)[key];
    const newVal = (newData as Record<string, any>)[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      const oldStr = oldVal !== undefined && oldVal !== null ? JSON.stringify(oldVal) : 'null';
      const newStr = newVal !== undefined && newVal !== null ? JSON.stringify(newVal) : 'null';
      changes.push(`${key}: ${oldStr} ➔ ${newStr}`);
    }
  }
  return changes.length > 0 ? changes.join(' | ') : 'No significant changes detected.';
}

/**
 * Extracts the client IP address from the Payload request object.
 * ✅ FIX 4: Removed req.ip (doesn't exist on PayloadRequest)
 */
export function getClientIp(req: PayloadRequest): string {
  // Try headers first (supports proxies)
  const forwarded = req.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map((ip) => ip.trim());
    return ips[0];
  }

  const realIp = req.headers?.get?.('x-real-ip');
  if (realIp) return realIp;

  const cfConnectingIp = req.headers?.get?.('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  return '0.0.0.0';
}

/**
 * Extracts the User-Agent from the Payload request object.
 */
export function getUserAgent(req: PayloadRequest): string {
  return req.headers?.get?.('user-agent') || 'Unknown';
}