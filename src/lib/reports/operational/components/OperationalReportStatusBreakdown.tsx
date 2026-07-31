// src/lib/reports/operational/components/OperationalReportStatusBreakdown.tsx

import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface StatusBreakdownProps {
  statusBreakdown: Record<string, number>;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const OperationalReportStatusBreakdown = ({
  statusBreakdown,
  styles,
}: StatusBreakdownProps) => {
  const entries = Object.entries(statusBreakdown).filter(([_, count]) => count > 0);

  if (entries.length === 0) return null;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
        🔍 Limbo Status Breakdown
      </Text>

      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <View style={[styles.tableHeaderCol, { width: "60%" }]}>
            <Text>Status</Text>
          </View>
          <View style={[styles.tableHeaderCol, { width: "40%", textAlign: "right" }]}>
            <Text>Count</Text>
          </View>
        </View>

        {/* Rows */}
        {entries.map(([status, count]) => (
          <View style={styles.tableRow} key={status}>
            <View style={[styles.tableCol, { width: "60%" }]}>
              <Text>{status}</Text>
            </View>
            <View style={[styles.tableCol, { width: "40%", textAlign: "right" }]}>
              <Text style={{ fontWeight: "bold" }}>{count}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};