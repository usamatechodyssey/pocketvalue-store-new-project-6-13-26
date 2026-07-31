import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
import { ClientOrder } from '@/models/Order';

interface InvoiceHeaderProps {
  order: ClientOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceHeader = ({ order, styles }: InvoiceHeaderProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketvalue.pk';
  
  return (
    <View style={styles.header}>
      <View style={styles.companyDetails}>
        <Image
          style={styles.logo}
          src={`${baseUrl}/Logo1.png`}
        />
        <Text style={styles.companyName}>PocketValue</Text>
        <Text style={styles.companyAddress}>
          Plot No. L-73, Street No. 12, Sector 32/A,
        </Text>
        <Text style={styles.companyAddress}>
          Labour Colony, Landhi, Karachi, Pakistan
        </Text>
        <Text style={styles.companyAddress}>+92 303 0234064</Text>
        <Text style={styles.companyAddress}>support@pocketvalue.pk</Text>
      </View>

      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceTitle}>ORDER SUMMARY</Text>
        <Text style={styles.invoiceDetail}>Order ID: {order.orderId}</Text>
        <Text style={styles.invoiceDetail}>
          Date Issued: {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};