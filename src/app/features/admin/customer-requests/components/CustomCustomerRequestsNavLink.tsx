// 📂 src/app/features/admin/customer-requests/components/CustomCustomerRequestsNavLink.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MailQuestion } from "lucide-react"; // Dynamic, intuitive icon representing customer questions/demands

const CustomCustomerRequestsNavLink: React.FC = () => {
  const pathname = usePathname();
  const isActive = pathname.startsWith("/admin/customer-requests");

  return (
    <div style={{ padding: "0 0.5rem" }}>
      <Link 
        href="/admin/customer-requests"
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px", 
          padding: "8px 12px", 
          textDecoration: "none", 
          color: isActive ? "var(--theme-elevation-800)" : "var(--theme-elevation-500)", 
          backgroundColor: isActive ? "var(--theme-elevation-100)" : "transparent",
          borderRadius: "4px", 
          fontSize: "14px", 
          fontWeight: 500, 
          transition: "all 0.2s ease"
        }}
      >
        <MailQuestion size={18} />
        Customer Requests
      </Link>
    </div>
  );
};

export default CustomCustomerRequestsNavLink;