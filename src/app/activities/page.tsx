import { prisma } from "@/lib/prisma";
import PublicHeader from "@/components/PublicHeader";
import ActivitiesClient from "./ActivitiesClient";

export default async function ActivitiesPage() {
  // 1. Lấy danh sách các Chương trình lớn -> Các Chặng -> Các Hoạt động
  const programs = await prisma.activityProgram.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      stages: {
        include: {
          activities: {
            include: { registrations: true },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  }).catch(() => []);

  // 2. Lấy các Hoạt động Độc lập (không thuộc chặng nào)
  const standaloneActivities = await prisma.activity.findMany({
    where: { stageId: null },
    orderBy: { createdAt: 'desc' },
    include: { registrations: true }
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center uppercase tracking-tight">Hoạt động</h1>
        
        <ActivitiesClient programs={programs} standaloneActivities={standaloneActivities} />
      </main>
    </div>
  );
}
