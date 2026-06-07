import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import AdminSearchFilter from "@/components/admin/AdminSearchFilter";
import AdminPagination from "@/components/admin/AdminPagination";
import ExportExcelButton from "@/components/admin/ExportExcelButton";
import AdminActionButtons from "@/components/admin/AdminActionButtons";
import DownloadAllButton from "./DownloadAllButton";
import ReportCharts, { ChartData } from "./ReportCharts";

export default async function AdminReportsPage({
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
      { user: { name: { contains: query, mode: 'insensitive' as const } } },
      { activity: { title: { contains: query, mode: 'insensitive' as const } } },
      { content: { contains: query, mode: 'insensitive' as const } }
    ]
  } : {};

  const [reports, total, allReportsForCharts] = await Promise.all([
    prisma.activityReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          include: {
            unit: true
          }
        },
        activity: true,
      }
    }).catch(() => []),
    prisma.activityReport.count({ where }).catch(() => 0),
    prisma.activityReport.findMany({
      include: {
        user: { include: { unit: true } },
        activity: { include: { stage: { include: { program: true } } } }
      }
    }).catch(() => [])
  ]);

  const totalPages = Math.ceil(total / limit);

  // Compute charts data
  const unitMap = new Map<string, number>();
  const activityMap = new Map<string, number>();
  const stageMap = new Map<string, number>();
  const programMap = new Map<string, number>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allReportsForCharts.forEach((r: any) => {
    const unitName = r.user?.unit?.name || "Khác";
    unitMap.set(unitName, (unitMap.get(unitName) || 0) + 1);

    const activityName = r.activity?.title || "Khác";
    activityMap.set(activityName, (activityMap.get(activityName) || 0) + 1);

    const stageName = r.activity?.stage?.title || "Độc lập (Không có chặng)";
    stageMap.set(stageName, (stageMap.get(stageName) || 0) + 1);

    const programName = r.activity?.stage?.program?.title || "Độc lập (Không có CT)";
    programMap.set(programName, (programMap.get(programName) || 0) + 1);
  });

  const chartData: ChartData = {
    unitStats: Array.from(unitMap.entries()).map(([name, count]) => ({ name, count })),
    activityStats: Array.from(activityMap.entries()).map(([name, count]) => ({ name, count })),
    stageStats: Array.from(stageMap.entries()).map(([name, count]) => ({ name, count })),
    programStats: Array.from(programMap.entries()).map(([name, count]) => ({ name, count })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Báo cáo hoạt động</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <ExportExcelButton endpoint="/api/export/reports" filename="Danh_sach_Bao_cao" />
        </div>
      </div>

      <ReportCharts data={chartData} />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <AdminSearchFilter placeholder="Tìm theo người đăng, nội dung, hoặc hoạt động..." />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Người báo cáo</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Hoạt động</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Nội dung</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Minh chứng</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm">Thời gian</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-sm text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map((report) => {
              const evidenceFiles = (report.evidenceFiles as string[]) || [];
              
              return (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{report.user.name}</div>
                    <div className="text-xs text-gray-500">MSSV: {report.user.studentId || "Chưa cập nhật"}</div>
                    <div className="text-xs text-gray-500">Đơn vị: {report.user.unit?.name || "Chưa cập nhật"}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600">{report.activity.title}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{report.content}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1">
                      {evidenceFiles.map((fileObj: any, i: number) => {
                        const url = typeof fileObj === 'string' ? fileObj : fileObj.url;
                        const name = typeof fileObj === 'string' ? `File ${i + 1}` : fileObj.name;
                        return (
                          <a 
                            key={i} 
                            href={url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-sm w-full truncate max-w-[200px]"
                            title={name}
                          >
                            <ExternalLink size={12} className="shrink-0" /> <span className="truncate">{name}</span>
                          </a>
                        );
                      })}
                    </div>
                    {evidenceFiles.length === 0 && <span className="text-gray-400 text-sm">Không có</span>}
                    <DownloadAllButton files={evidenceFiles} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric"
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-right flex justify-end">
                    <AdminActionButtons 
                      deleteEndpoint={`/api/reports/${report.id}`} 
                      itemName="báo cáo này"
                    />
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Không tìm thấy báo cáo nào.
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
