import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  income,
  expense,
  client,
  followup,
  monthlyTarget,
  budgetConfig,
  todo,
  outreachRecord,
  warRoomAction,
  warRoomOpportunity,
  jobApplication,
  notification,
  soloLevelingStats,
  soloLevelingDailyLogs,
} from '@/db/schema';
import { desc, asc, and, gte, lt } from 'drizzle-orm';
import { getClientDayBoundaries } from '@/lib/solo-leveling-server';
import { calculateCurrentStats } from '@/lib/solo-leveling-calc';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { todayStart, todayEnd } = getClientDayBoundaries(request);

    // Run ALL database selects in parallel using Promise.all on the server
    const [
      incomesList,
      expensesList,
      clientsList,
      followupsList,
      targetsList,
      budgetList,
      todosList,
      outreachList,
      warActionsList,
      warOppsList,
      jobsList,
      notificationsList,
      statsList,
      dailyLogsList,
    ] = await Promise.all([
      db.select().from(income).orderBy(desc(income.date)),
      db.select().from(expense).orderBy(desc(expense.date)),
      db.select().from(client).orderBy(desc(client.createdAt)),
      db.select().from(followup).orderBy(asc(followup.dueDate)),
      db.select().from(monthlyTarget).orderBy(desc(monthlyTarget.createdAt)).limit(1),
      db.select().from(budgetConfig).orderBy(desc(budgetConfig.createdAt)).limit(1),
      db.select().from(todo).orderBy(desc(todo.createdAt)),
      db.select().from(outreachRecord).orderBy(desc(outreachRecord.date)),
      db.select().from(warRoomAction).orderBy(desc(warRoomAction.createdAt)),
      db.select().from(warRoomOpportunity).orderBy(desc(warRoomOpportunity.createdAt)),
      db.select().from(jobApplication).orderBy(desc(jobApplication.appliedDate)),
      db.select().from(notification).orderBy(desc(notification.createdAt)),
      db.select().from(soloLevelingStats).limit(1),
      db.select().from(soloLevelingDailyLogs).where(
        and(
          gte(soloLevelingDailyLogs.date, todayStart),
          lt(soloLevelingDailyLogs.date, todayEnd)
        )
      ).limit(1),
    ]);

    // Handle solo leveling stats projection
    let stats: any = statsList[0] || null;
    const baseStats = stats;
    const completedTasks: Record<string, boolean> = {};

    if (stats) {
      const dailyLog = dailyLogsList[0] || null;
      const completedTaskIds: string[] = [];
      if (dailyLog && dailyLog.taskIds) {
        dailyLog.taskIds.split(',').forEach((id) => {
          const trimmed = id.trim();
          if (trimmed) {
            completedTasks[trimmed] = true;
            completedTaskIds.push(trimmed);
          }
        });
      }
      stats = calculateCurrentStats({ ...stats, userId: stats.userId ?? undefined }, completedTaskIds);
    }

    return NextResponse.json({
      incomes: incomesList,
      expenses: expensesList,
      clients: clientsList,
      followups: followupsList,
      settings: {
        monthlyTarget: targetsList[0] || null,
        budgetConfig: budgetList[0] || null,
      },
      todos: todosList,
      outreachRecords: outreachList,
      warRoomActions: warActionsList,
      warRoomOpportunities: warOppsList,
      jobApplications: jobsList,
      notifications: notificationsList,
      soloLeveling: {
        stats,
        baseStats,
        completedTasks,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to bootstrap app data:', error);
    return NextResponse.json({ error: 'Failed to bootstrap app data' }, { status: 500 });
  }
}
