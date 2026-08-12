// 📂 src/app/features/admin/inventory-cms/components/import-products/components/UploadBox.tsx (CYBER-HUD HARDENED)

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

export default function UploadBox({ file, onDrop, onRemoveFile, onAnalyze, isDragActive }: UploadBoxProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
  });

  if (!file) {
    return (
      <div
        {...getRootProps()}
        className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] shadow-xs border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-brand-primary dark:hover:border-brand-primary/50 transition-all group text-center cursor-pointer py-12"
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 border border-brand-primary/20">
          <UploadCloud size={28} className="text-brand-primary" />
        </div>
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">Click or Drag CSV File</h3>
        <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5">Supports multi-variant row parsing</p>
        {isDragActive && (
          <p className="text-xs font-bold text-brand-primary mt-2 font-mono uppercase tracking-widest animate-pulse">Drop your CSV here!</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] shadow-xs border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-brand-primary transition-all group text-center animate-in fade-in duration-300">
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-2xs">
          <FileIcon size={32} />
        </div>
        <div className="text-left leading-none space-y-1">
          <p className="font-bold text-sm text-zinc-800 dark:text-zinc-150 leading-none">{file.name}</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onRemoveFile}
          className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 cursor-pointer transition-colors"
        >
          <X size={14} className="stroke-[2.5px]" />
        </button>
      </div>
      <button
        onClick={onAnalyze}
        className="w-full max-w-sm mx-auto py-2.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
      >
        Analyze File <ChevronRight size={14} />
      </button>
    </div>
  );
}