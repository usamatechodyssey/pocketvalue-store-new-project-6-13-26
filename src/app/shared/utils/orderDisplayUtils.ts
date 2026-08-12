// /**
//  * 📦 ORDER DISPLAY UTILITIES
//  * Single source of truth for Customer-facing status mapping.
//  * Admin DB statuses (17+) are mapped to 6 simplified Customer UI statuses.
//  */

// // ================================================================
// // 1. MAPPER: DB Status → Customer-Friendly Status
// // ================================================================
// export const getCustomerOrderStatus = (dbStatus: string): string => {
//     const map: Record<string, string> = {
//       // Processing group
//       'Pending': 'Processing',
//       'Payment Verified': 'Processing',
//       'Processing': 'Processing',
//       'On Hold': 'Processing',
//       'Fraud Hold': 'Processing',
      
//       // Shipped group
//       'Ready to Ship': 'Shipped',
//       'Shipped': 'Shipped',
//       'In Transit': 'Shipped',
      
//       // Delivered (final positive)
//       'Delivered': 'Delivered',
//       'Completed': 'Completed',
      
//       // Return/Refund group
//       'Return Requested': 'Return Initiated',
//       'Return Approved': 'Return Initiated',
//       'Refund Initiated': 'Return Initiated',
      
//       // RTO / Failed delivery
//       'RTO': 'Returned to Sender',
//       'Auto-Restocked': 'Returned to Sender',
//       'Rejected': 'Returned to Sender',
      
//       // Terminal states
//       'Cancelled': 'Cancelled',
//     };
    
//     return map[dbStatus] || 'Processing';
//   };
  
//   // ================================================================
//   // 2. COLOR MAPPER: Customer Status → Tailwind CSS Classes
//   // ================================================================
//   export const getCustomerOrderStatusColor = (dbStatus: string): string => {
//     const displayStatus = getCustomerOrderStatus(dbStatus);
    
//     switch (displayStatus) {
//       case 'Processing':
//         return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
//       case 'Shipped':
//         return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
//       case 'Delivered':
//       case 'Completed':
//         return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
//       case 'Returned to Sender':
//         return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
//       case 'Return Initiated':
//         return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
//       case 'Cancelled':
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//       default:
//         return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
//     }
//   };
  
//   // ================================================================
//   // 3. EXTRA: Check if order can be cancelled by customer
//   // ================================================================
//   export const isOrderCancellableByCustomer = (dbStatus: string): boolean => {
//     const cancellableStatuses = [
//       'Pending',
//       'Processing',
//       'Payment Verified',
//       'Ready to Ship',
//       'On Hold',
//       'Fraud Hold'
//     ];
//     return cancellableStatuses.includes(dbStatus);
//   };
  
//   // ================================================================
//   // 4. EXTRA: Check if order is eligible for return
//   // ================================================================
//   export const isOrderReturnable = (dbStatus: string): boolean => {
//     return dbStatus === 'Delivered';
//   };
  
//   // ================================================================
//   // 5. EXTRA: Check if invoice can be downloaded
//   // ================================================================
//   export const isInvoiceDownloadable = (dbStatus: string): boolean => {
//     return dbStatus !== 'Cancelled';
//   };


//   // src/app/shared/utils/orderDisplayUtils.ts (ADD THIS FUNCTION)

// /**
//  * Reverse Mapping: Customer Filter → Array of DB Statuses
//  * Used for filtering orders in the database.
//  */
// export const getDbStatusesForCustomerFilter = (customerFilter: string): string[] => {
//     const map: Record<string, string[]> = {
//       'Processing': ['Pending', 'Processing', 'Payment Verified', 'On Hold', 'Fraud Hold'],
//       'Shipped': ['Ready to Ship', 'Shipped', 'In Transit'],
//       'Delivered': ['Delivered'],
//       'Returned to Sender': ['RTO', 'Auto-Restocked', 'Rejected'],
//       'Return Initiated': ['Return Requested', 'Return Approved', 'Refund Initiated'],
//       'Cancelled': ['Cancelled'],
//     };
//     return map[customerFilter] || [];
//   };

//   // ================================================================
// // 📦 CUSTOMER RETURN REASONS
// // ================================================================

// export const CUSTOMER_RETURN_REASONS = [
//     "Item was defective or damaged",
//     "Received the wrong item",
//     "Size was too small",
//     "Size was too large",
//     "Changed my mind",
//     "Other",
//   ];
  
//   export const DEFAULT_RETURN_REASON = "Item was defective or damaged";
  
//   // ================================================================
//   // 📦 CUSTOMER TIMELINE STEPS
//   // ================================================================
  
//   export const CUSTOMER_TIMELINE_STEPS = [
//     { name: "Processing", icon: "Package" },
//     { name: "Shipped", icon: "Truck" },
//     { name: "Delivered", icon: "Home" },
//   ];
  
//   // ================================================================
//   // 📦 CUSTOMER RETURN STATUS COLORS
//   // ================================================================
  
