
// src/app/shared/lib/utils/safeSerialize.ts

import { Types } from 'mongoose';

type PlainObject = { [key: string]: any };

export function toPlainObject<T>(data: T): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof Types.ObjectId) {
    return data.toString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(item => toPlainObject(item));
  }

  if (typeof data === 'object') {
    const plain: PlainObject = {};
    for (const key of Object.keys(data)) {
      if (key.startsWith('_') && key !== '_id') continue;
      if (key === '__v') continue;
      plain[key] = toPlainObject((data as any)[key]);
    }
    return plain;
  }

  return data;
}

export function safeStringify(data: any): string {
  const plain = toPlainObject(data);
  return JSON.stringify(plain);
}

/**
 * ✅ ENTERPRISE FIX: Safely parse cached data
 * - If input is already an object, return it directly.
 * - If input is a string, parse it as JSON.
 * - If parsing fails, return null and log error.
 */
export function safeParse<T>(cached: string | null | unknown): T | null {
  if (!cached) return null;

  // ✅ If already an object, return it (no parsing needed)
  if (typeof cached === 'object') {
    return cached as T;
  }

  // ✅ If it's a string, attempt JSON parse
  if (typeof cached === 'string') {
    try {
      return JSON.parse(cached) as T;
    } catch (error) {
      console.error('⚠️ Cache parse failed:', error);
      return null;
    }
  }

  // ✅ Unknown type: log and return null
  console.warn('⚠️ Unexpected cached value type:', typeof cached);
  return null;
}

export function isSerializable(data: any): boolean {
  try {
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}