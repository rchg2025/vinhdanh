import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomeLogoutButton } from "@/components/LogoutButton";

export default async function PublicHeader() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                Cổng thông tin Hoạt động Đoàn
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/campaigns" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Đợt Xét Duyệt
            </Link>
            <Link href="/activities" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Hoạt động
            </Link>
            <Link href="/vinh-danh" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Vinh Danh
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Link>
                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
                <div className="hidden sm:block">
                  <HomeLogoutButton />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
                  Đăng nhập
                </Link>
                <Link href="/register" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
