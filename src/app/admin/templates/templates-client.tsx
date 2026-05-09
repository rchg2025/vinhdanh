"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Image as ImageIcon, Copy, Check, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

type Template = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  createdAt: string;
};

const getDisplayUrl = (url: string) => {
  if (!url) return "";
  
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch && viewMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${viewMatch[1]}&sz=w2000`;
  }
  
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1] && url.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w2000`;
  }
  
  return url;
};

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    imageUrl: "",
  });

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTemplates(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải dữ liệu mẫu giấy khen");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template?: Template) => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        description: template.description || "",
        imageUrl: template.imageUrl,
      });
    } else {
      setFormData({ id: "", name: "", description: "", imageUrl: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ id: "", name: "", description: "", imageUrl: "" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    const toastId = toast.loading("Đang tải ảnh lên...");
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tải ảnh");

      setFormData({ ...formData, imageUrl: data.url });
      toast.success("Tải ảnh thành công", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tải ảnh", { id: toastId });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.imageUrl) {
      toast.error("Vui lòng điền tên và URL hình ảnh");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = formData.id ? `/api/templates/${formData.id}` : "/api/templates";
      const method = formData.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          imageUrl: formData.imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(formData.id ? "Cập nhật thành công!" : "Thêm mới thành công!");
      fetchTemplates();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá mẫu này?")) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Đã xoá mẫu giấy khen");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      toast.error(error.message || "Lỗi xoá dữ liệu");
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Đã sao chép URL");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return <div className="animate-pulse bg-white rounded-xl h-64 border border-gray-100"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Danh sách mẫu</h2>
            <p className="text-xs text-gray-500">{templates.length} mẫu đã lưu</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={16} /> Thêm mẫu mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="aspect-[1.414] w-full bg-gray-100 relative border-b border-gray-100 group-hover:opacity-90 transition-opacity">
              {template.imageUrl ? (
                <img 
                  src={getDisplayUrl(template.imageUrl)} 
                  alt={template.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x565?text=L%E1%BB%97i+%E1%BA%A3nh';
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate">{template.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
                {template.description || "Không có mô tả"}
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(template.imageUrl, template.id)}
                  className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                  title="Sao chép URL hình ảnh để dùng trong Đợt xét duyệt"
                >
                  {copiedId === template.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copiedId === template.id ? 'Đã chép' : 'Copy URL'}
                </button>
                
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/templates/${template.id}/design`}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Thiết kế vị trí"
                  >
                    <LayoutTemplate size={16} />
                  </Link>
                  <button
                    onClick={() => handleOpenModal(template)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Sửa thông tin"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Xoá"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <ImageIcon className="text-gray-400" size={24} />
            </div>
            <h3 className="text-sm font-medium text-gray-900">Chưa có mẫu nào</h3>
            <p className="text-xs text-gray-500 mt-1">Bấm "Thêm mẫu mới" để tải lên mẫu giấy khen đầu tiên.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {formData.id ? "Sửa mẫu giấy khen" : "Thêm mẫu giấy khen mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên mẫu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  placeholder="Vd: Giấy khen Sinh viên 5 tốt 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Mô tả ngắn gọn về mẫu này..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh mẫu (Template) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploadingFile}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                {isUploadingFile && <p className="text-sm text-indigo-600 mt-2 animate-pulse">Đang tải ảnh lên Google Drive...</p>}
                {!formData.imageUrl && !isUploadingFile && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Khuyến nghị kích thước A4 ngang (ví dụ: 1123 x 794 px). Chọn file ảnh để tải lên.
                  </p>
                )}
              </div>

              {formData.imageUrl && (
                <div className="mt-4 aspect-[1.414] w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <img
                    src={getDisplayUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x565?text=L%E1%BB%97i+%E1%BA%A3nh';
                    }}
                  />
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingFile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu mẫu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
