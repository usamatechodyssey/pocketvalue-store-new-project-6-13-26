// src/app/shared/constants/orderTransitions.ts

// ================================================================
// 🔥 STATE MACHINE: 17 Statuses (As per Module 1 Report)
// ================================================================

export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
    // Initial State
    'Pending': ['Payment Verified', 'Processing', 'Cancelled', 'On Hold', 'Fraud Hold'],
  
    // Payment & Fraud
    'Payment Verified': ['Ready to Ship', 'Fraud Hold'],
    'Fraud Hold': ['Payment Verified', 'Cancelled'],
  
    // Fulfillment
    'Ready to Ship': ['Shipped'],
    'Shipped': ['In Transit', 'RTO'],
    'In Transit': ['Delivered', 'RTO'],
    'Delivered': ['Completed', 'Return Requested'],
  
    // Returns (RMA)
    'Return Requested': ['Return Approved', 'Rejected'],
    'Return Approved': ['Refund Initiated'],
    'Refund Initiated': ['Completed', 'Rejected'], // If refund fails, can be rejected
  
    // RTO (Return to Origin)
    'RTO': ['Auto-Restocked'],
    'Auto-Restocked': ['Completed'], // Terminal after restock
  
    // Admin Hold
    'On Hold': ['Processing', 'Cancelled'],
  
    // Processing (General)
    'Processing': ['Shipped', 'On Hold', 'Cancelled'],
  
    // Terminal States (No outgoing transitions)
    'Completed': [],
    'Cancelled': [],
    'Rejected': [],
  };
  
  /**
   * Validates if a status transition is allowed.
   * @param currentStatus - The current status of the order.
   * @param newStatus - The proposed new status.
   * @returns boolean - True if the transition is valid.
   */
  export const isValidStatusTransition = (
    currentStatus: string,
    newStatus: string
  ): boolean => {
    const allowed = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    return allowed.includes(newStatus);
  };
  
  /**
   * Gets all possible next statuses for a given current status.
   * Useful for populating Admin dropdowns dynamically.
   */
  export const getNextStatuses = (currentStatus: string): string[] => {
    return ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  };