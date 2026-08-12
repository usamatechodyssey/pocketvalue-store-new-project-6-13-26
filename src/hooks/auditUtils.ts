// 📂 src/hooks/auditUtils.ts (FULLY COMPILE-SAFE)

import type { PayloadRequest } from 'payload';

const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordResetToken',
  'verificationOtp',
  'hashKey',
  'integritySalt',
  'resetToken',
]);

export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  if (!data) return {};
  
  // ✅ FIX: Clone using type-safe spread and manual deletion
  const result = { ...data } as Partial<T>;
  
  for (const key of Object.keys(result)) {
    if (SENSITIVE_FIELDS.has(key)) {
      delete result[key as keyof T];
    }
  }
  return result;
}

export function generateDiff(previous: any, current: any): string {
  if (!previous || !current) return 'Document created or deleted.';
  
  const oldData = sanitizeData(previous);
  const newData = sanitizeData(current);
  const changes: string[] = [];

  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    if (['id', '_id', 'createdAt', 'updatedAt', 'version'].includes(key)) continue;
    
    const oldVal = (oldData as Record<string, any>)[key];
    const newVal = (newData as Record<string, any>)[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      const oldStr = oldVal !== undefined && oldVal !== null ? JSON.stringify(oldVal) : 'null';
      const newStr = newVal !== undefined && newVal !== null ? JSON.stringify(newVal) : 'null';
      changes.push(`${key}: ${oldStr} ➔ ${newStr}`);
    }
  }
  
  const diffStr = changes.length > 0 ? changes.join(' | ') : 'No significant changes detected.';
  return diffStr.length > 1000 ? diffStr.substring(0, 997) + '...' : diffStr;
}

export function getClientIp(req: PayloadRequest): string {
  
  const forwarded = req.headers?.get?.('x-forwarded-for');
  if (forwarded && typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers?.get?.('x-real-ip');
  if (realIp && typeof realIp === 'string') return realIp;

  return '0.0.0.0';
}

export function getUserAgent(req: PayloadRequest): string {
  
  return req.headers?.get?.('user-agent') || 'Unknown';
}