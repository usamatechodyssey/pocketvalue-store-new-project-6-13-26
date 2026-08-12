// 📂 src/app/features/storefront/customer-account/components/orders/Invoice/InvoiceHeader.tsx (FULLY LOCALIZED)

import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { ClientOrder } from '@/models/Order';

interface InvoiceHeaderProps {
  order: ClientOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

// ================================================================
// 🚀 INVOICE COPRORATE HEADER RENDERER
// ================================================================
export const InvoiceHeader = ({ order, styles }: InvoiceHeaderProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.pocketvalue.pk';
  
  return (
    <View style={styles.header}>
      {/* Left: Company Details & Contact coordinates */}
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

      {/* Right: Invoice Metadata */}
      <View style={styles.invoiceHeader}>
        <Text style={styles.invoiceTitle}>ORDER SUMMARY</Text>
        <Text style={styles.invoiceDetail}>Order ID: {order.orderId}</Text>
        
        {/* ✅ FIX: Strictly formats issuance date to Pakistan Standard time (en-PK) */}
        <Text style={styles.invoiceDetail}>
          Date Issued: {new Date(order.createdAt).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>
    </View>
  );
};