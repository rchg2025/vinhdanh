import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Eye } from "lucide-react";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<{ campaignId?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const where = resolvedSearchParams.campaignId ? { campaignId: resolvedSearchParams.campaignId } : {};

  const applications = await prisma.application.findMany({
    where,
    include: { user: true, campaign: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Xét Duyệt Hồ Sơ</h1>
        <p className="text-gray-500 text-sm mt-1">Xem, đánh giá và duyệt hồ sơ ứng viên nộp về.</p>
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
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <FileText size={40} className="mb-3 opacity-50" />
                      <p>Chưa có hồ sơ nào.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
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
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/applications/${app.id}`}>
                        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-gray-600 hover:text-indigo-600 rounded-lg">
                          <Eye size={14} /> Duyệt
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
    </div>
  );
}
