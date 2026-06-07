"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, FileText, Settings, Users, ArrowLeft, Trophy, Library, Image as ImageIcon, Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/users", label: "Người dùng", icon: Users },
  { href: "/admin/units", label: "Đơn vị / Lớp", icon: Library },
  { href: "/admin/campaigns", label: "Đợt xét duyệt", icon: Award },
  { href: "/admin/applications", label: "Xét duyệt hồ sơ", icon: FileText },
  { href: "/admin/programs", label: "Chương trình lớn", icon: LayoutDashboard },
  { href: "/admin/activities", label: "Quản lý hoạt động", icon: Trophy },
  { href: "/admin/reports", label: "Báo cáo hoạt động", icon: FileText },
  { href: "/admin/templates", label: "Mẫu giấy khen", icon: ImageIcon },
  { href: "/admin/settings", label: "Cài đặt hệ thống", icon: Settings },
];

export function AdminSidebar({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Header & Toggle Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm fixed top-0 w-full z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-bold text-gray-900 text-lg leading-tight">Hoạt động Đoàn</h1>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md p-1.5">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">Hoạt động Đoàn</h1>
              <p className="text-gray-500 text-xs font-medium">Admin Panel</p>
            </div>
          </div>
          <button className="md:hidden text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
             <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-3">Quản lý</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <item.icon size={18} className={`${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"} transition-colors`} />
                {item.label}
              </Link>
            )
          })}
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
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
