import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"],
        },
      },
    });

    const config = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASS) {
      console.warn("Chưa cấu hình SMTP. Email chưa được gửi.");
      return { success: false, error: "SMTP not configured" };
    }

    const transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT) || 587,
      secure: Number(config.SMTP_PORT) === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Hệ Thống Vinh Danh" <${config.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return { success: false, error };
  }
}
