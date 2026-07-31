
// 📂 src/app/features/admin/executive-kpi/components/ExecutiveDashboardContent.tsx (UPDATED TO 8-CARD CAPITAL & COURIER VAULT GRID)

"use client";

import {
  Banknote,
  ShoppingBag,
  Users,
  AlertTriangle,
  Wallet,
  Truck,
  Clock,
  Tag,
} from "lucide-react";
import AnalyticsStatCard from "./StatCard";
import { ExecutiveSummary } from "../actions/getExecutiveAnalytics";

interface ExecutiveDashboardContentProps {
  data: ExecutiveSummary | null;
}

export default function ExecutiveDashboardContent({
  data,
}: ExecutiveDashboardContentProps) {
  // ✅ ENTERPRISE FIX: 8-Card Skeleton Loader State
  if (!data) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm animate-pulse"
            >
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      
      {/* 🔹 ROW 1: FINANCIAL CAPITAL & CASH FLOW (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1: Gross Revenue */}
        <AnalyticsStatCard
          title="Gross Revenue"
          value={`Rs. ${data.revenue.gross.toLocaleString('en-PK')}`}
          icon={Banknote}
          trend={data.revenue.growthPercentage}
          subtext={`Est. Profit: Rs. ${data.revenue.netProfitEstimate.toLocaleString('en-PK')}`}
          colorVariant="success"
          href="/admin/reports-index"
        />

        {/* Stat Card 2: Realized Cash In Bank (Settled) */}
        <AnalyticsStatCard
          title="Realized Cash (Bank)"
          value={`Rs. ${data.revenue.deliveredCash.toLocaleString('en-PK')}`}
          icon={Wallet}
          subtext="Settled & Paid in Bank"
          colorVariant="success"
          href="/admin/orders"
        />

        {/* Stat Card 3: Courier COD Vault (Un-remitted Courier Money) */}
        <AnalyticsStatCard
          title="Courier COD Vault"
          value={`Rs. ${data.revenue.courierVault.toLocaleString('en-PK')}`}
          icon={Truck}
          subtext="Delivered - Awaiting Settlement"
          colorVariant="warning"
          href="/admin/orders"
        />

        {/* Stat Card 4: Pipeline Capital (Pending Fulfillment) */}
        <AnalyticsStatCard
          title="Pipeline Capital"
          value={`Rs. ${data.revenue.pipelineCapital.toLocaleString('en-PK')}`}
          icon={Clock}
          subtext="Unfulfilled / Processing Sales"
          colorVariant="info"
          href="/admin/orders"
        />

      </div>

      {/* 🔹 ROW 2: OPERATIONS, MARKETING & RISK (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 5: Orders Pulse */}
        <AnalyticsStatCard
          title="Orders Pulse"
          value={data.orders.total}
          icon={ShoppingBag}
          subtext={`${data.orders.velocity} orders / hr velocity`}
          colorVariant="primary"
          href="/admin/orders"
        />

        {/* Stat Card 6: Promotional Discounts (Coupon Burn) */}
        <AnalyticsStatCard
          title="Coupon Discounts"
          value={`Rs. ${data.revenue.totalDiscounts.toLocaleString('en-PK')}`}
          icon={Tag}
          subtext="Total Promotional Burn"
          colorVariant="error"
          href="/admin/marketing-hub"
        />

        {/* Stat Card 7: Active Customers */}
        <AnalyticsStatCard
          title="Active Customers"
          value={data.customers.total.toLocaleString('en-PK')}
          icon={Users}
          subtext={`${data.customers.newToday} new today`}
          colorVariant="info"
          href="/admin/users-explorer"
        />

        {/* Stat Card 8: Inventory Risk */}
        <AnalyticsStatCard
          title="Inventory Risk"
          value={data.inventory.criticalStockCount}
          icon={AlertTriangle}
          subtext={`${data.inventory.outOfStockCount} variants depleted`}
          colorVariant={data.inventory.criticalStockCount > 0 ? "error" : "warning"}
          href="/admin/inventory-risk"
        />

      </div>

    </div>
  );
}