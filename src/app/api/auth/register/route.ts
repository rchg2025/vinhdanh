import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, studentId, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ message: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { studentId: studentId || "" }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email hoặc Mã số đã tồn tại" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        studentId,
        password: hashedPassword,
        role: "USER"
      }
    });

    return NextResponse.json({ message: "Đăng ký thành công", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json({ message: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
