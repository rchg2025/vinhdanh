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

    const programs = await prisma.activityProgram.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { stages: true }
    });

    const exportData = programs.map((p) => ({
      "Tên chương trình": p.title,
      "Mô tả": p.description || "",
      "Ngày bắt đầu": new Date(p.startDate).toLocaleDateString("vi-VN"),
      "Ngày kết thúc": new Date(p.endDate).toLocaleDateString("vi-VN"),
      "Số lượng chặng": p.stages.length,
      "Ngày tạo": new Date(p.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting programs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
