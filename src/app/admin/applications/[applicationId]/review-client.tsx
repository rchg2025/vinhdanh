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
  type: "text" | "image" | "line" | "qrcode";
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
  shape?: "rectangle" | "circle"; // for portrait image
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
  // If already a proxy URL, use directly; otherwise proxy it
  const fetchUrl = url.startsWith("/api/proxy-image")
    ? url
    : `/api/proxy-image?url=${encodeURIComponent(getDisplayUrl(url))}`;
  const r = await fetch(fetchUrl);
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
  const [showCertModal, setShowCertModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const [bgDataUrl, setBgDataUrl] = useState<string>("");
  const [fieldDataUrls, setFieldDataUrls] = useState<Record<string, string>>({});
  const [portraitDataUrl, setPortraitDataUrl] = useState<string>("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [templateLoading, setTemplateLoading] = useState(false);

  // The public URL that the QR code should point to
  const certViewUrl = `${typeof window !== "undefined" ? window.location.origin : "https://vinhdanh.ite.id.vn"}/certificate/${application.id}`;

  const templateFields: TemplateField[] =
    template?.config && Array.isArray(template.config) ? template.config : [];

  useEffect(() => {
    if (!template?.imageUrl) return;
    setTemplateLoading(true);

    const bgPromise = toDataUrl(template.imageUrl)
      .then(setBgDataUrl)
      .catch((e) => console.error("bg load failed", e));

    // Pre-load static image fields (logo, signature, etc.)
    const imageFields = templateFields.filter(
      (f) => f.type === "image" && f.value && f.id.split("_")[0] !== "portrait"
    );
    const fieldPromises = imageFields.map((f) =>
      toDataUrl(f.value)
        .then((dataUrl) => setFieldDataUrls((prev) => ({ ...prev, [f.id]: dataUrl })))
        .catch((e) => console.error(`field ${f.id} load failed`, e))
    );

    // Pre-load the student's portrait from the application
    const portraitPromise = application.portraitImage
      ? toDataUrl(application.portraitImage)
          .then(setPortraitDataUrl)
          .catch((e) => console.error("portrait load failed", e))
      : Promise.resolve();

    // Pre-load QR code image for html-to-image rendering
    const hasQr = (template?.config as TemplateField[] | undefined)?.some(f => f.type === "qrcode");
    const qrPromise = hasQr
      ? (() => {
          // Defer until window is available so certViewUrl is correct
          const origin = typeof window !== "undefined" ? window.location.origin : "https://vinhdanh.ite.id.vn";
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(origin + "/certificate/" + application.id)}`;
          const proxied = `/api/proxy-image?url=${encodeURIComponent(qrUrl)}`;
          return toDataUrl(proxied).then(setQrDataUrl).catch(e => console.error("qr load failed", e));
        })()
      : Promise.resolve();

    Promise.all([bgPromise, portraitPromise, qrPromise, ...fieldPromises]).finally(() => setTemplateLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.imageUrl]);

  const handleDownloadPng = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(certRef.current, { quality: 1, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `GiayKhen_${application.user.studentId || application.user.name}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      toast.error("Không thể xuất ảnh");
    } finally {
      setDownloading(false);
    }
  };

  const getFieldValue = (field: TemplateField): string => {
    const baseId = field.id.split("_")[0];
    if (baseId === "honoree") return application.user.name || field.value;
    if (baseId === "achievement") return application.campaign.title || field.value;
    return field.value;
  };

  // Check if template config already has these dynamic fields
  const hasHonoree = templateFields.some((f) => f.id.split("_")[0] === "honoree");
  const hasAchievement = templateFields.some((f) => f.id.split("_")[0] === "achievement");
  const hasPortrait = templateFields.some((f) => f.id.split("_")[0] === "portrait");

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
  const [previewW, setPreviewW] = useState(800);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (previewContainerRef.current) {
        setPreviewW(previewContainerRef.current.clientWidth || 800);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scale = previewW / CANVAS_W;
  const previewH = Math.round(CANVAS_H * scale);

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
              __html: `@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Barlow:ital,wght@0,400;0,700;1,400&family=Be+Vietnam+Pro:ital,wght@0,400;0,700;1,400&family=Cabin:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Exo+2:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Josefin+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans:ital,wght@0,400;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Nunito:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Work+Sans:ital,wght@0,400;0,700;1,400&display=swap');`,
            }} />

            <div
              ref={previewContainerRef}
              className="border rounded overflow-hidden w-full bg-gray-100"
              style={{ height: `${previewH}px` }}
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
                          field.type === "image" || field.type === "line" || field.type === "qrcode"
                            ? `${field.width}px`
                            : undefined,
                        height:
                          field.type === "image" || field.type === "line" || field.type === "qrcode"
                            ? `${field.height}px`
                            : undefined,
                        backgroundColor:
                          field.type === "line" ? field.color : "transparent",
                        zIndex: 1,
                      }}
                    >
                      {field.type === "text" && getFieldValue(field)}

                      {field.type === "image" && (() => {
                        const baseId = field.id.split("_")[0];
                        const src = baseId === "portrait"
                          ? (portraitDataUrl || (application.portraitImage ? getDisplayUrl(application.portraitImage) : null))
                          : (fieldDataUrls[field.id] || (field.value ? getDisplayUrl(field.value) : null));
                        if (!src) return null;
                        const isCircle = field.shape === "circle";
                        return (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt={field.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: isCircle ? "50%" : undefined,
                            }}
                          />
                        );
                      })()}

                      {field.type === "qrcode" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certViewUrl)}`}
                          alt="QR Code"
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

                  {/* Fallback: show portrait if template has no portrait field */}
                  {!hasPortrait && application.portraitImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={portraitDataUrl || getDisplayUrl(application.portraitImage)}
                      alt="Ảnh đại diện"
                      style={{
                        position: "absolute",
                        left: "80px",
                        top: "350px",
                        width: "100px",
                        height: "130px",
                        objectFit: "cover",
                        border: "4px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        zIndex: 2,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {application.status === "APPROVED" && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="font-semibold text-green-800">Hồ sơ đã được duyệt</p>
              <p className="text-sm text-green-600">
                Sinh viên có thể tải giấy khen từ trang cá nhân của mình.
              </p>
            </div>
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
            >
              <Download size={16} /> Xem / Tải Giấy Khen
            </button>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowCertModal(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-auto max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Giấy Khen</h2>
                  <p className="text-sm text-gray-500">{application.user.name} — {application.campaign.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownloadPng}
                    disabled={downloading || templateLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium text-sm"
                  >
                    <Download size={16} />
                    {downloading ? "Đang xuất..." : "Tải xuống PNG"}
                  </button>
                  <button
                    onClick={() => setShowCertModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-auto flex justify-center">
                {template ? (
                  <>
                    <div style={{ transform: `scale(${800 / CANVAS_W})`, transformOrigin: "top left", width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, flexShrink: 0, pointerEvents: "none" }}>
                      <div
                        style={{ width: `${CANVAS_W}px`, height: `${CANVAS_H}px`, position: "relative", backgroundColor: "#fff", overflow: "hidden" }}
                      >
                        {bgDataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={bgDataUrl} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
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
                              width: field.type === "image" || field.type === "line" || field.type === "qrcode" ? `${field.width}px` : undefined,
                              height: field.type === "image" || field.type === "line" || field.type === "qrcode" ? `${field.height}px` : undefined,
                              backgroundColor: field.type === "line" ? field.color : "transparent",
                              zIndex: 1,
                            }}
                          >
                            {field.type === "text" && getFieldValue(field)}
                            {field.type === "image" && (() => {
                              const baseId = field.id.split("_")[0];
                              const src = baseId === "portrait"
                                ? (portraitDataUrl || null)
                                : (fieldDataUrls[field.id] || null);
                              if (!src) return null;
                              const isCircle = field.shape === "circle";
                              return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={src} alt={field.label} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: isCircle ? "50%" : undefined }} />
                              );
                            })()}
                            {field.type === "qrcode" && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certViewUrl)}`}
                                alt="QR Code"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                              />
                            )}
                          </div>
                        ))}
                        {!hasHonoree && application.user.name && (
                          <div style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%, -50%)", fontSize: "40px", fontWeight: "bold", color: "#c0392b", fontFamily: "Roboto", textAlign: "center", whiteSpace: "nowrap", zIndex: 2, textTransform: "uppercase" }}>
                            {application.user.name}
                          </div>
                        )}
                        {!hasAchievement && application.campaign.title && (
                          <div style={{ position: "absolute", left: "50%", top: "63%", transform: "translate(-50%, -50%)", fontSize: "24px", fontStyle: "italic", color: "#2c3e50", fontFamily: "Roboto", textAlign: "center", whiteSpace: "nowrap", zIndex: 2 }}>
                            {application.campaign.title}
                          </div>
                        )}
                        {!hasPortrait && application.portraitImage && portraitDataUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={portraitDataUrl} alt="Ảnh đại diện" style={{ position: "absolute", left: "80px", top: "350px", width: "100px", height: "130px", objectFit: "cover", border: "4px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 2 }} />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm py-8">Không có mẫu giấy khen cho đợt này.</p>
                )}
              </div>
            </div>
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
