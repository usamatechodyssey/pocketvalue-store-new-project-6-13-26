// 📂 src/app/features/admin/analytics-telemetry/components/CustomAuditNavLink.tsx (CYBER-HUD HARDENED)

"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";

export default function CustomAuditNavLink() {
  const pathname = usePathname();
  const isActive = pathname === "/admin/collections/audit-logs";

  return (
    <div className="px-2 mt-2">
      <Link
        href="/admin/collections/audit-logs"
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 no-underline hover:no-underline ${
          isActive
            ? "bg-brand-primary/10 text-brand-primary shadow-xs"
            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        }`}
      >
        <FileText size={16} className={isActive ? "text-brand-primary" : "text-zinc-400"} />
        Audit Logs
      </Link>
    </div>
  );
}