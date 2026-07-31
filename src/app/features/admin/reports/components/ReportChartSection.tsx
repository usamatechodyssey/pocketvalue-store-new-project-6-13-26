// 📂 src/app/features/admin/reports/components/ReportChartSection.tsx (FULLY LOCALIZED & THEME HARDENED)

"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ReportColumn } from "../configs/reportConfigs";

// ================================================================
// ✅ TYPES
// ================================================================
type ChartType = "line" | "bar" | "area" | "pie";

interface ReportChartSectionProps {
  data: any[];
  columns: ReportColumn[];
  isLoading?: boolean;
  emptyMessage?: string;
  height?: number;
}

// ================================================================
// 🎨 CHART COLORS (Enterprise Palette)
// ================================================================
const CHART_COLORS = [
  "#f97316", // brand primary
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
];

// ================================================================
// 🔧 HELPERS: Detect chart types & keys
// ================================================================
const detectNumericColumns = (columns: ReportColumn[]): ReportColumn[] => {
  return columns.filter(
    (col) =>
      col.format === "currency" ||
      col.format === "number" ||
      col.format === "percentage"
  );
};

const detectDateColumn = (columns: ReportColumn[]): ReportColumn | null => {
  return columns.find((col) => col.format === "date") || null;
};

const detectCategoryColumn = (columns: ReportColumn[]): ReportColumn | null => {
  return (
    columns.find(
      (col) =>
        (col.format === "string" || col.format === "text") &&
        col.key !== "date" &&
        !col.key.includes("id") &&
        !col.key.includes("ref") &&
        !col.key.includes("sku")
    ) || null
  );
};

// ================================================================
// 🧩 CHART RENDERER (100% en-PK Localized & Theme Hardened)
// ================================================================
const ChartRenderer = ({
  data,
  chartType,
  xKey,
  yKeys,
}: {
  data: any[];
  chartType: ChartType;
  xKey: string;
  yKeys: string[];
}) => {
  const colors = CHART_COLORS;

  // Localized formatter helper
  const formatTooltipPKR = (value: any) => {
    return `Rs. ${new Intl.NumberFormat("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value))}`;
  };

  // ✅ PIE CHART RENDERER
  if (chartType === "pie") {
    const pieData = data.map((item) => ({
      name: item[xKey] || "Unknown",
      value: item[yKeys[0]] || 0,
    }));

    const renderPieShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
      const RADIAN = Math.PI / 180;
      
      const x1 = cx + outerRadius * Math.cos(startAngle * RADIAN);
      const y1 = cy + outerRadius * Math.sin(startAngle * RADIAN);
      const x2 = cx + outerRadius * Math.cos(endAngle * RADIAN);
      const y2 = cy + outerRadius * Math.sin(endAngle * RADIAN);
      
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
      
      const path = [
        `M ${cx + innerRadius * Math.cos(startAngle * RADIAN)} ${cy + innerRadius * Math.sin(startAngle * RADIAN)}`,
        `L ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${cx + innerRadius * Math.cos(endAngle * RADIAN)} ${cy + innerRadius * Math.sin(endAngle * RADIAN)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${cx + innerRadius * Math.cos(startAngle * RADIAN)} ${cy + innerRadius * Math.sin(startAngle * RADIAN)}`,
        "Z",
      ].join(" ");

      return (
        <path
          d={path}
          fill={fill}
          stroke="var(--stroke-color, #27272a)" // ✅ Dynamic stroke variable
          strokeWidth={1}
          className="transition-opacity hover:opacity-85 cursor-pointer outline-hidden"
        />
      );
    };

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => {
              const safePercent = percent ?? 0;
              return `${name}: ${(safePercent * 100).toFixed(0)}%`;
            }}
            labelLine={true}
            shape={renderPieShape}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "10px",
              color: "#fff",
              fontSize: 11,
            }}
            formatter={formatTooltipPKR} // ✅ PKR Localized
          />
          <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ✅ LINE / BAR / AREA CHARTS RENDERER
  const ChartComponent =
    chartType === "line"
      ? LineChart
      : chartType === "area"
      ? AreaChart
      : BarChart;

  const DataComponent =
    chartType === "line" ? Line : chartType === "area" ? Area : Bar;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.25} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 9, fill: "#a1a1aa", fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: "#a1a1aa", fontFamily: "monospace" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "10px",
            color: "#fff",
            fontSize: 11,
          }}
          formatter={formatTooltipPKR} // ✅ PKR Localized
        />
        <Legend wrapperStyle={{ fontSize: 10, color: "#a1a1aa" }} />
        {yKeys.map((key, index) => (
          <DataComponent
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function ReportChartSection({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data available to visualize.",
  height = 320,
}: ReportChartSectionProps) {
  
  const { chartType, xKey, yKeys } = useMemo(() => {
    const dateCol = detectDateColumn(columns);
    const numericCols = detectNumericColumns(columns);
    const categoryCol = detectCategoryColumn(columns);

    let detectedXKey = dateCol?.key || categoryCol?.key || columns[0]?.key || "";
    let detectedYKeys = numericCols.map((c) => c.key);

    if (detectedYKeys.length === 0) {
      return { chartType: "bar" as ChartType, xKey: detectedXKey, yKeys: [] };
    }

    let detectedType: ChartType = "bar";
    if (detectedYKeys.length === 1 && (categoryCol || dateCol)) {
      detectedType = "pie";
    } else if (dateCol) {
      detectedType = "line";
    } else if (detectedYKeys.length > 2) {
      detectedType = "area";
    }

    return {
      chartType: detectedType,
      xKey: detectedXKey,
      yKeys: detectedYKeys,
    };
  }, [columns]);

  // Loading State (Skeleton card)
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-700 rounded mb-4" />
        <div className="h-64 w-full bg-zinc-100 dark:bg-zinc-850 rounded" />
      </div>
    );
  }

  // Empty / No Data State (Dashed Style)
  if (!data || data.length === 0 || yKeys.length === 0) {
    return (
      <div className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-[2.5rem] bg-zinc-50/50 dark:bg-zinc-900/10 p-12 text-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="p-3 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl shadow-2xs">
            <span className="text-xl">📈</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              No Chart Data Available
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {emptyMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono">
          Visual Analytics
        </h3>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-900/40 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 uppercase">
          {chartType === "pie" ? "Distribution" : `${chartType} render`}
          {yKeys.length > 1 && ` · ${yKeys.length} metrics`}
        </span>
      </div>
      <div style={{ width: "100%", height: `${height}px` }}>
        <ChartRenderer
          data={data}
          chartType={chartType}
          xKey={xKey}
          yKeys={yKeys}
        />
      </div>
      {yKeys.length > 3 && (
        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 text-center mt-3 font-medium italic font-mono">
          * Overlaying {yKeys.length} operational indicators. Hover over data nodes for details.
        </p>
      )}
    </div>
  );
}