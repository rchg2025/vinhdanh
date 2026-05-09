import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Award, FileText, Settings, Users, ArrowLeft, Trophy, Library, Image as ImageIcon } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/units", label: "Đơn vị / Lớp", icon: Library },
  { href: "/admin/campaigns", label: "Đợt xét duyệt", icon: Award },
  { href: "/admin/applications", label: "Xét duyệt hồ sơ", icon: FileText },
  { href: "/admin/templates", label: "Mẫu giấy khen", icon: ImageIcon },
  { href: "/admin/settings", label: "Cài đặt hệ thống", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Trophy size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Vinh Danh</h1>
              <p className="text-gray-500 text-xs font-medium">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Quản lý</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <item.icon size={18} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom: back + user */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm w-full"
          >
            <ArrowLeft size={16} /> Về trang chủ
          </Link>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex flex-shrink-0 items-center justify-center text-white text-sm font-bold shadow-sm">
              {session.user.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
