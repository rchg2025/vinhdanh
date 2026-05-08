"use client";

import { useState } from "react";
import { Users, Library, Plus, Edit, Trash2, X, CalendarIcon, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  
  // Modals
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [selectedUnitIdToClass, setSelectedUnitIdToClass] = useState<string | null>(null);
  
  // Data forms
  const [unitForm, setUnitForm] = useState({ name: "", description: "" });
  const [classForm, setClassForm] = useState({ name: "", description: "" });

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
        toast.success("Cập nhật đơn vị thành công!");
      } else {
        setUnits([{ ...updated, classes: [], createdAt: new Date(updated.createdAt) }, ...units]);
        toast.success("Tạo đơn vị mới thành công!");
      }
      setIsUnitModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitIdToClass) return;
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

      toast.success(editingClass ? "Cập nhật lớp thành công!" : "Tạo lớp mới thành công!");
      setIsClassModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn vị / Lớp</h1>
          <p className="text-gray-500 mt-1">Cấu trúc phân tầng đơn vị và lớp trực thuộc</p>
        </div>
        <Button onClick={() => handleOpenUnitModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-lg">
          <Plus size={18} /> Thêm Đơn vị
        </Button>
      </div>

      <div className="space-y-6">
        {units.length === 0 ? (
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 text-sm">
             Chưa có đơn vị nào được tạo.
           </div>
        ) : (
          units.map(unit => (
            <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50/50 border-b border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex flex-shrink-0 items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                    <Library size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{unit.name}</h3>
                    {unit.description && <p className="text-sm text-gray-500">{unit.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
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
            </div>
          ))
        )}
      </div>

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
              <Button type="button" variant="outline" onClick={() => setIsUnitModalOpen(false)}>Hủy</Button>
              <Button type="submit" form="unit-form" className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu</Button>
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
              <Button type="button" variant="outline" onClick={() => setIsClassModalOpen(false)}>Hủy</Button>
              <Button type="submit" form="class-form" className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}