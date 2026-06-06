import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: programId } = await params;
    const data = await request.json();
    const { title, description } = data;

    const stage = await prisma.activityStage.create({
      data: {
        title,
        description,
        programId,
      },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Error creating stage:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;
    const stages = await prisma.activityStage.findMany({
      where: { programId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(stages);
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
