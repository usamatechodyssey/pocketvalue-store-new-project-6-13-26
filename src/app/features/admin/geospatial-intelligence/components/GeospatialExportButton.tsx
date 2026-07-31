// 📂 src/app/features/admin/geospatial-intelligence/components/GeospatialExportButton.tsx

"use client";


import { Download } from 'lucide-react';
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import { GeospatialCityData, GeospatialResponse } from '../actions/getGeospatialIntelligence';

// ================================================================
// ✅ FLEXIBLE PROPS INTERFACE (Supports both response & city list)
// ================================================================
interface GeospatialExportButtonProps {
  data: GeospatialResponse | GeospatialCityData[] | null | undefined;
  fileName?: string;
}

export default function GeospatialExportButton(props: GeospatialExportButtonProps) {
  // ✅ Safe extraction of city list and file name
  const cityList: GeospatialCityData[] = Array.isArray(props.data)
    ? props.data
    : props.data?.cities || [];

  const exportFileName = props.fileName || "geospatial_intelligence_report";

  // ✅ CSV Escaping Function
  const escapeCsvValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const strValue = String(value);
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`;
    }
    return strValue;
  };

  const exportCSV = () => {
    if (!cityList || cityList.length === 0) {
      toastError('No geospatial records available to export.');
      return;
    }

    try {
      // Define headers based on GeospatialCityData interface
      const headers = [
        'city',
        'province',
        'revenue',
        'orders',
        'aov',
        'rtoRate',
        'growth',
        'trend',
        'isHighPotential',
      ];

      const headerRow = headers.join(',');

      const rows = cityList.map((row) => {
        return headers
          .map((key) => {
            const value = (row as any)[key];
            return escapeCsvValue(value);
          })
          .join(',');
      });

      const csv = [headerRow, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportFileName}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toastSuccess(`Exported ${cityList.length} city records successfully.`);
    } catch (error: any) {
      console.error('CSV Export Error:', error);
      toastError('Failed to export CSV. Please try again.');
    }
  };

  return (
    <button
      onClick={exportCSV}
      disabled={!cityList || cityList.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-2xs hover:shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      aria-label={`Export ${cityList.length} records to CSV`}
    >
      <Download size={14} aria-hidden="true" />
      Export CSV ({cityList.length})
    </button>
  );
}