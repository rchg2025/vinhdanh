"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AdminActionButtonsProps {
  editUrl?: string;
  deleteEndpoint: string;
  itemName?: string;
}

export default function AdminActionButtons({ editUrl, deleteEndpoint, itemName = "mục này" }: AdminActionButtonsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${itemName} không? Hành động này không thể hoàn tác.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(deleteEndpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Có lỗi xảy ra khi xóa");
      }
      toast.success("Xóa thành công!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {editUrl && (
        <Link href={editUrl}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
            <Pencil size={16} />
          </Button>
        </Link>
      )}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDelete} 
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 hover:bg-red-50"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
}
