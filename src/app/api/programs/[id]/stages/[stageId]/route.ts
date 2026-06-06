import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stageId } = await params;
    await prisma.activityStage.delete({
      where: { id: stageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi xóa chặng" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; stageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stageId } = await params;
    const data = await request.json();

    const stage = await prisma.activityStage.update({
      where: { id: stageId },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        registrationStartDate: data.registrationStartDate ? new Date(data.registrationStartDate) : null,
        registrationEndDate: data.registrationEndDate ? new Date(data.registrationEndDate) : null,
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi cập nhật chặng" }, { status: 500 });
  }
}
