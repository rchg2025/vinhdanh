"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Download } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useRef } from "react";

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
  shape?: "rectangle" | "circle";
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
export default function CertificateViewClient({ application, template }: { application: any; template: any | null }) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [bgDataUrl, setBgDataUrl] = useState("");
  const [fieldDataUrls, setFieldDataUrls] = useState<Record<string, string>>({});
  const [portraitDataUrl, setPortraitDataUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [containerW, setContainerW] = useState(800);
  const [canvasDimensions, setCanvasDimensions] = useState({ w: 1123, h: 794 });
  const containerRef = useRef<HTMLDivElement>(null);

  const certViewUrl = `${typeof window !== "undefined" ? window.location.origin : "https://vinhdanh.ite.id.vn"}/certificate/${application.id}`;

  const templateFields: TemplateField[] =
    template?.config && Array.isArray(template.config) ? template.config : [];

  const hasHonoree = templateFields.some((f) => f.id.split("_")[0] === "honoree");
  const hasAchievement = templateFields.some((f) => f.id.split("_")[0] === "achievement");
  const hasPortrait = templateFields.some((f) => f.id.split("_")[0] === "portrait");

  useEffect(() => {
    const update = () => {
      if (containerRef.current) setContainerW(containerRef.current.clientWidth || 800);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!template?.imageUrl) return;

    const bgPromise = toDataUrl(template.imageUrl).then((url) => {
      setBgDataUrl(url);
      const img = new window.Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth) {
          setCanvasDimensions({ w: 794, h: 1123 });
        } else {
          setCanvasDimensions({ w: 1123, h: 794 });
        }
      };
      img.src = url;
    }).catch(console.error);

    const imageFields = templateFields.filter(
      (f) => f.type === "image" && f.value && f.id.split("_")[0] !== "portrait"
    );
    const fieldPromises = imageFields.map((f) =>
      toDataUrl(f.value)
        .then((d) => setFieldDataUrls((prev) => ({ ...prev, [f.id]: d })))
        .catch(console.error)
    );

    const portraitPromise = application.portraitImage
      ? toDataUrl(application.portraitImage).then(setPortraitDataUrl).catch(console.error)
      : Promise.resolve();

    const hasQr = templateFields.some((f) => f.type === "qrcode");
    const qrPromise = hasQr
      ? toDataUrl(`/api/proxy-image?url=${encodeURIComponent(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certViewUrl)}`)}`).then(setQrDataUrl).catch(console.error)
      : Promise.resolve();

    Promise.all([bgPromise, portraitPromise, qrPromise, ...fieldPromises]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.imageUrl]);

  const getFieldValue = (field: TemplateField): string => {
    const baseId = field.id.split("_")[0];
    if (baseId === "honoree") return application.user?.name || field.value;
    if (baseId === "achievement") return application.campaign?.title || field.value;
    return field.value;
  };

  const scale = containerW / canvasDimensions.w;
  const previewH = Math.round(canvasDimensions.h * scale);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toPng(certRef.current, { quality: 1, pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `GiayKhen_${application.user?.name || application.id}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-xl shadow-md flex items-center justify-center w-9 h-9">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">Vinh Danh Online</span>
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            <Download size={16} />
            {downloading ? "Đang xuất..." : "Tải xuống PNG"}
          </button>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
            🏆
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{application.user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              Đã được vinh danh: <span className="font-semibold text-indigo-600">{application.campaign?.title}</span>
            </p>
          </div>
        </div>

        {/* Certificate */}
        <style dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Barlow:ital,wght@0,400;0,700;1,400&family=Be+Vietnam+Pro:ital,wght@0,400;0,700;1,400&family=Cabin:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Exo+2:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Josefin+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans:ital,wght@0,400;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Nunito:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Work+Sans:ital,wght@0,400;0,700;1,400&display=swap');`,
        }} />

        {template ? (
          <div
            ref={containerRef}
            className="w-full rounded-xl overflow-hidden shadow-lg border border-gray-200"
            style={{ height: `${previewH}px` }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${canvasDimensions.w}px`,
                height: `${canvasDimensions.h}px`,
                position: "relative",
                backgroundColor: "#fff",
              }}
            >
              {/* Hidden certRef for download at full resolution */}
              <div
                ref={certRef}
                style={{
                  width: `${canvasDimensions.w}px`,
                  height: `${canvasDimensions.h}px`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  backgroundColor: "#fff",
                  overflow: "hidden",
                }}
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
                        style={{ width: "100%", height: "100%", objectFit: "contain", backgroundColor: "#fff", padding: "6px", borderRadius: "8px" }}
                      />
                    )}
                  </div>
                ))}
                {!hasHonoree && application.user?.name && (
                  <div style={{ position: "absolute", left: "50%", top: "52%", transform: "translate(-50%, -50%)", fontSize: "40px", fontWeight: "bold", color: "#c0392b", fontFamily: "Roboto", textAlign: "center", whiteSpace: "nowrap", zIndex: 2, textTransform: "uppercase" }}>
                    {application.user.name}
                  </div>
                )}
                {!hasAchievement && application.campaign?.title && (
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
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">Không tìm thấy mẫu giấy khen.</p>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn
      </footer>
    </div>
  );
}
