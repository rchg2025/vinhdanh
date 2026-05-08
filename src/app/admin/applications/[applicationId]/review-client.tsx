"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";

function getDisplayUrl(url: string): string {
  if (!url) return "";
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch?.[1]) return `https://drive.google.com/thumbnail?id=${viewMatch[1]}&sz=w2000`;
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch?.[1] && url.includes("drive.google.com"))
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w2000`;
  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApplicationReviewClient({ application }: { application: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);
  const [templateDataUrl, setTemplateDataUrl] = useState<string>("");
  const [templateLoading, setTemplateLoading] = useState(false);

  // Fetch template image via proxy to get a CORS-safe data URL for html-to-image
  useEffect(() => {
    const rawUrl = application.campaign.templateUrl;
    if (!rawUrl) return;

    setTemplateLoading(true);
    const displayUrl = getDisplayUrl(rawUrl);
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(displayUrl)}`;

    fetch(proxyUrl)
      .then((r) => {
        if (!r.ok) throw new Error("Proxy fetch failed");
        return r.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => setTemplateDataUrl(dataUrl))
      .catch((err) => {
        console.error("Failed to load template image:", err);
        // Fallback: use the converted display URL directly
        setTemplateDataUrl(displayUrl);
      })
      .finally(() => setTemplateLoading(false));
  }, [application.campaign.templateUrl]);

  const backgroundStyle = templateDataUrl
    ? `url(${templateDataUrl})`
    : application.campaign.templateUrl
    ? `url(${getDisplayUrl(application.campaign.templateUrl)})`
    : "none";

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    let certificateUrl = application.certificateUrl;

    try {
      if (status === "APPROVED" && certRef.current) {
        toast.info("Đang tạo giấy khen tự động...");
        // Generate Image from DOM
        const dataUrl = await htmlToImage.toPng(certRef.current, { quality: 1, pixelRatio: 2 });

        // Convert dataUrl to File
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `GiayKhen_${application.user.studentId}.png`, { type: "image/png" });

        // Upload to Google Drive (via our API)
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadResult = await uploadRes.json();

        if (uploadRes.ok) {
          certificateUrl = uploadResult.url;
          toast.success("Đã tạo và lưu giấy khen thành công");
        } else {
          toast.error("Không thể lưu giấy khen lên Drive");
        }
      }

      // Update Database
      const dbRes = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, certificateUrl }),
      });

      if (!dbRes.ok) throw new Error("Cập nhật trạng thái thất bại");

      toast.success("Đã cập nhật trạng thái hồ sơ!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xử lý");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyết định & Cấp Giấy Khen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Template loading indicator */}
        {templateLoading && (
          <p className="text-sm text-gray-500 animate-pulse">Đang tải mẫu giấy khen...</p>
        )}

        {/* No template warning */}
        {!application.campaign.templateUrl && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Đợt xét duyệt này chưa có mẫu giấy khen. Hãy chọn mẫu trong trang chỉnh sửa đợt.
          </div>
        )}

        {/* Certificate Preview Element */}
        <div className="border rounded bg-gray-100 p-4 overflow-x-auto flex justify-center">
          <div
            ref={certRef}
            className="relative shadow-lg"
            style={{
              width: "800px",
              height: "565px",
              backgroundColor: "#fff",
              backgroundImage: backgroundStyle,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Absolute positioned text overlay */}
            <div className="absolute top-[240px] left-0 right-0 text-center">
              <h2 className="text-4xl font-bold text-red-600 uppercase font-serif">{application.user.name}</h2>
            </div>
            <div className="absolute top-[290px] left-0 right-0 text-center">
              <p className="text-xl italic font-serif">Đã đạt danh hiệu: {application.campaign.title}</p>
            </div>

            {application.portraitImage && (
              <div className="absolute top-[350px] left-[80px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={application.portraitImage}
                  alt="Portrait"
                  className="w-[100px] h-[130px] object-cover border-4 border-white shadow-md"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            <div className="absolute bottom-[80px] right-[100px] text-center">
              <p className="text-sm">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm{" "}
                {new Date().getFullYear()}
              </p>
              <p className="font-bold mt-20">BCH Đoàn Trường</p>
            </div>
          </div>
        </div>

        {/* Existing certificate — admin download + student info */}
        {application.status === "APPROVED" && application.certificateUrl && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="font-semibold text-green-800">Hồ sơ đã được duyệt</p>
              <p className="text-sm text-green-600">
                Sinh viên có thể tải giấy khen từ trang cá nhân của mình.
              </p>
            </div>
            <a
              href={application.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <Download size={16} /> Xem / Tải Giấy Khen
            </a>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            onClick={() => handleUpdateStatus("APPROVED")}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Duyệt & Cấp Giấy Khen
          </Button>
          <Button
            onClick={() => handleUpdateStatus("REJECTED")}
            disabled={loading}
            variant="destructive"
          >
            Từ chối
          </Button>
          <Button
            onClick={() => handleUpdateStatus("PENDING")}
            disabled={loading}
            variant="outline"
          >
            Chuyển về Chờ Duyệt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
