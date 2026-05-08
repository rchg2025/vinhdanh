import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { campaignId, data, portraitImage, evidenceFiles } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ message: "Thiếu thông tin Đợt xét duyệt" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        campaignId,
        data: data || {},
        portraitImage,
        evidenceFiles,
        status: "PENDING",
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
