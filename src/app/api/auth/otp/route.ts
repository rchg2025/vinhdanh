import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    if (type === "FORGOT_PASSWORD") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ message: "Email không tồn tại trong hệ thống" }, { status: 404 });
      }
    }

    // Delete existing OTPs for this email and type
    await prisma.otp.deleteMany({
      where: { email, type }
    });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.otp.create({
      data: { email, code, type, expiresAt }
    });

    const subject = "Mã xác thực OTP - Vinh Danh Online";
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">Xin chào,</h2>
        <p style="color: #555;">Bạn đã yêu cầu mã xác thực OTP từ hệ thống Vinh Danh Online.</p>
        <p style="color: #555;">Mã xác thực của bạn là:</p>
        <div style="background-color: #f4f4f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="font-size: 36px; letter-spacing: 5px; color: #4F46E5; margin: 0;">${code}</h1>
        </div>
        <p style="color: #ef4444; font-size: 14px;">Mã này có hiệu lực trong 15 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #888; font-size: 12px;">Trân trọng,<br/>Hệ thống Vinh Danh Online</p>
      </div>
    `;

    const mailResult = await sendEmail(email, subject, html);
    if (!mailResult.success) {
      console.error("Failed to send OTP email", mailResult.error);
      return NextResponse.json({ message: "Không thể gửi email. Vui lòng thử lại sau." }, { status: 500 });
    }

    return NextResponse.json({ message: "Đã gửi mã OTP" }, { status: 200 });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
