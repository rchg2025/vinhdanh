"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

export default function DownloadAllButton({ files }: { files: string[] }) {
  const handleDownload = () => {
    if (files.length === 0) {
      toast.error("Không có tệp đính kèm nào để tải xuống.");
      return;
    }

    if (files.length > 5) {
      const confirm = window.confirm(`Bạn đang chuẩn bị tải xuống ${files.length} tệp. Trình duyệt có thể yêu cầu cấp quyền mở nhiều tab. Bạn có muốn tiếp tục?`);
      if (!confirm) return;
    }

    toast.info(`Bắt đầu tải xuống ${files.length} tệp...`);

    files.forEach((url, i) => {
      setTimeout(() => {
        let downloadUrl = url;
        if (downloadUrl.includes('drive.google.com/uc')) {
           downloadUrl = downloadUrl.replace('export=view', 'export=download');
        }
        window.open(downloadUrl, "_blank");
      }, i * 500);
    });
  };

  return (
    <button 
      onClick={handleDownload}
      disabled={files.length === 0}
      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      <Download size={18} /> Tải xuống tất cả tệp ({files.length})
    </button>
  );
}
