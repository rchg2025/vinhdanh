import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TemplatesClient from "./templates-client";

export const metadata = {
  title: "Quản lý mẫu giấy khen | Admin",
};

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý mẫu giấy khen</h1>
        <p className="text-gray-500 text-sm mt-1">Thêm, sửa, xoá và quản lý các mẫu giấy khen của hệ thống</p>
      </div>

      <TemplatesClient />
    </div>
  );
}
