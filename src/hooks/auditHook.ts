// src/hooks/auditHook.ts
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload';
import { sanitizeData, generateDiff, getClientIp, getUserAgent } from './auditUtils';

/**
 * Creates a standardized `afterChange` hook for audit logging.
 */
export const createAuditAfterChangeHook = (
  collectionSlug: string
): CollectionAfterChangeHook => {
  return async ({ collection, doc, previousDoc, req, operation }) => {
    // Ignore if no user is logged in (system/internal processes)
    if (!req.user) return;

    // Sanitize and prepare data
    const previousData = sanitizeData(previousDoc || {});
    const newData = sanitizeData(doc || {});
    const changes = generateDiff(previousDoc, doc);

    try {
      // ✅ FIX 5: Cast 'collection' as string to bypass strict type check
      await req.payload.create({
        collection: 'audit-logs' as any,
        data: {
          admin: req.user.id,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          action: `${collectionSlug.toUpperCase()}_${operation.toUpperCase()}`,
          targetCollection: collectionSlug,
          targetId: doc?.id || 'N/A',
          changes: changes,
          previousData: previousData,
          newData: newData,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          timestamp: new Date().toISOString(),
        } as any, // ✅ FIX 6: Cast data as any to bypass strict type check
      });
    } catch (error) {
      // ❌ Silent Fail: Audit logging should never break the main transaction.
      console.error(`[AUDIT ERROR] Failed to log change for ${collectionSlug}:`, error);
    }
  };
};

/**
 * Creates a standardized `afterDelete` hook for audit logging.
 */
export const createAuditAfterDeleteHook = (
  collectionSlug: string
): CollectionAfterDeleteHook => {
  return async ({ collection, id, doc, req }) => {
    if (!req.user) return;

    const sanitizedDoc = sanitizeData(doc || {});

    try {
      // ✅ FIX 7: Cast 'collection' and 'data' as any
      await req.payload.create({
        collection: 'audit-logs' as any,
        data: {
          admin: req.user.id,
          adminEmail: req.user.email,
          adminRole: req.user.role,
          action: `${collectionSlug.toUpperCase()}_DELETE`,
          targetCollection: collectionSlug,
          targetId: id,
          changes: `Document with ID "${id}" was permanently deleted.`,
          previousData: sanitizedDoc,
          newData: null,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
          timestamp: new Date().toISOString(),
        } as any,
      });
    } catch (error) {
      console.error(`[AUDIT ERROR] Failed to log deletion for ${collectionSlug}:`, error);
    }
  };
};