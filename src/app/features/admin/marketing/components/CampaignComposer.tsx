// // 📂 src/app/features/admin/marketing/components/CampaignComposer.tsx

// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   Mail,
//   Send,
//   Loader2,
//   Eye,
//   CheckCircle,
//   FileText,
// } from "lucide-react";
// import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
// import { sendCampaign } from "../actions/sendCampaign";
// import { getSegmentByIdAndExecute } from "@/app/features/admin/loyalty-intelligence/actions/getSegmentQuery";
// import { listSegments } from "@/app/features/admin/loyalty-intelligence/actions/saveSegment";

// // ================================================================
// // ✅ TYPES
// // ================================================================
// interface SavedSegment {
//   _id: string;
//   name: string;
//   description?: string;
// }

// // ================================================================
// // 🚀 MAIN COMPONENT
// // ================================================================
// export default function CampaignComposer() {
//   // Step 1: Audience Selection
//   const [segments, setSegments] = useState<SavedSegment[]>([]);
//   const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
//   const [manualEmails, setManualEmails] = useState<string>("");
//   const [audienceCount, setAudienceCount] = useState<number | null>(null);
//   const [isLoadingAudience, setIsLoadingAudience] = useState(false);

//   // Step 2: Send Limit
//   const [sendLimit, setSendLimit] = useState<number>(0); // 0 = all

//   // Step 3: Email Content
//   const [subject, setSubject] = useState("");
//   const [htmlContent, setHtmlContent] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const [sendResult, setSendResult] = useState<null | {
//     sent: number;
//     failed: number;
//     message: string;
//   }>(null);

//   // Load saved segments on mount
//   useEffect(() => {
//     loadSegments();
//   }, []);

//   const loadSegments = async () => {
//     try {
//       const result = await listSegments();
//       if (result.success && result.data) {
//         setSegments(result.data);
//       }
//     } catch (error) {
//       console.error("Failed to load segments:", error);
//     }
//   };

//   // Preview Audience Count
//   const handlePreviewAudience = async () => {
//     setIsLoadingAudience(true);
//     setAudienceCount(null);

//     try {
//       if (manualEmails.trim()) {
//         const emailList = manualEmails
//           .split(",")
//           .map((e) => e.trim())
//           .filter(Boolean);
//         setAudienceCount(emailList.length);
//         setIsLoadingAudience(false);
//         return;
//       }

//       if (selectedSegmentId) {
//         const result = await getSegmentByIdAndExecute(selectedSegmentId, 1, 1);
//         if (result.totalDocs !== undefined) {
//           setAudienceCount(result.totalDocs);
//         } else {
//           toastError("Failed to fetch segment count.");
//         }
//       } else {
//         toastError("Please select a segment or enter manual emails.");
//       }
//     } catch (error) {
//       toastError("Failed to preview audience.");
//     } finally {
//       setIsLoadingAudience(false);
//     }
//   };

//   // Send Campaign
//   const handleSend = async () => {
//     if (!selectedSegmentId && !manualEmails.trim()) {
//       toastError("Please select a segment or enter emails.");
//       return;
//     }
//     if (!subject.trim()) {
//       toastError("Please enter a subject.");
//       return;
//     }
//     if (!htmlContent.trim()) {
//       toastError("Please enter email content.");
//       return;
//     }

//     setIsSending(true);
//     setSendResult(null);

//     try {
//       let userIds: string[] | undefined = undefined;
//       let emails: string[] | undefined = undefined;

//       if (manualEmails.trim()) {
//         emails = manualEmails
//           .split(",")
//           .map((e) => e.trim())
//           .filter(Boolean);
//       } else if (selectedSegmentId) {
//         const limit = sendLimit > 0 ? sendLimit : 10000;
//         const result = await getSegmentByIdAndExecute(selectedSegmentId, 1, limit);
//         userIds = result.users.map((u: any) => u._id);
//       }

