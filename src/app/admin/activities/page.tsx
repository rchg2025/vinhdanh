import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminActivitiesPage() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý Hoạt động</h1>
        <Link 
          href="/admin/activities/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={18} /> Đăng hoạt động mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Tên hoạt động</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Thời gian</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{activity.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(activity.startDate).toLocaleDateString("vi-VN")} - {new Date(activity.endDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link href={`/admin/activities/${activity.id}/reports`} className="text-indigo-600 hover:underline">
                    Xem báo cáo
                  </Link>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Chưa có hoạt động nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
