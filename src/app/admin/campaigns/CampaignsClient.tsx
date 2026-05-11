"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Eye, Calendar, Search } from "lucide-react";

type CampaignData = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  _count: { applications: number };
};

export default function CampaignsClient({ initialCampaigns }: { initialCampaigns: CampaignData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredCampaigns = useMemo(() => {
    return initialCampaigns.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [initialCampaigns, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE));
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đợt Xét Duyệt</h1>
          <p className="text-gray-500 text-sm mt-1">Tạo và quản lý các đợt vinh danh sinh viên tập thể.</p>
        </div>
        <Link href="/admin/campaigns/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl">
            <Plus size={18} /> Tạo đợt mới
          </Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm đợt xét duyệt..."
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
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Tên Đợt</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Thời gian</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-center">Số Hồ sơ</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Calendar size={40} className="mb-3 opacity-50" />
                      <p>Chưa có đợt xét duyệt nào được tạo.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy đợt xét duyệt nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{camp.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-500 text-xs space-y-1">
                        <p>Từ: <span className="font-medium text-gray-700">{new Date(camp.startDate).toLocaleDateString("vi-VN")}</span></p>
                        <p>Đến: <span className="font-medium text-gray-700">{new Date(camp.endDate).toLocaleDateString("vi-VN")}</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {camp._count.applications}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/campaigns/${camp.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-gray-600 hover:text-indigo-600 rounded-lg">
                          <Edit size={14} /> Sửa
                        </Button>
                      </Link>
                      <Link href={`/admin/applications?campaignId=${camp.id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-gray-600 hover:text-indigo-600 rounded-lg">
                          <Eye size={14} /> Xem HS
                        </Button>
                      </Link>
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
            Hiển thị <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCampaigns.length)}</span> trong số <span className="font-medium">{filteredCampaigns.length}</span> đợt
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
