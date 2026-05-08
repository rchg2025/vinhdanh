"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";

type TemplateField = {
  id: string;
  type: "text" | "image" | "line";
  label: string;
  value: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

function getDisplayUrl(url: string): string {
  if (!url) return "";
  const viewMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (viewMatch?.[1]) return `https://drive.google.com/thumbnail?id=${viewMatch[1]}&sz=w2000`;
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch?.[1] && url.includes("drive.google.com"))
    return `https://drive.google.com/thumbnail?id=${ucMatch[1]}&sz=w2000`;
  return url;
}

async function toDataUrl(url: string): Promise<string> {
  const displayUrl = getDisplayUrl(url);
  const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(displayUrl)}`;
  const r = await fetch(proxyUrl);
  if (!r.ok) throw new Error("Failed to proxy image");
  const blob = await r.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApplicationReviewClient({ application, template }: { application: any; template: any | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const [bgDataUrl, setBgDataUrl] = useState<string>("");
  const [fieldDataUrls, setFieldDataUrls] = useState<Record<string, string>>({});
  const [templateLoading, setTemplateLoading] = useState(false);

  const templateFields: TemplateField[] =
    template?.config && Array.isArray(template.config) ? template.config : [];

  useEffect(() => {
    if (!template?.imageUrl) return;
    setTemplateLoading(true);

    const bgPromise = toDataUrl(template.imageUrl)
      .then(setBgDataUrl)
      .catch((e) => console.error("bg load failed", e));

    const imageFields = templateFields.filter((f) => f.type === "image" && f.value);
    const fieldPromises = imageFields.map((f) =>
      toDataUrl(f.value)
        .then((dataUrl) => setFieldDataUrls((prev) => ({ ...prev, [f.id]: dataUrl })))
        .catch((e) => console.error(`field ${f.id} load failed`, e))
    );

    Promise.all([bgPromise, ...fieldPromises]).finally(() => setTemplateLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.imageUrl]);

  const getFieldValue = (field: TemplateField): string => {
    const baseId = field.id.split("_")[0];
    if (baseId === "honoree") return application.user.name || field.value;
    if (baseId === "achievement") return application.campaign.title || field.value;
    return field.value;
  };

  // Check if template config already has these dynamic fields
  const hasHonoree = templateFields.some((f) => f.id.split("_")[0] === "honoree");
  const hasAchievement = templateFields.some((f) => f.id.split("_")[0] === "achievement");

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    let certificateUrl = application.certificateUrl;

    try {
      if (status === "APPROVED" && certRef.current) {
        toast.info("Đang tạo giấy khen tự động...");
        const dataUrl = await htmlToImage.toPng(certRef.current, { quality: 1, pixelRatio: 2 });

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `GiayKhen_${application.user.studentId}.png`, {
          type: "image/png",
        });

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

  const CANVAS_W = 1123;
  const CANVAS_H = 794;
  const PREVIEW_W = 800;
  const scale = PREVIEW_W / CANVAS_W;
  const PREVIEW_H = Math.round(CANVAS_H * scale);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyết định & Cấp Giấy Khen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {templateLoading && (
          <p className="text-sm text-gray-500 animate-pulse">Đang tải mẫu giấy khen...</p>
        )}

        {!template && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            Đợt xét duyệt này chưa có mẫu giấy khen. Hãy chọn mẫu trong trang chỉnh sửa đợt.
          </div>
        )}

        {template && (
          <>
            <style dangerouslySetInnerHTML={{
              __html: `@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap');`,
            }} />

            <div
              className="border rounded overflow-hidden mx-auto bg-gray-100"
              style={{ width: `${PREVIEW_W}px`, height: `${PREVIEW_H}px` }}
            >
              <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
                <div
                  ref={certRef}
                  style={{
                    width: `${CANVAS_W}px`,
                    height: `${CANVAS_H}px`,
                    position: "relative",
                    backgroundColor: "#fff",
                    overflow: "hidden",
                  }}
                >
                  {bgDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bgDataUrl}
                      alt=""
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {templateFields.map((field) => (
                    <div
                      key={field.id}
                      style={{
                        position: "absolute",
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: "translate(-50%, -50%)",
                        color: field.color,
                        fontSize: field.type === "text" ? `${field.fontSize}px` : undefined,
                        fontWeight: field.bold ? "bold" : "normal",
                        fontStyle: field.italic ? "italic" : "normal",
                        textDecoration: field.underline ? "underline" : "none",
                        fontFamily: field.fontFamily || "Roboto",
                        textAlign: field.align,
                        whiteSpace: "nowrap",
                        width:
                          field.type === "image" || field.type === "line"
                            ? `${field.width}px`
                            : undefined,
                        height:
                          field.type === "image" || field.type === "line"
                            ? `${field.height}px`
                            : undefined,
                        backgroundColor:
                          field.type === "line" ? field.color : "transparent",
                        zIndex: 1,
                      }}
                    >
                      {field.type === "text" && getFieldValue(field)}

                      {field.type === "image" && (fieldDataUrls[field.id] || field.value) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fieldDataUrls[field.id] || getDisplayUrl(field.value)}
                          alt={field.label}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Fallback: always render student name if template has no honoree field */}
                  {!hasHonoree && application.user.name && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "52%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "40px",
                        fontWeight: "bold",
                        color: "#c0392b",
                        fontFamily: "Roboto",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        zIndex: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      {application.user.name}
                    </div>
                  )}

                  {/* Fallback: always render campaign title if template has no achievement field */}
                  {!hasAchievement && application.campaign.title && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "63%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "24px",
                        fontStyle: "italic",
                        color: "#2c3e50",
                        fontFamily: "Roboto",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        zIndex: 2,
                      }}
                    >
                      {application.campaign.title}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

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
            disabled={loading || !template}
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
