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
      },
      include: {
        campaign: true,
      }
    });

    try {
      // Send confirmation email
      if (session.user.email) {
        const { emailTemplates } = await import("@/lib/email-templates");
        const { sendEmail } = await import("@/lib/mail");
        const template = emailTemplates.applicationSubmitted(session.user.name || "Sinh viên", application.campaign.title);
        await sendEmail(session.user.email, template.subject, template.html);
      }
    } catch (e) {
      console.error("Lỗi gửi email nộp hồ sơ:", e);
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
