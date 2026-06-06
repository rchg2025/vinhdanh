"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";

interface ExportExcelButtonProps {
  endpoint: string;
  filename: string;
}

export default function ExportExcelButton({ endpoint, filename }: ExportExcelButtonProps) {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setLoading(true);
    try {
      // Pass the current query filters to the API
      const queryParams = new URLSearchParams(searchParams.toString());
      // We don't want to limit to the current page when exporting
      queryParams.delete("page"); 

      const res = await fetch(`${endpoint}?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Lỗi tải dữ liệu");
      
      const data = await res.json();
      
      if (!data || data.length === 0) {
        toast.info("Không có dữ liệu để xuất");
        setLoading(false);
        return;
      }

      // Convert JSON to Worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      
      // Generate Excel file
      XLSX.writeFile(workbook, `${filename}.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể xuất file Excel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={loading}
      variant="outline"
      className="flex items-center gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
    >
      <Download size={16} />
      {loading ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
