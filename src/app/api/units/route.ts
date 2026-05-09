import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const units = await prisma.unit.findMany({
      include: { classes: true },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(units);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Tên đơn vị là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.unit.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Đơn vị này đã tồn tại" }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: { name, description },
    });

    return NextResponse.json(unit);
  } catch (error: any) {
    console.error("Create Unit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
