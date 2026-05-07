import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminApplicationsPage({ searchParams }: { searchParams: { campaignId?: string } }) {
  const where = searchParams.campaignId ? { campaignId: searchParams.campaignId } : {};

  const applications = await prisma.application.findMany({
    where,
    include: { user: true, campaign: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Xét Duyệt Hồ Sơ</h1>

      <div className="bg-white rounded-lg border shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900">Sinh viên</th>
              <th className="px-6 py-3 font-medium text-gray-900">Đợt Vinh Danh</th>
              <th className="px-6 py-3 font-medium text-gray-900">Chi đoàn</th>
              <th className="px-6 py-3 font-medium text-gray-900">Trạng thái</th>
              <th className="px-6 py-3 font-medium text-gray-900">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có hồ sơ nào.</td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{app.user.name}</div>
                    <div className="text-gray-500 text-xs">{app.user.studentId}</div>
                  </td>
                  <td className="px-6 py-4">{app.campaign.title}</td>
                  <td className="px-6 py-4">{(app.data as any)?.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                      ${app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${app.status === 'REJECTED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/applications/${app.id}`}>
                      <Button variant="outline" size="sm">Chi tiết & Duyệt</Button>
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
