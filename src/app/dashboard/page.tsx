import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex justify-center p-10">
        <p>Vui lòng đăng nhập</p>
      </div>
    );
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      endDate: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' }
  });

  const myApplications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { campaign: true }
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Xin chào, {session.user.name}</h1>
        {session.user.role === "ADMIN" && (
          <Link href="/admin/campaigns">
            <Button>Quản lý Hệ thống (Admin)</Button>
          </Link>
        )}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Các Đợt Xét Duyệt Đang Mở</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.length === 0 ? (
            <p className="text-gray-500">Hiện tại không có đợt xét duyệt nào đang mở.</p>
          ) : (
            campaigns.map(campaign => (
              <Card key={campaign.id}>
                <CardHeader>
                  <CardTitle>{campaign.title}</CardTitle>
                  <CardDescription>
                    Hạn chót: {campaign.endDate.toLocaleDateString("vi-VN")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-gray-700">{campaign.description}</p>
                </CardContent>
                <CardFooter>
                  <Link href={`/apply/${campaign.id}`} className="w-full">
                    <Button className="w-full">Nộp Hồ Sơ</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Hồ Sơ Của Tôi</h2>
        <div className="bg-white rounded-lg border shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">Danh hiệu</th>
                <th className="px-6 py-3 font-medium text-gray-900">Ngày nộp</th>
                <th className="px-6 py-3 font-medium text-gray-900">Trạng thái</th>
                <th className="px-6 py-3 font-medium text-gray-900">Giấy khen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {myApplications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">Bạn chưa nộp hồ sơ nào.</td>
                </tr>
              ) : (
                myApplications.map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4">{app.campaign.title}</td>
                    <td className="px-6 py-4">{app.createdAt.toLocaleDateString("vi-VN")}</td>
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
                      {app.status === 'APPROVED' && app.certificateUrl ? (
                        <a href={app.certificateUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Tải xuống</a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
