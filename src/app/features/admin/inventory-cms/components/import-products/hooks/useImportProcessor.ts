// // src/app/features/admin/inventory-cms/components/import-products/hooks/useImportProcessor.ts

// "use client";

// import { useState, useCallback, useRef, useEffect } from "react";
// import Papa from "papaparse";
// import { compressImage } from "@/lib/media/clientCompression";
// import toast from "react-hot-toast";

// // ================================================================
// // TYPES
// // ================================================================
// export type ProcessStatus =
//   | "idle"
//   | "parsing"
//   | "processing"
//   | "paused"
//   | "waiting_network"
//   | "completed";

// export interface Stats {
//   processed: number;
//   success: number;
//   failed: number;
// }

// interface BatchResult {
//   success: boolean;
//   successful: number;
//   failed: number;
//   errors: string[];
// }

// // ================================================================
// // CONFIGURATION
// // ================================================================
// const CHUNK_SIZE = 5;
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 2000;

// // ================================================================
// // HOOK
// // ================================================================
// export function useImportProcessor() {
//   // --- State ---
//   const [file, setFile] = useState<File | null>(null);
//   const [status, setStatus] = useState<ProcessStatus>("idle");
//   const [isOnline, setIsOnline] = useState(true);
//   const [pendingGroups, setPendingGroups] = useState<any[][]>([]);
//   const [totalInitialCount, setTotalInitialCount] = useState(0);
//   const [chunkIndex, setChunkIndex] = useState(0);
//   const [stats, setStats] = useState<Stats>({ processed: 0, success: 0, failed: 0 });
//   const [logs, setLogs] = useState<string[]>([]);
//   const [timeLeft, setTimeLeft] = useState<string>("--:--");

//   // --- Refs ---
//   const startTimeRef = useRef<number>(0);
//   const processedRef = useRef<number>(0);
//   const shouldStopRef = useRef(false);
//   const isProcessingRef = useRef(false);

//   // --- Network Monitoring ---
//   useEffect(() => {
//     setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

//     const handleOnline = () => {
//       setIsOnline(true);
//       if (status === "waiting_network") {
//         addLog("🟢 Internet Restored. Resuming...", "success");
//         setTimeout(() => {
//           setStatus("processing");
//           startProcessing();
//         }, 3000);
//       } else {
//         toast.success("Internet Connected");
//       }
//     };

//     const handleOffline = () => {
//       setIsOnline(false);
//       if (status === "processing") {
//         shouldStopRef.current = true;
//         setStatus("waiting_network");
//         addLog("🔴 Connection Lost! Pausing...", "error");
//         toast.error("No Internet. Pausing...");
//       }
//     };

//     if (typeof window !== "undefined") {
//       window.addEventListener("online", handleOnline);
//       window.addEventListener("offline", handleOffline);
//     }

//     return () => {
//       if (typeof window !== "undefined") {
//         window.removeEventListener("online", handleOnline);
//         window.removeEventListener("offline", handleOffline);
//       }
//     };
//   }, [status]);

//   // --- Logging ---
//   const addLog = useCallback(
//     (message: string, logType: "info" | "success" | "error" | "warning" = "info") => {
//       const timestamp = new Date().toLocaleTimeString([], {
//         hour12: false,
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//       });
//       const prefixIcon =
//         logType === "success" ? "✅" : logType === "error" ? "❌" : logType === "warning" ? "⚠️" : "💬";
//       setLogs((prev) => [`[${timestamp}] ${prefixIcon} ${message}`, ...prev].slice(0, 50));
//     },
//     []
//   );

//   // --- Reset ---
//   const resetAll = useCallback(() => {
//     setStatus("idle");
//     setPendingGroups([]);
//     setStats({ processed: 0, success: 0, failed: 0 });
//     setLogs([]);
//     setTimeLeft("--:--");
//     setTotalInitialCount(0);
//     setChunkIndex(0);
//     shouldStopRef.current = false;
//     isProcessingRef.current = false;
//   }, []);

//   // --- CSV Parsing ---
//   const parseFile = useCallback(() => {
//     if (!file) return;
//     setStatus("parsing");
//     addLog("Analyzing CSV file structure...");

