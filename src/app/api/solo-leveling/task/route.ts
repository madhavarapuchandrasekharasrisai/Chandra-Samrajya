import { db } from '@/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { DAILY_CORE_PROTOCOLS, calculateCurrentStats } from '@/lib/solo-leveling-calc';
import { getClientDayBoundaries } from '@/lib/solo-leveling-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, isCompleted } = body;

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    // 1. Get current base stats
    let statsList = await db.select().from(soloLevelingStats).limit(1);
    if (statsList.length === 0) {
      return NextResponse.json({ error: 'Stats not initialized' }, { status: 404 });
    }
    const stats = statsList[0];

    // 2. Find today's daily log timezone-safely
    const { todayStart, todayEnd } = getClientDayBoundaries(request);

    let dailyLogsList = await db.select()
      .from(soloLevelingDailyLogs)
      .where(
        and(
          gte(soloLevelingDailyLogs.date, todayStart),
          lt(soloLevelingDailyLogs.date, todayEnd)
        )
      )
      .limit(1);

    if (dailyLogsList.length === 0) {
      return NextResponse.json({ error: 'Daily log not initialized for today' }, { status: 404 });
    }
    const dailyLog = dailyLogsList[0];

    // 3. Parse task list
    let taskIdsArray = dailyLog.taskIds ? dailyLog.taskIds.split(',').map(s => s.trim()).filter(Boolean) : [];
    const isAlreadyCompleted = taskIdsArray.includes(taskId);

    if (isCompleted && !isAlreadyCompleted) {
      taskIdsArray.push(taskId);
    } else if (!isCompleted && isAlreadyCompleted) {
      taskIdsArray = taskIdsArray.filter((id) => id !== taskId);
    }

    // 4. Counts
    const completedCoreTasks = taskIdsArray.filter(id => DAILY_CORE_PROTOCOLS.some(ct => ct.id === id)).length;
    const completedSpecialTasks = taskIdsArray.length - completedCoreTasks;
    const perfectDay = completedCoreTasks === DAILY_CORE_PROTOCOLS.length ? 1 : 0;

    // 5. Update only the daily log in database (do not mutate base stats table during daily checks)
    await db
      .update(soloLevelingDailyLogs)
      .set({
        taskIds: taskIdsArray.join(','),
        completedCoreTasks,
        completedSpecialTasks,
        perfectDay,
        penaltyApplied: dailyLog.penaltyApplied,
      })
      .where(eq(soloLevelingDailyLogs.id, dailyLog.id));

    // Dynamic deterministic clean projection
    const projectedStats = calculateCurrentStats(
      { ...stats, userId: stats.userId ?? undefined },
      taskIdsArray
    );

    // Formatted completed tasks for the frontend
    const completedTasksResponse: Record<string, boolean> = {};
    taskIdsArray.forEach((id) => {
      completedTasksResponse[id] = true;
    });

    return NextResponse.json({
      stats: projectedStats,
      baseStats: stats, // Clean baseline
      completedTasks: completedTasksResponse,
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

