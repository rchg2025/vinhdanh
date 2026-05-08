import { prisma } from "@/lib/prisma";
import { Users, Award, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [totalUsers, totalCampaigns, totalApplications] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.application.count(),
  ]);

  const recentApplications = await prisma.application.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      campaign: true
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 mt-1">Thông số và hoạt động mới nhất</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng người dùng</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalUsers}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Đợt xét duyệt</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalCampaigns}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hồ sơ đã nộp</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalApplications}</h3>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500" /> Hồ sơ nộp gần đây
          </h2>
          <Link href="/admin/applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Xem tất cả
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Ứng viên</th>
                <th className="px-6 py-4">Đợt vinh danh</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]">{app.user.name}</td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{app.campaign.title}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {app.createdAt.toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">
                      {app.status === "PENDING" ? "Chờ duyệt" : app.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentApplications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có hồ sơ nào được nộp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}