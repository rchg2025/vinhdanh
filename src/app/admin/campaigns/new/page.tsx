"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    templateUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Lỗi khi tạo đợt xét duyệt");
      
      toast.success("Tạo đợt xét duyệt thành công!");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Tạo Đợt Vinh Danh Mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tên Danh Hiệu (VD: Sinh viên 5 tốt 2026)</Label>
              <Input id="title" required value={formData.title} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả / Yêu cầu</Label>
              <Textarea id="description" rows={4} value={formData.description} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày bắt đầu nộp hồ sơ</Label>
                <Input id="startDate" type="datetime-local" required value={formData.startDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày kết thúc</Label>
                <Input id="endDate" type="datetime-local" required value={formData.endDate} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateUrl">Link Phôi Giấy Khen (Ảnh URL để test)</Label>
              <Input id="templateUrl" placeholder="https://example.com/template.png" value={formData.templateUrl} onChange={handleChange} />
              <p className="text-xs text-gray-500">Ở phiên bản này, bạn dán link ảnh mẫu giấy khen. Hệ thống sẽ tự động vẽ chữ lên ảnh này.</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Đang lưu..." : "Lưu Đợt Mới"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
