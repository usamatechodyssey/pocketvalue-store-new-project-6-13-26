// /src/app/account/profile/_components/UpdateProfileImage.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { User as UserIcon, Upload, Loader2, ImageIcon } from "lucide-react";

export default function UpdateProfileImage() {
  const { data: session, update: updateSession } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, startUploadingTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image must be less than 5MB.");
        return;
      }
      setImageFile(file);
      // Create a temporary URL for instant preview
      if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean up previous preview
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = () => {
    if (!imageFile) return;
    startUploadingTransition(async () => {
      const formData = new FormData();
      formData.append("image", imageFile);
      try {
        const response = await fetch("/api/user/update-image", { method: "POST", body: formData });
        const result = await response.json();
        
        if (result.success) {
          // Trigger a session update to fetch the new image URL from the server
          await updateSession({ trigger: "update" });
          toast.success("Profile image updated successfully.");
          setImageFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        } else {
          toast.error(result.message || "Upload failed.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred during upload.");
      }
    });
  };

  const currentImage = previewUrl || session?.user?.image || null;

  return (
    <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <ImageIcon size={20} /> Profile Picture
      </h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Image Preview */}
        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 shrink-0">
          {currentImage ? (
            <Image src={currentImage} alt="Profile" fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <UserIcon className="h-10 w-10 text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <input type="file" accept="image/png, image/jpeg, image/webp" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading} 
            className="px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Choose Image
          </button>
          {imageFile && (
            <button 
              onClick={handleImageUpload} 
              disabled={isUploading} 
              className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary-hover disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              {isUploading ? "Uploading..." : "Upload & Save"}
            </button>
          )}
        </div>
      </div>
      {imageFile && <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Selected: <span className="font-medium">{imageFile.name}</span></p>}
    </div>
  );
}