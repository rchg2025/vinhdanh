"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterButton({ activityId, isRegistered }: { activityId: string, isRegistered: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (isRegistered) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/activities/${activityId}/register`, {
        method: "POST",
      });
      if (res.ok) {
        alert("Đăng ký thành công!");
        router.refresh();
      } else {
        alert("Có lỗi xảy ra khi đăng ký.");
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <button disabled className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md cursor-not-allowed">
        Đã đăng ký
      </button>
    );
  }

  return (
    <button 
      onClick={handleRegister} 
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Đăng ký tham gia"}
    </button>
  );
}
