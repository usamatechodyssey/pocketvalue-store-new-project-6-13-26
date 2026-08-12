// 📂 src/app/features/storefront/customer-account/components/orders/Invoice/InvoiceItemsTable.tsx (FULLY LOCALIZED)

import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { ClientOrder } from '@/models/Order';

interface InvoiceItemsTableProps {
  order: ClientOrder;
  styles: ReturnType<typeof StyleSheet.create>;
}

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  cartItemId?: string;
  _id?: string;
}

// ================================================================
// 🚀 INVOICE LINE ITEMS TABLE RENDERER
// ================================================================
export const InvoiceItemsTable = ({
  order,
  styles,
}: InvoiceItemsTableProps) => {
  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <View style={[styles.tableHeaderCol, { width: "55%" }]}>
          <Text>Item</Text>
        </View>
        <View style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}>
          <Text>Qty</Text>
        </View>
        <View style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}>
          <Text>Price</Text>
        </View>
        <View style={[styles.tableHeaderCol, { width: "15%", textAlign: "right" }]}>
          <Text>Total</Text>
        </View>
      </View>

      {/* Table Rows (With en-PK Localized Cells) */}
      {(order.products as unknown as InvoiceItem[]).map((item, index) => (
        <View
          style={styles.tableRow}
          key={item.cartItemId || item._id || index}
          wrap={false} // 🛡️ Prevents page-break cutting on single product texts
        >
          {/* 1. Item Name Column */}
          <View style={[styles.tableCol, { width: "55%" }]}>
            <Text style={styles.tableCell}>{item.name}</Text>
          </View>
          
          {/* 2. Quantity Column */}
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>{item.quantity}</Text>
          </View>
          
          {/* 3. Unit Price Column (en-PK Locked) */}
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>
              Rs. {item.price.toLocaleString("en-PK")}
            </Text>
          </View>
          
          {/* 4. Line Total Column (en-PK Locked) */}
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Rs. {(item.price * item.quantity).toLocaleString("en-PK")}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};