//     Papa.parse(file, {
//       header: true,
//       skipEmptyLines: true,
//       comments: "//",
//       complete: (results) => {
//         const rawData: any[] = results.data;
//         if (rawData.length === 0) {
//           toast.error("CSV is empty.");
//           setStatus("idle");
//           return;
//         }

//         const groups: any[][] = [];
//         let currentGroup: any[] = [];
//         for (const row of rawData) {
//           if (row.title && row.title.trim() !== "") {
//             if (currentGroup.length > 0) groups.push(currentGroup);
//             currentGroup = [row];
//           } else if (currentGroup.length > 0) {
//             currentGroup.push(row);
//           }
//         }
//         if (currentGroup.length > 0) groups.push(currentGroup);

//         if (groups.length === 0) {
//           toast.error("No products found. Check CSV headers.");
//           setStatus("idle");
//           return;
//         }

//         setPendingGroups(groups);
//         setTotalInitialCount(groups.length);
//         setStatus("idle");
//         addLog(`✅ Found ${groups.length} products in CSV.`, "success");
//         toast.success(`Ready to import ${groups.length} products.`);
//       },
//       error: (err) => {
//         toast.error("CSV Parse Error");
//         addLog(`Error parsing CSV: ${err.message}`, "error");
//         setStatus("idle");
//       },
//     });
//   }, [file, addLog]);

//   // --- Helper: Compress Images for a Product ---
//   const compressProductImages = useCallback(
//     async (productRow: any): Promise<File[]> => {
//       const imageUrls = (productRow.variant_images || "")
//         .toString()
//         .split(",")
//         .map((u: string) => u.trim())
//         .filter(Boolean);

//       if (imageUrls.length === 0) return [];

//       const compressedFiles: File[] = [];

//       for (const url of imageUrls) {
//         try {
//           const response = await fetch(url);
//           if (!response.ok) {
//             addLog(`⚠️ Failed to fetch image: ${url} (${response.status})`, "warning");
//             continue;
//           }

//           const blob = await response.blob();
//           if (!blob.type.startsWith("image/")) {
//             addLog(`⚠️ URL is not an image: ${url}`, "warning");
//             continue;
//           }

//           const fileName = url.split("/").pop() || "image.jpg";
//           // ✅ Native File constructor (no conflict now)
//           const file = new File([blob], fileName, { type: blob.type });

//           const compressed = await compressImage(file, {
//             maxWidth: 1200,
//             maxHeight: 1200,
//             quality: 80,
//             maxSizeMB: 0.5,
//             format: "webp",
//           });

//           compressedFiles.push(compressed);
//         } catch (error) {
//           addLog(`❌ Failed to compress image from ${url}: ${error}`, "error");
//         }
//       }

//       return compressedFiles;
//     },
//     [addLog]
//   );

//   // --- Calculate ETA ---
//   const calculateTimeLeft = useCallback(() => {
//     if (processedRef.current === 0 || totalInitialCount === 0) return;
//     const elapsed = Date.now() - startTimeRef.current;
//     const speed = elapsed / processedRef.current;
//     const remaining = totalInitialCount - processedRef.current;
//     const msLeft = speed * remaining;

//     if (msLeft <= 0) {
//       setTimeLeft("Finishing...");
//       return;
//     }
//     const mins = Math.floor(msLeft / 60000);
//     const secs = Math.floor((msLeft % 60000) / 1000);
//     setTimeLeft(`${mins}m ${secs}s`);
//   }, [totalInitialCount]);

//   // --- Main Processing Loop (Chunked + Browser Compression) ---
//   const startProcessing = useCallback(async () => {
//     if (!isOnline) {
//       setStatus("waiting_network");
//       return;
//     }
//     if (pendingGroups.length === 0 || isProcessingRef.current) return;

//     shouldStopRef.current = false;
//     isProcessingRef.current = true;
//     setStatus("processing");

//     if (stats.processed === 0) {
//       startTimeRef.current = Date.now();
//       processedRef.current = 0;
//       addLog("🚀 Starting chunked import with browser compression...", "info");
//     } else {
//       addLog("▶️ Resuming import...", "info");
//     }

//     let queue = [...pendingGroups];
//     let currentChunk = chunkIndex;

//     while (queue.length > 0 && !shouldStopRef.current) {
//       const chunk = queue.slice(0, CHUNK_SIZE);
//       const compressedProducts: any[] = [];

