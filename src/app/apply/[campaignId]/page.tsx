"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, Send, UserCircle } from "lucide-react";

export default function ApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    achievements: "",
  });
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const handleUpload = async (file: File) => {
    // Sử dụng Resumable Upload: tạo session trên server, sau đó upload trực tiếp
    // từ trình duyệt lên Google Drive để không bị giới hạn dung lượng.
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

    // Upload file trực tiếp từ trình duyệt lên Google Drive (không qua server)
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

    // Gọi finish để cấp quyền public và lấy URL
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
      let portraitUrl = null;
      let evidenceUrls: string[] = [];

      if (portraitFile) {
        setUploading(true);
        toast.info("Đang tải ảnh chân dung lên Google Drive...");
        const res = await handleUpload(portraitFile);
        portraitUrl = res.url;
      }

      if (evidenceFile) {
        setUploading(true);
        toast.info("Đang tải file minh chứng lên Google Drive...");
        const res = await handleUpload(evidenceFile);
        evidenceUrls.push(res.url);
      }

      setUploading(false);
      toast.info("Đang gửi hồ sơ xét duyệt...");

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          data: { achievements: formData.achievements },
          portraitImage: portraitUrl,
          evidenceFiles: evidenceUrls,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gặp lỗi khi gửi hồ sơ");
      }

      toast.success("Nộp hồ sơ thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
      setUploading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header / Sidebar alternative - Top fixed header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <FileText size={20} className="text-indigo-600" /> Nộp Hồ Sơ Mới
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 md:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Đăng ký Danh hiệu / Giải thưởng</h1>
            <p className="text-indigo-100 text-sm md:text-base">
              Vui lòng điền đầy đủ các thông tin và đính kèm minh chứng rõ ràng.
              File được tải lên trực tiếp Google Drive, không giới hạn dung lượng.
            </p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="achievements" className="text-base font-semibold text-gray-800">Thành tích nổi bật của bạn</Label>
                <p className="text-sm text-gray-500 mb-2">Liệt kê ngắn gọn các bằng khen, thẻ điểm, hoặc các hoạt động đã tham gia phù hợp với tiêu chí.</p>
                <Textarea
                  id="achievements"
                  rows={6}
                  placeholder="Ví dụ: Đạt giải Nhất cuộc thi Nghiên cứu khoa học cấp Trường năm 2025, Tham gia chiến dịch Mùa hè xanh..."
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  required
                  className="resize-none rounded-xl focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div className="space-y-3">
                  <Label htmlFor="portrait" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <UserCircle size={18} className="text-indigo-500" />
                    Ảnh thẻ chân dung
                  </Label>
                  <p className="text-xs text-gray-500">Ảnh rõ mặt, dùng để in giấy khen hoặc hiển thị vinh danh (JPG/PNG).</p>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50/50">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="portrait" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2 py-1">
                          <span>Tải ảnh lên</span>
                          <input id="portrait" name="portrait" type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files && setPortraitFile(e.target.files[0])} required />
                        </label>
                      </div>
                      {portraitFile ? <p className="text-xs text-green-600 font-medium truncate max-w-[200px]">{portraitFile.name}</p> : <p className="text-xs text-gray-400">Chưa chọn tệp nào</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="evidence" className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FileText size={18} className="text-indigo-500" />
                    File nén minh chứng
                  </Label>
                  <p className="text-xs text-gray-500">Gộp tất cả giấy chứng nhận vào 1 tệp PDF hoặc ZIP, RAR.</p>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50/50">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="evidence" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2 py-1">
                          <span>Tải file nén lên</span>
                          <input id="evidence" name="evidence" type="file" accept=".zip,.rar,.pdf,.doc,.docx" className="sr-only" onChange={(e) => e.target.files && setEvidenceFile(e.target.files[0])} />
                        </label>
                      </div>
                      {evidenceFile ? <p className="text-xs text-green-600 font-medium truncate max-w-[200px]">{evidenceFile.name}</p> : <p className="text-xs text-gray-400">Không bắt buộc</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading || uploading} 
                  className="w-full h-12 text-base rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all gap-2"
                >
                  {(loading || uploading) ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                      {uploading ? "Đang đẩy file lên hệ thống..." : "Đang xử lý..."}
                    </span>
                  ) : (
                    <>
                      <Send size={18} /> Gửi Hồ Sơ Xét Duyệt
                    </>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}