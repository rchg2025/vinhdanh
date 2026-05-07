import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CampaignsAdminPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Đợt Xét Duyệt</h1>
        <Link href="/admin/campaigns/new">
          <Button>Tạo đợt mới</Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-900">Tên Đợt</th>
              <th className="px-6 py-3 font-medium text-gray-900">Bắt đầu</th>
              <th className="px-6 py-3 font-medium text-gray-900">Kết thúc</th>
              <th className="px-6 py-3 font-medium text-gray-900">Số Hồ sơ</th>
              <th className="px-6 py-3 font-medium text-gray-900">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chưa có đợt nào.</td>
              </tr>
            ) : (
              campaigns.map((camp) => (
                <tr key={camp.id}>
                  <td className="px-6 py-4 font-semibold">{camp.title}</td>
                  <td className="px-6 py-4">{camp.startDate.toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4">{camp.endDate.toLocaleDateString("vi-VN")}</td>
                  <td className="px-6 py-4">{camp._count.applications}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link href={`/admin/campaigns/${camp.id}/edit`}>
                      <Button variant="outline" size="sm">Sửa</Button>
                    </Link>
                    <Link href={`/admin/applications?campaignId=${camp.id}`}>
                      <Button variant="outline" size="sm">Xem HS</Button>
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
