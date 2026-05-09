import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Tên lớp là bắt buộc" }, { status: 400 });
    }

    const currentClass = await prisma.class.findUnique({ where: { id } });
    if (!currentClass) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    const existing = await prisma.class.findFirst({ 
      where: { name, unitId: currentClass.unitId, id: { not: id } } 
    });

    if (existing) {
      return NextResponse.json({ error: "Tên lớp này đã tồn tại" }, { status: 400 });
    }

    const updated = await prisma.class.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update Class Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Class Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
