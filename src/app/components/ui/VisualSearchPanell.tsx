// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { useKeenSlider } from "keen-slider/react";
// import "keen-slider/keen-slider.min.css";
// import {
//   X,
//   UploadCloud,
//   Search,
//   ArrowLeft,
//   ArrowRight,
//   Image as ImageIcon,
//   AlertTriangle,
//   Loader2,
// } from "lucide-react";

// import SanityProduct from "@/sanity/types/product_types";
// // 🔥 UPDATED: Now pointing to Payload-based query helper
// import { getPayloadProductsBySlugs } from "@/sanity/lib/payload/product.queries";
// import { urlFor } from "@/sanity/lib/image";

// interface VisualSearchPanelProps {
//   onClose: () => void;
// }

// const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

// export default function VisualSearchPanel({ onClose }: VisualSearchPanelProps) {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [results, setResults] = useState<SanityProduct[]>([]);

//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [loaded, setLoaded] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   // Keen Slider Configuration
//   const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
//     initial: 0,
//     slides: { perView: "auto", spacing: 12 },
//     slideChanged: (slider) => setCurrentSlide(slider.track.details.rel),
//     created: () => setLoaded(true),
//   });

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         setError("Image size should be less than 5MB.");
//         return;
//       }
//       setSelectedFile(file);
//       setError(null);
//     }
//   };

//   const handleSearch = useCallback(async (file: File) => {
//     setIsLoading(true);
//     setError(null);
//     setResults([]);

//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       // 1. Hit AI Server API
//       const response = await fetch("/api/visual-search", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || "Could not analyze image.");
//       }

//       const aiData: { results: { slug: string; similarity: number }[] } = await response.json();
//       const slugs = aiData.results.map((item) => item.slug).filter(Boolean);

//       if (slugs.length > 0) {
//         // 2. Fetch Full Product Data from Payload
//         const products = await getPayloadProductsBySlugs(slugs);
//         setResults(products);
//       } else {
//         setResults([]);
//       }
//     } catch (err: any) {
//       setError(err.message || "Search failed. Please try again.");
//       console.error("Visual Search Error:", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Cleanup Preview URL and Trigger Search
//   useEffect(() => {
//     if (selectedFile) {
//       const objectUrl = URL.createObjectURL(selectedFile);
//       setPreviewUrl(objectUrl);
//       handleSearch(selectedFile);

//       return () => URL.revokeObjectURL(objectUrl);
//     }
//   }, [selectedFile, handleSearch]);

//   const resetSearch = () => {
//     setSelectedFile(null);
//     setPreviewUrl(null);
//     setResults([]);
//     setError(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const allResultSlugs = results.map((p) => p.slug).join(",");

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.98, y: 10 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       exit={{ opacity: 0, scale: 0.98, y: 10 }}
//       className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 z-50 overflow-hidden"
//     >
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center gap-2 text-brand-primary">
//           <div className="p-2 bg-brand-primary/10 rounded-lg">
//             <ImageIcon size={20} />
//           </div>
//           <h3 className="font-bold text-gray-900 dark:text-white">Visual Search AI</h3>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//         >
//           <X className="text-gray-500" size={20} />
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* LEFT: Upload Area */}
//         <div className="md:col-span-1">
//           <label
//             className={`relative flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden
//             ${previewUrl ? "border-brand-primary bg-gray-50 dark:bg-gray-900" : "border-gray-300 dark:border-gray-600 hover:border-brand-primary"}`}
//           >
//             {previewUrl ? (
//               <>
//                 <Image src={previewUrl} alt="Preview" fill className="object-contain p-2" />
//                 <button
//                   onClick={(e) => { e.preventDefault(); resetSearch(); }}
//                   className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 z-10"
//                 >
//                   <X size={12} />
//                 </button>
//               </>
//             ) : (
//               <div className="text-center p-4">
//                 <UploadCloud size={32} className="text-brand-primary mx-auto mb-2" />
//                 <p className="text-xs font-bold">Scan an image</p>
//                 <p className="text-[10px] text-gray-400 mt-1 uppercase">Max 5MB</p>
//               </div>
//             )}
//             <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//           </label>
//         </div>

//         {/* RIGHT: Results Area */}
//         <div className="md:col-span-2 flex flex-col h-56 bg-gray-50 dark:bg-gray-900/50 rounded-xl relative">
//           {isLoading ? (
//             <div className="grow flex flex-col items-center justify-center">
//               <Loader2 className="animate-spin text-brand-primary mb-2" size={28} />
//               <p className="text-xs font-medium text-gray-500">AI is analyzing your style...</p>
//             </div>
//           ) : results.length > 0 ? (
//             <div className="flex flex-col h-full p-4">
//               <div className="flex justify-between items-center mb-3">
//                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
//                   Matches Found ({results.length})
//                 </h4>
//                 <div className="flex gap-1.5">
//                   <button
//                     onClick={() => instanceRef.current?.prev()}
//                     disabled={currentSlide === 0}
//                     className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm border disabled:opacity-30"
//                   >
//                     <ArrowLeft size={14} />
//                   </button>
//                   <button
//                     onClick={() => instanceRef.current?.next()}
//                     disabled={currentSlide >= results.length - 1}
//                     className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm border disabled:opacity-30"
//                   >
//                     <ArrowRight size={14} />
//                   </button>
//                 </div>
//               </div>

