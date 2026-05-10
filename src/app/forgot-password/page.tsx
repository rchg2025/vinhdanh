"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "FORGOT_PASSWORD" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Mã OTP đã được gửi đến email của bạn");
        setStep(2);
      } else {
        toast.error(data.message || "Lỗi gửi mã OTP");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, type: "FORGOT_PASSWORD" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Xác thực OTP thành công");
        setStep(3);
      } else {
        toast.error(data.message || "Mã OTP không hợp lệ");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        router.push("/login");
      } else {
        toast.error(data.message || "Lỗi đổi mật khẩu");
      }
    } catch (error) {
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Quên Mật Khẩu</h1>
          <p className="text-gray-500 text-sm mt-2">Khôi phục quyền truy cập tài khoản</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email đã đăng ký</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="sv@student.abc.edu.vn"
                  className="pl-10 h-12 rounded-xl bg-gray-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Nhận mã OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Nhập mã OTP (gửi qua email)</Label>
              <Input
                id="otp"
                type="text"
                required
                placeholder="XXXXXX"
                className="h-12 rounded-xl bg-gray-50 text-center tracking-widest text-xl font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Xác thực"} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                required
                placeholder="••••••••"
                className="h-12 rounded-xl bg-gray-50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Lưu mật khẩu mới"} <CheckCircle2 size={18} />
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-indigo-600 font-medium">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
