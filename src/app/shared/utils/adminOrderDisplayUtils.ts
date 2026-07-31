// src/app/shared/utils/adminOrderDisplayUtils.ts

/**
 * 📦 ADMIN ORDER DISPLAY UTILITIES
 * Single source of truth for Admin Panel status display.
 * All 17 Enterprise Statuses with colors and labels.
 */

type StatusColorMap = Record<string, string>;

export const ADMIN_STATUS_COLORS: StatusColorMap = {
  'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'payment verified': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'processing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'ready to ship': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  'shipped': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'in transit': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'rto': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'return requested': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'return approved': 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  'refund initiated': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
  'auto-restocked': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'on hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'fraud hold': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

/**
 * Get CSS classes for admin status badge.
 * @param status - The order status (case insensitive)
 * @returns Tailwind CSS classes for the status badge
 */
export const getAdminStatusColor = (status: string): string => {
  const key = status?.toLowerCase() || '';
  return ADMIN_STATUS_COLORS[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

/**
 * All 17 statuses for Admin dropdowns and filters
 */
export const ADMIN_STATUSES = [
  'All',
  'Pending',
  'Payment Verified',
  'Processing',
  'Ready to Ship',
  'Shipped',
  'In Transit',
  'Delivered',
  'RTO',
  'Return Requested',
  'Return Approved',
  'Refund Initiated',
  'Auto-Restocked',
  'Completed',
  'Cancelled',
  'On Hold',
  'Fraud Hold',
  'Rejected'
];

/**
 * Statuses that are terminal (no further actions)
 */
export const ADMIN_TERMINAL_STATUSES = ['Completed', 'Cancelled', 'Rejected'];

/**
 * Statuses that are active/processing
 */
export const ADMIN_ACTIVE_STATUSES = [
  'Pending',
  'Payment Verified',
  'Processing',
  'Ready to Ship',
  'Shipped',
  'In Transit',
  'On Hold',
  'Fraud Hold'
];


// ================================================================
// 🕐 ADMIN TIMELINE STEPS (Simplified for Admin View)
// ================================================================

import { Package, CreditCard, Truck, Home, Check, XCircle } from 'lucide-react';

export const ADMIN_TIMELINE_STEPS = [
  { name: 'Pending', icon: Package },
  { name: 'Payment Verified', icon: CreditCard },
  { name: 'Processing', icon: Package },
  { name: 'Shipped', icon: Truck },
  { name: 'Delivered', icon: Home },
  { name: 'Completed', icon: Check },
];

/**
 * Get the timeline step index for a given status.
 * Maps all 17 statuses to one of the 6 timeline steps.
 */
export const getAdminTimelineStep = (status: string): { step: string; index: number } => {
  const stepMap: Record<string, { step: string; index: number }> = {
    'Pending': { step: 'Pending', index: 0 },
    'Payment Verified': { step: 'Payment Verified', index: 1 },
    'Processing': { step: 'Processing', index: 2 },
    'Ready to Ship': { step: 'Processing', index: 2 },
    'Shipped': { step: 'Shipped', index: 3 },
    'In Transit': { step: 'Shipped', index: 3 },
    'Delivered': { step: 'Delivered', index: 4 },
    'RTO': { step: 'RTO', index: -1 },
    'Return Requested': { step: 'Return Requested', index: -1 },
    'Return Approved': { step: 'Return Approved', index: -1 },
    'Refund Initiated': { step: 'Refund Initiated', index: -1 },
    'Auto-Restocked': { step: 'Auto-Restocked', index: -1 },
    'Completed': { step: 'Completed', index: 5 },
    'Cancelled': { step: 'Cancelled', index: -1 },
    'On Hold': { step: 'Processing', index: 2 },
    'Fraud Hold': { step: 'Pending', index: 0 },
    'Rejected': { step: 'Rejected', index: -1 },
  };
  
  return stepMap[status] || { step: status, index: 0 };
};

/**
 * Check if a status is terminal (should show full-width message instead of timeline).
 */
export const isAdminTerminalStatus = (status: string): boolean => {
  return ['Cancelled', 'Completed', 'Rejected', 'RTO', 'Auto-Restocked', 'Return Requested', 'Return Approved', 'Refund Initiated'].includes(status);
};
// ================================================================
// 📦 RETURN STATUSES (Admin Return Management)
// ================================================================

export const RETURN_STATUSES = [
    'All',
    'Pending',
    'Approved',
    'Processing',
    'Completed',
    'Rejected'
  ];
  
  /**
   * All return statuses except "All" (for dropdowns)
   */
  export const RETURN_STATUSES_FILTER = RETURN_STATUSES.filter(s => s !== 'All');
  
  /**
   * Get CSS classes for return status badge
   */
  export const getReturnStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'processing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    const key = status?.toLowerCase() || '';
    return colorMap[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // ================================================================
// 📦 RETURN RESOLUTIONS (Admin Return Management)
// ================================================================

export const RETURN_RESOLUTIONS = [
    'Refund',
    'StoreCredit',
    'Replacement'
  ];
  
  /**
   * Resolution options with an empty placeholder for select dropdown.
   */
  export const RETURN_RESOLUTIONS_WITH_PLACEHOLDER = [
    { value: '', label: 'Select Resolution...' },
    ...RETURN_RESOLUTIONS.map(r => ({ value: r, label: r }))
  ];