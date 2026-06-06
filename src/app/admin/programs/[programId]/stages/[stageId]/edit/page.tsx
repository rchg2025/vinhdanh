"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditStagePage({ params }: { params: Promise<{ programId: string; stageId: string }> }) {
  const { programId, stageId } = use(params);
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

  useEffect(() => {
    // Fetch existing stage data
    fetch(`/api/programs/${programId}/stages`)
      .then(res => res.json())
      .then(data => {
        const stage = data.find((s: any) => s.id === stageId);
        if (stage) {
          setFormData({
            title: stage.title,
            description: stage.description || "",
            startDate: stage.startDate ? new Date(stage.startDate).toISOString().slice(0, 16) : "",
            endDate: stage.endDate ? new Date(stage.endDate).toISOString().slice(0, 16) : "",
            registrationStartDate: stage.registrationStartDate ? new Date(stage.registrationStartDate).toISOString().slice(0, 16) : "",
            registrationEndDate: stage.registrationEndDate ? new Date(stage.registrationEndDate).toISOString().slice(0, 16) : "",
          });
        } else {
          toast.error("Không tìm thấy chặng");
          router.push(`/admin/programs/${programId}/stages`);
        }
      })
      .catch(() => toast.error("Lỗi khi tải dữ liệu"))
      .finally(() => setFetching(false));
  }, [programId, stageId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/programs/${programId}/stages/${stageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Lỗi khi cập nhật chặng");

      toast.success("Cập nhật chặng thành công!");
      router.push(`/admin/programs/${programId}/stages`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/programs/${programId}/stages`} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sửa Chặng</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Tên chặng <span className="text-red-500">*</span></Label>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu diễn ra</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Ngày kết thúc diễn ra</Label>
            <Input
              id="endDate"
              type="datetime-local"
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

        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? "Đang xử lý..." : "Cập nhật chặng"}
        </Button>
      </form>
    </div>
  );
}
