import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

export default async function AdminProgramStagesPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const program = await prisma.activityProgram.findUnique({
    where: { id },
  });

  if (!program) redirect("/admin/programs");

  const stages = await prisma.activityStage.findMany({
    where: { programId: id },
    orderBy: { createdAt: "asc" },
    include: {
      activities: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/programs" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Các chặng thuộc: {program.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý danh sách các chặng trong chương trình này.</p>
          </div>
        </div>
        <Link
          href={`/admin/programs/${id}/stages/new`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Thêm chặng mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Tên chặng</th>
              <th className="px-6 py-4">Mô tả</th>
              <th className="px-6 py-4">Số hoạt động</th>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
