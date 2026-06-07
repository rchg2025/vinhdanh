"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Users, Library, Plus, Edit, Trash2, X, CalendarIcon, Layers, Search, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

type ClassData = {
  id: string;
  name: string;
  description: string | null;
  unitId: string;
  createdAt: Date;
};

type UnitData = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  classes: ClassData[];
};

export default function UnitsClient({ initialUnits }: { initialUnits: UnitData[] }) {
  const [units, setUnits] = useState<UnitData[]>(initialUnits);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingUnit, setIsSavingUnit] = useState(false);
  const [isSavingClass, setIsSavingClass] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Modals
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [selectedUnitIdToClass, setSelectedUnitIdToClass] = useState<string | null>(null);
  
  // Data forms
  const [unitForm, setUnitForm] = useState({ name: "", description: "" });
  const [classForm, setClassForm] = useState({ name: "", description: "" });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [units, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / ITEMS_PER_PAGE));
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const handleOpenUnitModal = (unit?: UnitData) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({ name: unit.name, description: unit.description || "" });
    } else {
      setEditingUnit(null);
      setUnitForm({ name: "", description: "" });
    }
    setIsUnitModalOpen(true);
  };

  const handleOpenClassModal = (unitId: string, cls?: ClassData) => {
    setSelectedUnitIdToClass(unitId);
    if (cls) {
      setEditingClass(cls);
      setClassForm({ name: cls.name, description: cls.description || "" });
    } else {
      setEditingClass(null);
      setClassForm({ name: "", description: "" });
    }
    setIsClassModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUnit(true);
    const loadingId = toast.loading("Đang lưu đơn vị...");
    try {
      const url = editingUnit ? `/api/units/${editingUnit.id}` : "/api/units";
      const method = editingUnit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitForm),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();

      if (editingUnit) {
        setUnits(units.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        toast.success("Cập nhật đơn vị thành công!", { id: loadingId });
      } else {
        setUnits([{ ...updated, classes: [], createdAt: new Date(updated.createdAt) }, ...units]);
        toast.success("Tạo đơn vị mới thành công!", { id: loadingId });
      }
      setIsUnitModalOpen(false);
    } catch (err: any) {
      toast.error(err.message, { id: loadingId });
    } finally {
      setIsSavingUnit(false);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitIdToClass) return;
    setIsSavingClass(true);
    const loadingId = toast.loading("Đang lưu lớp...");
    try {
      const url = editingClass ? `/api/classes/${editingClass.id}` : "/api/classes";
      const method = editingClass ? "PUT" : "POST";
      
      const payload = { ...classForm, unitId: selectedUnitIdToClass };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();

      setUnits(units.map(u => {
        if (u.id === selectedUnitIdToClass) {
          if (editingClass) {
            return { ...u, classes: u.classes.map(c => c.id === updated.id ? { ...c, ...updated } : c) };
          } else {
            return { ...u, classes: [...u.classes, { ...updated, createdAt: new Date(updated.createdAt) }] };
          }
        }
        return u;
      }));

      toast.success(editingClass ? "Cập nhật lớp thành công!" : "Tạo lớp mới thành công!", { id: loadingId });
      setIsClassModalOpen(false);
    } catch (err: any) {
      toast.error(err.message, { id: loadingId });
    } finally {
      setIsSavingClass(false);
    }
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn vị này và toàn bộ lớp?")) return;
    try {
      const res = await fetch(`/api/units/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gặp lỗi khi xóa đơn vị");
      setUnits(units.filter(u => u.id !== id));
      toast.success("Đã xóa đơn vị");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClass = async (unitId: string, id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lớp này?")) return;
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gặp lỗi khi xóa");
      
      setUnits(units.map(u => {
        if (u.id === unitId) return { ...u, classes: u.classes.filter(c => c.id !== id) };
        return u;
      }));
      toast.success("Đã xóa lớp");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const rows = jsonData.slice(1).filter((row: any) => row.length > 0);
        
        const importedItems = rows.map((row: any) => ({
          unitName: row[0]?.toString() || "",
          className: row[1]?.toString() || "",
        })).filter(u => u.unitName);

        if (importedItems.length === 0) {
          toast.error("Không tìm thấy dữ liệu hợp lệ trong file Excel.");
          setIsImporting(false);
          return;
        }

        const res = await fetch("/api/units/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: importedItems })
        });

        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || "Có lỗi xảy ra khi import");
        
        if (result.success) {
          toast.success(result.message);
          if (result.errors?.length > 0) {
            console.warn("Import errors:", result.errors);
            toast.warning(`Có ${result.errors.length} dòng bị lỗi. Xem console log.`);
          }
          // Refresh page to load new units
          window.location.reload();
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Tên Đơn vị", "Tên lớp"],
      ["Khoa Công Nghệ Thông Tin", "K65-CS1"],
      ["Khoa Công Nghệ Thông Tin", "K65-CS2"],
      ["Khoa Kinh Tế", "K12-KT"]
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_muc_Don_vi_Lop");
    XLSX.writeFile(wb, "mau_import_don_vi_lop.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn vị / Lớp</h1>
          <p className="text-gray-500 mt-1">Cấu trúc phân tầng đơn vị và lớp trực thuộc</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate} 
            className="bg-white gap-2 rounded-lg text-gray-700"
          >
            Tải file mẫu
          </Button>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-white gap-2 rounded-lg text-gray-700"
            disabled={isImporting}
          >
            {isImporting ? <span className="animate-spin text-xl">↻</span> : <Upload size={18} />}
            {isImporting ? "Đang xử lý..." : "Import Excel"}
          </Button>
          <Button onClick={() => handleOpenUnitModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-lg">
            <Plus size={18} /> Thêm Đơn vị
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đơn vị..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-6">
        {units.length > 0 && paginatedUnits.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 text-sm">
             Không tìm thấy đơn vị nào phù hợp.
           </div>
        ) : (
          paginatedUnits.map(unit => (
            <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => toggleUnit(unit.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-shrink-0 items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                    <Library size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      {unit.name}
                      <span className="text-gray-400">
                        {expandedUnits.has(unit.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </h3>
                    {unit.description && <p className="text-sm text-gray-500">{unit.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleOpenClassModal(unit.id)} className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Plus size={14} /> Thêm Lớp
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenUnitModal(unit)} className="text-gray-400 hover:text-indigo-600">
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(unit.id)} className="text-gray-400 hover:text-rose-600">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {expandedUnits.has(unit.id) && (
                <div className="p-0">
                  {unit.classes.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Đơn vị này chưa có lớp trực thuộc.</div>
                  ) : (
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-50">
                        {unit.classes.map(cls => (
                          <tr key={cls.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="pl-6 md:pl-16 px-6 py-4 w-full">
                              <div className="flex items-center gap-2">
                                <Layers size={16} className="text-gray-300" />
                                <span className="font-medium text-gray-800">{cls.name}</span>
                              </div>
                              {cls.description && <div className="text-xs text-gray-500 pl-6 mt-1">{cls.description}</div>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenClassModal(unit.id, cls)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteClass(unit.id, cls.id)} className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUnits.length)}</span> trong số <span className="font-medium">{filteredUnits.length}</span> đơn vị
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Trang trước
            </Button>
            <div className="text-sm font-medium px-2">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingUnit ? "Cập nhật Đơn vị" : "Thêm Đơn vị mới"}</h2>
              <button onClick={() => setIsUnitModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              <form id="unit-form" onSubmit={handleSaveUnit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị</label>
                  <input type="text" required value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Khoa Công Nghệ Thông Tin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea rows={2} value={unitForm.description} onChange={e => setUnitForm({...unitForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsUnitModalOpen(false)} disabled={isSavingUnit}>Hủy</Button>
              <Button type="submit" form="unit-form" disabled={isSavingUnit} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSavingUnit ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingClass ? "Cập nhật Lớp" : "Thêm Lớp trực thuộc"}</h2>
              <button onClick={() => setIsClassModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              <form id="class-form" onSubmit={handleSaveClass} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                  <input type="text" required value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: K65-CS..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả thêm</label>
                  <textarea rows={2} value={classForm.description} onChange={e => setClassForm({...classForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)} disabled={isSavingClass}>Hủy</Button>
              <Button type="submit" form="class-form" disabled={isSavingClass} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {isSavingClass ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}