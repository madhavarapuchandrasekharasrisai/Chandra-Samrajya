import { db } from '@/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Fetch stats
    const statsList = await db
      .select()
      .from(soloLevelingStats)
      .where(eq(soloLevelingStats.userId, userId))
      .limit(1);

    if (statsList.length === 0) {
      return NextResponse.json({ error: 'Hunter profile not found' }, { status: 404 });
    }

    const stats = statsList[0];

    // 2. Fetch history
    const logsList = await db
      .select()
      .from(soloLevelingDailyLogs)
      .where(eq(soloLevelingDailyLogs.userId, userId))
      .orderBy(desc(soloLevelingDailyLogs.date))
      .limit(30);

    return NextResponse.json({
      stats,
      history: logsList.reverse(), // chronologically ordered for graph compatibility
    });
  } catch (error) {
    console.error('Failed to retrieve public hunter profile API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile data' },
      { status: 500 }
    );
  }
}
