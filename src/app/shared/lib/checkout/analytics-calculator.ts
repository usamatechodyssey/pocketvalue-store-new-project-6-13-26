// 📂 src/app/shared/lib/checkout/analytics-calculator.ts (DUAL PROFIT DYNAMICS HARDENED)

/**
 * @description Calculates pre-calculated analytics fields (targetProfit, profit, cost, fees, tax, rates)
 * for each product in the cart. These fields are stored in the order document
 * to enable zero-load historical analytics and bulletproof audit trails.
 * 
 * Formula synchronization with Order.ts, getGranularFinancials.ts, and PriceAnatomySurgeon.tsx
 */

// ================================================================
// ✅ INTERFACES
// ================================================================

interface CartItem {
  _id: string;
  price: number;
  quantity: number;
  name: string;
  variant?: { _key: string; name: string };
  [key: string]: any; 
}

interface GlobalSettings {
  globalFixedFees?: Array<{ percentage: number }>;
  pricingLogicTiers?: Array<{
    minCost: number;
    maxCost: number;
    profitPercent: number;
    adSpendPercent: number;
  }>;
  taxSettings?: { standardGstPercent: number };
  pricingSettings?: { estimatedDutiesPercent: number };
  returnsSettings?: { estimatedReturnRatePercent: number };
}

export interface EnrichedCartItem extends CartItem {
  costPrice?: number;         // Unit cost (capital)
  targetProfit?: number;      // ✅ Target Line Profit BEFORE Coupon Discounts (e.g. Rs. 2,000)
  profit?: number;            // Realized Pure Line Profit AFTER Coupon Discounts (e.g. Rs. 1,000)
  fees?: number;              // Total line fees
  tax?: number;               // Total line tax
  capital?: number;           // Total line cost (cost per unit × quantity)
  
  // ✅ SNAPSHOT RATES (THE AUDIT TRAIL)
  appliedGstRate?: number;     // Snapshotted GST % (e.g. 15)
  appliedDutiesRate?: number;  // Snapshotted Duties % (e.g. 5)
  appliedFeeRate?: number;     // Snapshotted Total Fixed Fee % (e.g. 3)
  appliedProfitRate?: number;  // Snapshotted Target Profit % (e.g. 20)
  appliedAdSpendRate?: number; // Snapshotted Ad Spend % (e.g. 8)
  appliedRtoRate?: number;     // Snapshotted RTO Budget % (e.g. 10)
}

// ================================================================
// 🚀 MAIN LOGIC: DUAL PROFIT SURGICAL ENRICHMENT
// ================================================================

/**
 * @function enrichCartWithAnalytics
 * @description Injects financial snapshots, dual profit amounts, and rate stamps into cart items.
 * @param cartItems - Array of cart items
 * @param settings - Global CMS settings
 * @param couponDiscountAmount - Optional cart-wide coupon discount amount (PKR)
 */
export function enrichCartWithAnalytics(
  cartItems: CartItem[],
  settings: GlobalSettings | null,
  couponDiscountAmount: number = 0
): EnrichedCartItem[] {
  if (!settings) {
    console.warn('⚠️ Settings missing in enrichCartWithAnalytics. Financial snapshotting bypassed!');
    return cartItems.map((item) => ({
      ...item,
      costPrice: undefined,
      targetProfit: undefined,
      profit: undefined,
      fees: undefined,
      tax: undefined,
      capital: undefined,
      appliedGstRate: undefined,
      appliedDutiesRate: undefined,
      appliedFeeRate: undefined,
      appliedProfitRate: undefined,
      appliedAdSpendRate: undefined,
      appliedRtoRate: undefined,
    }));
  }

  // 1. Extract Global Variables from Settings
  const globalFeesArray = settings.globalFixedFees || [];
  const totalFixedFeePercent = globalFeesArray.reduce(
    (sum: number, fee: any) => sum + (fee.percentage || 0),
    0
  );

  const pricingTiers = settings.pricingLogicTiers || [];
  const gstPercent = settings.taxSettings?.standardGstPercent ?? 0;
  const dutiesPercent = settings.pricingSettings?.estimatedDutiesPercent ?? 0;
  const rtoPercent = settings.returnsSettings?.estimatedReturnRatePercent ?? 0;

  // Calculate cart total subtotal for pro-rata coupon allocation
  const totalCartSubtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  // 2. Process each item and FREEZE the current business logic values
  return cartItems.map((item) => {
    const SP = item.price || 0; // Selling Price
    const Q = item.quantity || 0; // Quantity
    const itemSubtotal = SP * Q;

    // 0-value fallback protection
    if (SP === 0 || Q === 0) {
      return {
        ...item,
        costPrice: 0, 
        targetProfit: 0,
        profit: 0, 
        fees: 0, 
        tax: 0, 
        capital: 0,
        appliedGstRate: gstPercent,
        appliedDutiesRate: dutiesPercent,
        appliedFeeRate: totalFixedFeePercent,
        appliedProfitRate: 0,
        appliedAdSpendRate: 0,
        appliedRtoRate: rtoPercent
      };
    }

    // 3. Find matching tier for dynamic profit % and ad spend %
    let profitPercent = 0;
    let adSpendPercent = 0;

    if (pricingTiers.length > 0) {
      const matchedTier = pricingTiers.find(
        (tier: any) => SP >= tier.minCost && SP <= tier.maxCost
      );
      if (matchedTier) {
        profitPercent = matchedTier.profitPercent || 0;
        adSpendPercent = matchedTier.adSpendPercent || 0;
      } else {
        profitPercent = pricingTiers[0]?.profitPercent || 0;
        adSpendPercent = pricingTiers[0]?.adSpendPercent || 0;
      }
    }

    // 4. Per-Unit PKR Math (Reverse Engineering Retail Price)
    const gstAmount = SP * (gstPercent / 100);
    const feesAmount = SP * (totalFixedFeePercent / 100);
    const adSpendAmount = SP * (adSpendPercent / 100);
    const targetProfitPerUnit = SP * (profitPercent / 100);

    const leftover = SP - (gstAmount + feesAmount + adSpendAmount + targetProfitPerUnit);

    // 5. Derived Capital (Base Cost before Duties)
    const capitalPerUnit = leftover / (1 + dutiesPercent / 100);

    // 6. Pro-Rata Coupon Discount Allocation
    const itemCouponShare = totalCartSubtotal > 0
      ? (couponDiscountAmount * itemSubtotal) / totalCartSubtotal
      : 0;

    // Line Target Profit (Before Coupon) & Line Realized Profit (After Coupon)
    const targetLineProfit = Math.round(targetProfitPerUnit * Q);
    const realizedLineProfit = Math.max(0, Math.round(targetLineProfit - itemCouponShare));

    // 7. Return Enriched Item with Dual Profit Audit Snapshots
    return {
      ...item,
      // Total Rupees Amounts (Stamped)
      costPrice: Math.round(capitalPerUnit),
      targetProfit: targetLineProfit,              // ✅ Target Profit BEFORE Coupon
      profit: realizedLineProfit,                  // ✅ Realized Pure Profit AFTER Coupon
      fees: Math.round(feesAmount * Q),
      tax: Math.round(gstAmount * Q),
      capital: Math.round(capitalPerUnit * Q),
      
      // Frozen Audit Rates
      appliedGstRate: gstPercent,
      appliedDutiesRate: dutiesPercent,
      appliedFeeRate: totalFixedFeePercent,
      appliedProfitRate: profitPercent,
      appliedAdSpendRate: adSpendPercent,
      appliedRtoRate: rtoPercent
    };
  });
}