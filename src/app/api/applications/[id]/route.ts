import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { status, certificateUrl } = await req.json();
    const { id } = await params;

    const application = await prisma.application.update({
      where: { id },
      data: { status, certificateUrl },
      include: { user: true, campaign: true }
    });

    // Send Email notification asynchronously
    if (application.user.email) {
      let subject = "Cập nhật trạng thái Hồ sơ Xét duyệt";
      let content = `<p>Chào ${application.user.name},</p><p>Trạng thái hồ sơ <strong>${application.campaign.title}</strong> của bạn đã được cập nhật thành: <strong>${status}</strong>.</p>`;

      if (status === "APPROVED" && certificateUrl) {
        subject = "Chúc mừng! Bạn đã đạt danh hiệu " + application.campaign.title;
        content += `<p>Bạn có thể tải giấy chứng nhận tại đây: <a href="${certificateUrl}">Tải Giấy Khen</a></p>`;
      }

      // Do not await this so it doesn't block the request if SMTP is not configured properly
      sendEmail(application.user.email, subject, content).catch(err => console.error("Email send failed:", err));
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
