// src/app/features/admin/inventory-cms/components/import-products/components/UploadBox.tsx

"use client";

import { File as FileIcon, UploadCloud, X, ChevronRight } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadBoxProps {
  file: File | null;
  onDrop: (acceptedFiles: File[]) => void;
  onRemoveFile: () => void;
  onAnalyze: () => void;
  isDragActive: boolean;
}

export function UploadBox({ file, onDrop, onRemoveFile, onAnalyze, isDragActive }: UploadBoxProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  if (!file) {
    return (
      <div
        {...getRootProps()}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary transition-all group text-center cursor-pointer py-10"
      >
        <input {...getInputProps()} />
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud size={40} className="text-brand-primary" />
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Click or Drag CSV File</h3>
        <p className="text-gray-500 text-sm mt-2">Supports multi-variant rows</p>
        {isDragActive && (
          <p className="text-sm font-semibold text-brand-primary mt-2">Drop your CSV here!</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-primary transition-all group text-center animate-in fade-in">
      <div className="flex items-center justify-center gap-4 mb-6">
        <FileIcon size={48} className="text-green-500 shadow-green-200 drop-shadow-md" />
        <div className="text-left">
          <p className="font-bold text-lg text-gray-800 dark:text-white">{file.name}</p>
          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onRemoveFile}
          className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
        >
          <X size={18} />
        </button>
      </div>
      <button
        onClick={onAnalyze}
        className="w-full max-w-sm mx-auto py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-lg shadow-lg shadow-brand-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        Analyze File <ChevronRight size={18} />
      </button>
    </div>
  );
}