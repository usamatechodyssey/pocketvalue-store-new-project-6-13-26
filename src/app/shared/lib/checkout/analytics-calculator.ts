// // src/app/shared/lib/checkout/analytics-calculator.ts

// /**
//  * @description Calculates pre-calculated analytics fields (profit, cost, fees, tax)
//  * for each product in the cart. These fields are stored in the order document
//  * to enable zero-load historical analytics.
//  * 
//  * Formula used matches getGranularFinancials.ts
//  */

// interface CartItem {
//     _id: string;
//     price: number;
//     quantity: number;
//     variant?: { _key: string; name: string };
//     [key: string]: any; // For other fields
//   }
  
//   interface GlobalSettings {
//     globalFixedFees?: Array<{ percentage: number }>;
//     pricingLogicTiers?: Array<{
//       minCost: number;
//       maxCost: number;
//       profitPercent: number;
//       adSpendPercent: number;
//     }>;
//     taxSettings?: { standardGstPercent: number };
//     pricingSettings?: { estimatedDutiesPercent: number };
//   }
  
//   export interface EnrichedCartItem extends CartItem {
//     costPrice?: number; // Unit cost (capital)
//     profit?: number;    // Total line profit (profit per unit × quantity)
//     fees?: number;      // Total line fees
//     tax?: number;       // Total line tax
//     capital?: number;   // Total line cost (cost per unit × quantity)
//   }
  
//   export function enrichCartWithAnalytics(
//     cartItems: CartItem[],
//     settings: GlobalSettings | null
//   ): EnrichedCartItem[] {
//     if (!settings) {
//       // If settings are missing, return original items without analytics fields
//       console.warn('⚠️ Settings missing in enrichCartWithAnalytics. Returning empty fields.');
//       return cartItems.map((item) => ({
//         ...item,
//         costPrice: undefined,
//         profit: undefined,
//         fees: undefined,
//         tax: undefined,
//         capital: undefined,
//       }));
//     }
  
//     // 1. Extract settings
//     const globalFeesArray = settings.globalFixedFees || [];
//     const totalFixedFeePercent = globalFeesArray.reduce(
//       (sum: number, fee: any) => sum + (fee.percentage || 0),
//       0
//     );
  
//     const pricingTiers = settings.pricingLogicTiers || [];
//     const gstPercent = settings.taxSettings?.standardGstPercent ?? 0;
//     const dutiesPercent = settings.pricingSettings?.estimatedDutiesPercent ?? 0;
  
//     // 2. Process each product
//     return cartItems.map((item) => {
//       const SP = item.price || 0;
//       const Q = item.quantity || 0;
  
//       // If price is 0 or quantity is 0, return item with zeros
//       if (SP === 0 || Q === 0) {
//         return {
//           ...item,
//           costPrice: 0,
//           profit: 0,
//           fees: 0,
//           tax: 0,
//           capital: 0,
//         };
//       }
  
//       // 3. Find matching tier for profit % and ad spend %
//       let profitPercent = 0;
//       let adSpendPercent = 0;
  
//       if (pricingTiers.length > 0) {
//         const matchedTier = pricingTiers.find(
//           (tier: any) => SP >= tier.minCost && SP <= tier.maxCost
//         );
//         if (matchedTier) {
//           profitPercent = matchedTier.profitPercent || 0;
//           adSpendPercent = matchedTier.adSpendPercent || 0;
//         } else {
//           // Fallback to first tier
//           profitPercent = pricingTiers[0]?.profitPercent || 0;
//           adSpendPercent = pricingTiers[0]?.adSpendPercent || 0;
//         }
//       }
  
//       // 4. Per-unit calculations
//       const gstAmount = SP * (gstPercent / 100);
//       const feesAmount = SP * (totalFixedFeePercent / 100);
//       const adSpendAmount = SP * (adSpendPercent / 100);
//       const profitPerUnit = SP * (profitPercent / 100);
  
//       const leftover = SP - (gstAmount + feesAmount + adSpendAmount + profitPerUnit);
  
//       // 5. Capital (Cost) and Duties
//       const capitalPerUnit = leftover / (1 + dutiesPercent / 100);
//       // const dutiesPerUnit = leftover - capitalPerUnit; // Not needed in order, only for analytics
  
//       // 6. Line totals (multiply by quantity)
//       const totalProfit = profitPerUnit * Q;
//       const totalFees = feesAmount * Q;
//       const totalTax = gstAmount * Q;
//       const totalCapital = capitalPerUnit * Q;
  
