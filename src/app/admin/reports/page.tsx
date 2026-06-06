import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminReportsPage() {
  const reports = await prisma.activityReport.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      activity: true,
    }
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý Báo cáo hoạt động</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Người báo cáo</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Hoạt động</th>
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
                  <td className="px-6 py-4 font-medium text-indigo-600">{report.activity.title}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{report.content}</td>
                  <td className="px-6 py-4">
                    {evidenceFiles.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-1 text-sm"
                      >
                        File {i + 1} <ExternalLink size={12} />
                      </a>
                    ))}
                    {evidenceFiles.length === 0 && <span className="text-gray-400 text-sm">Không có</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Chưa có báo cáo nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
