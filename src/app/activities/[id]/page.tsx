import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import RegisterButton from "./RegisterButton";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import { getDisplayUrl } from "@/lib/utils";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      stage: { include: { program: true } },
      registrations: true
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/activities" className="text-blue-600 hover:underline mb-6 inline-block">
        &larr; Quay lại danh sách
      </Link>
      
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        {activity.stage && (
          <div className="mb-4">
            <span className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg border border-blue-200">
              {activity.stage.program.title} &rarr; {activity.stage.title}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>

        {activity.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={getDisplayUrl(activity.imageUrl)} 
            alt={activity.title} 
            className="w-full h-64 object-cover rounded-xl mb-6 shadow-sm"
          />
        )}
        
        <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-8 pb-6 border-b">
          <div>
            <strong className="block text-gray-800">Bắt đầu sự kiện</strong>
            {new Date(activity.startDate).toLocaleDateString("vi-VN")}
          </div>
          <div>
            <strong className="block text-gray-800">Kết thúc sự kiện</strong>
            {new Date(activity.endDate).toLocaleDateString("vi-VN")}
          </div>
          {(activity.registrationStartDate || activity.registrationEndDate) && (
            <>
              <div>
                <strong className="block text-emerald-700">Mở đăng ký</strong>
                {activity.registrationStartDate ? new Date(activity.registrationStartDate).toLocaleDateString("vi-VN") : "Bây giờ"}
              </div>
              <div>
                <strong className="block text-emerald-700">Đóng đăng ký</strong>
                {activity.registrationEndDate ? new Date(activity.registrationEndDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
              </div>
            </>
          )}
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
              <div className="flex flex-col gap-4">
                {activity.maxRegistrations && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-indigo-900">Số lượng đăng ký:</span>
                      <span className="text-indigo-700 font-bold">{activity.registrations.length} / {activity.maxRegistrations}</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min((activity.registrations.length / activity.maxRegistrations) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {!!registration ? (
                  <Link 
                    href={`/activities/${activity.id}/report`}
                    className="inline-block w-full text-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    Báo cáo hoạt động
                  </Link>
                ) : (
                  (() => {
                    const now = new Date();
                    const isRegistrationOpen = (!activity.registrationStartDate || now >= new Date(activity.registrationStartDate)) && 
                                             (!activity.registrationEndDate || now <= new Date(activity.registrationEndDate));
                    return isRegistrationOpen ? (
                      <RegisterButton 
                        activityId={activity.id} 
                        isFull={activity.maxRegistrations !== null && activity.registrations.length >= activity.maxRegistrations}
                      />
                    ) : (
                      <div className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-500 text-center whitespace-nowrap">
                        {(!activity.registrationStartDate || now >= new Date(activity.registrationStartDate)) ? "Đã đóng đăng ký" : "Chưa mở đăng ký"}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
