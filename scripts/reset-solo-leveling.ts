import { db } from '../src/lib/db';
import { soloLevelingStats, soloLevelingDailyLogs } from '../src/db/schema';

async function resetSoloLeveling() {
  console.log('⚡ Initiating Solo Leveling Hunter Awakening Reset...');
  try {
    // 1. Delete all records from both tables
    await db.delete(soloLevelingDailyLogs);
    await db.delete(soloLevelingStats);

    // 2. Insert fresh starting stats:
    // Level 1, Civilian / E-Rank Hunter, base 10 across all attributes, 0 streak, no failure
    const [freshStats] = await db.insert(soloLevelingStats).values({
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
      powerLevel: 100,
      physicalPower: 20,
      mentalPower: 20,
      disciplinePower: 20,
      communicationPower: 20,
      careerPower: 20,
      unlockedMilestones: '',
      currentRank: 'Civilian',
      perfectStreak: 0,
      weeklyStreak: 0,
      failureState: 0,
      xpMultiplier: 1.0,
      level: 1,
      weeklyQuestWeek: '',
      weeklyQuestsCleared: '',
    }).returning();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const [freshDailyLog] = await db.insert(soloLevelingDailyLogs).values({
      userId: 'default_user',
      date: todayStart,
      completedCoreTasks: 0,
      completedSpecialTasks: 0,
      perfectDay: 0,
      penaltyApplied: 0,
      taskIds: '',
    }).returning();

    console.log('✅ Solo Leveling stats successfully reset to starting rank:');
    console.log(JSON.stringify(freshStats, null, 2));
    console.log('✅ Daily quest log reset to 0 tasks completed for today:', freshDailyLog.date);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during reset:', error);
    process.exit(1);
  }
}

resetSoloLeveling();
