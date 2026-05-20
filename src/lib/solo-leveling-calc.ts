export interface SoloLevelingStats {
  id: string;
  userId?: string;
  strength: number;
  agility: number;
  intelligence: number;
  memory: number;
  discipline: number;
  focus: number;
  communication: number;
  confidence: number;
  stability: number;
  careerXp: number;
  powerLevel: number;
  physicalPower: number;
  mentalPower: number;
  disciplinePower: number;
  communicationPower: number;
  careerPower: number;
  unlockedMilestones: string;
  currentRank: string;
  perfectStreak: number;
  weeklyStreak: number;
  failureState: number;
  xpMultiplier: number;
  level: number;
  weeklyQuestWeek: string;
  weeklyQuestsCleared: string;
  lastUpdated: string | Date;
}

export function getLevelFromPower(powerLevel: number): number {
  if (powerLevel <= 134) return 1;
  // Quadratic curve: PL = 134 + 100(L-1) + 5(L-1)^2
  // Solving: 5x^2 + 100x - (PL-134) = 0 where x = L-1
  // x = (-100 + sqrt(10000 + 20*(PL-134))) / 10
  const x = (-100 + Math.sqrt(7320 + 20 * powerLevel)) / 10;
  return Math.min(100, Math.max(1, Math.floor(1 + x)));
}

export function getPowerRequiredForLevel(level: number): number {
  if (level <= 1) return 134;
  const x = level - 1;
  return Math.round(134 + 100 * x + 5 * x * x);
  // LV2=239 (~1wk), LV5=614 (~1mo), LV10=1439 (~3mo), LV25=5414 (~1yr), LV50=17039 (~3yr)
}