//       return {
//         ...item,
//         costPrice: Math.round(capitalPerUnit), // Unit cost
//         profit: Math.round(totalProfit),        // Line profit
//         fees: Math.round(totalFees),            // Line fees
//         tax: Math.round(totalTax),              // Line tax
//         capital: Math.round(totalCapital),      // Line cost
//       };
//     });
//   }
// 📂 src/app/shared/lib/checkout/analytics-calculator.ts (FINAL HARDENED VERSION)

/**
 * @description Calculates pre-calculated analytics fields (profit, cost, fees, tax, rates)
 * for each product in the cart. These fields are stored in the order document
 * to enable zero-load historical analytics and bulletproof audit trails.
 * 
 * Formula synchronization with getGranularFinancials.ts and PriceAnatomySurgeon.tsx
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
  returnsSettings?: { estimatedReturnRatePercent: number }; // ✅ Added for RTO Snapshot
}

export interface EnrichedCartItem extends CartItem {
  costPrice?: number;         // Unit cost (capital)
  profit?: number;            // Total line profit (profit per unit × quantity)
  fees?: number;              // Total line fees
  tax?: number;               // Total line tax
  capital?: number;           // Total line cost (cost per unit × quantity)
  
  // ✅ SNAPSHOT RATES (THE AUDIT TRAIL)
  // Yeh fields future reports ko batayengi ke checkout ke waqt kya exact margins thay.
  appliedGstRate?: number;     // Snapshotted GST % (e.g. 18)
  appliedDutiesRate?: number;  // Snapshotted Duties % (e.g. 5)
  appliedFeeRate?: number;     // Snapshotted Total Fixed Fee % (e.g. 3)
  appliedProfitRate?: number;  // Snapshotted Target Profit % (e.g. 25)
  appliedAdSpendRate?: number; // Snapshotted Ad Spend % (e.g. 8)
  appliedRtoRate?: number;     // ✅ Snapshotted RTO Budget % (e.g. 10)
}

// ================================================================
// 🚀 MAIN LOGIC: SURGICAL ENRICHMENT
// ================================================================

/**
 * @function enrichCartWithAnalytics
 * @description Injects financial snapshots and rate stamps into cart items.
 */
export function enrichCartWithAnalytics(
  cartItems: CartItem[],
  settings: GlobalSettings | null
): EnrichedCartItem[] {
  if (!settings) {
    console.warn('⚠️ Settings missing in enrichCartWithAnalytics. Critical financial snapshotting bypassed!');
    return cartItems.map((item) => ({
      ...item,
      costPrice: undefined,
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
  const rtoPercent = settings.returnsSettings?.estimatedReturnRatePercent ?? 0; // ✅ RTO Capture

  // 2. Process each item and FREEZE the current business logic values
  return cartItems.map((item) => {
    const SP = item.price || 0; // Selling Price
    const Q = item.quantity || 0; // Quantity

    // 0-value fallback protection
    if (SP === 0 || Q === 0) {
      return {
        ...item,
        costPrice: 0, profit: 0, fees: 0, tax: 0, capital: 0,
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
        // Fallback to first tier if SP is out of range
        profitPercent = pricingTiers[0]?.profitPercent || 0;
        adSpendPercent = pricingTiers[0]?.adSpendPercent || 0;
      }
    }

    // 4. Per-Unit PKR Math (Reverse Engineering Retail Price)
    const gstAmount = SP * (gstPercent / 100);
    const feesAmount = SP * (totalFixedFeePercent / 100);
    const adSpendAmount = SP * (adSpendPercent / 100);
    const profitPerUnit = SP * (profitPercent / 100);

    const leftover = SP - (gstAmount + feesAmount + adSpendAmount + profitPerUnit);

    // 5. Derived Capital (Base Cost before Duties)
    // Formula: Capital = Leftover / (1 + Duties%)
    const capitalPerUnit = leftover / (1 + dutiesPercent / 100);

    // 6. Return Enriched Item with Audit Snapshot
    return {
      ...item,
      // Total Rupees Amounts (Stamped)
      costPrice: Math.round(capitalPerUnit),
      profit: Math.round(profitPerUnit * Q),
      fees: Math.round(feesAmount * Q),
      tax: Math.round(gstAmount * Q),
      capital: Math.round(capitalPerUnit * Q),
      
      // ✅ THE AUDIT EVIDENCE (Frozen Rates)
      appliedGstRate: gstPercent,
      appliedDutiesRate: dutiesPercent,
      appliedFeeRate: totalFixedFeePercent,
      appliedProfitRate: profitPercent,
      appliedAdSpendRate: adSpendPercent,
      appliedRtoRate: rtoPercent // ✅ Frozen RTO estimation %
    };
  });
}