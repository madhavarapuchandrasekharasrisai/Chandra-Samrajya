import { db } from '@/lib/db';
import { soloLevelingStats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { WEEKLY_QUEST_POOL, getWeekKey } from '@/lib/solo-leveling-calc';

export async function POST(request: NextRequest) {
  try {
    const { questId } = await request.json();
    if (!questId) return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 });

    // Fetch current stats from DB (single-user pattern)
    const statsList = await db.select().from(soloLevelingStats).limit(1);
    if (statsList.length === 0) {
      return NextResponse.json({ error: 'Hunter stats not found' }, { status: 404 });
    }
    const row = statsList[0];

    const currentWeekKey = getWeekKey();

    // Reset cleared list if it's a new week
    const isCurrentWeek = row.weeklyQuestWeek === currentWeekKey;
    const clearedIds: string[] = isCurrentWeek
      ? (row.weeklyQuestsCleared || '').split(',').filter(Boolean)
      : [];

    // Check if already claimed this week
    if (clearedIds.includes(questId)) {
      return NextResponse.json({ error: 'Quest reward already claimed this week' }, { status: 400 });
    }

    // Find the quest definition
    const quest = WEEKLY_QUEST_POOL.find((q) => q.id === questId);
    if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 });

    // Verify objective is actually met using live DB stats
    const statsForCheck = {
      perfectStreak: row.perfectStreak,
      weeklyStreak: row.weeklyStreak,
      strength: row.strength,
      agility: row.agility,
      intelligence: row.intelligence,
      memory: row.memory,
      discipline: row.discipline,
      focus: row.focus,
      communication: row.communication,
      confidence: row.confidence,
      stability: row.stability,
      careerXp: row.careerXp,
      powerLevel: row.powerLevel,
      level: row.level,
      unlockedMilestones: row.unlockedMilestones,
      xpMultiplier: row.xpMultiplier,
      id: row.id,
      failureState: row.failureState,
      physicalPower: row.physicalPower,
      mentalPower: row.mentalPower,
      disciplinePower: row.disciplinePower,
      communicationPower: row.communicationPower,
      careerPower: row.careerPower,
      currentRank: row.currentRank,
      weeklyQuestWeek: row.weeklyQuestWeek,
      weeklyQuestsCleared: row.weeklyQuestsCleared,
      lastUpdated: row.lastUpdated,
    };

    const { met } = quest.checkProgress(statsForCheck);
    if (!met) {
      return NextResponse.json({ error: 'Quest objective not yet met' }, { status: 400 });
    }

    // Parse and apply rewards
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    const effects = quest.rewardEffect.split(',');

    for (const effect of effects) {
      const [key, rawAmount] = effect.trim().split(':');
      const amount = parseFloat(rawAmount);
      if (isNaN(amount)) continue;

      if (key === 'multiplier') {
        const current = typeof row.xpMultiplier === 'number' ? row.xpMultiplier : 1.0;
        updates.xpMultiplier = Number(Math.min(5.0, current + amount).toFixed(2));
      } else {
        // Stat boost — capped at 999
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const current = (row as any)[key] || 10;
        updates[key] = Math.min(999, current + amount);
      }
    }

    // Mark quest as claimed this week
    clearedIds.push(questId);
    updates.weeklyQuestWeek = currentWeekKey;
    updates.weeklyQuestsCleared = clearedIds.join(',');

    await db
      .update(soloLevelingStats)
      .set(updates)
      .where(eq(soloLevelingStats.id, row.id));

    // Return the updated row
    const [updatedRow] = await db.select().from(soloLevelingStats).limit(1);

    return NextResponse.json({
      success: true,
      reward: quest.rewardText,
      stats: updatedRow,
    });
  } catch (error) {
    console.error('Weekly quest claim error:', error);
    return NextResponse.json({ error: 'Failed to claim quest reward' }, { status: 500 });
  }
}