//       addLog(`📦 Processing chunk ${currentChunk + 1}: ${chunk.length} products...`, "info");

//       try {
//         // Step 1: Compress all images in this chunk (Browser)
//         for (const group of chunk) {
//           const parentRow = group[0];
//           const variantRows = group.slice(1);

//           const parentImages = await compressProductImages(parentRow);
//           const variantImages = await Promise.all(
//             variantRows.map((row) => compressProductImages(row))
//           );

//           compressedProducts.push({
//             parent: parentRow,
//             variants: variantRows.map((row, idx) => ({
//               ...row,
//               compressedImages: variantImages[idx] || [],
//             })),
//             parentCompressedImages: parentImages,
//           });
//         }

//         // Step 2: Build FormData
//         const formData = new FormData();
//         const productMetadata = compressedProducts.map((p) => ({
//           parent: p.parent,
//           variants: p.variants.map((v: any) => ({
//             ...v,
//             compressedImages: v.compressedImages.map((f: File) => f.name),
//           })),
//           parentCompressedImages: p.parentCompressedImages.map((f: File) => f.name),
//         }));
//         formData.append("products", JSON.stringify(productMetadata));

//         let imageIndex = 0;
//         for (const p of compressedProducts) {
//           for (const img of p.parentCompressedImages) {
//             formData.append(`image_${imageIndex}`, img);
//             imageIndex++;
//           }
//           for (const v of p.variants) {
//             for (const img of v.compressedImages) {
//               formData.append(`image_${imageIndex}`, img);
//               imageIndex++;
//             }
//           }
//         }

//         // Step 3: Send to API
//         let retries = 0;
//         let result: BatchResult | null = null;

//         while (retries < MAX_RETRIES && !result) {
//           try {
//             const response = await fetch("/api/admin/import/batch", {
//               method: "POST",
//               body: formData,
//             });

//             if (!response.ok) {
//               const errorText = await response.text();
//               throw new Error(`HTTP ${response.status}: ${errorText}`);
//             }

//             result = await response.json();
//           } catch (error: any) {
//             retries++;
//             if (retries < MAX_RETRIES) {
//               addLog(`⚠️ Chunk failed, retrying (${retries}/${MAX_RETRIES})...`, "warning");
//               await new Promise((r) => setTimeout(r, RETRY_DELAY));
//             } else {
//               throw error;
//             }
//           }
//         }

//         // Step 4: Update stats
//         if (result) {
//           setStats((prev) => ({
//             processed: prev.processed + chunk.length,
//             success: prev.success + (result.successful || 0),
//             failed: prev.failed + (result.failed || 0),
//           }));
//           processedRef.current += chunk.length;

//           if (result.errors?.length) {
//             result.errors.forEach((err: string) => addLog(`❌ ${err}`, "error"));
//           } else {
//             addLog(`✅ Chunk complete: ${result.successful} success, ${result.failed} failed`, "success");
//           }
//         }

//         queue = queue.slice(CHUNK_SIZE);
//         setPendingGroups(queue);
//         setChunkIndex(currentChunk + 1);
//         currentChunk++;

//         calculateTimeLeft();
//         await new Promise((r) => setTimeout(r, 100));
//       } catch (error: any) {
//         const msg = error.message || "";
//         if (msg.includes("fetch") || msg.includes("Network") || !isOnline) {
//           addLog(`⚠️ Network error. Retrying...`, "warning");
//           await new Promise((r) => setTimeout(r, RETRY_DELAY));
//           if (!isOnline) shouldStopRef.current = true;
//         } else {
//           addLog(`💀 Critical error: ${msg}`, "error");
//           setStats((prev) => ({
//             ...prev,
//             processed: prev.processed + chunk.length,
//             failed: prev.failed + chunk.length,
//           }));
//           queue = queue.slice(CHUNK_SIZE);
//           setPendingGroups(queue);
//           setChunkIndex(currentChunk + 1);
//         }
//       }
//     }

//     isProcessingRef.current = false;

//     if (!shouldStopRef.current) {
//       setStatus("completed");
//       setTimeLeft("Completed");
//       addLog("🎉 Import Job Finished!", "success");
//       toast.success("Import Completed!");
//     } else {
//       setStatus("paused");
//       addLog("⏸️ Import Paused.", "warning");
//     }
//   }, [pendingGroups, isOnline, stats.processed, chunkIndex, addLog, compressProductImages, calculateTimeLeft]);

