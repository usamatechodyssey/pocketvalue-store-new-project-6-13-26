"use client";

import AccountSidebar from "@/app/features/storefront/customer-account/components/AccountSidebar";

export default function AccountSidebarClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* === 1. DESKTOP SIDEBAR === */}
      <div
        className="hidden lg:block w-72 shrink-0"
        aria-label="Account navigation sidebar"
      >
        <div className="sticky top-28">
          <AccountSidebar />
        </div>
      </div>

      {/* === 2. MAIN CONTENT AREA === */}
      <div className="grow min-h-125">
        {children}
      </div>
    </div>
  );
}