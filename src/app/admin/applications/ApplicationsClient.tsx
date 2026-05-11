"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Search } from "lucide-react";
import { DeleteApplicationButton } from "./delete-button";

type AppData = {
  id: string;
  user: { name: string | null; studentId: string | null };
  campaign: { title: string };
  status: string;
  data: any;
};

export default function ApplicationsClient({ initialApplications }: { initialApplications: AppData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredApps = useMemo(() => {
    return initialApplications.filter(app => {
      const q = searchQuery.toLowerCase();
      const name = (app.user.name || "").toLowerCase();
      const studentId = (app.user.studentId || "").toLowerCase();
      return name.includes(q) || studentId.includes(q);
    });
  }, [initialApplications, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / ITEMS_PER_PAGE));
  const paginatedApps = filteredApps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xét Duyệt Hồ Sơ</h1>
        <p className="text-gray-500 text-sm mt-1">Xem, đánh giá và duyệt hồ sơ ứng viên nộp về.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc MSSV..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Sinh viên</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Đợt Vinh Danh</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialApplications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <FileText size={40} className="mb-3 opacity-50" />
                      <p>Chưa có hồ sơ nào.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedApps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy hồ sơ nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {app.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{app.user.name}</div>
                          <div className="text-gray-500 text-xs font-medium">MSSV: {app.user.studentId || "Chưa cập nhật"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-700">{app.campaign.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Chi đoàn: {(app.data as any)?.unit || "Không có"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                        ${app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : ''}
                        ${app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : ''}
                        ${app.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200/60' : ''}
                      `}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link href={`/admin/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-gray-600 hover:text-indigo-600 rounded-lg">
                          <Eye size={14} /> Duyệt
                        </Button>
                      </Link>
                      <DeleteApplicationButton id={app.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)}</span> trong số <span className="font-medium">{filteredApps.length}</span> hồ sơ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Trang trước
            </Button>
            <div className="text-sm font-medium px-2">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
