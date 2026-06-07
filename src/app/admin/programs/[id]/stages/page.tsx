import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import AdminSearchFilter from "@/components/admin/AdminSearchFilter";
import AdminPagination from "@/components/admin/AdminPagination";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import AdminActionButtons from "@/components/admin/AdminActionButtons";

export default async function AdminProgramStagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const resolvedParams = await searchParams;
  
  const query = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: any = { programId: id };
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' as const } },
      { description: { contains: query, mode: 'insensitive' as const } }
    ];
  }

  const program = await prisma.activityProgram.findUnique({
    where: { id },
  });

  if (!program) redirect("/admin/programs");

  const [stages, total] = await Promise.all([
    prisma.activityStage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
      include: { activities: true }
    }),
    prisma.activityStage.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <Link href="/admin/programs" className="p-2 hover:bg-gray-100 rounded-full transition shrink-0 mt-1 sm:mt-0">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Các chặng thuộc: {program.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý danh sách các chặng trong chương trình này.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportExcelButton endpoint={`/api/export/programs/${id}/stages`} filename={`Danh_sach_Chang_${id}`} />
          <Link
            href={`/admin/programs/${id}/stages/new`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition whitespace-nowrap"
          >
            <Plus size={16} /> Thêm chặng
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <AdminSearchFilter placeholder="Tìm theo tên chặng..." />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tên chặng</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Số hoạt động</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stages.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Chương trình này chưa có chặng nào.
                </td>
              </tr>
            ) : (
              stages.map((stage) => (
                <tr key={stage.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{stage.title}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{stage.description || "—"}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600">
                    {stage.activities.length} hoạt động
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end">
                    <AdminActionButtons 
                      editUrl={`/admin/programs/${id}/stages/${stage.id}/edit`} 
                      deleteEndpoint={`/api/programs/${id}/stages/${stage.id}`} 
                      itemName="chặng này"
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
