
//shipping-calculator.ts
import { ShippingRule } from '@/types';


// --- ✅ NEW PAYLOAD ACTION IMPORT ---
import { getShippingRulesAction } from '@/app/features/storefront/cart-checkout/actions/shippingActions';

export interface ShippingCalculation {
  cost: number;
  displayText: string;
  isFree: boolean;
  ruleName?: string;
  isOnCall?: boolean; 
}

export function calculateShipping(subtotal: number, rules: ShippingRule[]): ShippingCalculation {
    if (!rules || rules.length === 0) {
        return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'fallback_free' };
    }

    let bestMatch: ShippingRule | null = null;

    for (const rule of rules) {
        if (subtotal >= rule.minAmount) {
            if (!bestMatch || rule.minAmount > bestMatch.minAmount) {
                bestMatch = rule;
            }
        }
    }

    if (bestMatch) {
        const { cost, name, isOnCall } = bestMatch;

        if (isOnCall) {
            return { 
                cost: 0, 
                displayText: "Calculated on Call", 
                isFree: false, 
                ruleName: name,
                isOnCall: true 
            };
        }

        return { 
            cost: cost, 
            displayText: cost > 0 ? `Rs. ${cost.toLocaleString()}` : "FREE", 
            isFree: cost === 0, 
            ruleName: name,
            isOnCall: false
        };
    }

    return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'fallback_no_rule_found' };
}

// 🔥 THE FIX IS HERE: Ab ye hamare naye Payload action se rules fetch karega
export async function calculateShippingCostServer(subtotal: number): Promise<ShippingCalculation> {
    try {
        const rules = await getShippingRulesAction(); // ✅ Switch to Payload Action
        return calculateShipping(subtotal, rules);
    } catch (error) {
        console.error("Error in calculateShippingCostServer:", error);
        return { cost: 0, displayText: "FREE", isFree: true, ruleName: 'server_fallback_error' };
    }
}