//       const result = await sendCampaign({
//         userIds,
//         emails,
//         subject: subject.trim(),
//         htmlContent: htmlContent.trim(),
//         senderName: "PocketValue Team",
//       });

//       if (result.success) {
//         setSendResult({
//           sent: result.sentCount,
//           failed: result.failedCount,
//           message: result.message,
//         });
//         toastSuccess(result.message);
//       } else {
//         toastError(result.message || "Failed to send campaign.");
//       }
//     } catch (error: any) {
//       toastError(error.message || "Unexpected error.");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <div className="space-y-6 w-full p-4 animate-in fade-in duration-300">
      
//       {/* 1. AUDIENCE SECTION */}
//       <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
//         <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
//           <Users size={16} className="text-brand-primary stroke-[2.2px]" />
//           <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
//             1. Select Audience
//           </h3>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           {/* Saved Segment Dropdown */}
//           <div>
//             <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
//               Saved Segment
//             </label>
//             <select
//               value={selectedSegmentId}
//               onChange={(e) => {
//                 setSelectedSegmentId(e.target.value);
//                 setAudienceCount(null);
//               }}
//               className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200 text-xs focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
//             >
//               <option value="">Select a segment...</option>
//               {segments.map((seg) => (
//                 <option key={seg._id} value={seg._id}>
//                   {seg.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Manual Emails */}
//           <div>
//             <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
//               Manual Emails (comma separated)
//             </label>
//             <input
//               type="text"
//               value={manualEmails}
//               onChange={(e) => {
//                 setManualEmails(e.target.value);
//                 setAudienceCount(null);
//               }}
//               placeholder="e.g., a@gmail.com, b@gmail.com"
//               className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
//             />
//           </div>
//         </div>

//         {/* Preview Button */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 gap-4">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handlePreviewAudience}
//               disabled={isLoadingAudience || (!selectedSegmentId && !manualEmails.trim())}
//               className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-xs transition-all hover:scale-102 active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
//             >
//               {isLoadingAudience ? (
//                 <Loader2 size={13} className="animate-spin" />
//               ) : (
//                 <Eye size={13} className="stroke-[2.2px]" />
//               )}
//               {isLoadingAudience ? "Counting..." : "Preview Audience"}
//             </button>
//             {audienceCount !== null && (
//               <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
//                 <CheckCircle size={14} />
//                 {audienceCount.toLocaleString()} recipients
//               </span>
//             )}
//           </div>

//           {/* Send Limit */}
//           <div className="flex items-center gap-2.5">
//             <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
//               Send Limit
//             </label>
//             <input
//               type="number"
//               min={0}
//               value={sendLimit}
//               onChange={(e) => setSendLimit(Number(e.target.value) || 0)}
//               className="w-20 px-2 py-1 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-center font-mono focus:border-brand-primary outline-hidden"
//               placeholder="All"
//             />
//             <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">(0 = all)</span>
//           </div>
//         </div>
//       </div>

//       {/* 2. CONTENT SECTION */}
//       <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
//         <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60">
//           <FileText size={16} className="text-brand-primary stroke-[2.2px]" />
//           <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
//             2. Email Content
//           </h3>
//         </div>

//         <div className="space-y-4">
//           {/* Subject */}
//           <div>
//             <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
//               Subject Line
//             </label>
//             <input
//               type="text"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               placeholder="e.g., Special Offer Just for You!"
//               className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
//             />
//           </div>

//           {/* HTML Content */}
//           <div>
//             <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
//               HTML Body (Use {'{{name}}'}, {'{{email}}'} for personalization)
//             </label>
//             <textarea
//               rows={8}
//               value={htmlContent}
//               onChange={(e) => setHtmlContent(e.target.value)}
//               placeholder={`<h1>Hello {{name}},</h1><p>Check out our latest deals!</p>`}
//               className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200 text-xs font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
//             />
//           </div>
//         </div>
//       </div>

