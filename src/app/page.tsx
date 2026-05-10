import Link from "next/link";
import { prisma } from "@/lib/prisma";
import HomeHonoreesSection from "@/components/HomeHonoreesSection";

export default async function Home() {
  // Fetch up to 20 recent approved applications for the slider
  const honorees = await prisma.application.findMany({
    where: { status: "APPROVED" },
    include: { user: { select: { name: true, studentId: true } }, campaign: { select: { title: true } } },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div className="relative min-h-screen animated-gradient overflow-hidden">
      {/* Floating decorative blobs */}
      <div className="absolute top-[-120px] left-[-80px] w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span>Vinh Danh <span className="font-light opacity-80">Online</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2.5 text-sm font-medium text-white/90 hover:text-white transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Đăng ký
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32">
        <div className="glass-card px-8 md:px-16 py-12 md:py-16 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium text-gray-700 dark:text-gray-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Hệ thống đang hoạt động
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6 flex flex-wrap justify-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Vinh Danh
            </span>
            <span className="text-gray-800 dark:text-white">
              Trực Tuyến
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-10 leading-relaxed">
            Hệ thống <strong>Vinh danh & Cấp giấy khen tự động</strong> dành cho sinh viên 
            Trường Cao đẳng Bách Khoa Nam Sài Gòn. Nộp hồ sơ nhanh chóng, nhận kết quả minh bạch.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all text-center"
            >
              🚀 Đăng nhập ngay
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-800 font-semibold rounded-full hover:bg-white transition-all text-center"
            >
              📝 Tạo tài khoản
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform cursor-default">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Nộp hồ sơ Online</h3>
            <p className="text-sm text-gray-500">Sinh viên đăng ký và nộp minh chứng trực tuyến mọi lúc, mọi nơi.</p>
          </div>
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform cursor-default">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Xét duyệt minh bạch</h3>
            <p className="text-sm text-gray-500">Quy trình xét duyệt rõ ràng, theo dõi trạng thái hồ sơ theo thời gian thực.</p>
          </div>
          <div className="glass-card p-6 text-center hover:scale-105 transition-transform cursor-default">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Giấy khen tự động</h3>
            <p className="text-sm text-gray-500">Giấy khen được tạo tự động và gửi qua email ngay khi được duyệt.</p>
          </div>
        </div>
      </main>

      {/* Vinh danh gương sáng */}
      {honorees.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">🌟 Vinh danh gương sáng</h2>
                <p className="text-white/60 text-sm mt-1">Những sinh viên tiêu biểu được vinh danh gần đây</p>
              </div>
              <Link
                href="/vinh-danh"
                className="px-4 py-2 text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-full hover:bg-white/30 transition-all"
              >
                Xem tất cả →
              </Link>
            </div>
            <HomeHonoreesSection honorees={JSON.parse(JSON.stringify(honorees))} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/60 text-sm">
        © {new Date().getFullYear()} Đoàn Trường Cao đẳng Bách Khoa Nam Sài Gòn. All rights reserved.
      </footer>
    </div>
  );
}