//   export const getCustomerReturnStatusColor = (status: string): string => {
//     const colorMap: Record<string, string> = {
//       'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
//       'processing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
//       'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//     };
//     const key = status?.toLowerCase() || '';
//     return colorMap[key] || 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
//   };

// 📂 src/app/shared/utils/orderDisplayUtils.ts

/**
 * 📦 ORDER DISPLAY UTILITIES
 * Single source of truth for Customer-facing status mapping.
 * Admin DB statuses (17+) are mapped to 6 simplified Customer UI statuses.
 */

// ================================================================
// 1. MAPPER: DB Status → Customer-Friendly Status
// ================================================================
export const getCustomerOrderStatus = (dbStatus: string): string => {
  const map: Record<string, string> = {
    // Processing group
    'Pending': 'Processing',
    'Payment Verified': 'Processing',
    'Processing': 'Processing',
    'On Hold': 'Processing',
    'Fraud Hold': 'Processing',
    
    // Shipped group
    'Ready to Ship': 'Shipped',
    'Shipped': 'Shipped',
    'In Transit': 'Shipped',
    
    // Delivered (final positive)
    'Delivered': 'Delivered',
    'Completed': 'Delivered', // ✅ FIX 1: Maps 'Completed' to 'Delivered' so CUSTOMER_TIMELINE_STEPS findIndex matches 100%!
    
    // Return/Refund group
    'Return Requested': 'Return Initiated',
    'Return Approved': 'Return Initiated',
    'Refund Initiated': 'Return Initiated',
    
    // RTO / Failed delivery
    'RTO': 'Returned to Sender',
    'Auto-Restocked': 'Returned to Sender',
    'Rejected': 'Returned to Sender',
    
    // Terminal states
    'Cancelled': 'Cancelled',
  };
  
  return map[dbStatus] || 'Processing';
};

// ================================================================
// 2. COLOR MAPPER: Customer Status → Tailwind CSS Classes
// ================================================================
export const getCustomerOrderStatusColor = (dbStatus: string): string => {
  const displayStatus = getCustomerOrderStatus(dbStatus);
  
  switch (displayStatus) {
    case 'Processing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
    case 'Shipped':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'Delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    case 'Returned to Sender':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'Return Initiated':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

// ================================================================
// 3. EXTRA: Check if order can be cancelled by customer
// ================================================================
export const isOrderCancellableByCustomer = (dbStatus: string): boolean => {
  const cancellableStatuses = [
    'Pending',
    'Processing',
    'Payment Verified',
    'Ready to Ship',
    'On Hold',
    'Fraud Hold'
  ];
  return cancellableStatuses.includes(dbStatus);
};

// ================================================================
// 4. EXTRA: Check if order is eligible for return (Enables Returns for both)
// ================================================================
export const isOrderReturnable = (dbStatus: string): boolean => {
  // ✅ FIX 2: Added 'Completed' status so completed orders are still eligible for return refunds!
  return dbStatus === 'Delivered' || dbStatus === 'Completed';
};

// ================================================================
// 5. EXTRA: Check if invoice can be downloaded
// ================================================================
export const isInvoiceDownloadable = (dbStatus: string): boolean => {
  return dbStatus !== 'Cancelled';
};

// ================================================================
// 🎛️ REVERSE MAPPER: Customer Filter → Array of DB Statuses
// ================================================================
export const getDbStatusesForCustomerFilter = (customerFilter: string): string[] => {
  const map: Record<string, string[]> = {
    'Processing': ['Pending', 'Processing', 'Payment Verified', 'On Hold', 'Fraud Hold'],
    'Shipped': ['Ready to Ship', 'Shipped', 'In Transit'],
    // ✅ FIX 3: Added 'Completed' to Delivered database filter queries!
    'Delivered': ['Delivered', 'Completed'],
    'Returned to Sender': ['RTO', 'Auto-Restocked', 'Rejected'],
    'Return Initiated': ['Return Requested', 'Return Approved', 'Refund Initiated'],
    'Cancelled': ['Cancelled'],
  };
  return map[customerFilter] || [];
};

// ================================================================
// 📦 CUSTOMER RETURN REASONS
// ================================================================
export const CUSTOMER_RETURN_REASONS = [
  "Item was defective or damaged",
  "Received the wrong item",
  "Size was too small",
  "Size was too large",
  "Changed my mind",
  "Other",
];

export const DEFAULT_RETURN_REASON = "Item was defective or damaged";

// ================================================================
// 📦 CUSTOMER TIMELINE STEPS
// ================================================================
export const CUSTOMER_TIMELINE_STEPS = [
  { name: "Processing", icon: "Package" },
  { name: "Shipped", icon: "Truck" },
  { name: "Delivered", icon: "Home" },
];

// ================================================================
// 📦 CUSTOMER RETURN STATUS COLORS
// ================================================================
export const getCustomerReturnStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'processing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  const key = status?.toLowerCase() || '';
  return colorMap[key] || 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
};