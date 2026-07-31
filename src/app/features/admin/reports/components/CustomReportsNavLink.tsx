// 📂 src/app/features/admin/reports/components/CustomReportsNavLink.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

const CustomReportsNavLink: React.FC = () => {
  const pathname = usePathname();
  
  // ✅ Check if current path is exactly '/admin/reports-index' or starts with '/admin/reports/'
  const isActive = pathname?.startsWith("/admin/reports-index") ?? false;
  const isReportDetail = pathname?.startsWith("/admin/reports/") ?? false;

  return (
    <div style={{ padding: "0 0.5rem" }}>
      <Link
        href="/admin/reports-index"
        aria-current={isActive || isReportDetail ? "page" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 12px",
          textDecoration: "none",
          color: isActive || isReportDetail ? "var(--theme-elevation-800)" : "var(--theme-elevation-500)",
          backgroundColor: isActive || isReportDetail ? "var(--theme-elevation-100)" : "transparent",
          borderRadius: "4px",
          fontSize: "14px",
          fontWeight: 500,
          transition: "all 0.2s ease",
        }}
      >
        <FileSpreadsheet size={18} />
        Reports
      </Link>
    </div>
  );
};

export default CustomReportsNavLink;