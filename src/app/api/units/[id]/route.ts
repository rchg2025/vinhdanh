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
      return NextResponse.json({ error: "Tên đơn vị là bắt buộc" }, { status: 400 });
    }

    const existing = await prisma.unit.findFirst({ 
      where: { name, id: { not: id } } 
    });

    if (existing) {
      return NextResponse.json({ error: "Tên đơn vị này đã tồn tại" }, { status: 400 });
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: { name, description },
    });

    return NextResponse.json(unit);
  } catch (error: any) {
    console.error("Update Unit Error:", error);
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
    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Unit Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
