import { Text, View, StyleSheet } from "@react-pdf/renderer";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
import { ClientOrder } from '@/models/Order';

interface InvoiceFooterProps {
  order: ClientOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceFooter = ({ order, styles }: InvoiceFooterProps) => {
  return (
    <View style={styles.footer}>
      <Text>
        Thank you for your purchase! For any support, please contact support@pocketvalue.pk.
      </Text>
      <Text style={styles.verificationNote}>
        Note: This document is computer generated. Validity of this order is subject to 
        verification with PocketValue's official database record for Order ID: {order.orderId}.
      </Text>
    </View>
  );
};