//               <div ref={sliderRef} className="keen-slider grow">
//                 {results.map((product) => (
//                   <div key={product._id} className="keen-slider__slide min-w-27.5! max-w-27.5!">
//                     <button
//                       onClick={() => { router.push(`/product/${product.slug}`); onClose(); }}
//                       className="w-full h-full text-left group"
//                     >
//                       <div className="bg-white dark:bg-gray-800 rounded-lg p-2 h-full border border-transparent group-hover:border-brand-primary/40 transition-all shadow-sm">
//                         <div className="relative aspect-square mb-2 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-900">
//                           <Image
//                             src={product.defaultVariant.images?.[0] ? urlFor(product.defaultVariant.images[0]).url() : PLACEHOLDER_IMAGE_URL}
//                             alt={product.title}
//                             fill
//                             className="object-contain p-1 group-hover:scale-105 transition-transform"
//                           />
//                         </div>
//                         <p className="text-[10px] font-bold leading-tight line-clamp-2">{product.title}</p>
//                       </div>
//                     </button>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-2 text-right">
//                 <button
//                   onClick={() => { router.push(`/search?slugs=${allResultSlugs}`); onClose(); }}
//                   className="text-[10px] font-bold text-brand-primary uppercase hover:underline"
//                 >
//                   Explore all matches &rarr;
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="grow flex flex-col items-center justify-center text-gray-400">
//               <Search size={32} className="mb-2 opacity-20" />
//               <p className="text-xs">{selectedFile ? "No matching products found." : "Upload an image to start searching."}</p>
//             </div>
//           )}

//           {error && (
//             <div className="absolute inset-x-4 bottom-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-2.5 rounded-lg flex items-center gap-2 text-[10px] font-bold uppercase">
//               <AlertTriangle size={14} /> {error}
//             </div>
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// }
// src/app/components/ui/VisualSearchPanel.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  X,
  UploadCloud,
  Search,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import SanityProduct from "@/sanity/types/product_types";
import { urlFor } from "@/sanity/lib/image";

// ✅ FIXED: Using Server Action instead of direct DB query
import { fetchVisualSearchResults } from "@/app/actions/visualSearchActions";

interface VisualSearchPanelProps {
  onClose: () => void;
}

const PLACEHOLDER_IMAGE_URL = "/placeholder.png";

export default function VisualSearchPanel({ onClose }: VisualSearchPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SanityProduct[]>([]);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Keen Slider Configuration
  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    initial: 0,
    slides: { perView: "auto", spacing: 12 },
    slideChanged: (slider) => setCurrentSlide(slider.track.details.rel),
    created: () => setLoaded(true),
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB.");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSearch = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Hit AI Server API (External or Internal API Route)
      const response = await fetch("/api/visual-search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Could not analyze image.");
      }

      const aiData: { results: { slug: string; similarity: number }[] } =
        await response.json();
      const slugs = aiData.results.map((item) => item.slug).filter(Boolean);

      if (slugs.length > 0) {
        // 🔥 FIX: Calling Server Action to get DB data
        const result = await fetchVisualSearchResults(slugs);

        if (result.success) {
          setResults(result.products);
        } else {
          setError(result.error || "Failed to fetch matches.");
        }
      } else {
        setResults([]);
      }
    } catch (err: any) {
      setError(err.message || "Search failed. Please try again.");
      console.error("Visual Search Client Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cleanup Preview URL and Trigger Search
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      handleSearch(selectedFile);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile, handleSearch]);

  const resetSearch = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const allResultSlugs = results.map((p) => p.slug).join(",");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-brand-primary">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <ImageIcon size={20} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
            Style Visualizer
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="text-gray-500" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="md:col-span-1">
          <label
            className={`relative flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden ${previewUrl ? "border-brand-primary bg-gray-50 dark:bg-gray-900" : "border-gray-300 dark:border-gray-600 hover:border-brand-primary"}`}
          >
            {previewUrl ? (
              <>
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain p-2"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    resetSearch();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md z-10"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <UploadCloud
                  size={32}
                  className="text-brand-primary mx-auto mb-2"
                />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Scan Outfit
                </p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase">
                  Max 5MB
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Results Column */}
        <div className="md:col-span-2 flex flex-col h-56 bg-gray-50 dark:bg-gray-900/50 rounded-xl relative">
          {isLoading ? (
            <div className="grow flex flex-col items-center justify-center">
              <Loader2
                className="animate-spin text-brand-primary mb-2"
                size={28}
              />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Analyzing your style...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col h-full p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Matches Found
                </h4>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => instanceRef.current?.prev()}
                    disabled={currentSlide === 0}
                    className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm disabled:opacity-30"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    onClick={() => instanceRef.current?.next()}
                    disabled={currentSlide >= results.length - 1}
                    className="p-1 rounded-full bg-white dark:bg-gray-800 shadow-sm disabled:opacity-30"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div ref={sliderRef} className="keen-slider grow">
                {results.map((product) => (
                  <div
                    key={product._id}
                    className="keen-slider__slide min-w-27.5 max-w-27.5"
                  >
                    <button
                      onClick={() => {
                        router.push(`/product/${product.slug}`);
                        onClose();
                      }}
                      className="w-full h-full text-left group"
                    >
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 h-full border border-transparent group-hover:border-brand-primary transition-all shadow-sm">
                        <div className="relative aspect-square mb-2 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 p-1">
                          <Image
                            src={
                              product.defaultVariant?.images?.[0]
                                ? urlFor(product.defaultVariant.images[0]).url()
                                : PLACEHOLDER_IMAGE_URL
                            }
                            alt={product.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-[9px] font-bold leading-tight line-clamp-1">
                          {product.title}
                        </p>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grow flex flex-col items-center justify-center text-gray-400">
              <Search size={32} className="mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                {selectedFile ? "No Matches" : "Drop an Image"}
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-x-4 bottom-4 bg-red-600 text-white p-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase shadow-lg">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
