import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminActivityReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await prisma.activity.findUnique({
    where: { id }
  });

  if (!activity) {
    return <div>Không tìm thấy hoạt động</div>;
  }

  const reports = await prisma.activityReport.findMany({
    where: { activityId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    }
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <Link href="/admin/activities" className="text-blue-600 hover:underline inline-block">
        &larr; Quay lại danh sách hoạt động
      </Link>
      
      <h1 className="text-2xl font-bold">Báo cáo: {activity.title}</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Người báo cáo</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Nội dung</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Minh chứng</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => {
              const evidenceFiles = (report.evidenceFiles as string[]) || [];
              
              return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{report.user.name}</div>
                    <div className="text-xs text-gray-500">{report.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{report.content}</td>
                  <td className="px-6 py-4">
                    {evidenceFiles.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-sm mb-1"
                      >
                        Xem file <ExternalLink size={12} />
                      </a>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Chưa có báo cáo nào cho hoạt động này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
