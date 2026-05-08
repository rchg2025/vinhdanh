"use client";

import { useState, useMemo } from "react";
import { User, Shield, CalendarIcon, Plus, Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type UnitData = {
  id: string;
  name: string;
  classes: { id: string; name: string }[];
};

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  studentId: string | null;
  unitId: string | null;
  classId: string | null;
  unit?: { name: string } | null;
  class?: { name: string } | null;
  role: "USER" | "ADMIN";
  createdAt: Date;
  _count?: { applications: number };
};

export default function UsersClient({ initialUsers, units }: { initialUsers: any[], units: UnitData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", studentId: "", unitId: "", classId: "", role: "USER" as "USER" | "ADMIN"
  });

  const availableClasses = useMemo(() => {
    if (!formData.unitId) return [];
    const unit = units.find(u => u.id === formData.unitId);
    return unit?.classes || [];
  }, [formData.unitId, units]);

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // leave empty for edit unless they want to change
        studentId: user.studentId || "",
        unitId: user.unitId || "",
        classId: user.classId || "",
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "", email: "", password: "", studentId: "", unitId: "", classId: "", role: "USER"
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";
      
      const payload: any = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      
      // Update ui lists
      const uiUnit = units.find(u => u.id === updated.unitId);
      const uiClass = uiUnit?.classes.find(c => c.id === updated.classId);
      
      const completeUser = {
        ...updated,
        unit: uiUnit ? { name: uiUnit.name } : null,
        class: uiClass ? { name: uiClass.name } : null,
        _count: editingUser ? editingUser._count : { applications: 0 }
      };

      if (editingUser) {
        setUsers(users.map(u => u.id === completeUser.id ? { ...u, ...completeUser } : u));
        toast.success("Cập nhật thành công!");
      } else {
        setUsers([completeUser, ...users]);
        toast.success("Tạo tài khoản thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành viên này? (Hành động này không thể hoàn tác)")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Lỗi khi xóa tài khoản");
      setUsers(users.filter(u => u.id !== id));
      toast.success("Đã xóa tài khoản!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thành viên</h1>
          <p className="text-gray-500 mt-1">Xem, thêm, sửa và xóa tài khoản người dùng</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-lg">
          <Plus size={18} /> Thêm Tài Khoản
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên & Email</th>
                <th className="px-6 py-4 font-semibold">MSSV</th>
                <th className="px-6 py-4 font-semibold">Tổ chức</th>
                <th className="px-6 py-4 font-semibold">Vai trò</th>
                <th className="px-6 py-4 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shrink-0">
                        {user.name?.charAt(0).toUpperCase() || <User size={18} />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.name || "Chưa cập nhật"}</div>
                        <div className="text-sm text-gray-500">{user.email || "Chưa có email"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">{user.studentId || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">
                      {user.unit?.name || "-"}
                    </div>
                    {(user.class?.name) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Lớp: {user.class.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-indigo-100 text-indigo-700 border border-indigo-200"}`}>
                      {user.role === "ADMIN" && <Shield size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" title="Chỉnh sửa">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50" title="Xóa">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-auto max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-gray-900">{editingUser ? "Cập nhật Thành viên" : "Thêm Thành viên mới"}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="user-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số SV</label>
                    <input type="text" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: 312xxxx..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                    <select 
                      value={formData.unitId} 
                      onChange={e => {
                        setFormData({...formData, unitId: e.target.value, classId: ""}); // reset class on unit change
                      }} 
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- Chọn đơn vị --</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                    <select 
                      value={formData.classId} 
                      onChange={e => setFormData({...formData, classId: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      disabled={!formData.unitId || availableClasses.length === 0}
                    >
                      <option value="">-- Chọn lớp --</option>
                      {availableClasses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 text-xs font-normal">(Dùng để đăng nhập)</span></label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="abc@student.vn" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu 
                    <span className="text-gray-400 text-xs font-normal ml-1">
                      {editingUser ? "(Nhập nếu muốn đổi)" : "(Bắt buộc)"}
                    </span>
                  </label>
                  <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="USER">Thành viên (USER)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="submit" form="user-form" className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thông tin</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}