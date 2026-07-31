// src/lib/reports/operational/components/OperationalReportComparison.tsx

import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

interface ComparisonProps {
  comparisonData: any; // Type from getOperationalComparisonPayload
  styles: ReturnType<typeof StyleSheet.create>;
}

export const OperationalReportComparison = ({ comparisonData, styles }: ComparisonProps) => {
  if (!comparisonData || !comparisonData.metrics) return null;

  const metrics = comparisonData.metrics;
  const range = comparisonData.range;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827", marginBottom: 8 }}>
        📈 Period-over-Period Comparison
      </Text>
      <Text style={{ fontSize: 8, color: "#6b7280", marginBottom: 8 }}>
        {range.current.from.toDateString()} — {range.current.to.toDateString()} vs {range.previous.from.toDateString()} —{" "}
        {range.previous.to.toDateString()}
      </Text>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <View style={[styles.tableHeaderCol, { width: "25%" }]}>
            <Text>Metric</Text>
          </View>
          <View style={[styles.tableHeaderCol, { width: "25%", textAlign: "right" }]}>
            <Text>Current</Text>
          </View>
          <View style={[styles.tableHeaderCol, { width: "25%", textAlign: "right" }]}>
            <Text>Previous</Text>
          </View>
          <View style={[styles.tableHeaderCol, { width: "25%", textAlign: "right" }]}>
            <Text>Change</Text>
          </View>
        </View>

        {Object.entries(metrics).map(([key, metric]: [string, any]) => (
          <View style={styles.tableRow} key={key}>
            <View style={[styles.tableCol, { width: "25%" }]}>
              <Text style={{ fontWeight: "bold" }}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Text>
            </View>
            <View style={[styles.tableCol, { width: "25%", textAlign: "right" }]}>
              <Text>{metric.current.toLocaleString()}</Text>
            </View>
            <View style={[styles.tableCol, { width: "25%", textAlign: "right" }]}>
              <Text>{metric.previous.toLocaleString()}</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                { width: "25%", textAlign: "right" },
              ]}
            >
              <Text
                style={{
                  color:
                    metric.trend === "UP"
                      ? "#22c55e"
                      : metric.trend === "DOWN"
                      ? "#ef4444"
                      : "#6b7280",
                  fontWeight: "bold",
                }}
              >
                {metric.trend === "UP" ? "▲" : metric.trend === "DOWN" ? "▼" : "—"} {metric.change}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};