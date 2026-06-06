import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Target, ChevronDown, Activity as ActivityIcon } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import { getDisplayUrl } from "@/lib/utils";

export default async function ActivitiesPage() {
  const session = await getServerSession(authOptions);
  
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

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center uppercase tracking-tight">Hoạt động tình nguyện</h1>
      
      {programs.length === 0 && standaloneActivities.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">Hiện chưa có hoạt động nào đang diễn ra.</p>
        </div>
      )}

      {/* Hiển thị phân cấp theo Chương trình -> Chặng */}
      <div className="space-y-12">
        {programs.map((program) => (
          <div key={program.id} className="relative">
            {/* Header Chương trình */}
            <div className="flex items-start gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-emerald-100">
              {program.imageUrl ? (
                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm shrink-0 border border-emerald-50">
                  <img src={getDisplayUrl(program.imageUrl)} alt={program.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border-[3px] border-emerald-500 flex items-center justify-center bg-emerald-50 shrink-0">
                  <Target className="text-emerald-600" size={28} />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide mb-2">{program.title}</h2>
                <div className="flex flex-col gap-1 text-sm font-medium text-gray-500">
                  <span><strong className="text-gray-700">Thời gian diễn ra:</strong> {new Date(program.startDate).toLocaleDateString("vi-VN")} - {new Date(program.endDate).toLocaleDateString("vi-VN")}</span>
                  {(program.registrationStartDate || program.registrationEndDate) && (
                    <span className="text-emerald-600">
                      <strong className="text-emerald-700">Thời gian đăng ký:</strong> {program.registrationStartDate ? new Date(program.registrationStartDate).toLocaleDateString("vi-VN") : "Bây giờ"} - {program.registrationEndDate ? new Date(program.registrationEndDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pl-[19px]">
              {program.stages.map((stage) => (
                <details key={stage.id} className="group" open>
                  <summary className="flex items-center justify-between p-4 md:p-5 bg-emerald-50/80 rounded-xl group-open:rounded-b-none border border-emerald-100 cursor-pointer list-none relative transition-all">
                    <div className="absolute left-[-19px] top-0 bottom-0 w-[2px] bg-emerald-200 group-open:bg-emerald-500 transition-colors"></div>
                    <div className="flex flex-col pr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <ChevronDown size={20} className="text-emerald-600 transition-transform group-open:-rotate-180 flex-shrink-0" />
                        <h3 className="font-bold text-emerald-800 text-sm md:text-base leading-snug">{stage.title}</h3>
                      </div>
                      {(stage.startDate || stage.endDate || stage.registrationStartDate || stage.registrationEndDate) && (
                        <div className="flex flex-col gap-1 pl-8 text-xs font-medium text-emerald-700/80">
                          {(stage.startDate || stage.endDate) && (
                            <span>Sự kiện: {stage.startDate ? new Date(stage.startDate).toLocaleDateString("vi-VN") : "..."} - {stage.endDate ? new Date(stage.endDate).toLocaleDateString("vi-VN") : "..."}</span>
                          )}
                          {(stage.registrationStartDate || stage.registrationEndDate) && (
                            <span>Đăng ký: {stage.registrationStartDate ? new Date(stage.registrationStartDate).toLocaleDateString("vi-VN") : "..."} - {stage.registrationEndDate ? new Date(stage.registrationEndDate).toLocaleDateString("vi-VN") : "..."}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
                      {stage.activities.length}
                    </div>
                  </summary>

                  <div className="border-l-2 border-emerald-500 border-b border-r border-emerald-100 rounded-b-xl bg-white p-4 space-y-3 relative -left-[1px]">
                    {stage.activities.length === 0 ? (
                      <p className="text-sm text-gray-400 italic py-2 pl-2">Chưa có hoạt động nào trong chặng này.</p>
                    ) : (
                      stage.activities.map((activity) => (
                        <div key={activity.id} className="bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 flex gap-4">
                            {activity.imageUrl && (
                              <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-gray-100 hidden sm:block">
                                <img src={getDisplayUrl(activity.imageUrl)} alt={activity.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-800 mb-2 leading-tight">{activity.title}</h4>
                              <div className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                                <span><strong className="text-gray-700">Sự kiện:</strong> {new Date(activity.startDate).toLocaleDateString("vi-VN")} - {new Date(activity.endDate).toLocaleDateString("vi-VN")}</span>
                                {(activity.registrationStartDate || activity.registrationEndDate) && (
                                  <span className="text-emerald-600">
                                    <strong className="text-emerald-700">Đăng ký:</strong> {activity.registrationStartDate ? new Date(activity.registrationStartDate).toLocaleDateString("vi-VN") : "Bây giờ"} - {activity.registrationEndDate ? new Date(activity.registrationEndDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 self-start md:self-auto shrink-0 bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg w-full md:w-auto">
                            <div className="flex-1 md:flex-none flex items-center justify-between md:justify-end gap-4 w-full">
                              {activity.maxRegistrations ? (
                                <div className="text-sm font-bold text-gray-600 bg-white md:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">
                                  {activity.registrations.length} / {activity.maxRegistrations} <span className="text-gray-400 font-medium">Lượt</span>
                                </div>
                              ) : (
                                <div className="text-sm font-bold text-gray-600 bg-white md:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">
                                  {activity.registrations.length} <span className="text-gray-400 font-medium">Lượt</span>
                                </div>
                              )}
                              {(() => {
                                const isRegistrationOpen = (!activity.registrationStartDate || now >= new Date(activity.registrationStartDate)) && 
                                                         (!activity.registrationEndDate || now <= new Date(activity.registrationEndDate));
                                return isRegistrationOpen ? (
                                  <Link 
                                    href={`/activities/${activity.id}`} 
                                    className="text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                  >
                                    Xem & Đăng ký
                                  </Link>
                                ) : (
                                  <Link 
                                    href={`/activities/${activity.id}`} 
                                    className="text-sm font-bold text-gray-500 bg-gray-200 px-4 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                                  >
                                    Đã đóng đăng ký
                                  </Link>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hiển thị các hoạt động độc lập */}
      {standaloneActivities.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full border-[3px] border-indigo-500 flex items-center justify-center bg-indigo-50">
              <ActivityIcon className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-600 uppercase tracking-wide">Hoạt động độc lập</h2>
          </div>
          
          <div className="grid gap-4 pl-[19px]">
            {standaloneActivities.map((activity) => (
              <div key={activity.id} className="relative">
                <div className="absolute left-[-19px] top-0 bottom-0 w-[2px] bg-indigo-200"></div>
                <div className="bg-white border-2 border-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative -left-[1px] ml-[1px]">
                  <div className="flex-1 flex gap-5">
                    {activity.imageUrl && (
                      <div className="w-28 h-28 rounded-lg overflow-hidden shrink-0 border border-gray-100 hidden sm:block">
                        <img src={getDisplayUrl(activity.imageUrl)} alt={activity.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{activity.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{activity.description}</p>
                      <div className="flex flex-col gap-1 text-xs font-medium text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                          <strong className="text-gray-700">Sự kiện:</strong> {new Date(activity.startDate).toLocaleDateString("vi-VN")} - {new Date(activity.endDate).toLocaleDateString("vi-VN")}
                        </span>
                        {(activity.registrationStartDate || activity.registrationEndDate) && (
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block w-fit mt-1">
                            <strong className="text-indigo-800">Đăng ký:</strong> {activity.registrationStartDate ? new Date(activity.registrationStartDate).toLocaleDateString("vi-VN") : "Bây giờ"} - {activity.registrationEndDate ? new Date(activity.registrationEndDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                    {activity.maxRegistrations ? (
                      <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                        {activity.registrations.length} / {activity.maxRegistrations} <span className="font-medium opacity-70">Lượt</span>
                      </div>
                    ) : (
                      <div className="text-sm font-bold text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                        {activity.registrations.length} <span className="font-medium opacity-70">Lượt</span>
                      </div>
                    )}
                    {(() => {
                      const isRegistrationOpen = (!activity.registrationStartDate || now >= new Date(activity.registrationStartDate)) && 
                                               (!activity.registrationEndDate || now <= new Date(activity.registrationEndDate));
                      return isRegistrationOpen ? (
                        <Link 
                          href={`/activities/${activity.id}`} 
                          className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                          Xem chi tiết
                        </Link>
                      ) : (
                        <Link 
                          href={`/activities/${activity.id}`} 
                          className="text-sm font-bold text-gray-500 bg-gray-200 px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                          Đã đóng đăng ký
                        </Link>
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
