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

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [stages, setStages] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    stageId: "",
    maxRegistrations: "",
  });
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/stages").then(res => res.json()).then(data => setStages(Array.isArray(data) ? data : []));
    
    fetch(`/api/activities/${id}`)
      .then(res => res.json())
      .then(activity => {
        if (activity && activity.id) {
          setFormData({
            title: activity.title,
            description: activity.description || "",
            startDate: new Date(activity.startDate).toISOString().slice(0, 16),
            endDate: new Date(activity.endDate).toISOString().slice(0, 16),
            stageId: activity.stageId || "",
            maxRegistrations: activity.maxRegistrations ? activity.maxRegistrations.toString() : "",
          });
          setExistingImageUrl(activity.imageUrl);
        } else {
          toast.error("Không tìm thấy hoạt động");
          router.push("/admin/activities");
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
        toast.info("Đang tải ảnh lên Google Drive...");
        const res = await handleUpload(imageFile);
        finalImageUrl = res.url;
      }
      
      setUploading(false);
      toast.info("Đang cập nhật hoạt động...");

      const res = await fetch(`/api/activities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          imageUrl: finalImageUrl,
          maxRegistrations: formData.maxRegistrations ? parseInt(formData.maxRegistrations) : null,
          stageId: formData.stageId || null
        }),
      });

      if (!res.ok) throw new Error("Gặp lỗi khi cập nhật hoạt động");

      toast.success("Cập nhật hoạt động thành công!");
      router.push("/admin/activities");
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
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/activities" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">Sửa Hoạt động</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stageId">Chọn Chặng (Tùy chọn)</Label>
            <select
              id="stageId"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.stageId}
              onChange={(e) => setFormData({ ...formData, stageId: e.target.value })}
            >
              <option value="">-- Hoạt động độc lập (Không thuộc chặng) --</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.program?.title} - {stage.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxRegistrations">Số lượng đăng ký tối đa</Label>
            <Input
              id="maxRegistrations"
              type="number"
              min="1"
              value={formData.maxRegistrations}
              onChange={(e) => setFormData({ ...formData, maxRegistrations: e.target.value })}
              placeholder="Để trống nếu không giới hạn"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Tên hoạt động <span className="text-red-500">*</span></Label>
          <Input
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
            Ảnh banner (Tùy chọn)
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

        <Button type="submit" disabled={loading || uploading} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {(loading || uploading) ? (uploading ? "Đang tải ảnh..." : "Đang xử lý...") : "Cập nhật hoạt động"}
        </Button>
      </form>
    </div>
  );
}
