"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Send } from "lucide-react";

export default function ReportForm({ activityId }: { activityId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setEvidenceFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleUpload = async (file: File) => {
    const initRes = await fetch("/api/upload/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        origin: window.location.origin,
      }),
    });

    if (!initRes.ok) {
      const errData = await initRes.json().catch(() => ({}));
      throw new Error(errData.message || "Không thể khởi tạo upload.");
    }

    const { uploadUrl } = await initRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Upload lên Google Drive thất bại. Vui lòng thử lại.");
    }

    const uploadData = await uploadRes.json().catch(() => ({}));
    const fileId = uploadData.id;

    if (!fileId) {
      throw new Error("Không lấy được ID file sau khi upload.");
    }

    const finishRes = await fetch("/api/upload/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });

    if (!finishRes.ok) {
      const errData = await finishRes.json().catch(() => ({}));
      throw new Error(errData.message || "Không thể hoàn tất upload.");
    }

    return finishRes.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let evidenceUrls: any[] = [];

      if (evidenceFiles.length > 0) {
        setUploading(true);
        toast.info(`Đang tải lên ${evidenceFiles.length} file đính kèm...`);
        // Upload sequentially to avoid overloading
        for (const file of evidenceFiles) {
          const res = await handleUpload(file);
          evidenceUrls.push({ url: res.url, name: file.name });
        }
      }

      setUploading(false);
      toast.info("Đang gửi báo cáo...");

      const res = await fetch(`/api/activities/${activityId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          evidenceFiles: evidenceUrls.length > 0 ? evidenceUrls : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gặp lỗi khi gửi báo cáo");
      }

      toast.success("Nộp báo cáo thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="content" className="text-base font-semibold text-gray-800">Nội dung báo cáo</Label>
        <p className="text-sm text-gray-500 mb-2">Tóm tắt lại những công việc bạn đã thực hiện trong hoạt động này.</p>
        <Textarea
          id="content"
          rows={6}
          placeholder="Ví dụ: Đã tham gia phát quà cho 50 hộ nghèo..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="resize-none rounded-xl focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="evidence" className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" />
          Tệp minh chứng đính kèm (không bắt buộc)
        </Label>
        <p className="text-xs text-gray-500">Có thể upload mọi loại file. Chúng tôi sẽ lưu trữ trên Google Drive.</p>

        <div
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50/50 cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('evidence')?.click()}
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-10 w-10 text-gray-400" />
            <div className="flex text-sm text-gray-600 justify-center">
              <span className="font-medium text-indigo-600 hover:text-indigo-500 px-2 py-1">Kéo thả hoặc tải file lên</span>
              <input id="evidence" name="evidence" type="file" multiple className="hidden" onChange={(e) => {
                if (e.target.files) {
                  setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                }
              }} />
            </div>
            {evidenceFiles.length > 0 ? (
              <div className="text-xs text-green-600 font-medium truncate max-w-[200px] mx-auto text-center space-y-1">
                <p>Đã chọn {evidenceFiles.length} file</p>
                {evidenceFiles.map((f, i) => <p key={i} className="truncate" title={f.name}>{f.name}</p>)}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Dung lượng tải lên tối đa 10MB mỗi file</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || uploading}
        className="w-full h-12 text-base rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all gap-2"
      >
        {(loading || uploading) ? (
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {uploading ? "Đang đẩy file lên hệ thống..." : "Đang xử lý..."}
          </span>
        ) : (
          <>
            <Send size={18} /> Gửi Báo Cáo
          </>
        )}
      </Button>
    </form>
  );
}
