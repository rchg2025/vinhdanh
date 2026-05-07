"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";

export default function ApplicationReviewClient({ application }: { application: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handleUpdateStatus = async (status: string) => {
    setLoading(true);
    let certificateUrl = application.certificateUrl;

    try {
      if (status === "APPROVED" && certRef.current) {
        toast.info("Đang tạo giấy khen tự động...");
        // Generate Image from DOM
        const dataUrl = await htmlToImage.toPng(certRef.current, { quality: 1, pixelRatio: 2 });
        
        // Convert dataUrl to File
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `GiayKhen_${application.user.studentId}.png`, { type: "image/png" });

        // Upload to Google Drive (via our API)
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        const uploadResult = await uploadRes.json();
        
        if (uploadRes.ok) {
          certificateUrl = uploadResult.url;
          toast.success("Đã tạo và lưu giấy khen thành công");
        } else {
          toast.error("Không thể lưu giấy khen lên Drive");
        }
      }

      // Update Database
      const dbRes = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, certificateUrl }),
      });

      if (!dbRes.ok) throw new Error("Cập nhật trạng thái thất bại");

      toast.success("Đã cập nhật trạng thái hồ sơ!");
      router.refresh();
    } catch (error) {
      toast.error("Lỗi khi xử lý");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quyết định & Cấp Giấy Khen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Certificate Preview Element */}
        <div className="border rounded bg-gray-100 p-4 overflow-x-auto flex justify-center">
          <div 
            ref={certRef}
            className="relative bg-white shadow-lg"
            style={{ 
              width: "800px", 
              height: "565px", 
              backgroundImage: `url(${application.campaign.templateUrl || 'https://via.placeholder.com/800x565?text=Chua+co+Template'})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            {/* Absolute positioned text overlay */}
            <div className="absolute top-[240px] left-0 right-0 text-center">
              <h2 className="text-4xl font-bold text-red-600 uppercase font-serif">{application.user.name}</h2>
            </div>
            <div className="absolute top-[290px] left-0 right-0 text-center">
              <p className="text-xl italic font-serif">Đã đạt danh hiệu: {application.campaign.title}</p>
            </div>
            
            {application.portraitImage && (
              <div className="absolute top-[350px] left-[80px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={application.portraitImage} alt="Portrait" className="w-[100px] h-[130px] object-cover border-4 border-white shadow-md" crossOrigin="anonymous" />
              </div>
            )}
            
            <div className="absolute bottom-[80px] right-[100px] text-center">
              <p className="text-sm">Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
              <p className="font-bold mt-20">BCH Đoàn Trường</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button onClick={() => handleUpdateStatus("APPROVED")} disabled={loading} className="bg-green-600 hover:bg-green-700">
            Duyệt & Cấp Giấy Khen
          </Button>
          <Button onClick={() => handleUpdateStatus("REJECTED")} disabled={loading} variant="destructive">
            Từ chối
          </Button>
          <Button onClick={() => handleUpdateStatus("PENDING")} disabled={loading} variant="outline">
            Chuyển về Chờ Duyệt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
