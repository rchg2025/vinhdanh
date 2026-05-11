import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, code, type } = await req.json();

    if (!email || !code || !type) {
      return NextResponse.json({ message: "Thiếu thông tin" }, { status: 400 });
    }

    const otp = await prisma.otp.findFirst({
      where: { email, code, type },
      orderBy: { createdAt: 'desc' }
    });

    if (!otp) {
      return NextResponse.json({ message: "Mã OTP không chính xác" }, { status: 400 });
    }

    if (new Date() > otp.expiresAt) {
      return NextResponse.json({ message: "Mã OTP đã hết hạn" }, { status: 400 });
    }

    return NextResponse.json({ message: "Xác thực thành công" }, { status: 200 });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
