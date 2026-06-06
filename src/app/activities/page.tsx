import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Hoạt động tình nguyện</h1>
      
      <div className="grid gap-6">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition">
            {activity.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={activity.imageUrl} 
                alt={activity.title} 
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{activity.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{activity.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>Bắt đầu: {new Date(activity.startDate).toLocaleDateString("vi-VN")}</span>
              <span>Kết thúc: {new Date(activity.endDate).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/activities/${activity.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Xem chi tiết & Tham gia
              </Link>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-gray-500 text-center py-8">Hiện chưa có hoạt động nào.</p>
        )}
      </div>
    </div>
  );
}
