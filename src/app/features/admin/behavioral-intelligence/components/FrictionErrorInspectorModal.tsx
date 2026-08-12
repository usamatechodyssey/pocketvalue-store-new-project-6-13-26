// 📂 src/app/features/admin/behavioral-intelligence/components/FrictionErrorInspectorModal.tsx

"use client";

import React from "react";
import { X, Copy, Terminal, AlertCircle, FileCode, Radio } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";

interface FrictionErrorInspectorModalProps {
  event: any | null;
  onClose: () => void;
}

export default function FrictionErrorInspectorModal({
  event,
  onClose,
}: FrictionErrorInspectorModalProps) {
  if (!event) return null;

  const isJsException = event.eventType === "js_exception";
  const metadata = event.metadata || {};

  // Extract variables
  const errorMessage = isJsException 
    ? metadata.error_message || "Unknown Javascript Exception"
    : `Checkout Failure: ${metadata.error_code || "N/A"}`;
    
  const errorStack = metadata.error_stack || "No stack trace recorded.";
  const file = metadata.file || "N/A";
  const line = metadata.line || 0;
  const column = metadata.column || 0;
  const path = event.path || "/";

  const copyStackToClipboard = () => {
    navigator.clipboard.writeText(errorStack)
      .then(() => {
        toastSuccess("Stack trace copied to clipboard!");
      })
      .catch(() => {
        toastError("Failed to copy stack trace.");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Error Inspector"
      >
        {/* 🟥 TOP RED CRASH BANNER */}
        <div className="bg-red-950/40 border-b border-red-500/20 p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-500 rounded-xl border border-red-500/30 shrink-0">
              <AlertCircle size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {isJsException ? "Runtime Exception" : "Gateway Blocker"}
              </span>
              <h2 className="text-sm sm:text-base font-black text-red-500 font-mono mt-1.5 leading-tight break-all">
                {errorMessage}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0 border border-zinc-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* 📋 METADATA ZONE */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/40 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-2">
            <p className="text-zinc-500 uppercase text-[9px] font-bold tracking-wider">Crashed Path / Page</p>
            <p className="text-zinc-200 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 truncate font-semibold">
              🔗 {path}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-zinc-500 uppercase text-[9px] font-bold tracking-wider">Source File Location</p>
            <p className="text-zinc-200 bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 truncate font-semibold flex items-center gap-1.5">
              <FileCode size={13} className="text-brand-primary" /> {file} {line > 0 && `(Line: ${line})`}
            </p>
          </div>
        </div>

        {/* 💻 DEBUBGER TERMINAL PANEL */}
        <div className="p-5 flex-1 flex flex-col min-h-0 bg-zinc-950/80">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-850 mb-3 shrink-0">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Terminal size={12} className="text-purple-500" /> STACK TRACE CONSOLE
            </span>
            <button
              onClick={copyStackToClipboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-all border border-zinc-700 cursor-pointer shadow-sm active:scale-95"
            >
              <Copy size={11} /> Copy Stack
            </button>
          </div>

          {/* Scrollable Stack Box */}
          <div className="flex-1 overflow-auto bg-zinc-950 p-4 border border-zinc-850 rounded-2xl custom-scrollbar max-h-64 sm:max-h-72">
            <pre className="text-[10px] font-mono text-zinc-300 select-text leading-relaxed whitespace-pre font-medium">
              {errorStack}
            </pre>
          </div>
        </div>

        {/* 📊 INSPECTOR FOOTER */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 text-center flex items-center justify-between gap-4 flex-wrap text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest shrink-0">
          <span className="flex items-center gap-1.5"><Radio size={12} className="text-emerald-500 animate-pulse" /> Neural Debugger Engine Active</span>
          <span>Logged: {format(parseISO(event.createdAt), "MMM dd, hh:mm:ss a")}</span>
        </div>
      </div>
    </div>
  );
}