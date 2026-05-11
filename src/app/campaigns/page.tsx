import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60; // 60 seconds ISR

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold text-gray-900 text-lg">
              Danh sách Đợt Xét Duyệt
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 mt-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Tất Cả Các Đợt Xét Duyệt</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Xem danh sách các đợt vinh danh và xét duyệt danh hiệu sinh viên. Hãy chọn đợt xét duyệt phù hợp đang mở cổng để nộp hồ sơ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const isStarted = new Date(campaign.startDate) <= now;
            const isClosed = new Date(campaign.endDate) < now;
            
            return (
              <div key={campaign.id} className="bg-white p-6 flex flex-col justify-between rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${isClosed ? 'bg-gray-100 text-gray-500' : isStarted ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      {isClosed ? "Đã kết thúc" : isStarted ? "Đang diễn ra" : "Sắp diễn ra"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{campaign.description}</p>
                  )}
                </div>
                <div className="mt-4">
                  <div className="flex flex-col gap-2 text-xs font-medium mb-5">
                    <div className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      🗓 Mở: {new Date(campaign.startDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                      ⏰ Đóng: {new Date(campaign.endDate).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  {!isClosed && isStarted ? (
                    <Link 
                      href={`/apply/${campaign.id}`}
                      className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700 transition-all"
                    >
                      Nộp ngay 🚀
                    </Link>
                  ) : (
                    <div className="w-full text-center px-4 py-2.5 bg-gray-100 text-gray-400 font-bold rounded-xl border border-gray-100 cursor-not-allowed">
                      {isClosed ? "Đã đóng cổng" : "Chưa mở cổng"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {campaigns.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-2xl border border-gray-200 border-dashed">
              Chưa có đợt xét duyệt nào trên hệ thống.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