//       {/* 3. SEND & RESULT */}
//       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-100 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
//             <Mail size={15} />
//           </div>
//           <div>
//             <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
//               Ready to dispatch campaign?
//             </span>
//             {sendResult && (
//               <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
//                 Sent: {sendResult.sent.toLocaleString()} | Failed: {sendResult.failed.toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>

//         <button
//           onClick={handleSend}
//           disabled={isSending || (audienceCount === null && !manualEmails.trim())}
//           className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold rounded-xl text-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-lg shadow-brand-primary/20"
//         >
//           {isSending ? (
//             <>
//               <Loader2 size={14} className="animate-spin" />
//               Broadcasting...
//             </>
//           ) : (
//             <>
//               <Send size={14} />
//               Send Campaign
//             </>
//           )}
//         </button>
//       </div>
//     </div>
//   );
// }
// 📂 src/app/features/admin/marketing/components/CampaignComposer.tsx (TOP-TIER PKR LOCALIZED & COMPOSER HUD)

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Send,
  Loader2,
  Eye,
  CheckCircle,
  FileText,
  Code,
  Tag,
} from "lucide-react";
import { toastSuccess, toastError } from "@/app/shared/components/helpers/CustomToasts";
import { sendCampaign } from "../actions/sendCampaign";
import { getSegmentByIdAndExecute } from "@/app/features/admin/loyalty-intelligence/actions/getSegmentQuery";
import { listSegments } from "@/app/features/admin/loyalty-intelligence/actions/saveSegment";

// ================================================================
// ✅ TYPES
// ================================================================
interface SavedSegment {
  _id: string;
  name: string;
  description?: string;
}

