"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Type, Minus, Bold, Italic, Underline } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type TemplateField = {
  id: string;
  type: "text" | "image" | "line";
  label: string;
  value: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize?: number;
  color?: string;
  width?: number; // for image/line
  height?: number; // for image/line
  align?: "left" | "center" | "right";
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const GOOGLE_FONTS = [
  "Roboto",
  "Arial",
  "Times New Roman",
  "Playfair Display",
  "Montserrat",
  "Lora",
  "Dancing Script"
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
  { id: "signature", label: "Chữ ký (Ảnh)", type: "image", defaultVal: "" },
  { id: "logo", label: "Logo cơ quan", type: "image", defaultVal: "" },
  { id: "line", label: "Đường kẻ (Line)", type: "line", defaultVal: "" },
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

  const [isDragging, setIsDragging] = useState(false);
  const dragInfo = useRef({ fieldId: "", startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (template.config && Array.isArray(template.config)) {
      setFields(template.config);
    }
  }, [template]);

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
      width: fieldDef.type === "image" ? 150 : fieldDef.type === "line" ? 200 : undefined,
      height: fieldDef.type === "image" ? 80 : fieldDef.type === "line" ? 2 : undefined,
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

  const handleMouseMove = (e: React.MouseEvent) => {
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
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId);

  return (
    <div className="flex flex-col h-full md:flex-row bg-gray-50 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap');
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
                  {af.type === "text" ? <Type size={16} className="mb-1.5 opacity-70" /> : af.type === "line" ? <Minus size={16} className="mb-1.5 opacity-70" /> : <ImageIcon size={16} className="mb-1.5 opacity-70" />}
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
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tải ảnh lên (Drive)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, selectedField.id)}
                      className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <div className="grid grid-cols-2 gap-3 mt-3">
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
                          value={selectedField.height || 80}
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
        className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-4 md:p-8 min-h-[600px] cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedFieldId(null)}
      >
        {/* A4 Landscape Size: 297x210mm -> 1123x794 px at 96 DPI */}
        <div 
          ref={containerRef}
          className="relative bg-white shadow-2xl origin-center max-w-full"
          style={{ 
            width: "1123px", 
            height: "794px", 
            minWidth: "1123px",
            minHeight: "794px",
            transform: "scale(0.85)", 
            transformOrigin: "center" 
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
                width: field.type === "image" || field.type === "line" ? `${field.width}px` : undefined,
                height: field.type === "image" || field.type === "line" ? `${field.height}px` : undefined,
                backgroundColor: field.type === "line" ? field.color : "transparent"
              }}
            >
              {field.type === "text" && field.value}
              
              {field.type === "image" && (
                field.value ? (
                  <img src={getDisplayUrl(field.value)} alt="Signature" className="w-full h-full object-contain pointer-events-none" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
                    {field.label}
                  </div>
                )
              )}
              
              {/* Line type doesn't need children, it's just a styled div with background color */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
