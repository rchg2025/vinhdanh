import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ListTree } from "lucide-react";
import AdminSearchFilter from "@/components/admin/AdminSearchFilter";
import AdminPagination from "@/components/admin/AdminPagination";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import AdminActionButtons from "@/components/admin/AdminActionButtons";

export default async function AdminProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

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

  const [programs, total] = await Promise.all([
    prisma.activityProgram.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { stages: true }
    }).catch(() => []),
    prisma.activityProgram.count({ where }).catch(() => 0)
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chương trình lớn</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo các Chương trình lớn (VD: Mùa hè xanh) và thêm các Chặng vào trong chương trình.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportExcelButton endpoint="/api/export/programs" filename="Danh_sach_Chuong_trinh" />
          <Link
            href="/admin/programs/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition whitespace-nowrap"
          >
            <Plus size={16} /> Thêm chương trình
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <AdminSearchFilter placeholder="Tìm theo tên chương trình..." />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tên chương trình</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Số chặng</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {programs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Chưa có chương trình nào.
                </td>
              </tr>
            ) : (
              programs.map((prog) => (
                <tr key={prog.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{prog.title}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {prog.startDate.toLocaleDateString("vi-VN")} - {prog.endDate.toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    {prog.stages.length} chặng
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/programs/${prog.id}/stages`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition font-medium text-xs border border-emerald-200"
                    >
                      <ListTree size={14} /> Chặng
                    </Link>
                    <AdminActionButtons 
                      editUrl={`/admin/programs/${prog.id}/edit`} 
                      deleteEndpoint={`/api/programs/${prog.id}`} 
                      itemName="chương trình này"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination totalPages={totalPages} />
    </div>
  );
}
