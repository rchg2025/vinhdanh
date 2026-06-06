import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const where = query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {};

    const activities = await prisma.activity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        stage: { include: { program: true } },
        registrations: true,
      }
    });

    const exportData = activities.map((a) => ({
      "Chương trình": a.stage?.program?.title || "",
      "Chặng": a.stage?.title || "",
      "Tên hoạt động": a.title,
      "Mô tả": a.description || "",
      "Ngày bắt đầu": new Date(a.startDate).toLocaleDateString("vi-VN"),
      "Ngày kết thúc": new Date(a.endDate).toLocaleDateString("vi-VN"),
      "Số lượng đăng ký": `${a.registrations.length} / ${a.maxRegistrations || "Không giới hạn"}`,
      "Ngày tạo": new Date(a.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting activities:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
