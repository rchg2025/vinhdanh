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
        { user: { name: { contains: query, mode: 'insensitive' as const } } },
        { activity: { title: { contains: query, mode: 'insensitive' as const } } },
        { content: { contains: query, mode: 'insensitive' as const } }
      ]
    } : {};

    const reports = await prisma.activityReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        activity: { include: { stage: { include: { program: true } } } },
      }
    });

    const exportData = reports.map((r) => ({
      "Chương trình": r.activity?.stage?.program?.title || "",
      "Chặng": r.activity?.stage?.title || "",
      "Hoạt động": r.activity.title,
      "Người báo cáo": r.user.name,
      "Email người báo cáo": r.user.email,
      "Nội dung": r.content,
      "Số lượng file minh chứng": (r.evidenceFiles as string[])?.length || 0,
      "Ngày tạo": new Date(r.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting reports:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