//   // Auto-calculate ETA on stats change
//   useEffect(() => {
//     calculateTimeLeft();
//   }, [stats.processed, calculateTimeLeft]);

//   return {
//     // State
//     file,
//     setFile,
//     status,
//     isOnline,
//     pendingGroups,
//     totalInitialCount,
//     stats,
//     logs,
//     timeLeft,
//     progressPercent: totalInitialCount > 0 ? Math.min(Math.round((stats.processed / totalInitialCount) * 100), 100) : 0,
//     // Actions
//     parseFile,
//     startProcessing,
//     resetAll,
//     addLog,
//     isProcessing: isProcessingRef.current,
//   };
// }
// src/app/features/admin/inventory-cms/components/import-products/hooks/useImportProcessor.ts

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Papa from "papaparse";
import { compressImage } from "@/lib/media/clientCompression";
import toast from "react-hot-toast";

// ================================================================
// TYPES
// ================================================================
export type ProcessStatus =
  | "idle"
  | "parsing"
  | "processing"
  | "paused"
  | "waiting_network"
  | "completed";

export interface Stats {
  processed: number;
  success: number;
  failed: number;
}

interface BatchResult {
  success: boolean;
  successful: number;
  failed: number;
  errors: string[];
}

// ================================================================
// CONFIGURATION
// ================================================================
const CHUNK_SIZE = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// ================================================================
// HOOK
// ================================================================
export function useImportProcessor(cdnMode: boolean = false) {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessStatus>("idle");
  const [isOnline, setIsOnline] = useState(true);
  const [pendingGroups, setPendingGroups] = useState<any[][]>([]);
  const [totalInitialCount, setTotalInitialCount] = useState(0);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [stats, setStats] = useState<Stats>({ processed: 0, success: 0, failed: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<string>("--:--");

  // --- Refs ---
  const startTimeRef = useRef<number>(0);
  const processedRef = useRef<number>(0);
  const shouldStopRef = useRef(false);
  const isProcessingRef = useRef(false);

  // --- Network Monitoring ---
  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      if (status === "waiting_network") {
        addLog("🟢 Internet Restored. Resuming...", "success");
        setTimeout(() => {
          setStatus("processing");
          startProcessing();
        }, 3000);
      } else {
        toast.success("Internet Connected");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (status === "processing") {
        shouldStopRef.current = true;
        setStatus("waiting_network");
        addLog("🔴 Connection Lost! Pausing...", "error");
        toast.error("No Internet. Pausing...");
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [status]);

  // --- Logging ---
  const addLog = useCallback(
    (message: string, logType: "info" | "success" | "error" | "warning" = "info") => {
      const timestamp = new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const prefixIcon =
        logType === "success" ? "✅" : logType === "error" ? "❌" : logType === "warning" ? "⚠️" : "💬";
      setLogs((prev) => [`[${timestamp}] ${prefixIcon} ${message}`, ...prev].slice(0, 50));
    },
    []
  );

  // --- Reset ---
  const resetAll = useCallback(() => {
    setStatus("idle");
    setPendingGroups([]);
    setStats({ processed: 0, success: 0, failed: 0 });
    setLogs([]);
    setTimeLeft("--:--");
    setTotalInitialCount(0);
    setChunkIndex(0);
    shouldStopRef.current = false;
    isProcessingRef.current = false;
  }, []);

  // --- CSV Parsing ---
  const parseFile = useCallback(() => {
    if (!file) return;
    setStatus("parsing");
    addLog("Analyzing CSV file structure...");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      comments: "//",
      complete: (results) => {
        const rawData: any[] = results.data;
        if (rawData.length === 0) {
          toast.error("CSV is empty.");
          setStatus("idle");
          return;
        }

        const groups: any[][] = [];
        let currentGroup: any[] = [];
        for (const row of rawData) {
          if (row.title && row.title.trim() !== "") {
            if (currentGroup.length > 0) groups.push(currentGroup);
            currentGroup = [row];
          } else if (currentGroup.length > 0) {
            currentGroup.push(row);
          }
        }
        if (currentGroup.length > 0) groups.push(currentGroup);

        if (groups.length === 0) {
          toast.error("No products found. Check CSV headers.");
          setStatus("idle");
          return;
        }

        setPendingGroups(groups);
        setTotalInitialCount(groups.length);
        setStatus("idle");
        addLog(`✅ Found ${groups.length} products in CSV.`, "success");
        toast.success(`Ready to import ${groups.length} products.`);
      },
      error: (err) => {
        toast.error("CSV Parse Error");
        addLog(`Error parsing CSV: ${err.message}`, "error");
        setStatus("idle");
      },
    });
  }, [file, addLog]);

  // --- Helper: Compress Images for a Product ---
  const compressProductImages = useCallback(
    async (productRow: any): Promise<File[]> => {
      // ✅ ENTERPRISE UPGRADE: Split using regex to cleanly support both commas and semicolons
      const imageUrls = (productRow.variant_images || "")
        .toString()
        .split(/[;,]/)
        .map((u: string) => u.trim())
        .filter(Boolean);

      if (imageUrls.length === 0) return [];

      const compressedFiles: File[] = [];

      for (const url of imageUrls) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            addLog(`⚠️ Failed to fetch image: ${url} (${response.status})`, "warning");
            continue;
          }

          const blob = await response.blob();
          if (!blob.type.startsWith("image/")) {
            addLog(`⚠️ URL is not an image: ${url}`, "warning");
            continue;
          }

          const fileName = url.split("/").pop() || "image.jpg";
          const file = new File([blob], fileName, { type: blob.type });

          const compressed = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 80,
            maxSizeMB: 0.5,
            format: "webp",
          });

          compressedFiles.push(compressed);
        } catch (error) {
          addLog(`❌ Failed to compress image from ${url}: ${error}`, "error");
        }
      }

      return compressedFiles;
    },
    [addLog]
  );

  // --- Calculate ETA ---
  const calculateTimeLeft = useCallback(() => {
    if (processedRef.current === 0 || totalInitialCount === 0) return;
    const elapsed = Date.now() - startTimeRef.current;
    const speed = elapsed / processedRef.current;
    const remaining = totalInitialCount - processedRef.current;
    const msLeft = speed * remaining;

    if (msLeft <= 0) {
      setTimeLeft("Finishing...");
      return;
    }
    const mins = Math.floor(msLeft / 60000);
    const secs = Math.floor((msLeft % 60000) / 1000);
    setTimeLeft(`${mins}m ${secs}s`);
  }, [totalInitialCount]);

  // --- Main Processing Loop (Chunked + Browser Compression) ---
  const startProcessing = useCallback(async () => {
    if (!isOnline) {
      setStatus("waiting_network");
      return;
    }
    if (pendingGroups.length === 0 || isProcessingRef.current) return;

    shouldStopRef.current = false;
    isProcessingRef.current = true;
    setStatus("processing");

    if (stats.processed === 0) {
      startTimeRef.current = Date.now();
      processedRef.current = 0;
      addLog("🚀 Starting chunked import with browser compression...", "info");
    } else {
      addLog("▶️ Resuming import...", "info");
    }

    let queue = [...pendingGroups];
    let currentChunk = chunkIndex;

    while (queue.length > 0 && !shouldStopRef.current) {
      const chunk = queue.slice(0, CHUNK_SIZE);
      const compressedProducts: any[] = [];

      addLog(`📦 Processing chunk ${currentChunk + 1}: ${chunk.length} products...`, "info");

      try {
        // Step 1: Compress all images in this chunk (Bypassed if cdnMode is enabled)
        for (const group of chunk) {
          const parentRow = group[0];
          const variantRows = group.slice(1);

          let parentImages: File[] = [];
          let variantImages: File[][] = [];

          // ✅ ENTERPRISE UPGRADE: If CDN Mode is active, bypass heavy downloads & compression.
          // This allows lightning-fast CSV parsing without blocking system execution memory threads.
          if (!cdnMode) {
            parentImages = await compressProductImages(parentRow);
            variantImages = await Promise.all(
              variantRows.map((row) => compressProductImages(row))
            );
          } else {
            addLog(`ℹ️ CDN Mode Active: Bypassing browser download & compression for ${parentRow.title}.`, "info");
          }

          compressedProducts.push({
            parent: parentRow,
            variants: variantRows.map((row, idx) => ({
              ...row,
              compressedImages: cdnMode ? [] : (variantImages[idx] || []),
            })),
            parentCompressedImages: parentImages,
          });
        }

        // Step 2: Build FormData
        const formData = new FormData();
        const productMetadata = compressedProducts.map((p) => ({
          parent: p.parent,
          variants: p.variants.map((v: any) => ({
            ...v,
            compressedImages: v.compressedImages.map((f: File) => f.name),
          })),
          parentCompressedImages: p.parentCompressedImages.map((f: File) => f.name),
        }));
        formData.append("products", JSON.stringify(productMetadata));

        // Inject binaries if CDN Mode is off
        if (!cdnMode) {
          let imageIndex = 0;
          for (const p of compressedProducts) {
            for (const img of p.parentCompressedImages) {
              formData.append(`image_${imageIndex}`, img);
              imageIndex++;
            }
            for (const v of p.variants) {
              for (const img of v.compressedImages) {
                formData.append(`image_${imageIndex}`, img);
                imageIndex++;
              }
            }
          }
        }

        // Step 3: Send to API
        let retries = 0;
        let result: BatchResult | null = null;

        while (retries < MAX_RETRIES && !result) {
          try {
            const response = await fetch("/api/admin/import/batch", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            result = await response.json();
          } catch (error: any) {
            retries++;
            if (retries < MAX_RETRIES) {
              addLog(`⚠️ Chunk failed, retrying (${retries}/${MAX_RETRIES})...`, "warning");
              await new Promise((r) => setTimeout(r, RETRY_DELAY));
            } else {
              throw error;
            }
          }
        }

        // Step 4: Update stats
        if (result) {
          setStats((prev) => ({
            processed: prev.processed + chunk.length,
            success: prev.success + (result.successful || 0),
            failed: prev.failed + (result.failed || 0),
          }));
          processedRef.current += chunk.length;

          if (result.errors?.length) {
            result.errors.forEach((err: string) => addLog(`❌ ${err}`, "error"));
          } else {
            addLog(`✅ Chunk complete: ${result.successful} success, ${result.failed} failed`, "success");
          }
        }

        queue = queue.slice(CHUNK_SIZE);
        setPendingGroups(queue);
        setChunkIndex(currentChunk + 1);
        currentChunk++;

        calculateTimeLeft();
        await new Promise((r) => setTimeout(r, 100));
      } catch (error: any) {
        const msg = error.message || "";
        if (msg.includes("fetch") || msg.includes("Network") || !isOnline) {
          addLog(`⚠️ Network error. Retrying...`, "warning");
          await new Promise((r) => setTimeout(r, RETRY_DELAY));
          if (!isOnline) shouldStopRef.current = true;
        } else {
          addLog(`💀 Critical error: ${msg}`, "error");
          setStats((prev) => ({
            ...prev,
            processed: prev.processed + chunk.length,
            failed: prev.failed + chunk.length,
          }));
          queue = queue.slice(CHUNK_SIZE);
          setPendingGroups(queue);
          setChunkIndex(currentChunk + 1);
        }
      }
    }

    isProcessingRef.current = false;

    if (!shouldStopRef.current) {
      setStatus("completed");
      setTimeLeft("Completed");
      addLog("🎉 Import Job Finished!", "success");
      toast.success("Import Completed!");
    } else {
      setStatus("paused");
      addLog("⏸️ Import Paused.", "warning");
    }
    // ✅ ENTERPRISE UPGRADE: Registered cdnMode in startProcessing dependency array to prevent React stale closures
  }, [pendingGroups, isOnline, stats.processed, chunkIndex, addLog, compressProductImages, calculateTimeLeft, cdnMode]);

  // Auto-calculate ETA on stats change
  useEffect(() => {
    calculateTimeLeft();
  }, [stats.processed, calculateTimeLeft]);

  return {
    // State
    file,
    setFile,
    status,
    isOnline,
    pendingGroups,
    totalInitialCount,
    stats,
    logs,
    timeLeft,
    progressPercent: totalInitialCount > 0 ? Math.min(Math.round((stats.processed / totalInitialCount) * 100), 100) : 0,
    // Actions
    parseFile,
    startProcessing,
    resetAll,
    addLog,
    isProcessing: isProcessingRef.current,
  };
}