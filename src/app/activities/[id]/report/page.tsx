import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ReportForm from "./ReportForm";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default async function ActivityReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
  });

  if (!activity) {
    notFound();
  }

  // Check if registered
  const registration = await prisma.activityRegistration.findUnique({
    where: {
      userId_activityId: {
        userId: session.user.id,
        activityId: activity.id,
      }
    }
  });

  if (!registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8 w-full text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Bạn chưa đăng ký tham gia hoạt động này</h1>
          <Link href={`/activities/${activity.id}`} className="text-blue-600 hover:underline">
            Quay lại trang chi tiết hoạt động để đăng ký
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <div className="container mx-auto px-4 py-8 w-full flex-1">
        <Link href={`/activities/${activity.id}`} className="text-blue-600 hover:underline mb-6 inline-block">
          &larr; Quay lại chi tiết
        </Link>
        
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
          <h1 className="text-2xl font-bold mb-2">Báo cáo hoạt động</h1>
          <h2 className="text-xl text-gray-600 mb-8">{activity.title}</h2>
          
          <ReportForm activityId={activity.id} />
        </div>
      </div>
    </div>
  );
}
