import { db } from '@/lib/db';
import { soloLevelingDailyLogs } from '@/db/schema';
import { and, gte, lt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getClientDayBoundaries, evaluateDailyProtocols } from '@/lib/solo-leveling-server';

export async function POST(request: Request) {
  try {
    const { todayStart, todayEnd } = getClientDayBoundaries(request);

    // Call the shared evaluation helper to process un-evaluated daily logs before today
    const updatedStats = await evaluateDailyProtocols(todayStart);
    if (!updatedStats) {
      return NextResponse.json({ error: 'Stats not initialized' }, { status: 404 });
    }

    // Load or create today's daily log (to return correct state to store)
    let todayLogs = await db.select()
      .from(soloLevelingDailyLogs)
      .where(
        and(
          gte(soloLevelingDailyLogs.date, todayStart),
          lt(soloLevelingDailyLogs.date, todayEnd)
        )
      )
      .limit(1);

    let dailyLog;
    if (todayLogs.length === 0) {
      const [newLog] = await db.insert(soloLevelingDailyLogs).values({
        userId: 'default_user',
        date: todayStart,
        completedCoreTasks: 0,
        completedSpecialTasks: 0,
        perfectDay: 0,
        penaltyApplied: 0,
        taskIds: '',
      }).returning();
      dailyLog = newLog;
    } else {
      dailyLog = todayLogs[0];
    }

    const completedTasks: Record<string, boolean> = {};
    if (dailyLog.taskIds) {
      dailyLog.taskIds.split(',').forEach((id) => {
        if (id.trim()) completedTasks[id.trim()] = true;
      });
    }

    return NextResponse.json({
      stats: updatedStats,
      baseStats: updatedStats, // Clean baseline
      completedTasks,
      dailyLog,
    });
  } catch (error) {
    console.error('Failed to reset daily solo-leveling protocols:', error);
    return NextResponse.json(
      { error: 'Failed to reset protocols' },
      { status: 500 }
    );
  }
}
