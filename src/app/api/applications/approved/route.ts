import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10")));
  const skip = (page - 1) * limit;

  try {
    const [total, items] = await Promise.all([
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.findMany({
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, studentId: true } }, campaign: { select: { title: true } } },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ total, page, limit, items });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
