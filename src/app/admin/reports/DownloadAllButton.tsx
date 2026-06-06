"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DownloadAllButton({ files }: { files: any[] }) {
  if (!files || files.length <= 1) return null;

  const handleDownloadAll = () => {
    files.forEach((fileObj, index) => {
      const url = typeof fileObj === "string" ? fileObj : fileObj.url;
      // We open each url in a new tab with a slight delay to prevent browser blocking
      setTimeout(() => {
        window.open(url, "_blank");
      }, index * 200);
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownloadAll}
      className="mt-2 text-xs h-7 px-2 flex items-center gap-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border-indigo-200"
    >
      <Download size={12} /> Tải tất cả
    </Button>
  );
}