// ─────────────────────────────────────────────────────────────────────
// FANTASY POWERS — Sovereign abilities unlocked at milestone levels
// ─────────────────────────────────────────────────────────────────────
export interface FantasyPower {
  id: string;
  level: number;
  name: string;
  title: string;
  description: string;
  effect: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const FANTASY_POWERS: FantasyPower[] = [
  {
    id: 'fp-05', level: 5,
    name: 'Awakened Perception', title: 'NOVICE HUNTER',
    description: 'The System has recognized your awakening. Your senses pierce the veil of ordinary reality.',
    effect: '+5% task XP efficiency on all core protocols',
    icon: '👁️', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'fp-10', level: 10,
    name: 'Iron Constitution', title: 'IRON BODY',
    description: 'Your body has been tempered through sweat and suffering. You are harder to break than before.',
    effect: 'Failure state recovery accelerated. Decay resistance +10%',
    icon: '⚔️', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20',
  },
  {
    id: 'fp-15', level: 15,
    name: 'Shadow Instinct', title: 'SHADOW SENSE',
    description: 'Like the Shadow Monarch himself, you sense threats before they materialize. Discipline never falters.',
    effect: '+1 bonus stat on each unbroken perfect protocol day',
    icon: '🌑', color: 'text-indigo-400', bgColor: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'fp-20', level: 20,
    name: "Sovereign's Aura", title: 'AURA MANIFESTATION',
    description: 'A faint Sovereign Aura radiates from your presence. Others sense your growing authority.',
    effect: 'XP Multiplier floor permanently elevated by 0.10',
    icon: '✨', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'fp-25', level: 25,
    name: 'Battle Transcendence', title: 'AWAKENED WARRIOR',
    description: 'The line between human and hunter has dissolved. Your will alone reshapes outcomes.',
    effect: 'Perfect streak bonuses doubled. Weekly quest rewards amplified',
    icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/20',
  },
  {
    id: 'fp-30', level: 30,
    name: 'Dominion Field', title: 'DOMAIN USER',
    description: 'Your personal domain of authority manifests. No challenge within it goes unmet.',
    effect: 'Core protocol rewards +15%. Specialization efficiency +10%',
    icon: '🔮', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    id: 'fp-40', level: 40,
    name: 'Temporal Acceleration', title: 'TIME WALKER',
    description: 'Time warps around your focused intent. What takes mortals months, you complete in weeks.',
    effect: 'All stat scaling increased. Specialization task rewards +20%',
    icon: '⏳', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'fp-50', level: 50,
    name: "Monarch's Decree", title: 'TRUE MONARCH',
    description: 'You have entered the domain of the Monarchs. The System itself bows to your sovereignty.',
    effect: 'Weekly quest rewards tripled. Absolute immunity to one failure per month',
    icon: '👑', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    id: 'fp-75', level: 75,
    name: 'Ancient Power Surge', title: 'ANCIENT-GRADE',
    description: 'Power that predates the System surges through you. You transcend all ordinary constraints.',
    effect: 'All stats gain permanent +2% bonus. Milestone rewards doubled',
    icon: '🌌', color: 'text-pink-400', bgColor: 'bg-pink-500/10 border-pink-500/20',
  },
  {
    id: 'fp-100', level: 100,
    name: 'True Sovereign', title: 'ABSOLUTE RULER',
    description: 'The impossible achieved. The System recognizes you as its equal — an entity beyond classification.',
    effect: 'MAXIMUM POWER STATE. Absolute Sovereignty achieved. No limits remain.',
    icon: '🏗️', color: 'text-white', bgColor: 'bg-white/10 border-white/20',
  },
];

export function getUnlockedPowers(level: number): FantasyPower[] {
  return FANTASY_POWERS.filter((p) => level >= p.level);
}

export function getNextPower(level: number): FantasyPower | null {
  return FANTASY_POWERS.find((p) => level < p.level) || null;
}

// ─────────────────────────────────────────────────────────────────────
// WEEKLY QUEST SYSTEM — 5 rotating weekly challenges with stat rewards
// ─────────────────────────────────────────────────────────────────────
export function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor(
    (Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - startOfYear.getTime()) / 86400000
  );
  const weekNum = Math.floor(dayOfYear / 7) + 1;
  return `${now.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export interface WeeklyQuestDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  checkProgress: (stats: SoloLevelingStats) => { current: number; target: number; met: boolean };
  rewardText: string;
  rewardEffect: string; // "stat:amount" or "multiplier:0.05", comma-separated
}

export const WEEKLY_QUEST_POOL: WeeklyQuestDef[] = [
  {
    id: 'wq-streak-3', title: 'Iron Persistence',
    description: 'Achieve a 3-day perfect protocol streak this week',
    icon: '🔥', color: 'text-orange-400',
    checkProgress: (s) => ({ current: Math.min(s.perfectStreak, 3), target: 3, met: s.perfectStreak >= 3 }),
    rewardText: '+8 Discipline, +5 Stability', rewardEffect: 'discipline:8,stability:5',
  },
  {
    id: 'wq-str-20', title: 'Body Forger',
    description: 'Raise Strength to 20 through relentless physical training',
    icon: '💪', color: 'text-red-400',
    checkProgress: (s) => ({ current: Math.min(s.strength, 20), target: 20, met: s.strength >= 20 }),
    rewardText: '+8 Agility, +5 Strength', rewardEffect: 'agility:8,strength:5',
  },
  {
    id: 'wq-int-25', title: 'Mind Ascendant',
    description: 'Elevate Intelligence to 25 through relentless learning',
    icon: '🧠', color: 'text-purple-400',
    checkProgress: (s) => ({ current: Math.min(s.intelligence, 25), target: 25, met: s.intelligence >= 25 }),
    rewardText: '+8 Memory, +5 Focus', rewardEffect: 'memory:8,focus:5',
  },
  {
    id: 'wq-disc-25', title: 'Unshakeable Core',
    description: 'Forge Discipline to 25 — the foundation of all Sovereign power',
    icon: '🛡️', color: 'text-pink-400',
    checkProgress: (s) => ({ current: Math.min(s.discipline, 25), target: 25, met: s.discipline >= 25 }),
    rewardText: '+0.05 XP Multiplier', rewardEffect: 'multiplier:0.05',
  },
  {
    id: 'wq-pl-300', title: 'Power Surge',
    description: 'Break the Power Level barrier of 300',
    icon: '⚡', color: 'text-amber-400',
    checkProgress: (s) => ({ current: Math.min(s.powerLevel, 300), target: 300, met: s.powerLevel >= 300 }),
    rewardText: '+5 all Primary Stats', rewardEffect: 'strength:5,intelligence:5,discipline:5,agility:5,focus:5',
  },
  {
    id: 'wq-pl-750', title: 'Warrior Threshold',
    description: 'Reach Power Level 750 — enter warrior territory',
    icon: '⚔️', color: 'text-teal-400',
    checkProgress: (s) => ({ current: Math.min(s.powerLevel, 750), target: 750, met: s.powerLevel >= 750 }),
    rewardText: '+0.08 XP Multiplier, +10 Discipline', rewardEffect: 'multiplier:0.08,discipline:10',
  },
  {
    id: 'wq-pl-1500', title: 'Elite Contender',
    description: 'Achieve Power Level 1500 — elite rank territory',
    icon: '🏆', color: 'text-yellow-400',
    checkProgress: (s) => ({ current: Math.min(s.powerLevel, 1500), target: 1500, met: s.powerLevel >= 1500 }),
    rewardText: '+0.12 XP Multiplier, +15 Str/Int/Disc', rewardEffect: 'multiplier:0.12,strength:15,intelligence:15,discipline:15',
  },
  {
    id: 'wq-weekly-2', title: 'Weekly Warrior',
    description: 'Maintain a 2-week consecutive perfect weekly streak',
    icon: '📅', color: 'text-indigo-400',
    checkProgress: (s) => ({ current: Math.min(s.weeklyStreak, 2), target: 2, met: s.weeklyStreak >= 2 }),
    rewardText: '+0.05 XP Multiplier, +10 Confidence', rewardEffect: 'multiplier:0.05,confidence:10',
  },
  {
    id: 'wq-comm-20', title: 'Voice of Command',
    description: 'Raise Communication to 20 — your words carry sovereign weight',
    icon: '🗣️', color: 'text-cyan-400',
    checkProgress: (s) => ({ current: Math.min(s.communication, 20), target: 20, met: s.communication >= 20 }),
    rewardText: '+10 Confidence, +8 Communication', rewardEffect: 'confidence:10,communication:8',
  },
  {
    id: 'wq-career-20', title: 'Career Ascent',
    description: 'Elevate Career XP to 20 through relentless building',
    icon: '💼', color: 'text-blue-400',
    checkProgress: (s) => ({ current: Math.min(s.careerXp, 20), target: 20, met: s.careerXp >= 20 }),
    rewardText: '+10 Intelligence, +8 Memory', rewardEffect: 'intelligence:10,memory:8',
  },
  {
    id: 'wq-level-5', title: 'Awakening Protocol',
    description: 'Achieve Level 5 — the System acknowledges your awakening',
    icon: '🌟', color: 'text-emerald-400',
    checkProgress: (s) => ({ current: Math.min(s.level || 1, 5), target: 5, met: (s.level || 1) >= 5 }),
    rewardText: '+0.05 XP Multiplier, +10 all stats', rewardEffect: 'multiplier:0.05,strength:10,agility:10,intelligence:10,discipline:10',
  },
  {
    id: 'wq-level-10', title: 'Hunter Certification',
    description: 'Reach Level 10 — you are now a certified Hunter',
    icon: '🎖️', color: 'text-orange-400',
    checkProgress: (s) => ({ current: Math.min(s.level || 1, 10), target: 10, met: (s.level || 1) >= 10 }),
    rewardText: '+0.15 XP Multiplier, +20 all stats', rewardEffect: 'multiplier:0.15,strength:20,agility:20,intelligence:20,discipline:20,focus:20',
  },
  {
    id: 'wq-milestone-any', title: 'Threshold Breaker',
    description: 'Unlock your first Elite Milestone badge',
    icon: '💎', color: 'text-rose-400',
    checkProgress: (s) => {
      const count = s.unlockedMilestones ? s.unlockedMilestones.split(',').filter(Boolean).length : 0;
      return { current: Math.min(count, 1), target: 1, met: count >= 1 };
    },
    rewardText: '+0.10 XP Multiplier, +15 Str/Int/Disc', rewardEffect: 'multiplier:0.10,strength:15,intelligence:15,discipline:15',
  },
  {
    id: 'wq-stab-20', title: 'Zen Mastery',
    description: 'Achieve Stability 20 through consistent meditation practice',
    icon: '☯️', color: 'text-teal-400',
    checkProgress: (s) => ({ current: Math.min(s.stability, 20), target: 20, met: s.stability >= 20 }),
    rewardText: '+10 Focus, +8 Stability, +5 Discipline', rewardEffect: 'focus:10,stability:8,discipline:5',
  },
  {
    id: 'wq-streak-7', title: 'Week of Legends',
    description: 'Achieve a 7-day perfect protocol streak — legendary status',
    icon: '👑', color: 'text-yellow-400',
    checkProgress: (s) => ({ current: Math.min(s.perfectStreak, 7), target: 7, met: s.perfectStreak >= 7 }),
    rewardText: '+0.10 XP Multiplier, +20 Discipline, +15 all stats',
    rewardEffect: 'multiplier:0.10,discipline:20,strength:15,intelligence:15,focus:15',
  },
];

export function getWeeklyQuests(weekKey: string): WeeklyQuestDef[] {
  const weekNum = parseInt(weekKey.split('-W')[1] || '1');
  const pool = WEEKLY_QUEST_POOL;
  const result: WeeklyQuestDef[] = [];
  for (let i = 0; i < 5; i++) {
    result.push(pool[(weekNum * 5 + i) % pool.length]);
  }
  return result;
}

export interface RPGTask {
  id: string;
  label: string;
  rewards: {
    strength?: number;
    agility?: number;
    intelligence?: number;
    memory?: number;
    discipline?: number;
    focus?: number;
    communication?: number;
    confidence?: number;
    stability?: number;
    careerXp?: number;
  };
  isCore: boolean;
  weekday?: number; // 0 = Sunday, 1 = Monday, etc.
}

export const DAILY_CORE_PROTOCOLS: RPGTask[] = [
  {
    id: 'core-pushups-squats',
    label: '50 Pushups + 50 Squats',
    rewards: { strength: 1.0 },
    isCore: true,
  },
  {
    id: 'core-deepwork',
    label: '90 Minutes Deep Work',
    rewards: { intelligence: 1.5 },
    isCore: true,
  },
  {
    id: 'core-activerecall',
    label: '20 Minutes Active Recall',
    rewards: { memory: 1.0 },
    isCore: true,
  },
  {
    id: 'core-waketime',
    label: 'Wake at Fixed Time',
    rewards: { discipline: 1.0 },
    isCore: true,
  },
  {
    id: 'core-nophone',
    label: 'No Phone First 60 Minutes',
    rewards: { focus: 0.8 },
    isCore: true,
  },
  {
    id: 'core-meditation',
    label: 'Meditation — 20 Minutes',
    rewards: { stability: 1.0, focus: 0.6 },
    isCore: true,
  },
];

export const WEEKLY_SPECIALIZATIONS: Record<number, RPGTask[]> = {
  // Monday: Agility + Memory
  1: [
    { id: 'special-mon-jumprope', label: 'Jump Rope 15 mins', rewards: { agility: 1.0 }, isCore: false, weekday: 1 },
    { id: 'special-mon-sprints', label: 'Sprint Intervals', rewards: { agility: 1.2 }, isCore: false, weekday: 1 },
    { id: 'special-mon-memorize', label: 'Memorize 10 Concepts', rewards: { memory: 1.2 }, isCore: false, weekday: 1 },
    { id: 'special-mon-recall', label: 'Recall Without Notes', rewards: { memory: 1.0 }, isCore: false, weekday: 1 },
  ],
  // Tuesday: Intelligence + Discipline
  2: [
    { id: 'special-tue-technical', label: 'Solve 3 Technical Questions', rewards: { intelligence: 1.5 }, isCore: false, weekday: 2 },
    { id: 'special-tue-concept', label: 'Learn One New Concept', rewards: { intelligence: 1.0 }, isCore: false, weekday: 2 },
    { id: 'special-tue-coldshower', label: 'Cold Shower', rewards: { discipline: 0.8 }, isCore: false, weekday: 2 },
    { id: 'special-tue-hardest', label: 'Hardest Task First', rewards: { confidence: 1.0 }, isCore: false, weekday: 2 },
  ],
  // Wednesday: English + Mental Stability
  3: [
    { id: 'special-wed-speak', label: 'Speak English 20 mins aloud', rewards: { communication: 1.2 }, isCore: false, weekday: 3 },
    { id: 'special-wed-podcast', label: 'Watch English Interview/Podcast', rewards: { communication: 0.8 }, isCore: false, weekday: 3 },
    { id: 'special-wed-meditate', label: 'Meditation 20 mins', rewards: { stability: 1.0 }, isCore: false, weekday: 3 },
  ],
  // Thursday: Agility + Intelligence
  4: [
    { id: 'special-thu-sprints', label: 'Sprint Intervals', rewards: { agility: 1.2 }, isCore: false, weekday: 4 },
    { id: 'special-thu-techreading', label: 'Technical Reading 20 mins', rewards: { intelligence: 1.0 }, isCore: false, weekday: 4 },
    { id: 'special-thu-buildfeature', label: 'Build Small Project Feature', rewards: { careerXp: 1.5 }, isCore: false, weekday: 4 },
  ],
  // Friday: English + Memory
  5: [
    { id: 'special-fri-shadow', label: 'Shadow Speaking Practice', rewards: { communication: 1.2 }, isCore: false, weekday: 5 },
    { id: 'special-fri-words', label: 'Learn 10 New Words', rewards: { communication: 1.0 }, isCore: false, weekday: 5 },
    { id: 'special-fri-teach', label: 'Teach Topic in English', rewards: { confidence: 1.0 }, isCore: false, weekday: 5 },
  ],
  // Saturday: Strength + Strategy
  6: [
    { id: 'special-sat-heavyworkout', label: 'Heavy Workout', rewards: { strength: 1.5 }, isCore: false, weekday: 6 },
    { id: 'special-sat-selfhelp', label: 'Read Self-Help Book 20 mins', rewards: { intelligence: 1.0 }, isCore: false, weekday: 6 },
    { id: 'special-sat-applyjobs', label: 'Apply to 3 Jobs', rewards: { careerXp: 1.2 }, isCore: false, weekday: 6 },
  ],
  // Sunday: Recovery + System Analysis
  0: [
    { id: 'special-sun-stretch', label: 'Stretching Session', rewards: { stability: 0.8 }, isCore: false, weekday: 0 },
    { id: 'special-sun-planning', label: 'Weekly Planning', rewards: { discipline: 1.0 }, isCore: false, weekday: 0 },
    { id: 'special-sun-metrics', label: 'Review Progress Metrics', rewards: { focus: 1.0 }, isCore: false, weekday: 0 },
    { id: 'special-sun-organize', label: 'Organize Environment', rewards: { focus: 0.8 }, isCore: false, weekday: 0 },
  ],
};

const getScale = (currentVal: number) => {
  if (currentVal >= 200) return 0.4;
  if (currentVal >= 100) return 0.6;
  if (currentVal >= 50) return 0.8;
  return 1.0;
};

// Pure deterministic calculations starting from base stats and today's completed task IDs.
// Calculations are kept as high-precision floats during processing to prevent truncation drift.
export function calculateCurrentStats(baseStats: SoloLevelingStats, completedTaskIds: string[]): SoloLevelingStats {
  const sortedTaskIds = [...completedTaskIds].sort();

  let strength = baseStats.strength;
  let agility = baseStats.agility;
  let intelligence = baseStats.intelligence;
  let memory = baseStats.memory;
  let discipline = baseStats.discipline;
  let focus = baseStats.focus;
  let communication = baseStats.communication;
  let confidence = baseStats.confidence;
  let stability = baseStats.stability;
  let careerXp = baseStats.careerXp;

  let unlockedMilestonesArray = baseStats.unlockedMilestones
    ? baseStats.unlockedMilestones.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  let xpMultiplier = baseStats.xpMultiplier;

  // We sequentially apply each task's effects. Since the list is sorted alphabetically,
  // the projection is 100% deterministic and free of task-order side effects.
  for (const taskId of sortedTaskIds) {
    const task =
      DAILY_CORE_PROTOCOLS.find((t) => t.id === taskId) ||
      Object.values(WEEKLY_SPECIALIZATIONS)
        .flat()
        .find((t) => t.id === taskId);

    if (!task) continue;

    // Failure state drops rewards by 70%
    const mult = baseStats.failureState === 1 ? xpMultiplier * 0.3 : xpMultiplier;

    if (task.rewards.strength) strength += task.rewards.strength * getScale(strength) * mult;
    if (task.rewards.agility) agility += task.rewards.agility * getScale(agility) * mult;
    if (task.rewards.intelligence) intelligence += task.rewards.intelligence * getScale(intelligence) * mult;
    if (task.rewards.memory) memory += task.rewards.memory * getScale(memory) * mult;
    if (task.rewards.discipline) discipline += task.rewards.discipline * getScale(discipline) * mult;
    if (task.rewards.focus) focus += task.rewards.focus * getScale(focus) * mult;
    if (task.rewards.communication) communication += task.rewards.communication * getScale(communication) * mult;
    if (task.rewards.confidence) confidence += task.rewards.confidence * getScale(confidence) * mult;
    if (task.rewards.stability) stability += task.rewards.stability * getScale(stability) * mult;
    if (task.rewards.careerXp) careerXp += task.rewards.careerXp * getScale(careerXp) * mult;

    // Check for milestone unlocks *during* the day's progression:
    if (strength >= 100 && !unlockedMilestonesArray.includes('Iron Body')) {
      unlockedMilestonesArray.push('Iron Body');
      careerXp += 50;
      xpMultiplier += 0.05;
    }
    if (discipline >= 100 && !unlockedMilestonesArray.includes('Unbreakable Mind')) {
      unlockedMilestonesArray.push('Unbreakable Mind');
      careerXp += 50;
      xpMultiplier += 0.05;
    }
    if (intelligence >= 150 && !unlockedMilestonesArray.includes('Tactical Genius')) {
      unlockedMilestonesArray.push('Tactical Genius');
      careerXp += 100;
      xpMultiplier += 0.10;
    }
  }

  // Enforce min/max boundaries
  strength = Math.max(10, Math.min(999, strength));
  agility = Math.max(10, Math.min(999, agility));
  intelligence = Math.max(10, Math.min(999, intelligence));
  memory = Math.max(10, Math.min(999, memory));
  discipline = Math.max(10, Math.min(999, discipline));
  focus = Math.max(10, Math.min(999, focus));
  communication = Math.max(10, Math.min(999, communication));
  confidence = Math.max(10, Math.min(999, confidence));
  stability = Math.max(10, Math.min(999, stability));
  careerXp = Math.max(10, Math.min(999, careerXp));

  const finalUnlockedMilestones = unlockedMilestonesArray.join(',');
  const finalXpMultiplier = Number(xpMultiplier.toFixed(2));

  // Compute Power Category values
  const physicalPower = Math.floor((strength + agility) * 2);
  const mentalPower = Math.floor((intelligence + memory + focus) * 1.8);
  const disciplinePower = Math.floor((discipline + stability) * 2.2);
  const communicationPower = Math.floor((communication + confidence) * 1.5);
  const careerPower = Math.floor(careerXp * 2);

  // Compute Weighted Power Level
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
  ) * finalXpMultiplier;

  // Apply failure state reduction
  const powerLevel = baseStats.failureState === 1 ? Math.floor(rawPowerLevel * 0.8) : Math.floor(rawPowerLevel);

  // Ranks
  let currentRank = 'Civilian';
  if (powerLevel > 15000) currentRank = 'Shadow Monarch';
  else if (powerLevel > 9000) currentRank = 'Monarch';
  else if (powerLevel > 5000) currentRank = 'Commander';
  else if (powerLevel > 2500) currentRank = 'Elite';
  else if (powerLevel > 1200) currentRank = 'Warrior';
  else if (powerLevel > 500) currentRank = 'Aspirant';

  return {
    ...baseStats,
    strength,
    agility,
    intelligence,
    memory,
    discipline,
    focus,
    communication,
    confidence,
    stability,
    careerXp,
    powerLevel,
    physicalPower,
    mentalPower,
    disciplinePower,
    communicationPower,
    careerPower,
    unlockedMilestones: finalUnlockedMilestones,
    xpMultiplier: finalXpMultiplier,
    currentRank,
    level: getLevelFromPower(powerLevel),
  };
}
