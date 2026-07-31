// /src/app/account/orders/[orderId]/_components/InvoiceSummary.tsx

import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface InvoiceSummaryProps {
  subtotal: number;
  shippingCost: number;
  grandTotal: number;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceSummary = ({ subtotal, shippingCost, grandTotal, styles }: InvoiceSummaryProps) => {
  return (
    <View style={styles.summarySection}>
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {subtotal.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost.toLocaleString()}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotalSection]}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>Rs. {grandTotal.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};