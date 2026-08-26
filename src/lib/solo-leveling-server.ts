import { db } from '@/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '@/db/schema';
import { eq, and, lt, asc } from 'drizzle-orm';
import { DAILY_CORE_PROTOCOLS, calculateCurrentStats, getLevelFromPower } from './solo-leveling-calc';

export interface DayBoundaries {
  now: Date;
  todayStart: Date;
  todayEnd: Date;
}

/**
 * Calculates day boundaries aligned with the client's local timezone.
 * Parses headers from the request. Fallbacks to server time if headers are missing.
 */
export function getClientDayBoundaries(request: Request): DayBoundaries {
  const clientDateStr = request.headers.get('x-client-date') || new Date().toISOString();
  const offsetStr = request.headers.get('x-timezone-offset') || '0';
  const offsetMinutes = parseInt(offsetStr, 10);

  // Parse the client's current UTC time
  const nowClient = new Date(clientDateStr);
  
  // Shift to get local Representation (where UTC date/time fields hold local values)
  const localTime = new Date(nowClient.getTime() - offsetMinutes * 60 * 1000);

  const year = localTime.getUTCFullYear();
  const month = localTime.getUTCMonth();
  const date = localTime.getUTCDate();

  // Construct local midnight in UTC terms (e.g. 00:00:00 local time representing UTC values)
  const localMidnightUTC = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  
  // Shift back to real UTC representation of client's local midnight
  const todayStart = new Date(localMidnightUTC.getTime() + offsetMinutes * 60 * 1000);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return {
    now: nowClient,
    todayStart,
    todayEnd,
  };
}

/**
 * Automatically evaluates all past un-evaluated daily logs chronologically (oldest first).
 * Commits permanent base stat increases, streak counts, and penalties directly to soloLevelingStats.
 */
export async function evaluateDailyProtocols(todayStart: Date) {
  // 1. Fetch current baseline stats
  let statsList = await db.select().from(soloLevelingStats).limit(1);
  if (statsList.length === 0) {
    return null;
  }
  let currentStats = statsList[0];

  // 2. Fetch all un-evaluated daily logs before today start, ordered ascending by date (oldest first)
  let unEvaluatedLogs = await db.select()
    .from(soloLevelingDailyLogs)
    .where(
      and(
        lt(soloLevelingDailyLogs.date, todayStart),
        eq(soloLevelingDailyLogs.penaltyApplied, 0)
      )
    )
    .orderBy(asc(soloLevelingDailyLogs.date));

  if (unEvaluatedLogs.length === 0) {
    return currentStats;
  }

  for (const log of unEvaluatedLogs) {
    // Parse completed task IDs
    const taskIds = log.taskIds
      ? log.taskIds.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    // Project final stats before decay and streak calculations
    const finalStats = calculateCurrentStats(
      { ...currentStats, userId: currentStats.userId ?? undefined },
      taskIds
    );

    const completedCore = log.completedCoreTasks;
    const totalCore = DAILY_CORE_PROTOCOLS.length;
    const missedCore = totalCore - completedCore;

    let isFailure = currentStats.failureState;
    let perfectStreak = currentStats.perfectStreak;
    let weeklyStreak = currentStats.weeklyStreak;
    let xpMultiplier = finalStats.xpMultiplier;

    let strength = finalStats.strength;
    let agility = finalStats.agility;
    let intelligence = finalStats.intelligence;
    let memory = finalStats.memory;
    let discipline = finalStats.discipline;
    let focus = finalStats.focus;
    let communication = finalStats.communication;
    let confidence = finalStats.confidence;
    let stability = finalStats.stability;
    let careerXp = finalStats.careerXp;

    const unlockedMilestonesArray = finalStats.unlockedMilestones
      ? finalStats.unlockedMilestones.split(',').map((s: string) => s.trim()).filter(Boolean)
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
      const decayFactor = currentStats.failureState === 1 ? 0.80 : 0.85;
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
        .where(eq(soloLevelingStats.id, currentStats.id))
        .returning(),
      db
        .update(soloLevelingDailyLogs)
        .set({ penaltyApplied: 1 })
        .where(eq(soloLevelingDailyLogs.id, log.id))
    ]);

    currentStats = updatedStatsRow;
  }

  // Storage Management: Prune logs older than 90 days timezone-safely
  const ninetyDaysAgo = new Date(todayStart.getTime() - 90 * 24 * 60 * 60 * 1000);
  await db.delete(soloLevelingDailyLogs).where(lt(soloLevelingDailyLogs.date, ninetyDaysAgo));

  return currentStats;
}
