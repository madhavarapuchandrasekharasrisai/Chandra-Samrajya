import { db } from '@/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { calculateCurrentStats } from '@/lib/solo-leveling-calc';
import { getClientDayBoundaries, evaluateDailyProtocols } from '@/lib/solo-leveling-server';

export async function GET(request: Request) {
  try {
    // 1. Retrieve or initialize soloLevelingStats (baseline base stats)
    let statsList = await db.select().from(soloLevelingStats).limit(1);
    let stats;
    
    if (statsList.length === 0) {
      // First time user - create default stats row with baseline of 10s
      const [newStats] = await db.insert(soloLevelingStats).values({
        userId: 'default_user',
        strength: 10,
        agility: 10,
        intelligence: 10,
        memory: 10,
        discipline: 10,
        focus: 10,
        communication: 10,
        confidence: 10,
        stability: 10,
        careerXp: 10,
        powerLevel: 134,
        physicalPower: 40,
        mentalPower: 54,
        disciplinePower: 44,
        communicationPower: 30,
        careerPower: 20,
        unlockedMilestones: '',
        currentRank: 'Civilian',
        perfectStreak: 0,
        weeklyStreak: 0,
        failureState: 0,
        xpMultiplier: 1.0,
        level: 1,
      }).returning();
      stats = newStats;
    } else {
      stats = statsList[0];
    }

    // 2. Retrieve or initialize today's daily log (timezone-safe, aligned with client timezone)
    const { todayStart, todayEnd } = getClientDayBoundaries(request);

    // 3. Auto-evaluate all un-evaluated past daily logs before today start
    const evaluatedStats = await evaluateDailyProtocols(todayStart);
    if (evaluatedStats) {
      stats = evaluatedStats;
    }

    let dailyLogsList = await db.select()
      .from(soloLevelingDailyLogs)
      .where(
        and(
          gte(soloLevelingDailyLogs.date, todayStart),
          lt(soloLevelingDailyLogs.date, todayEnd)
        )
      )
      .limit(1);

    let dailyLog;
    if (dailyLogsList.length === 0) {
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
      dailyLog = dailyLogsList[0];
    }

    // Parse completed tasks from comma-separated string
    const completedTasks: Record<string, boolean> = {};
    const completedTaskIds: string[] = [];
    if (dailyLog.taskIds) {
      dailyLog.taskIds.split(',').forEach((id) => {
        const trimmed = id.trim();
        if (trimmed) {
          completedTasks[trimmed] = true;
          completedTaskIds.push(trimmed);
        }
      });
    }

    // Dynamic clean deterministic state projection
    const projectedStats = calculateCurrentStats(stats, completedTaskIds);

    return NextResponse.json({
      stats: projectedStats,
      baseStats: stats, // Clean baseline
      completedTasks,
      dailyLog,
    });
  } catch (error) {
    console.error('Failed to get solo leveling stats:', error);
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // 1. Delete all rows from both tables to allow a clean re-initialization
    await Promise.all([
      db.delete(soloLevelingStats),
      db.delete(soloLevelingDailyLogs),
    ]);

    // 2. Perform a fresh, clean re-initialization
    const [stats] = await db.insert(soloLevelingStats).values({
      userId: 'default_user',
      strength: 10,
      agility: 10,
      intelligence: 10,
      memory: 10,
      discipline: 10,
      focus: 10,
      communication: 10,
      confidence: 10,
      stability: 10,
      careerXp: 10,
      powerLevel: 134,
      physicalPower: 40,
      mentalPower: 54,
      disciplinePower: 44,
      communicationPower: 30,
      careerPower: 20,
      unlockedMilestones: '',
      currentRank: 'Civilian',
      perfectStreak: 0,
      weeklyStreak: 0,
      failureState: 0,
      xpMultiplier: 1.0,
      level: 1,
    }).returning();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const [dailyLog] = await db.insert(soloLevelingDailyLogs).values({
      userId: 'default_user',
      date: todayStart,
      completedCoreTasks: 0,
      completedSpecialTasks: 0,
      perfectDay: 0,
      penaltyApplied: 0,
      taskIds: '',
    }).returning();

    return NextResponse.json({
      stats,
      baseStats: stats, // Clean baseline
      completedTasks: {},
      dailyLog,
    });
  } catch (error) {
    console.error('Failed to purge/reset solo leveling biometrics:', error);
    return NextResponse.json(
      { error: 'Failed to purge stats' },
      { status: 500 }
    );
  }
}

