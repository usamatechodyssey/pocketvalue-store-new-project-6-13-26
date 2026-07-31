import React from 'react';
import { Text, View, StyleSheet } from "@react-pdf/renderer";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
import { ClientOrder } from '@/models/Order';

interface InvoiceAddressProps {
  order: ClientOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const InvoiceAddress = ({ order, styles }: InvoiceAddressProps) => {
  return (
    <View style={styles.addressSection}>
      <View style={styles.addressBox}>
        <Text style={styles.sectionTitle}>Billed To</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.fullName}
        </Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.address}, {order.shippingAddress.area}
        </Text>
        <Text style={styles.addressText}>
          {order.shippingAddress.city}, {order.shippingAddress.province}
        </Text>
      </View>
      <View style={[styles.addressBox, { textAlign: 'right' }]}>
        <Text style={styles.sectionTitle}>Payment Info</Text>
        <Text style={styles.addressText}>Method: {order.paymentMethod}</Text>
        <Text style={styles.addressText}>Status: {order.paymentStatus}</Text>
      </View>
    </View>
  );
};