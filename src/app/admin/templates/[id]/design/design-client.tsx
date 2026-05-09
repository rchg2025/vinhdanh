"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Trash2, Image as ImageIcon, Type, Minus, Bold, Italic, Underline, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type TemplateField = {
  id: string;
  type: "text" | "image" | "line" | "qrcode";
  label: string;
  value: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize?: number;
  color?: string;
  width?: number; // for image/line/qrcode
  height?: number; // for image/line/qrcode
  align?: "left" | "center" | "right";
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  shape?: "rectangle" | "circle"; // for image fields (portrait)
};

const GOOGLE_FONTS = [
  // Sans-serif
  "Roboto", "Open Sans", "Montserrat", "Lato", "Nunito", "Raleway",
  "Josefin Sans", "Work Sans", "Cabin", "Barlow", "Exo 2", "Be Vietnam Pro", "Noto Sans",
  // Serif
  "Playfair Display", "Merriweather", "Lora", "EB Garamond",
  "Libre Baskerville", "Cormorant Garamond", "Cinzel", "Noto Serif",
  // Handwriting / Display
  "Dancing Script", "Great Vibes", "Pacifico", "Abril Fatface",
  // System
  "Arial", "Times New Roman", "Georgia",
];

const AVAILABLE_FIELDS = [
  { id: "agency", label: "Tên cơ quan chủ quản", type: "text", defaultVal: "UBND THÀNH PHỐ HÀ NỘI" },
  { id: "unit", label: "Tên đơn vị", type: "text", defaultVal: "SỞ GIÁO DỤC VÀ ĐÀO TẠO" },
  { id: "position", label: "Chức vụ", type: "text", defaultVal: "GIÁM ĐỐC" },
  { id: "honoree", label: "Người được khen", type: "text", defaultVal: "NGUYỄN VĂN A" },
  { id: "achievement", label: "Thành tích", type: "text", defaultVal: "Đã có thành tích xuất sắc trong công tác năm 2024" },
  { id: "signerName", label: "Họ và tên người ký", type: "text", defaultVal: "Trần Trọng B" },
  { id: "decisionNumber", label: "Số quyết định", type: "text", defaultVal: "Số: 01/QĐ" },
  { id: "location", label: "Địa điểm", type: "text", defaultVal: "Hà Nội" },
  { id: "signingDate", label: "Thời gian ký", type: "text", defaultVal: "ngày 01 tháng 01 năm 2025" },
  { id: "customText", label: "Văn bản tùy chỉnh", type: "text", defaultVal: "Nhập văn bản tùy chỉnh" },
  { id: "portrait", label: "Ảnh đại diện SV", type: "image", defaultVal: "" },
  { id: "signature", label: "Chữ ký (Ảnh)", type: "image", defaultVal: "" },
  { id: "logo", label: "Logo cơ quan", type: "image", defaultVal: "" },
  { id: "line", label: "Đường kẻ (Line)", type: "line", defaultVal: "" },
  { id: "qrcode", label: "Mã QR Code", type: "qrcode", defaultVal: "" },
];

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

