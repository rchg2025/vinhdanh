import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: programId } = await params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const where: any = { programId };
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    const stages = await prisma.activityStage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { activities: true }
    });

    const exportData = stages.map((s) => ({
      "Tên chặng": s.title,
      "Mô tả": s.description || "",
      "Số lượng hoạt động": s.activities.length,
      "Ngày tạo": new Date(s.createdAt).toLocaleDateString("vi-VN"),
    }));

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting stages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
