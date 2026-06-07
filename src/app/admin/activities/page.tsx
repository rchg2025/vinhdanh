import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import AdminSearchFilter from "@/components/admin/AdminSearchFilter";
import AdminPagination from "@/components/admin/AdminPagination";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import AdminActionButtons from "@/components/admin/AdminActionButtons";

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const where = query ? {
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } }
    ]
  } : {};

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        stage: { include: { program: true } }
      }
    }).catch(() => []),
    prisma.activity.count({ where }).catch(() => 0)
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Hoạt động</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportExcelButton endpoint="/api/export/activities" filename="Danh_sach_Hoat_dong" />
          <Link 
            href="/admin/activities/new"
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
          >
            <Plus size={18} /> Đăng hoạt động
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <AdminSearchFilter placeholder="Tìm theo tên hoạt động..." />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Tên hoạt động</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Thuộc Chặng / Chương trình</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Thời gian</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{activity.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.stage ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs border border-emerald-200 inline-block max-w-[200px] truncate" title={`${activity.stage.program.title} - ${activity.stage.title}`}>
                      {activity.stage.program.title} &rarr; {activity.stage.title}
                    </span>
                  ) : (
                    <span className="text-gray-400 italic">Độc lập</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(activity.startDate).toLocaleDateString("vi-VN")} - {new Date(activity.endDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-6 py-4 text-sm flex items-center justify-end gap-3">
                  <Link href={`/admin/activities/${activity.id}/reports`} className="text-indigo-600 hover:underline font-medium">
                    Báo cáo
                  </Link>
                  <AdminActionButtons 
                    editUrl={`/admin/activities/${activity.id}/edit`} 
                    deleteEndpoint={`/api/activities/${activity.id}`} 
                    itemName="hoạt động này"
                  />
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy hoạt động nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination totalPages={totalPages} />
    </div>
  );
}
