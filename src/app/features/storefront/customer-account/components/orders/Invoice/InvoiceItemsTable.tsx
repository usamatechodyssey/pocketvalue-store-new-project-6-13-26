import { Text, View, StyleSheet } from "@react-pdf/renderer";
// ✅ FIX: IMPORT FROM SINGLE SOURCE OF TRUTH
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

      {/* Table Rows */}
      {(order.products as unknown as InvoiceItem[]).map((item, index) => (
        <View
          style={styles.tableRow}
          key={item.cartItemId || item._id || index}
          wrap={false}
        >
          <View style={[styles.tableCol, { width: "55%" }]}>
            <Text style={styles.tableCell}>{item.name}</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>{item.quantity}</Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={styles.tableCell}>
              Rs. {item.price.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.tableCol, { width: "15%", textAlign: "right" }]}>
            <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
              Rs. {(item.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};