import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!campaign) {
      return NextResponse.json({ message: "Không tìm thấy đợt vinh danh" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const { title, description, startDate, endDate, templateUrl } = await req.json();

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const campaign = await prisma.campaign.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        templateUrl,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    await prisma.campaign.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ message: "Đã xóa đợt vinh danh" });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}