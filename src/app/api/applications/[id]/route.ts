import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import { emailTemplates } from "@/lib/email-templates";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const { status, certificateUrl, adminFeedback } = await req.json();
    const { id } = await params;

    const application = await prisma.application.update({
      where: { id },
      data: { status, certificateUrl, adminFeedback },
      include: { user: true, campaign: true }
    });

    // Send Email notification asynchronously
    if (application.user.email) {
      const template = emailTemplates.applicationStatus(
        application.user.name || "Sinh viên", 
        application.campaign.title, 
        status, 
        adminFeedback
      );
      
      let finalHtml = template.html;
      if (status === "APPROVED" && certificateUrl) {
        finalHtml += `<div style="max-width: 600px; margin: 0 auto; text-align: center;"><p>Bạn có thể tải giấy chứng nhận tại đây: <a href="${certificateUrl}" style="color: #1a56db; font-weight: bold;">Tải Giấy Khen</a></p></div>`;
      }

      sendEmail(application.user.email, template.subject, finalHtml).catch(err => console.error("Email send failed:", err));
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ message: "Lỗi máy chủ" }, { status: 500 });
  }
}
