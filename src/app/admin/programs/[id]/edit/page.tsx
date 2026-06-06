"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
  });
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch existing program data
    fetch(`/api/programs`)
      .then(res => res.json())
      .then(data => {
        const prog = data.find((p: any) => p.id === id);
        if (prog) {
          setFormData({
            title: prog.title,
            description: prog.description || "",
            startDate: new Date(prog.startDate).toISOString().slice(0, 16),
            endDate: new Date(prog.endDate).toISOString().slice(0, 16),
            registrationStartDate: prog.registrationStartDate ? new Date(prog.registrationStartDate).toISOString().slice(0, 16) : "",
            registrationEndDate: prog.registrationEndDate ? new Date(prog.registrationEndDate).toISOString().slice(0, 16) : "",
          });
          setExistingImageUrl(prog.imageUrl);
        } else {
          toast.error("Không tìm thấy chương trình");
          router.push("/admin/programs");
        }
      })
      .catch(() => toast.error("Lỗi khi tải dữ liệu"))
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
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

    if (!initRes.ok) throw new Error("Không thể khởi tạo upload.");
    const { uploadUrl } = await initRes.json();

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });

    if (!uploadRes.ok) throw new Error("Upload lên Google Drive thất bại.");
    const uploadData = await uploadRes.json().catch(() => ({}));
    if (!uploadData.id) throw new Error("Không lấy được ID file sau khi upload.");

    const finishRes = await fetch("/api/upload/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: uploadData.id }),
    });

    if (!finishRes.ok) throw new Error("Không thể hoàn tất upload.");
    return finishRes.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = existingImageUrl;

      if (imageFile) {
        setUploading(true);
        toast.info("Đang tải ảnh đại diện lên Google Drive...");
        const res = await handleUpload(imageFile);
        finalImageUrl = res.url;
      }
      
      setUploading(false);
      toast.info("Đang cập nhật chương trình...");

      const res = await fetch(`/api/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, imageUrl: finalImageUrl }),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật chương trình");

      toast.success("Cập nhật chương trình thành công!");
      router.push("/admin/programs");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/programs" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sửa Chương trình</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Tên chương trình <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg font-medium"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả tổng quan</Label>
          <Textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon size={18} className="text-indigo-500" />
            Ảnh đại diện chương trình
          </Label>
          
          {existingImageUrl && !imageFile && (
            <div className="mb-2">
              <img src={existingImageUrl} alt="Current banner" className="h-32 object-cover rounded-lg border border-gray-200" />
            </div>
          )}

          <div
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors bg-gray-50/50 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('imageFile')?.click()}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-10 w-10 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <span className="font-medium text-indigo-600 hover:text-indigo-500 px-2 py-1">Kéo thả hoặc tải ảnh lên để thay thế</span>
                <input id="imageFile" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
              </div>
              {imageFile && <p className="text-xs text-green-600 font-medium truncate max-w-[200px] mx-auto">{imageFile.name}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu <span className="text-red-500">*</span></Label>
            <Input
              id="startDate"
              type="datetime-local"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Ngày kết thúc <span className="text-red-500">*</span></Label>
            <Input
              id="endDate"
              type="datetime-local"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationStartDate">Ngày mở đăng ký</Label>
            <Input
              id="registrationStartDate"
              type="datetime-local"
              value={formData.registrationStartDate}
              onChange={(e) => setFormData({ ...formData, registrationStartDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationEndDate">Ngày đóng đăng ký</Label>
            <Input
              id="registrationEndDate"
              type="datetime-local"
              value={formData.registrationEndDate}
              onChange={(e) => setFormData({ ...formData, registrationEndDate: e.target.value })}
            />
          </div>
        </div>

        <Button type="submit" disabled={loading || uploading} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {(loading || uploading) ? (uploading ? "Đang tải ảnh..." : "Đang xử lý...") : "Cập nhật chương trình"}
        </Button>
      </form>
    </div>
  );
}
