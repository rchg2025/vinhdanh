import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const stages = await prisma.activityStage.findMany({
      include: { program: true },
      orderBy: [
        { program: { createdAt: "desc" } },
        { createdAt: "asc" }
      ]
    });
    return NextResponse.json(stages);
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
