// 📂 src/hooks/auditHook.ts (FULLY COMPILE-SAFE)

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload';
import { sanitizeData, generateDiff, getClientIp, getUserAgent } from './auditUtils';
import { headers } from 'next/headers';

export const createAuditAfterChangeHook = (
  collectionSlug: string
): CollectionAfterChangeHook => {
  return async ({ doc, previousDoc, req, operation }) => {
    if (!req.user) return;

    const changes = generateDiff(previousDoc, doc);
    const h = await headers();
    const requestId = h.get("x-request-id") || "N/A";

    try {
      await req.payload.create({
        collection: 'audit-logs',
        data: {
          admin: req.user.id,
          adminEmail: req.user.email,
          adminRole: (req.user as any).role || 'admin',
          action: `${collectionSlug.toUpperCase()}_${operation.toUpperCase()}`,
          targetCollection: collectionSlug,
          targetId: String(doc?.id || 'N/A'),
          changes: changes,
          previousData: sanitizeData(previousDoc || {}),
          newData: sanitizeData(doc || {}),
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          requestId: requestId,
          timestamp: new Date().toISOString(),
        } as any, 
      });
    } catch (error) {
      console.error(`[AUDIT ERROR] Failed to log change for ${collectionSlug}:`, error);
    }
  };
};

export const createAuditAfterDeleteHook = (
  collectionSlug: string
): CollectionAfterDeleteHook => {
  return async ({ id, doc, req }) => {
    if (!req.user) return;
    const h = await headers();
    const requestId = h.get("x-request-id") || "N/A";

    try {
      await req.payload.create({
        collection: 'audit-logs',
        data: {
          admin: req.user.id,
          adminEmail: req.user.email,
          adminRole: (req.user as any).role || 'admin',
          action: `${collectionSlug.toUpperCase()}_DELETE`,
          targetCollection: collectionSlug,
          targetId: String(id),
          changes: `Document with ID "${id}" was permanently deleted.`,
          previousData: sanitizeData(doc || {}),
          newData: null,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          requestId: requestId,
          timestamp: new Date().toISOString(),
        } as any,
      });
    } catch (error) {
      console.error(`[AUDIT ERROR] Failed to log deletion for ${collectionSlug}:`, error);
    }
  };
};