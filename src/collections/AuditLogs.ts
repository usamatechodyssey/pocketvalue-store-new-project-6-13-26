// src/collections/AuditLogs.ts
import type { CollectionConfig } from 'payload';

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    useAsTitle: 'timestamp',
    group: 'Security',
    defaultColumns: ['timestamp', 'adminEmail', 'action', 'targetId', 'changes'],
    hideAPIURL: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin' || user.role === 'manager';
    },
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    beforeChange: [
      () => {
        throw new Error('Audit logs are immutable and cannot be modified.');
      },
    ],
    beforeDelete: [
      () => {
        throw new Error('Audit logs are immutable and cannot be deleted.');
      },
    ],
  },
  fields: [
    {
      name: 'admin',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'adminEmail',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'adminRole',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'action',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'targetCollection',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'targetId',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'changes',
      type: 'textarea',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'previousData',
      type: 'json',
      required: false,
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'newData',
      type: 'json',
      required: false,
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'userAgent',
      type: 'text',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
    },
  ],
  // ✅ FIX: Removed 'options' property — TTL index will be created separately
  indexes: [
    {
      fields: ['adminEmail'],
    },
    {
      fields: ['targetId'],
    },
    {
      fields: ['action'],
    },
    // ⏳ TTL INDEX: Removed from here due to Payload type restrictions.
    // Will be created via migration script or MongoDB Compass.
  ],
  timestamps: false,
};