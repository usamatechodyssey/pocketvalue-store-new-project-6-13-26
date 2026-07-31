// src/lib/reports/operational/components/OperationalReportHeader.tsx

import React from "react";
import { Text, View, Image, StyleSheet } from "@react-pdf/renderer";

interface HeaderProps {
  range: { from: Date; to: Date };
  generatedAt: Date;
  styles: ReturnType<typeof StyleSheet.create>;
}

export const OperationalReportHeader = ({ range, generatedAt, styles }: HeaderProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.pocketvalue.pk";

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
      {/* Left: Logo + Company */}
      <View>
        <Image style={{ width: 60, height: 60, objectFit: "contain" }} src={`${baseUrl}/Logo1.png`} />
        <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827", marginTop: 4 }}>PocketValue</Text>
        <Text style={{ fontSize: 8, color: "#6b7280" }}>
          Plot No. L-73, Street No. 12, Sector 32/A, Labour Colony, Landhi, Karachi
        </Text>
      </View>

      {/* Right: Title + Details */}
      <View style={{ textAlign: "right" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827" }}>Operational Report</Text>
        <Text style={{ fontSize: 10, color: "#4b5563", marginTop: 4 }}>
          {range.from.toDateString()} — {range.to.toDateString()}
        </Text>
        <Text style={{ fontSize: 8, color: "#9ca3af", marginTop: 2 }}>
          Generated: {generatedAt.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};