// ================================================================
// 🚀 MAIN COMPONENT
// ================================================================
export default function CampaignComposer() {
  // Step 1: Audience Selection
  const [segments, setSegments] = useState<SavedSegment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  const [manualEmails, setManualEmails] = useState<string>("");
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);

  // Step 2: Send Limit
  const [sendLimit, setSendLimit] = useState<number>(0); // 0 = all

  // Step 3: Email Content
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<null | {
    sent: number;
    failed: number;
    message: string;
  }>(null);

  // Load saved segments on mount
  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const result = await listSegments();
      if (result.success && result.data) {
        setSegments(result.data);
      }
    } catch (error) {
      console.error("Failed to load segments:", error);
    }
  };

  // Quick Insert Variable Tag Helper
  const insertVariableTag = (tag: string) => {
    setHtmlContent((prev) => prev + tag);
  };

  // Preview Audience Count
  const handlePreviewAudience = async () => {
    setIsLoadingAudience(true);
    setAudienceCount(null);

    try {
      if (manualEmails.trim()) {
        const emailList = manualEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
        setAudienceCount(emailList.length);
        setIsLoadingAudience(false);
        return;
      }

      if (selectedSegmentId) {
        const result = await getSegmentByIdAndExecute(selectedSegmentId, 1, 1);
        if (result.totalDocs !== undefined) {
          setAudienceCount(result.totalDocs);
        } else {
          toastError("Failed to fetch segment count.");
        }
      } else {
        toastError("Please select a segment or enter manual emails.");
      }
    } catch (error) {
      toastError("Failed to preview audience.");
    } finally {
      setIsLoadingAudience(false);
    }
  };

  // Send Campaign
  const handleSend = async () => {
    if (!selectedSegmentId && !manualEmails.trim()) {
      toastError("Please select a segment or enter emails.");
      return;
    }
    if (!subject.trim()) {
      toastError("Please enter a subject.");
      return;
    }
    if (!htmlContent.trim()) {
      toastError("Please enter email content.");
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      let userIds: string[] | undefined = undefined;
      let emails: string[] | undefined = undefined;

      if (manualEmails.trim()) {
        emails = manualEmails
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      } else if (selectedSegmentId) {
        const limit = sendLimit > 0 ? sendLimit : 10000;
        const result = await getSegmentByIdAndExecute(selectedSegmentId, 1, limit);
        userIds = result.users.map((u: any) => u._id);
      }

      const result = await sendCampaign({
        userIds,
        emails,
        subject: subject.trim(),
        htmlContent: htmlContent.trim(),
        senderName: "PocketValue Team",
      });

      if (result.success) {
        setSendResult({
          sent: result.sentCount,
          failed: result.failedCount,
          message: result.message,
        });
        toastSuccess(result.message);
      } else {
        toastError(result.message || "Failed to send campaign.");
      }
    } catch (error: any) {
      toastError(error.message || "Unexpected error.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0 animate-in fade-in duration-300">
      
      {/* 1. AUDIENCE SECTION */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/60">
          <Users size={16} className="text-brand-primary stroke-[2.2px]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            1. Select Target Audience
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Saved Segment Dropdown */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Saved Segment
            </label>
            <select
              value={selectedSegmentId}
              onChange={(e) => {
                setSelectedSegmentId(e.target.value);
                setAudienceCount(null);
              }}
              className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200 cursor-pointer"
            >
              <option value="">Select a segment...</option>
              {segments.map((seg) => (
                <option key={seg._id} value={seg._id}>
                  {seg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Emails */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Manual Emails (Comma Separated)
            </label>
            <input
              type="text"
              value={manualEmails}
              onChange={(e) => {
                setManualEmails(e.target.value);
                setAudienceCount(null);
              }}
              placeholder="e.g., customer1@gmail.com, customer2@gmail.com"
              className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200 font-mono"
            />
          </div>
        </div>

        {/* Preview Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-5 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/60 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handlePreviewAudience}
              disabled={isLoadingAudience || (!selectedSegmentId && !manualEmails.trim())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono font-bold rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
            >
              {isLoadingAudience ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Eye size={13} className="stroke-[2.5px]" />
              )}
              {isLoadingAudience ? "Counting..." : "Preview Audience"}
            </button>
            {audienceCount !== null && (
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle size={14} />
                {audienceCount.toLocaleString('en-PK')} RECIPIENTS
              </span>
            )}
          </div>

          {/* Send Limit */}
          <div className="flex items-center gap-2.5">
            <label className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Send Limit
            </label>
            <input
              type="number"
              min={0}
              value={sendLimit}
              onChange={(e) => setSendLimit(Number(e.target.value) || 0)}
              className="w-20 px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 text-xs text-center font-mono focus:border-brand-primary outline-hidden text-zinc-800 dark:text-zinc-200"
              placeholder="All"
            />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">(0 = all)</span>
          </div>
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <FileText size={16} className="text-brand-primary stroke-[2.2px]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              2. Compose Email Content
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Code size={12} /> HTML Supported
          </span>
        </div>

        <div className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Special Offer Just for You! 🚀"
              className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200"
            />
          </div>

          {/* HTML Content & Tag Bar */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <label className="block text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                HTML Body Body
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Tag size={10} /> Insert Variable Tag:
                </span>
                {["{{name}}", "{{email}}", "{{senderName}}"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertVariableTag(tag)}
                    className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded font-mono text-[9px] border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={9}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder={`<h1>Hello {{name}},</h1>\n<p>Check out our latest deals! Sent by {{senderName}}.</p>`}
              className="w-full px-3.5 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs font-mono placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary outline-hidden transition-all duration-200 leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* 3. SEND ACTION BAR (High-Contrast Buttons) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-primary/20 shrink-0">
            <Mail size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Ready to dispatch campaign?
            </span>
            {sendResult && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                Sent: {sendResult.sent.toLocaleString('en-PK')} | Failed: {sendResult.failed.toLocaleString('en-PK')}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || (!selectedSegmentId && !manualEmails.trim())}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary hover:bg-brand-primary-hover text-white font-mono font-bold rounded-xl text-xs uppercase tracking-widest transition-all disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer shadow-md shadow-brand-primary/20"
        >
          {isSending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Broadcasting...
            </>
          ) : (
            <>
              <Send size={14} />
              Send Campaign
            </>
          )}
        </button>
      </div>
    </div>
  );
}