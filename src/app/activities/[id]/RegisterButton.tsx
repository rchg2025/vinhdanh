"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterButton({ activityId, isRegistered = false, isFull = false }: { activityId: string; isRegistered?: boolean; isFull?: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (isRegistered || isFull) return;
    
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
      <button disabled className="bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed">
        Đã đăng ký
      </button>
    );
  }

  if (isFull) {
    return (
      <button disabled className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-md cursor-not-allowed opacity-75">
        Đã đủ số lượng
      </button>
    );
  }

  return (
    <button 
      onClick={handleRegister} 
      disabled={loading}
      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Đăng ký tham gia"}
    </button>
  );
}