export default function DesignClient({ template }: { template: any }) {
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);
  const canvasScaleRef = useRef(1);
  const dragInfo = useRef({ fieldId: "", startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const resizeInfo = useRef({ fieldId: "", startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialFontSize: 0 });

  useEffect(() => {
    if (template.config && Array.isArray(template.config)) {
      setFields(template.config);
    }
  }, [template]);

  useEffect(() => {
    canvasScaleRef.current = canvasScale;
  }, [canvasScale]);

  useEffect(() => {
    const updateScale = () => {
      if (!canvasContainerRef.current) return;
      const padding = 64;
      const w = canvasContainerRef.current.clientWidth - padding;
      const h = canvasContainerRef.current.clientHeight - padding;
      if (w <= 0 || h <= 0) return;
      const scale = Math.min(w / 1123, h / 794, 1);
      setCanvasScale(Math.max(scale, 0.1));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const handleAddField = (fieldDef: any) => {
    const newField: TemplateField = {
      id: `${fieldDef.id}_${Date.now()}`,
      type: fieldDef.type,
      label: fieldDef.label,
      value: fieldDef.defaultVal,
      x: 50,
      y: 50,
      fontSize: 24,
      color: "#000000",
      align: "center",
      fontFamily: "Roboto",
      bold: fieldDef.id === "honoree" || fieldDef.id === "signerName",
      width: fieldDef.type === "image" ? 150 : fieldDef.type === "line" ? 200 : fieldDef.type === "qrcode" ? 120 : undefined,
      height: fieldDef.type === "image" ? 150 : fieldDef.type === "line" ? 2 : fieldDef.type === "qrcode" ? 120 : undefined,
      shape: fieldDef.type === "image" ? "rectangle" : undefined,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading("Đang lưu cấu hình...");
    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          imageUrl: template.imageUrl,
          config: fields,
        }),
      });
      if (!res.ok) throw new Error("Lưu thất bại");
      toast.success("Đã lưu thiết kế!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Đang tải ảnh lên...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tải ảnh");
      
      handleUpdateField(fieldId, { value: data.url });
      toast.success("Tải ảnh thành công", { id: toastId });
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setIsDragging(true);
    dragInfo.current = {
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: fields.find(f => f.id === fieldId)?.x || 0,
      initialY: fields.find(f => f.id === fieldId)?.y || 0
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    setSelectedFieldId(fieldId);
    setIsResizing(true);
    resizeInfo.current = {
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: field.width || 150,
      initialHeight: field.height || 150,
      initialFontSize: field.fontSize || 24,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing && resizeInfo.current.fieldId) {
      const dx = e.clientX - resizeInfo.current.startX;
      const dy = e.clientY - resizeInfo.current.startY;
      const scale = canvasScaleRef.current;
      setFields(prev => prev.map(f => {
        if (f.id !== resizeInfo.current.fieldId) return f;
        if (f.type === "text") {
          return { ...f, fontSize: Math.max(8, Math.round(resizeInfo.current.initialFontSize + dx / scale / 3)) };
        }
        return {
          ...f,
          width: Math.max(10, Math.round(resizeInfo.current.initialWidth + dx / scale)),
          height: Math.max(2, Math.round(resizeInfo.current.initialHeight + dy / scale)),
        };
      }));
      return;
    }
    if (!isDragging || !dragInfo.current.fieldId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    
    const dxPercent = (dx / rect.width) * 100;
    const dyPercent = (dy / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, dragInfo.current.initialX + dxPercent));
    const newY = Math.max(0, Math.min(100, dragInfo.current.initialY + dyPercent));

    setFields(prev => prev.map(f => f.id === dragInfo.current.fieldId ? { ...f, x: newX, y: newY } : f));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-full md:flex-row bg-gray-50 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Barlow:ital,wght@0,400;0,700;1,400&family=Be+Vietnam+Pro:ital,wght@0,400;0,700;1,400&family=Cabin:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Dancing+Script:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=Exo+2:ital,wght@0,400;0,700;1,400&family=Great+Vibes&family=Josefin+Sans:ital,wght@0,400;0,700;1,400&family=Lato:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Merriweather:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans:ital,wght@0,400;0,700;1,400&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Nunito:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Raleway:ital,wght@0,400;0,700;1,400&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&family=Work+Sans:ital,wght@0,400;0,700;1,400&display=swap');
      `}} />
      
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full shrink-0 shadow-sm z-10 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/templates" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={18} />
            </Link>
            <h2 className="font-bold text-gray-900 truncate">Thiết kế mẫu</h2>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} /> Lưu
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Add Fields */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Thêm trường dữ liệu</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVAILABLE_FIELDS.map((af) => (
                <button
                  key={af.id}
                  onClick={() => handleAddField(af)}
                  className="flex flex-col items-center justify-center p-3 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors text-center"
                >
                  {af.type === "text" ? <Type size={16} className="mb-1.5 opacity-70" /> : af.type === "line" ? <Minus size={16} className="mb-1.5 opacity-70" /> : af.type === "qrcode" ? <QrCode size={16} className="mb-1.5 opacity-70" /> : <ImageIcon size={16} className="mb-1.5 opacity-70" />}
                  <span className="line-clamp-2">{af.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Edit Selected Field */}
          {selectedField && (
            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thuộc tính: {selectedField.label}</h3>
                <button
                  onClick={() => handleRemoveField(selectedField.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Xoá trường này"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {selectedField.type === "text" && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nội dung mẫu</label>
                      <input
                        type="text"
                        value={selectedField.value}
                        onChange={(e) => handleUpdateField(selectedField.id, { value: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Font chữ</label>
                      <select
                        value={selectedField.fontFamily || "Roboto"}
                        onChange={(e) => handleUpdateField(selectedField.id, { fontFamily: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        style={{ fontFamily: selectedField.fontFamily || "Roboto" }}
                      >
                        {GOOGLE_FONTS.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateField(selectedField.id, { bold: !selectedField.bold })}
                        className={`p-1.5 rounded border ${selectedField.bold ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        title="In đậm"
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateField(selectedField.id, { italic: !selectedField.italic })}
                        className={`p-1.5 rounded border ${selectedField.italic ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        title="In nghiêng"
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateField(selectedField.id, { underline: !selectedField.underline })}
                        className={`p-1.5 rounded border ${selectedField.underline ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        title="Gạch chân"
                      >
                        <Underline size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Cỡ chữ (px)</label>
                        <input
                          type="number"
                          value={selectedField.fontSize || 24}
                          onChange={(e) => handleUpdateField(selectedField.id, { fontSize: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Màu sắc</label>
                        <input
                          type="color"
                          value={selectedField.color || "#000000"}
                          onChange={(e) => handleUpdateField(selectedField.id, { color: e.target.value })}
                          className="w-full h-8 px-1 py-1 rounded-md border border-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Căn lề</label>
                      <select
                        value={selectedField.align || "center"}
                        onChange={(e) => handleUpdateField(selectedField.id, { align: e.target.value as any })}
                        className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                      >
                        <option value="left">Trái</option>
                        <option value="center">Giữa</option>
                        <option value="right">Phải</option>
                      </select>
                    </div>
                  </>
                )}

                {selectedField.type === "image" && (
                  <div className="space-y-3">
                    {selectedField.id.split("_")[0] !== "portrait" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Tải ảnh lên (Drive)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, selectedField.id)}
                          className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                      </div>
                    )}

                    {selectedField.id.split("_")[0] === "portrait" && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
                        Ảnh sẽ tự động lấy từ hồ sơ sinh viên nộp lên.
                      </div>
                    )}

                    {selectedField.id.split("_")[0] === "portrait" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hình dạng</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateField(selectedField.id, { shape: "rectangle" })}
                            className={`flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                              (selectedField.shape || "rectangle") === "rectangle"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            ▭ Chữ nhật
                          </button>
                          <button
                            onClick={() => handleUpdateField(selectedField.id, { shape: "circle" })}
                            className={`flex-1 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                              selectedField.shape === "circle"
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            ● Tròn
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                        <input
                          type="number"
                          value={selectedField.width || 150}
                          onChange={(e) => handleUpdateField(selectedField.id, { width: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                        <input
                          type="number"
                          value={selectedField.height || 150}
                          onChange={(e) => handleUpdateField(selectedField.id, { height: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedField.type === "line" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Độ dài (px)</label>
                        <input
                          type="number"
                          value={selectedField.width || 200}
                          onChange={(e) => handleUpdateField(selectedField.id, { width: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Độ dày (px)</label>
                        <input
                          type="number"
                          value={selectedField.height || 2}
                          onChange={(e) => handleUpdateField(selectedField.id, { height: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Màu sắc</label>
                      <input
                        type="color"
                        value={selectedField.color || "#000000"}
                        onChange={(e) => handleUpdateField(selectedField.id, { color: e.target.value })}
                        className="w-full h-8 px-1 py-1 rounded-md border border-gray-200 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {selectedField.type === "qrcode" && (
                  <div className="space-y-3">
                    <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-md text-xs text-indigo-700">
                      Mã QR sẽ tự động liên kết đến trang xem giấy khen online khi xuất giấy khen.
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Chiều rộng (px)</label>
                        <input
                          type="number"
                          value={selectedField.width || 120}
                          onChange={(e) => handleUpdateField(selectedField.id, { width: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Chiều cao (px)</label>
                        <input
                          type="number"
                          value={selectedField.height || 120}
                          onChange={(e) => handleUpdateField(selectedField.id, { height: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vị trí X (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={Number(selectedField.x.toFixed(1))}
                      onChange={(e) => handleUpdateField(selectedField.id, { x: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vị trí Y (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={Number(selectedField.y.toFixed(1))}
                      onChange={(e) => handleUpdateField(selectedField.id, { y: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={canvasContainerRef}
        className="flex-1 bg-gray-200 overflow-auto flex items-start justify-center p-4 md:p-8 cursor-default"
        style={{ minHeight: "600px" }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedFieldId(null)}
      >
        {/* Wrapper reserves the visual layout space for the scaled canvas */}
        <div style={{
          width: `${Math.round(1123 * canvasScale)}px`,
          height: `${Math.round(794 * canvasScale)}px`,
          position: "relative",
          flexShrink: 0,
        }}>
        {/* A4 Landscape: 1123x794px, dynamically scaled to fit */}
        <div 
          ref={containerRef}
          className="absolute top-0 left-0 bg-white shadow-2xl"
          style={{ 
            width: "1123px", 
            height: "794px", 
            transform: `scale(${canvasScale})`,
            transformOrigin: "top left",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Template */}
          <img 
            src={getDisplayUrl(template.imageUrl)} 
            alt="Template" 
            className="w-full h-full object-cover pointer-events-none opacity-90"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1123x794?text=L%E1%BB%97i+%E1%BA%A3nh+n%E1%BB%81n';
            }}
          />

          {/* Overlays */}
          {fields.map((field) => (
            <div
              key={field.id}
              onMouseDown={(e) => handleMouseDown(e, field.id)}
              className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 select-none border-2 border-dashed ${
                selectedFieldId === field.id ? "border-blue-500 bg-blue-50/20 z-10" : "border-transparent hover:border-gray-300 z-0"
              }`}
              style={{
                left: `${field.x}%`,
                top: `${field.y}%`,
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
                backgroundColor: field.type === "line" ? field.color : "transparent"
              }}
            >
              {field.type === "text" && field.value}
              
              {field.type === "image" && (() => {
                const isPortrait = field.id.split("_")[0] === "portrait";
                const isCircle = field.shape === "circle";
                const borderRadius = isCircle ? "50%" : undefined;
                const overflow = isCircle ? "hidden" : undefined;
                if (field.value && !isPortrait) {
                  return (
                    <img
                      src={getDisplayUrl(field.value)}
                      alt={field.label}
                      style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius, overflow, pointerEvents: "none" }}
                    />
                  );
                }
                return (
                  <div
                    style={{ width: "100%", height: "100%", borderRadius, overflow: "hidden" }}
                    className="bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300"
                  >
                    {field.label}
                  </div>
                );
              })()}

              {field.type === "qrcode" && (() => {
                const sz = Math.min(field.width || 120, field.height || 120);
                return (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${sz}x${sz}&data=${encodeURIComponent("https://vinhdanh.ite.id.vn/certificate/preview")}`}
                    alt="QR Code"
                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                  />
                );
              })()}
              
              {/* Line type: background color only */}

              {/* Resize handle — visible when selected */}
              {selectedFieldId === field.id && (
                <div
                  onMouseDown={(e) => handleResizeMouseDown(e, field.id)}
                  title={field.type === "text" ? "Kéo để thay đổi cỡ chữ" : "Kéo để thay đổi kích thước"}
                  style={{
                    position: "absolute",
                    bottom: -5,
                    right: -5,
                    width: 10,
                    height: 10,
                    background: "#3b82f6",
                    border: "2px solid white",
                    borderRadius: 2,
                    cursor: "se-resize",
                    zIndex: 20,
                    boxShadow: "0 0 3px rgba(0,0,0,0.4)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        </div>{/* close scale wrapper */}
      </div>
    </div>
  );
}
