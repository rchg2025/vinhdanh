import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
    }

    const otp = await prisma.otp.findFirst({
      where: { email, code, type: "FORGOT_PASSWORD" },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp || new Date() > otp.expiresAt) {
      return NextResponse.json({ message: "OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    // Delete the OTP after successful use
    await prisma.otp.delete({ where: { id: otp.id } });

    return NextResponse.json({ message: "Cập nhật mật khẩu thành công" }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
