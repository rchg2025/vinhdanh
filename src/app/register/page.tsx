"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type UnitWithClasses = {
  id: string;
  name: string;
  classes: { id: string; name: string }[];
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    studentId: "",
    email: "",
    password: "",
    unitId: "",
    className: "",
  });
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<UnitWithClasses[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/units/public").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUnits(data);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (formData.unitId) {
      const unit = units.find(u => u.id === formData.unitId);
      setClasses(unit?.classes || []);
      setFormData(prev => ({ ...prev, className: "" }));
    } else {
      setClasses([]);
    }
  }, [formData.unitId, units]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Đăng ký thất bại");
      } else {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        router.push("/login");
      }
    } catch {
      toast.error("Lỗi kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen animated-gradient flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] bg-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-80px] w-[400px] h-[400px] bg-cyan-300/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl mb-4 overflow-hidden p-2">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tạo Tài Khoản</h1>
          <p className="text-white/70 text-sm mt-1">Trường Cao đẳng Bách Khoa Nam Sài Gòn</p>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký</h2>
          <p className="text-gray-500 text-sm mb-6">Điền đầy đủ thông tin để tạo tài khoản sinh viên.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-700 font-medium">Họ và Tên</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11 bg-gray-50 border-gray-200 focus:border-blue-400 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="studentId" className="text-gray-700 font-medium">Mã số sinh viên</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="2100xxxx"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="h-11 bg-gray-50 border-gray-200 focus:border-blue-400 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email trường</Label>
              <Input
                id="email"
                type="email"
                placeholder="20110382xx@sv.nsg.edu.vn"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 bg-gray-50 border-gray-200 focus:border-blue-400 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="h-11 bg-gray-50 border-gray-200 focus:border-blue-400 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unitId" className="text-gray-700 font-medium">Đơn vị / Chi đoàn</Label>
              <select
                id="unitId"
                value={formData.unitId}
                onChange={handleChange}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-200 focus:border-blue-400 rounded-xl text-gray-800 text-sm outline-none"
              >
                <option value="">-- Chọn đơn vị --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="className" className="text-gray-700 font-medium">Tên lớp</Label>
              {classes.length > 0 ? (
                <select
                  id="className"
                  value={formData.className}
                  onChange={handleChange}
                  className="w-full h-11 px-3 bg-gray-50 border border-gray-200 focus:border-blue-400 rounded-xl text-gray-800 text-sm outline-none"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id="className"
                  type="text"
                  placeholder="Nhập tên lớp"
                  value={formData.className}
                  onChange={handleChange}
                  className="h-11 bg-gray-50 border-gray-200 focus:border-blue-400 rounded-xl"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-pink-500 via-red-500 to-orange-400 text-white font-semibold rounded-xl hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : "Tạo tài khoản"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
