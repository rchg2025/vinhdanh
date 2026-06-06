"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteApplication } from "./actions";
import { useRouter } from "next/navigation";

export function DeleteApplicationButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa hồ sơ này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    setLoading(true);
    const result = await deleteApplication(id);
    
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 size={14} /> {loading ? "Đang xóa..." : "Xóa"}
    </Button>
  );
}
