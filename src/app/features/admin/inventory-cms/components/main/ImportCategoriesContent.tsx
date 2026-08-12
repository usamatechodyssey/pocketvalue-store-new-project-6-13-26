// 📂 src/app/features/admin/inventory-cms/components/main/ImportCategoriesContent.tsx (CYBER-HUD HARDENED)

"use client";

import { useState, useCallback, useRef, useEffect, useTransition } from "react";
import Papa from "papaparse";
import { 
    UploadCloud, FileText, CheckCircle, XCircle, 
    Loader2, File, X, Terminal, ChevronRight,
    Play,
    RefreshCw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

// ✅ Dynamic Categories Server Action
import { batchCreateCategoriesPayload } from "@/app/features/admin/inventory-cms/actions/payloadCategoryActions";
// ✅ Dynamic Categories CSV Template
import { CATEGORY_CSV_TEMPLATE } from "@/app/features/admin/inventory-cms/components/main/CategoryCsvTemplate"; 

// ✅ Type Definitions
type ProcessStatus = "idle" | "parsing" | "processing" | "completed"; 
interface Stats { processed: number; success: number; failed: number; }
interface BatchResult { success: boolean; successful: number; failed: number; errors: string[]; message?: string; }

export default function ImportCategoriesContent() {
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  
  // Data & Queue
  const [pendingCategories, setPendingCategories] = useState<any[]>([]); 
  const [totalInitialCount, setTotalInitialCount] = useState(0);

  // Statistics
  const [stats, setStats] = useState<Stats>({ processed: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]); 
  
  // Control Refs
  const shouldStopRef = useRef(false);
  const [isPending, startTransition] = useTransition();

  // --- 1. LOGGING SYSTEM (TERMINAL) ---
  const addLog = (message: string, logType: 'info' | 'success' | 'error' | 'warning' = 'info') => {
      const timestamp = new Date().toLocaleTimeString("en-PK", { hour12: false, hour: "2-digit", minute: "2-digit", second:"2-digit" });
      let prefixIcon = '';
      if (logType === 'success') prefixIcon = '✅';
      else if (logType === 'error') prefixIcon = '❌';
      else if (logType === 'warning') prefixIcon = '⚠️';
      else prefixIcon = '💬';

      setLogs(prev => [`[${timestamp}] ${prefixIcon} ${message}`, ...prev].slice(0, 50));
  };

  // --- 2. FILE HANDLING ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (acceptedFiles[0].type !== "text/csv") {
        addLog("Invalid file type. CSV only.", "error");
        toast.error("Invalid file type. CSV only.");
        return;
      }
      setFile(acceptedFiles[0]);
      resetAll();
    }
  }, [addLog]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false, accept: { "text/csv": [".csv"] },
  });

  const resetAll = () => {
    setStatus("idle");
    setPendingCategories([]);
    setStats({ processed: 0, success: 0, failed: 0 });
    setLogs([]);
    setTotalInitialCount(0);
    shouldStopRef.current = false;
  };

  // --- 3. CSV PARSING ---
  const parseFile = () => {
    if (!file) return;
    setStatus("parsing");
    addLog("Analyzing CSV file structure...");

    Papa.parse(file, {
        header: true, skipEmptyLines: true, comments: "//",
        complete: (results) => {
            const rawData: any[] = results.data;
            if (rawData.length === 0) {
                toast.error("CSV is empty.");
                setStatus("idle");
                return;
            }

            setPendingCategories(rawData);
            setTotalInitialCount(rawData.length);
            setStatus("idle");
            addLog(`✅ Analysis Complete. Found ${rawData.length} categories.`, "success");
            toast.success(`Ready to import ${rawData.length} categories.`);
        },
        error: (err) => {
            toast.error("CSV Parse Error");
            addLog(`Error parsing CSV: ${err.message}`, "error");
            setStatus("idle");
        }
    });
  };

  // --- 4. CORE PROCESSING LOOP ---
  const startProcessing = async () => {
    if (pendingCategories.length === 0) return;

    shouldStopRef.current = false;
    setStatus("processing");
    addLog("🚀 Starting Category Import Process...", "info");

    let currentQueue = [...pendingCategories];
    let currentBatchErrors: string[] = [];
    
    try {
        addLog(`Processing ${currentQueue.length} categories...`, "info");
        
        let result: BatchResult = { success: false, successful: 0, failed: 0, errors: [] };
        await new Promise<void>(resolve => {
            startTransition(async () => {
                try {
                    result = await batchCreateCategoriesPayload(currentQueue);
                } catch (e: any) {
                    result = { success: false, successful: 0, failed: currentQueue.length, errors: [e.message || "Unknown Server Action error"] };
                }
                resolve();
            });
        });
        
        const s = result.successful || 0;
        const f = result.failed || 0;
        currentBatchErrors = result.errors || [];

        setStats(prev => {
            return { processed: prev.processed + currentQueue.length, success: prev.success + s, failed: prev.failed + f };
        });

        if (currentBatchErrors.length) {
            currentBatchErrors.forEach((err: string) => addLog(`❌ ${err}`, "error"));
        } else {
            addLog(`✅ Import complete. ${s} Categories processed.`, "success");
        }

    } catch (error: any) {
        addLog(`💀 Critical Batch Error: ${error.message}`, "error");
        setStats(prev => ({ 
            ...prev, 
            processed: prev.processed + currentQueue.length, 
            failed: prev.failed + currentQueue.length 
        }));
    }

    setStatus("completed");
    addLog("🎉 Category Import Job Finished!", "success");
    toast.success("Category Import Completed!");
  };

  const handleDownloadTemplate = () => {
    try {
      const cleanCsvData = CATEGORY_CSV_TEMPLATE.split("\n").filter((line) => !line.startsWith("//")).join("\n");
      const blob = new Blob([cleanCsvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.setAttribute("href", URL.createObjectURL(blob));
      link.setAttribute("download", "pocketvalue_category_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("CSV template download failed:", error);
      toast.error("Could not prepare the template for download.");
    }
  };

  const progressPercent = totalInitialCount > 0 ? Math.min(Math.round((stats.processed / totalInitialCount) * 100), 100) : 0;

  return (
    // ✅ FIX: Expanded container width matches system-wide HUD layout (max-w-[1750px])
    <div className="space-y-6 max-w-[1750px] mx-auto font-sans p-4 md:p-8 animate-in fade-in duration-300">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
             <div className="space-y-1.5 leading-none">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-none">
                    Bulk Category Import
                </h1>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Import categories efficiently with parent-child relationships.</p>
             </div>
             <button 
              onClick={handleDownloadTemplate} 
              className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
             >
                <FileText size={14}/> Download Template
             </button>
        </div>

        {/* MAIN AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: STATUS & CONTROLS */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* 1. UPLOAD BOX (Visible when IDLE) */}
                {status === "idle" && totalInitialCount === 0 && (
                     <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] shadow-xs border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-brand-primary dark:hover:border-brand-primary/50 transition-all group">
                        {!file ? (
                            <div {...getRootProps()} className="text-center cursor-pointer py-10">
                                <input {...getInputProps()} />
                                <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-200 border border-brand-primary/20">
                                    <UploadCloud size={28} className="text-brand-primary"/>
                                </div>
                                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">Click or Drag CSV File</h3>
                                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1.5">Supports parent-child structure</p>
                                {isDragActive && (
                                    <p className="text-xs font-bold text-brand-primary mt-2 font-mono uppercase tracking-widest animate-pulse">Drop your CSV here!</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-center animate-in fade-in duration-300">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 shadow-2xs">
                                      <File size={32} />
                                    </div>
                                    <div className="text-left leading-none space-y-1">
                                        <p className="font-bold text-sm text-zinc-800 dark:text-zinc-150 leading-none">{file.name}</p>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button onClick={() => setFile(null)} className="p-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 cursor-pointer transition-colors">
                                      <X size={14} className="stroke-[2.5px]" />
                                    </button>
                                </div>
                                <button onClick={parseFile} className="w-full max-w-sm mx-auto py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-xs shadow-brand-primary/10 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer">
                                     Analyze File <ChevronRight size={14}/>
                                </button>
                            </div>
                        )}
                     </div>
                )}

                {/* 2. CONFIRMATION (Parsed) */}
                {status === "idle" && totalInitialCount > 0 && (
                    <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-2xl shadow-xs border-l-4 border-brand-primary border-t border-r border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Ready to Launch?</h2>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">Found <span className="font-bold text-brand-primary font-mono">{totalInitialCount} categories</span> inside CSV. System is ready to process.</p>
                        <div className="flex gap-3">
                            <button onClick={startProcessing} disabled={isPending} className="flex-1 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs shadow-brand-primary/10 flex items-center justify-center gap-2">
                                {isPending ? <Loader2 className="animate-spin" size={16}/> : <Play size={16}/>} Start Import
                            </button>
                            <button onClick={resetAll} disabled={isPending} className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider border border-zinc-200 dark:border-zinc-850 cursor-pointer transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. ACTIVE DASHBOARD (Processing/Completed) */}
                {status !== "idle" && status !== "parsing" && (
                    <div className="space-y-6">
                        {/* Progress Card */}
                        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    {status === "processing" && <Loader2 className="animate-spin text-brand-primary" size={20}/>}
                                    {status === "completed" && <CheckCircle className="text-emerald-500" size={20}/>}
                                    
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 leading-none">
                                            {status === "processing" ? "Importing..." : "Complete"}
                                        </h3>
                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono mt-1.5">
                                            {stats.processed} / {totalInitialCount} Processed
                                        </p>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-2">
                                    {status === "completed" && (
                                        <button onClick={resetAll} className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-850 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-xl flex gap-2 cursor-pointer transition-all">
                                            <RefreshCw size={14}/> New File
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Big Bar */}
                            <div className="h-5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className={`h-full transition-all duration-500 ease-out flex items-center justify-end pr-2 text-[9px] text-white font-mono font-bold
                                        ${status === "completed" ? "bg-emerald-500" : "bg-brand-primary"} 
                                    `} 
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    {progressPercent > 5 && `${progressPercent}%`}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
                                <div className="flex items-center gap-1.5 mb-1.5 text-brand-primary">
                                    <Terminal size={14}/> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Processed</span>
                                </div>
                                <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{stats.processed}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
                                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-500">
                                    <CheckCircle size={14}/> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Success</span>
                                </div>
                                <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{stats.success}</p>
                            </div>
                            <div className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs font-mono">
                                <div className="flex items-center gap-1.5 mb-1.5 text-red-500">
                                    <XCircle size={14}/> <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Failed</span>
                                </div>
                                <p className="text-xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{stats.failed}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT: TERMINAL / LOGS */}
            <div className="lg:col-span-4">
              <div className="bg-zinc-950 border border-zinc-800 text-zinc-200 p-4 rounded-2xl shadow-xl flex flex-col h-125 font-mono text-xs">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-2">
                      <Terminal size={14} className="text-brand-primary"/> 
                      <span className="font-bold text-[10px] uppercase tracking-wider text-zinc-500">Live Activity Log</span>
                      {status === "processing" && <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                      {logs.length === 0 ? (
                          <p className="text-zinc-700 italic text-center mt-10">Waiting for activity...</p>
                      ) : (
                          logs.map((log, i) => {
                            const isError = log.includes("❌") || log.includes("Error");
                            const isSuccess = log.includes("✅");
                            const isWarning = log.includes("⚠️");
                            const textColor = isError ? "text-red-400" : isSuccess ? "text-emerald-400" : isWarning ? "text-amber-400" : "text-zinc-300";
                            
                            return (
                              <div key={i} className={`flex gap-2 wrap-break-word animate-in fade-in slide-in-from-left-2 duration-300 ${textColor}`}>
                                  <span className="opacity-50 select-none text-[9px] pt-0.5 shrink-0">{log.split(']')[0]}]</span>
                                  <span>{log.split(']')[1]}</span>
                              </div>
                            );
                          })
                      )}
                  </div>
              </div>
            </div>

        </div>
    </div>
  );
}