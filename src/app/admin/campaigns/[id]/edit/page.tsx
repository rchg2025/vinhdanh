"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Search, ChevronDown, X, Image as ImageIcon } from "lucide-react";

type CertTemplate = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
};

function getDisplayUrl(url: string) {
  if (!url) return "";
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch?.[1]) return `https://drive.google.com/thumbnail?id=${viewMatch[1]}&sz=w400`;
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch?.[1] && url.includes("drive.google.com"))
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w400`;
  return url;
}

function TemplateSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (templateUrl: string) => void;
}) {
  const [templates, setTemplates] = useState<CertTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CertTemplate | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .catch(() => {});
  }, []);

  // Sync initial value
  useEffect(() => {
    if (value && templates.length) {
      const found = templates.find((t) => t.imageUrl === value);
      if (found) setSelected(found);
    }
  }, [value, templates]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (t: CertTemplate) => {
    setSelected(t);
    onChange(t.imageUrl);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSelected(null);
    onChange("");
    setSearch("");
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        className="flex items-center border border-input rounded-md bg-background cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => setOpen(!open)}
      >
        {selected ? (
          <div className="flex items-center gap-3 flex-1 px-3 py-2 min-w-0">
            <img
              src={getDisplayUrl(selected.imageUrl)}
              alt={selected.name}
              className="w-12 h-8 object-contain rounded border bg-gray-50 shrink-0"
            />
            <span className="text-sm font-medium truncate">{selected.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="ml-auto text-gray-400 hover:text-gray-700 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 px-3 py-2 text-gray-400 text-sm">
            <ImageIcon size={16} />
            <span>Chọn mẫu giấy khen...</span>
            <ChevronDown size={16} className="ml-auto" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <Search size={14} className="text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm mẫu..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                Không tìm thấy mẫu nào
              </div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors ${
                    selected?.id === t.id ? "bg-indigo-50" : ""
                  }`}
                >
                  <img
                    src={getDisplayUrl(t.imageUrl)}
                    alt={t.name}
                    className="w-16 h-10 object-contain rounded border bg-gray-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-gray-500 truncate">{t.description}</p>
                    )}
                  </div>
                  {selected?.id === t.id && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    templateUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await fetch(`/api/campaigns/${campaignId}`);
        if (!res.ok) throw new Error("Không thể lấy dữ liệu đợt vinh danh");
        const data = await res.json();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "",
          endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "",
          templateUrl: data.templateUrl || "",
        });
      } catch (error: unknown) {
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Lỗi khi cập nhật đợt xét duyệt");
      toast.success("Cập nhật đợt xét duyệt thành công!");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error: unknown) {
      toast.error((error as Error).message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Đang tải...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Chỉnh Sửa Đợt Vinh Danh</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên Danh Hiệu</Label>
              <Input id="title" required value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả / Yêu cầu</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu</Label>
                <Input id="startDate" type="datetime-local" required value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" type="datetime-local" required value={formData.endDate} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mẫu Giấy Khen</Label>
              <TemplateSelector
                value={formData.templateUrl}
                onChange={(url) => setFormData({ ...formData, templateUrl: url })}
              />
              <p className="text-xs text-gray-500">
                Chọn mẫu từ danh sách Mẫu Giấy Khen đã được thiết kế. Có thể gõ để tìm kiếm.
              </p>
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? "Đang lưu..." : "Cập Nhật"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/campaigns")}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}