import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: activityId } = await params;
    const userId = session.user.id;
    const data = await request.json();
    const { content, evidenceFiles } = data;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Create report
    const report = await prisma.activityReport.create({
      data: {
        userId,
        activityId,
        content,
        evidenceFiles,
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Submit report error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
