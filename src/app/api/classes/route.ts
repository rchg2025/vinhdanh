import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, unitId } = await req.json();

    if (!name || !unitId) {
      return NextResponse.json({ error: "Tên lớp và Đơn vị là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.class.findFirst({ where: { name, unitId } });
    if (existing) {
      return NextResponse.json({ error: "Lớp này đã tồn tại trong đơn vị chọn" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: { name, description, unitId },
    });

    return NextResponse.json(newClass);
  } catch (error: any) {
    console.error("Create Class Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
