import { db } from '@/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '@/db/schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { DAILY_CORE_PROTOCOLS, calculateCurrentStats, getLevelFromPower } from '@/lib/solo-leveling-calc';

export async function POST() {
  try {
    // 1. Fetch current baseline stats
    let statsList = await db.select().from(soloLevelingStats).limit(1);
    if (statsList.length === 0) {
      return NextResponse.json({ error: 'Stats not initialized' }, { status: 404 });
    }
    const stats = statsList[0];

    // 2. Fetch yesterday's log (most recent log before today)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    let logsList = await db.select()
      .from(soloLevelingDailyLogs)
      .where(lt(soloLevelingDailyLogs.date, todayStart))
      .orderBy(desc(soloLevelingDailyLogs.date))
      .limit(1);

    let updatedStats = { ...stats };

    if (logsList.length > 0) {
      const yesterdayLog = logsList[0];

      // Only apply yesterday's penalty evaluation once
      if (yesterdayLog.penaltyApplied === 0) {
        // Parse yesterday's completed task IDs
        const yesterdayTaskIds = yesterdayLog.taskIds
          ? yesterdayLog.taskIds.split(',').map(s => s.trim()).filter(Boolean)
          : [];

        // Project yesterday's final stats before decay and streak calculations
        const yesterdayFinalStats = calculateCurrentStats(
          { ...stats, userId: stats.userId ?? undefined },
          yesterdayTaskIds
        );

        const completedCore = yesterdayLog.completedCoreTasks;
        const totalCore = DAILY_CORE_PROTOCOLS.length;
        const missedCore = totalCore - completedCore;

        let isFailure = stats.failureState;
        let perfectStreak = stats.perfectStreak;
        let weeklyStreak = stats.weeklyStreak;
        let xpMultiplier = yesterdayFinalStats.xpMultiplier;

        let strength = yesterdayFinalStats.strength;
        let agility = yesterdayFinalStats.agility;
        let intelligence = yesterdayFinalStats.intelligence;
        let memory = yesterdayFinalStats.memory;
        let discipline = yesterdayFinalStats.discipline;
        let focus = yesterdayFinalStats.focus;
        let communication = yesterdayFinalStats.communication;
        let confidence = yesterdayFinalStats.confidence;
        let stability = yesterdayFinalStats.stability;
        let careerXp = yesterdayFinalStats.careerXp;

        const unlockedMilestonesArray = yesterdayFinalStats.unlockedMilestones
          ? yesterdayFinalStats.unlockedMilestones.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

        if (missedCore >= 3) {
          // SEVERE PENALTY: Enter Failure State + Reset Streaks & Streak Multiplier
          isFailure = 1;
          perfectStreak = 0;
          weeklyStreak = 0;

          // Reset multiplier back to base + permanent milestone boosts
          let baseMultiplier = 1.0;
          if (unlockedMilestonesArray.includes('Iron Body')) baseMultiplier += 0.05;
          if (unlockedMilestonesArray.includes('Unbreakable Mind')) baseMultiplier += 0.05;
          if (unlockedMilestonesArray.includes('Tactical Genius')) baseMultiplier += 0.10;
          xpMultiplier = Number(baseMultiplier.toFixed(2));

          // Accelerated Decay: Mental & Discipline stats decay by 15% (20% if already in failure state)
          const decayFactor = stats.failureState === 1 ? 0.80 : 0.85;
          discipline = Math.max(10, Math.floor(discipline * decayFactor));
          focus = Math.max(10, Math.floor(focus * decayFactor));
          stability = Math.max(10, Math.floor(stability * decayFactor));

          // Decay ALL other attributes by 5%
          strength = Math.max(10, Math.floor(strength * 0.95));
          agility = Math.max(10, Math.floor(agility * 0.95));
          intelligence = Math.max(10, Math.floor(intelligence * 0.95));
          memory = Math.max(10, Math.floor(memory * 0.95));
          communication = Math.max(10, Math.floor(communication * 0.95));
          confidence = Math.max(10, Math.floor(confidence * 0.95));
          careerXp = Math.max(10, Math.floor(careerXp * 0.95));
        } else if (missedCore > 0) {
          // Minor Penalty: Break streak but don't enter failure state
          perfectStreak = 0;
        } else if (completedCore === totalCore) {
          // PERFECT DAY: Clear failure state + increment streak + boost multiplier
          isFailure = 0;
          perfectStreak += 1;
          if (perfectStreak > 0 && perfectStreak % 7 === 0) {
            weeklyStreak += 1;
            xpMultiplier = Math.min(3.0, Number((xpMultiplier + 0.1).toFixed(2)));
          }
        }

        // Recalculate Power Categories for the base stats
        const finalPhysicalPower = Math.floor((strength + agility) * 2);
        const finalMentalPower = Math.floor((intelligence + memory + focus) * 1.8);
        const finalDisciplinePower = Math.floor((discipline + stability) * 2.2);
        const finalCommunicationPower = Math.floor((communication + confidence) * 1.5);
        const finalCareerPower = Math.floor(careerXp * 2);

        // Recalculate Weighted Power Level Formula
        const rawPowerLevel = (
          strength * 1.5 +
          agility * 1.4 +
          intelligence * 1.5 +
          memory * 1.3 +
          discipline * 1.7 +
          focus * 1.2 +
          communication * 1.1 +
          confidence * 1.1 +
          stability * 1.2 +
          careerXp * 1.4
        ) * xpMultiplier;

        // Temporary Failure State debuff: 20% power level reduction
        const finalPowerLevel = isFailure === 1 ? Math.floor(rawPowerLevel * 0.8) : Math.floor(rawPowerLevel);

        // Re-evaluate Ranks
        let newRank = 'Civilian';
        if (finalPowerLevel > 15000) newRank = 'Shadow Monarch';
        else if (finalPowerLevel > 9000) newRank = 'Monarch';
        else if (finalPowerLevel > 5000) newRank = 'Commander';
        else if (finalPowerLevel > 2500) newRank = 'Elite';
        else if (finalPowerLevel > 1200) newRank = 'Warrior';
        else if (finalPowerLevel > 500) newRank = 'Aspirant';

        // Update stats row and daily log in parallel. Save attributes as rounded integers.
        const [[updatedStatsRow]] = await Promise.all([
          db
            .update(soloLevelingStats)
            .set({
              failureState: isFailure,
              perfectStreak,
              weeklyStreak,
              xpMultiplier,
              strength: Math.round(strength),
              agility: Math.round(agility),
              intelligence: Math.round(intelligence),
              memory: Math.round(memory),
              discipline: Math.round(discipline),
              focus: Math.round(focus),
              communication: Math.round(communication),
              confidence: Math.round(confidence),
              stability: Math.round(stability),
              careerXp: Math.round(careerXp),
              powerLevel: finalPowerLevel,
              level: getLevelFromPower(finalPowerLevel),
              physicalPower: finalPhysicalPower,
              mentalPower: finalMentalPower,
              disciplinePower: finalDisciplinePower,
              communicationPower: finalCommunicationPower,
              careerPower: finalCareerPower,
              unlockedMilestones: unlockedMilestonesArray.join(','),
              currentRank: newRank,
              lastUpdated: new Date(),
            })
            .where(eq(soloLevelingStats.id, stats.id))
            .returning(),
          db
            .update(soloLevelingDailyLogs)
            .set({ penaltyApplied: 1 })
            .where(eq(soloLevelingDailyLogs.id, yesterdayLog.id))
        ]);

        updatedStats = updatedStatsRow;
      }
    }

    // 3. STORAGE MANAGEMENT: Prune logs older than 90 days timezone-safely
    const ninetyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 0, 0, 0, 0);
    await db.delete(soloLevelingDailyLogs).where(lt(soloLevelingDailyLogs.date, ninetyDaysAgo));

    // 4. Load or create today's daily log (to return correct state)
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
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

