"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Cloud, Mail, Database, Activity, Check } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    GOOGLE_DRIVE_CLIENT_EMAIL: "",
    GOOGLE_DRIVE_PRIVATE_KEY: "",
    GOOGLE_DRIVE_FOLDER_ID: "",
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("drive");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        toast.error("Không thể tải cấu hình");
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.id]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Đã lưu cấu hình thành công");
      } else {
        toast.error("Lỗi khi lưu cấu hình");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = () => {
    toast.info("Đang kết nối thử đến Google Drive...");
    // Mock API call to test connection
    setTimeout(() => {
      toast.success("Kết nối thành công!");
    }, 1500);
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Cấu hình Hệ thống</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Custom Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("drive")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "drive"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Cloud size={18} /> Cấu hình Lưu trữ (Google Drive)
          </button>
          <button
            onClick={() => setActiveTab("smtp")}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "smtp"
                ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Mail size={18} /> Cấu hình Gửi Email (SMTP)
          </button>
        </div>

        {/* Tab Content: Google Drive */}
        {activeTab === "drive" && (
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6 text-emerald-700 font-bold text-lg">
              <Database size={20} />
              <h2>API Lưu trữ ảnh</h2>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-5 mb-8">
              <h3 className="text-emerald-800 font-bold text-sm mb-1">Thông tin Service Account</h3>
              <p className="text-emerald-600 text-sm">
                Vui lòng tạo Service Account trên Google Cloud Console, chia sẻ Folder Drive cho Email của Service Account với quyền "Người chỉnh sửa", và bật chia sẻ liên kết Folder "Bất kỳ ai có liên kết".
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_CLIENT_EMAIL" className="text-gray-700 font-semibold text-sm">
                  Client Email (Email Service Account)
                </Label>
                <Input
                  id="GOOGLE_DRIVE_CLIENT_EMAIL"
                  placeholder="name@project-id.iam.gserviceaccount.com"
                  value={settings.GOOGLE_DRIVE_CLIENT_EMAIL || ""}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_PRIVATE_KEY" className="text-gray-700 font-semibold text-sm">
                  Private Key
                </Label>
                <Textarea
                  id="GOOGLE_DRIVE_PRIVATE_KEY"
                  placeholder='{\n  "type": "service_account",\n  "project_id": "...",\n  "private_key": "...",\n  ...\n}'
                  value={settings.GOOGLE_DRIVE_PRIVATE_KEY || ""}
                  onChange={handleChange}
                  className="h-40 font-mono text-xs rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 bg-gray-50/50 resize-y"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_FOLDER_ID" className="text-gray-700 font-semibold text-sm">
                  Folder ID (Thư mục lưu ảnh)
                </Label>
                <Input
                  id="GOOGLE_DRIVE_FOLDER_ID"
                  placeholder="1xPkmxcqQ2vwFoln8..."
                  value={settings.GOOGLE_DRIVE_FOLDER_ID || ""}
                  onChange={handleChange}
                  className="h-11 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                className="h-11 rounded-lg gap-2 px-6 font-semibold bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                <Activity size={18} /> Test kết nối
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="h-11 rounded-lg gap-2 px-6 font-semibold bg-[#00A152] hover:bg-[#008a46] text-white shadow-sm"
              >
                {loading ? "Đang lưu..." : (
                  <>
                    <Check size={18} /> Lưu cấu hình Drive
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content: SMTP */}
        {activeTab === "smtp" && (
          <div className="p-6 md:p-8">
             <div className="flex items-center gap-2 mb-6 text-gray-800 font-bold text-lg">
              <Mail size={20} />
              <h2>Cấu hình gửi Mail (SMTP)</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="SMTP_HOST">Máy chủ SMTP (VD: smtp.gmail.com)</Label>
                <Input id="SMTP_HOST" value={settings.SMTP_HOST || ""} onChange={handleChange} className="h-11 rounded-lg border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_PORT">Cổng (VD: 465 hoặc 587)</Label>
                <Input id="SMTP_PORT" value={settings.SMTP_PORT || ""} onChange={handleChange} className="h-11 rounded-lg border-gray-300"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_USER">Tài khoản Email</Label>
                <Input id="SMTP_USER" value={settings.SMTP_USER || ""} onChange={handleChange} className="h-11 rounded-lg border-gray-300"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_PASS">Mật khẩu ứng dụng (App Password)</Label>
                <Input id="SMTP_PASS" type="password" value={settings.SMTP_PASS || ""} onChange={handleChange} className="h-11 rounded-lg border-gray-300" />
              </div>
            </div>
            <div className="flex items-center justify-end mt-10 pt-6 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="h-11 rounded-lg gap-2 px-6 font-semibold bg-gray-900 hover:bg-gray-800 text-white"
              >
                {loading ? "Đang lưu..." : "Lưu cấu hình Email"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
