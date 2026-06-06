import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activityId = params.id;
    const userId = session.user.id;

    // Check if activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Upsert registration
    const registration = await prisma.activityRegistration.upsert({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
      update: {
        status: 'REGISTERED',
      },
      create: {
        userId,
        activityId,
        status: 'REGISTERED',
      },
    });

    return NextResponse.json(registration);
  } catch (error) {
    console.error('Register activity error:', error);
    return NextResponse.json({ error: 'Failed to register activity' }, { status: 500 });
  }
}
