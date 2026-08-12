// 📂 src/app/features/storefront/customer-account/components/orders/Invoice/InvoiceSummary.tsx (FBR TAX COMPLIANT)

import { Text, View, StyleSheet } from "@react-pdf/renderer";

// ================================================================
// ✅ TYPES (Strictly Reconciled with IOrder Coupon & Tax Schemas)
// ================================================================
interface InvoiceSummaryProps {
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  tax: number; // ✅ Snapshotted total tax collected (FBR GST)
  coupon?: {
    code: string;
    amount: number;
  } | null;
  styles: ReturnType<typeof StyleSheet.create>;
}

// ================================================================
// 🚀 INVOICE SUMMARY LEDGER RENDERER
// ================================================================
export const InvoiceSummary = ({ 
  subtotal, 
  shippingCost, 
  grandTotal, 
  tax,
  coupon, 
  styles 
}: InvoiceSummaryProps) => {
  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryBox}>
        {/* 1. Subtotal Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            Rs. {subtotal.toLocaleString("en-PK")}
          </Text>
        </View>

        {/* 2. Shipping Cost Row */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost.toLocaleString("en-PK")}`}
          </Text>
        </View>

        {/* 3. Dynamic Coupon Discount Row */}
        {coupon && coupon.amount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount ({coupon.code})</Text>
            <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
              - Rs. {coupon.amount.toLocaleString("en-PK")}
            </Text>
          </View>
        )}

        {/* 4. FBR GST Tax Included Row (🛡️ Legally Required Tax Compliance Stamp) */}
        {tax > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>FBR GST Tax (Included)</Text>
            <Text style={styles.summaryValue}>
              Rs. {tax.toLocaleString("en-PK")}
            </Text>
          </View>
        )}

        {/* 5. Grand Total Row */}
        <View style={[styles.summaryRow, styles.grandTotalSection]}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>
            Rs. {grandTotal.toLocaleString("en-PK")}
          </Text>
        </View>
      </View>
    </View>
  );
};