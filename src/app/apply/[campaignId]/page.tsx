"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function ApplicationPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    achievements: "",
    unit: "",
  });
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const handleUpload = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    if (!res.ok) throw new Error("Upload thất bại");
    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let portraitUrl = null;
      let evidenceUrls = [];

      if (portraitFile) {
        setUploading(true);
        toast.info("Đang tải ảnh thẻ lên hệ thống...");
        const res = await handleUpload(portraitFile);
        portraitUrl = res.url;
      }

      if (evidenceFile) {
        toast.info("Đang tải minh chứng lên hệ thống...");
        const res = await handleUpload(evidenceFile);
        evidenceUrls.push(res.url);
      }
      setUploading(false);

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          data: { achievements: formData.achievements, unit: formData.unit },
          portraitImage: portraitUrl,
          evidenceFiles: evidenceUrls,
        }),
      });

      if (!res.ok) throw new Error("Lỗi nộp hồ sơ");

      toast.success("Nộp hồ sơ thành công!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nộp Hồ Sơ Xét Duyệt</CardTitle>
          <CardDescription>Vui lòng điền đầy đủ thông tin và đính kèm minh chứng.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit">Chi đoàn / Đơn vị</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievements">Thành tích nổi bật</Label>
              <Textarea
                id="achievements"
                rows={4}
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portrait">Ảnh thẻ (dùng in giấy khen)</Label>
              <Input
                id="portrait"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setPortraitFile(e.target.files[0])}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="evidence">File minh chứng (PDF/ZIP/Hình ảnh)</Label>
              <Input
                id="evidence"
                type="file"
                onChange={(e) => e.target.files && setEvidenceFile(e.target.files[0])}
              />
            </div>
            <Button type="submit" disabled={loading || uploading} className="w-full">
              {loading || uploading ? "Đang xử lý..." : "Gửi Hồ Sơ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
