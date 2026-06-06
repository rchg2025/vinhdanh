import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ListTree } from "lucide-react";

export default async function AdminProgramsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const programs = await prisma.activityProgram.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      stages: true
    }
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Chương trình lớn</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo các Chương trình lớn (VD: Mùa hè xanh) và thêm các Chặng vào trong chương trình.
          </p>
        </div>
        <Link
          href="/admin/programs/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={16} /> Thêm chương trình mới
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
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
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/programs/${prog.id}/stages`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-xs"
                    >
                      <ListTree size={14} /> Quản lý các Chặng
                    </Link>
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
