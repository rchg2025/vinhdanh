import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy, Settings, Clock, Archive, ChevronRight, FileText, ExternalLink, Home } from "lucide-react";
import { HeaderLogoutButton } from "@/components/LogoutButton";

const statusMap: Record<string, { label: string; cls: string; icon: string }> = {
  PENDING:  { label: "Chờ duyệt",  cls: "bg-amber-50 text-amber-700 border border-amber-200/60", icon: "⏳" },
  APPROVED: { label: "Đã duyệt",   cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/60", icon: "✅" },
  REJECTED: { label: "Từ chối",    cls: "bg-rose-50 text-rose-700 border border-rose-200/60", icon: "❌" },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const [campaigns, myApplications] = await Promise.all([
    prisma.campaign.findMany({
      where: { endDate: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.findMany({
      where: { userId: session.user.id },
      include: { campaign: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-xl shadow-md flex items-center justify-center w-9 h-9">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-gray-900 text-lg hidden sm:block tracking-tight">Vinh Danh Online</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Home size={16} /> <span className="hidden sm:inline">Về Trang chủ</span>
            </Link>
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/campaigns"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Settings size={16} /> <span className="hidden sm:inline">Quản trị hệ thống</span>
              </Link>
            )}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-gray-900">{session.user.name}</span>
                <span className="text-xs text-gray-500">{session.user.email}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md border-2 border-white">
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            <div className="pl-4 border-l border-gray-100 flex items-center">
              <HeaderLogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 md:px-8 py-8 space-y-12">
        {/* Welcome */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none overflow-hidden">
            <img src="/logo.png" alt="" className="w-[300px] h-[300px] object-contain grayscale" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Chào mừng trở lại, {session.user.name} 👋
            </h1>
            <p className="text-gray-500 text-lg">Khám phá các đợt vinh danh mới nhất và theo dõi tiến độ hồ sơ của bạn ngay trong hệ thống.</p>
          </div>
        </div>

        {/* Campaigns Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Mở đăng ký xét duyệt
            </h2>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                <Archive size={32} />
              </div>
              <p className="text-gray-500 font-medium">Hiện tại không có đợt xét duyệt nào đang mở.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="p-6 flex flex-col flex-1 relative">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                      <Award size={24} />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                      {campaign.description || "Nhấn để xem chi tiết đợt vinh danh này."}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50/80 px-3 py-2 rounded-lg mb-6 w-fit border border-gray-100">
                      <Clock size={14} className="text-indigo-500" />
                      <span>Hạn cuối: {campaign.endDate.toLocaleDateString("vi-VN")}</span>
                    </div>

                    <Link
                      href={`/apply/${campaign.id}`}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                    >
                      Nộp hồ sơ ngay <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Applications Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Hồ Sơ Của Tôi
            </h2>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {myApplications.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center">
                <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                  <FileText size={32} />
                </div>
                <p className="text-gray-500 font-medium">Bạn chưa nộp hồ sơ nào.</p>
                <p className="text-gray-400 text-sm mt-1">Các hồ sơ đã nộp sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>
                      <th className="px-8 py-5 font-semibold text-gray-500 uppercase tracking-wider text-xs">Danh hiệu</th>
                      <th className="px-8 py-5 font-semibold text-gray-500 uppercase tracking-wider text-xs">Ngày nộp</th>
                      <th className="px-8 py-5 font-semibold text-gray-500 uppercase tracking-wider text-xs">Trạng thái</th>
                      <th className="px-8 py-5 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Giấy khen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myApplications.map((app) => {
                      const status = statusMap[app.status] ?? { label: app.status, cls: "bg-gray-100 text-gray-600", icon: "🔹" };
                      return (
                        <tr key={app.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{app.campaign.title}</p>
                          </td>
                          <td className="px-8 py-5 text-gray-500 font-medium">{app.createdAt.toLocaleDateString("vi-VN")}</td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${status.cls}`}>
                              <span>{status.icon}</span> {status.label}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            {app.status === "APPROVED" ? (
                              <div className="flex flex-col items-end gap-2">
                                {app.certificateUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={`/api/proxy-image?url=${encodeURIComponent(
                                      (() => {
                                        const u = app.certificateUrl!;
                                        const m = u.match(/\/d\/([a-zA-Z0-9_-]+)\//);
                                        if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400`;
                                        const m2 = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                                        if (m2?.[1]) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w400`;
                                        return u;
                                      })()
                                    )}`}
                                    alt="Giấy khen"
                                    loading="lazy"
                                    decoding="async"
                                    className="w-32 h-auto rounded-lg border border-gray-200 shadow-sm bg-gray-100"
                                  />
                                )}
                                <div className="flex gap-2">
                                  <Link
                                    href={`/certificate/${app.id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-xs shadow-sm"
                                  >
                                    <ExternalLink size={12} /> Xem giấy khen
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs font-medium">Chưa có</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Award({ className, ...props }:any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/></svg>;
}
