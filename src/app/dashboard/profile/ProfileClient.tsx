"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserRound } from "lucide-react";

type UnitData = {
  id: string;
  name: string;
  classes: { id: string; name: string }[];
};

type ProfileData = {
  name: string | null;
  email: string | null;
  studentId: string | null;
  unitId: string | null;
  classId: string | null;
};

export default function ProfileClient({ initialUser, units }: { initialUser: ProfileData, units: UnitData[] }) {
  const [formData, setFormData] = useState({
    name: initialUser.name || "",
    studentId: initialUser.studentId || "",
    unitId: initialUser.unitId || "",
    classId: initialUser.classId || "",
    password: "", 
    confirmPassword: "", 
  });
  const [loading, setLoading] = useState(false);

  const availableClasses = useMemo(() => {
    if (!formData.unitId) return [];
    const unit = units.find(u => u.id === formData.unitId);
    return unit?.classes || [];
  }, [formData.unitId, units]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = formData;
      if (!payload.password) {
        delete (payload as any).password;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error((await res.json()).error || "Không thể cập nhật hồ sơ");
      }

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-700 text-2xl font-bold border border-indigo-200">
          {initialUser.name ? initialUser.name.charAt(0).toUpperCase() : <UserRound />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{initialUser.name}</h2>
          <p className="text-gray-500">{initialUser.email}</p>
        </div>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã số Sinh viên</label>
              <input type="text" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn vị</label>
              <select
                value={formData.unitId} 
                onChange={e => setFormData({...formData, unitId: e.target.value, classId: ""})} 
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Lựa chọn đơn vị --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Lớp</label>
              <select 
                value={formData.classId} 
                onChange={e => setFormData({...formData, classId: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                disabled={!formData.unitId || availableClasses.length === 0}
              >
                <option value="">-- Lựa chọn lớp --</option>
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Đổi Mật khẩu</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới (Để trống nếu không đổi)</label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}