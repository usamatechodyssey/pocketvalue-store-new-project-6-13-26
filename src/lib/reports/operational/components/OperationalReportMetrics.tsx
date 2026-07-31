// src/lib/reports/operational/components/OperationalReportMetrics.tsx

import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface MetricsProps {
  metrics: {
    totalOrders: number;
    deliveredCount: number;
    cancelledCount: number;
    limboRevenue: number;
    pendingCount: number;
    fulfillmentRate: number;
    leakageRate: number;
  };
  styles: ReturnType<typeof StyleSheet.create>;
}

export const OperationalReportMetrics = ({ metrics, styles }: MetricsProps) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827", marginBottom: 12 }}>
        📊 Executive Summary
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {/* Row 1: Total Orders, Delivered, Cancelled */}
        <View style={{ width: "30%", backgroundColor: "#f9fafb", padding: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase" }}>Total Orders</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
            {metrics.totalOrders.toLocaleString()}
          </Text>
        </View>
        <View style={{ width: "30%", backgroundColor: "#f0fdf4", padding: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase" }}>Delivered</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#22c55e" }}>
            {metrics.deliveredCount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 8, color: "#22c55e" }}>{metrics.fulfillmentRate}% fulfillment</Text>
        </View>
        <View style={{ width: "30%", backgroundColor: "#fef2f2", padding: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase" }}>Cancelled</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#ef4444" }}>
            {metrics.cancelledCount.toLocaleString()}
          </Text>
          <Text style={{ fontSize: 8, color: "#ef4444" }}>{metrics.leakageRate}% leakage</Text>
        </View>

        {/* Row 2: Limbo Revenue, Pending Orders */}
        <View style={{ width: "45%", backgroundColor: "#fffbeb", padding: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase" }}>Limbo Revenue (Stuck)</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#f59e0b" }}>
            Rs. {metrics.limboRevenue.toLocaleString()}
          </Text>
        </View>
        <View style={{ width: "45%", backgroundColor: "#f3f4f6", padding: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase" }}>Pending Orders</Text>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6b7280" }}>
            {metrics.pendingCount.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};