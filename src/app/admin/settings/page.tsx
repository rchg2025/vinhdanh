"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    GOOGLE_DRIVE_CLIENT_ID: "",
    GOOGLE_DRIVE_CLIENT_SECRET: "",
    GOOGLE_DRIVE_REFRESH_TOKEN: "",
    GOOGLE_DRIVE_FOLDER_ID: "",
    SMTP_HOST: "",
    SMTP_PORT: "",
    SMTP_USER: "",
    SMTP_PASS: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (fetching) return <div>Đang tải cấu hình...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cài đặt Hệ thống</h1>

      <Tabs defaultValue="google-drive">
        <TabsList className="mb-4">
          <TabsTrigger value="google-drive">Google Drive Team</TabsTrigger>
          <TabsTrigger value="smtp">Cấu hình Email (SMTP)</TabsTrigger>
        </TabsList>

        <TabsContent value="google-drive">
          <Card>
            <CardHeader>
              <CardTitle>Google Drive API</CardTitle>
              <CardDescription>Cấu hình kết nối Google Drive để lưu trữ ảnh thẻ và minh chứng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_CLIENT_ID">Client ID</Label>
                <Input id="GOOGLE_DRIVE_CLIENT_ID" value={settings.GOOGLE_DRIVE_CLIENT_ID || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_CLIENT_SECRET">Client Secret</Label>
                <Input id="GOOGLE_DRIVE_CLIENT_SECRET" type="password" value={settings.GOOGLE_DRIVE_CLIENT_SECRET || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_REFRESH_TOKEN">Refresh Token</Label>
                <Input id="GOOGLE_DRIVE_REFRESH_TOKEN" type="password" value={settings.GOOGLE_DRIVE_REFRESH_TOKEN || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="GOOGLE_DRIVE_FOLDER_ID">Thư mục lưu trữ (Folder ID)</Label>
                <Input id="GOOGLE_DRIVE_FOLDER_ID" value={settings.GOOGLE_DRIVE_FOLDER_ID || ""} onChange={handleChange} />
              </div>
              <Button onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu cấu hình Drive"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình SMTP Gmail</CardTitle>
              <CardDescription>Sử dụng App Password của Gmail để gửi thông báo tự động.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="SMTP_HOST">Máy chủ SMTP (VD: smtp.gmail.com)</Label>
                <Input id="SMTP_HOST" value={settings.SMTP_HOST || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_PORT">Cổng (VD: 465 hoặc 587)</Label>
                <Input id="SMTP_PORT" value={settings.SMTP_PORT || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_USER">Tài khoản Email</Label>
                <Input id="SMTP_USER" value={settings.SMTP_USER || ""} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="SMTP_PASS">Mật khẩu ứng dụng (App Password)</Label>
                <Input id="SMTP_PASS" type="password" value={settings.SMTP_PASS || ""} onChange={handleChange} />
              </div>
              <Button onClick={handleSave} disabled={loading}>{loading ? "Đang lưu..." : "Lưu cấu hình Email"}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
