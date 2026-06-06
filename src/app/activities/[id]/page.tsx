import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import RegisterButton from "./RegisterButton";
import Link from "next/link";

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
  });

  if (!activity) {
    notFound();
  }

  let registration = null;
  if (session?.user?.id) {
    registration = await prisma.activityRegistration.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: activity.id,
        }
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/activities" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Quay lại danh sách
      </Link>
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
        
        <div className="flex gap-6 text-sm text-gray-600 mb-8 pb-6 border-b">
          <div>
            <strong className="block text-gray-800">Ngày bắt đầu</strong>
            {new Date(activity.startDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="block text-gray-800">Ngày kết thúc</strong>
            {new Date(activity.endDate).toLocaleDateString("vi-VN")}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <h3 className="text-xl font-semibold mb-2">Mô tả hoạt động</h3>
          <p className="whitespace-pre-wrap text-gray-700">{activity.description}</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="font-semibold text-lg">Tham gia hoạt động</h4>
            <p className="text-sm text-gray-600">Đăng ký tham gia để ghi nhận kết quả hoạt động của bạn.</p>
          </div>
          
          <div className="flex gap-3">
            {!session ? (
              <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                Đăng nhập để tham gia
              </Link>
            ) : (
              <>
                <RegisterButton activityId={activity.id} isRegistered={!!registration} />
                {registration && (
                  <Link href={`/activities/${activity.id}/report`} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition">
                    Gửi báo cáo
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
