import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import DownloadAllButton from "@/components/admin/DownloadAllButton";

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
  const allEvidenceFiles = reports.reduce((acc, report) => {
    const files = (report.evidenceFiles as string[]) || [];
    return [...acc, ...files];
  }, [] as string[]);

  return (
    <div className="space-y-6">
      <Link href="/admin/activities" className="text-blue-600 hover:underline inline-block">
        &larr; Quay lại danh sách hoạt động
      </Link>
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo: {activity.title}</h1>
        <DownloadAllButton files={allEvidenceFiles} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs">Người báo cáo</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs">Nội dung</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs">Minh chứng</th>
              <th className="px-3 py-2 font-semibold text-gray-700 text-xs">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => {
              const evidenceFiles = (report.evidenceFiles as string[]) || [];
              
              return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-xs">{report.user.name}</div>
                    <div className="text-[10px] text-gray-500">{report.user.email}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{report.content}</td>
                  <td className="px-3 py-2">
                    {evidenceFiles.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-[11px] mb-1"
                      >
                        Xem file <ExternalLink size={10} />
                      </a>
                    ))}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-4 text-center text-xs text-gray-500">
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
