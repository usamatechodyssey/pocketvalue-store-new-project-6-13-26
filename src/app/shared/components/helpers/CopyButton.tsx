// /app/admin/_components/CopyButton.tsx - SIRF STYLING UPDATE

"use client";

import { ClipboardCopy } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard!");
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-text-subtle hover:text-text-primary transition-colors"
      aria-label="Copy to clipboard"
    >
      <ClipboardCopy size={14} />
    </button>
  );
}
