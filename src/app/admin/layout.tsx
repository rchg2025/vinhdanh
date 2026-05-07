import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-6">
        <div className="font-bold text-xl">Admin Panel</div>
        <nav className="space-y-2">
          <Link href="/admin/campaigns">
            <Button variant="ghost" className="w-full justify-start text-white hover:text-gray-900">Quản lý Đợt Xét</Button>
          </Link>
          <Link href="/admin/applications">
            <Button variant="ghost" className="w-full justify-start text-white hover:text-gray-900">Duyệt Hồ Sơ</Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="ghost" className="w-full justify-start text-white hover:text-gray-900">Cài đặt Hệ thống</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-white hover:text-gray-900">Trở về Trang chủ</Button>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
