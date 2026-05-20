import { pgTable, varchar, text, doublePrecision, timestamp, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Helper to generate a custom CUID-like ID or simple random string for default ID values
const generateId = () => Math.random().toString(36).substring(2, 15);

// 1. Income Table
export const income = pgTable('Income', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  amount: doublePrecision('amount').notNull(),
  source: varchar('source').notNull(),
  clientName: varchar('clientName'),
  description: text('description'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  status: varchar('status').default('received').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 2. Expense Table
export const expense = pgTable('Expense', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  amount: doublePrecision('amount').notNull(),
  category: varchar('category').notNull(),
  description: text('description').notNull(),
  paymentMethod: varchar('paymentMethod'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 3. Client Table
export const client = pgTable('Client', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  name: varchar('name').notNull(),
  business: varchar('business'),
  email: varchar('email'),
  phone: varchar('phone'),
  projectValue: doublePrecision('projectValue').default(0).notNull(),
  pipelineStage: varchar('pipelineStage').default('prospect').notNull(),
  lastContact: timestamp('lastContact', { mode: 'date' }),
  urgencyLevel: varchar('urgencyLevel').default('normal').notNull(),
  notes: text('notes'),
  closeProbability: doublePrecision('closeProbability').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 4. Followup Table
export const followup = pgTable('Followup', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  clientId: varchar('clientId').notNull().references(() => client.id, { onDelete: 'cascade' }),
  type: varchar('type').notNull(),
  note: text('note'),
  dueDate: timestamp('dueDate', { mode: 'date' }).notNull(),
  status: varchar('status').default('pending').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Relational Mappings for Client & Followup
export const clientRelations = relations(client, ({ many }) => ({
  followups: many(followup),
}));

export const followupRelations = relations(followup, ({ one }) => ({
  client: one(client, {
    fields: [followup.clientId],
    references: [client.id],
  }),
}));

// 5. OutreachLog Table
export const outreachLog = pgTable('OutreachLog', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  type: varchar('type').notNull(),
  count: integer('count').default(0).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 6. MonthlyTarget Table
export const monthlyTarget = pgTable('MonthlyTarget', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  month: varchar('month').notNull(),
  income: doublePrecision('income').default(100000).notNull(),
  targetSocialMedia: doublePrecision('targetSocialMedia').default(15000).notNull(),
  targetAIAutomation: doublePrecision('targetAIAutomation').default(40000).notNull(),
  targetRetainer: doublePrecision('targetRetainer').default(25000).notNull(),
  targetFreelance: doublePrecision('targetFreelance').default(20000).notNull(),
  nameSocialMedia: varchar('nameSocialMedia').default('Social Media Websites'),
  nameAIAutomation: varchar('nameAIAutomation').default('AI Automation'),
  nameRetainer: varchar('nameRetainer').default('Retainer Clients'),
  nameFreelance: varchar('nameFreelance').default('International Freelance'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 7. BudgetConfig Table
export const budgetConfig = pgTable('BudgetConfig', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  personalPercent: doublePrecision('personalPercent').default(40).notNull(),
  savingsPercent: doublePrecision('savingsPercent').default(25).notNull(),
  businessPercent: doublePrecision('businessPercent').default(15).notNull(),
  skillsPercent: doublePrecision('skillsPercent').default(10).notNull(),
  funPercent: doublePrecision('funPercent').default(10).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 8. DisciplineLog Table
export const disciplineLog = pgTable('DisciplineLog', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  score: integer('score').default(0).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  metrics: text('metrics').default('{}').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 9. User Table
export const user = pgTable('User', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  name: varchar('name'),
  email: varchar('email'),
  password: varchar('password').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
}, (tb) => ({
  emailIdx: uniqueIndex('User_email_key').on(tb.email),
}));

// 10. Todo Table
export const todo = pgTable('Todo', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  task: text('task').notNull(),
  completed: integer('completed').default(0).notNull(), // 0 = false, 1 = true
  date: timestamp('date', { mode: 'date' }).defaultNow().notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 11. OutreachRecord Table — Individual outreach contacts with full detail
export const outreachRecord = pgTable('OutreachRecord', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  contactName: varchar('contactName').notNull(),
  platform: varchar('platform').default('instagram').notNull(), // instagram, linkedin, phone, email, twitter, other
  type: varchar('type').notNull(), // dm, call, proposal, meeting, closed
  status: varchar('status').default('pending').notNull(), // pending, accepted, rejected, reopen, noResponse
  notes: text('notes'),
  date: timestamp('date', { mode: 'date' }).notNull(),
  reopenDate: timestamp('reopenDate', { mode: 'date' }), // When to re-engage (auto-set 30 days later)
  projectValue: doublePrecision('projectValue').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 12. WarRoomAction Table — Custom urgent actions added by user
export const warRoomAction = pgTable('WarRoomAction', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  title: varchar('title').notNull(),
  subtitle: varchar('subtitle'),
  actionLabel: varchar('actionLabel').default('Execute').notNull(),
  urgency: varchar('urgency').default('high').notNull(), // overdue, high-urgency, over-budget, expiring
  status: varchar('status').default('pending').notNull(), // pending, in-progress, completed
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 13. WarRoomOpportunity Table — Custom high-value opportunities added by user
export const warRoomOpportunity = pgTable('WarRoomOpportunity', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  name: varchar('name').notNull(),
  projectValue: doublePrecision('projectValue').default(0).notNull(),
  pipelineStage: varchar('pipelineStage').default('prospect').notNull(),
  closeProbability: doublePrecision('closeProbability').default(0).notNull(),
  notes: text('notes'),
  status: varchar('status').default('active').notNull(), // active, won, lost
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 14. JobApplication Table — Job search records tracked in DB
export const jobApplication = pgTable('JobApplication', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  company: varchar('company').notNull(),
  role: varchar('role').notNull(),
  source: varchar('source'),
  notes: text('notes'),
  appliedDate: timestamp('appliedDate', { mode: 'date' }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 15. Notification Table — Reminders and triggered system alerts
export const notification = pgTable('Notification', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  title: varchar('title').notNull(),
  message: text('message'),
  dateTime: timestamp('dateTime', { mode: 'date' }).notNull(),
  read: integer('read').default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// 16. SoloLevelingStats Table — RPG Attributes, Streak and Rank stats
export const soloLevelingStats = pgTable('SoloLevelingStats', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  userId: varchar('userId', { length: 50 }),
  strength: integer('strength').default(10).notNull(),
  agility: integer('agility').default(10).notNull(),
  intelligence: integer('intelligence').default(10).notNull(),
  memory: integer('memory').default(10).notNull(),
  discipline: integer('discipline').default(10).notNull(),
  focus: integer('focus').default(10).notNull(),
  communication: integer('communication').default(10).notNull(),
  confidence: integer('confidence').default(10).notNull(),
  stability: integer('stability').default(10).notNull(),
  careerXp: integer('careerXp').default(10).notNull(),
  powerLevel: integer('powerLevel').default(100).notNull(),
  physicalPower: integer('physicalPower').default(0).notNull(),
  mentalPower: integer('mentalPower').default(0).notNull(),
  disciplinePower: integer('disciplinePower').default(0).notNull(),
  communicationPower: integer('communicationPower').default(0).notNull(),
  careerPower: integer('careerPower').default(0).notNull(),
  unlockedMilestones: text('unlockedMilestones').default('').notNull(),
  currentRank: varchar('currentRank', { length: 30 }).default('Civilian').notNull(),
  perfectStreak: integer('perfectStreak').default(0).notNull(),
  weeklyStreak: integer('weeklyStreak').default(0).notNull(),
  failureState: integer('failureState').default(0).notNull(), // 0 = normal, 1 = failure state active
  xpMultiplier: doublePrecision('xpMultiplier').default(1.0).notNull(),
  level: integer('level').default(1).notNull(),
  weeklyQuestWeek: text('weekly_quest_week').default('').notNull(),
  weeklyQuestsCleared: text('weekly_quests_cleared').default('').notNull(),
  lastUpdated: timestamp('lastUpdated', { mode: 'date' }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('solo_stats_user_id_idx').on(table.userId),
}));

// 17. SoloLevelingDailyLogs Table — Daily summarized logs pruned >90 days
export const soloLevelingDailyLogs = pgTable('SoloLevelingDailyLogs', {
  id: varchar('id', { length: 30 }).primaryKey().$defaultFn(() => generateId()),
  userId: varchar('userId', { length: 50 }),
  date: timestamp('date', { mode: 'date' }).notNull(),
  completedCoreTasks: integer('completedCoreTasks').default(0).notNull(),
  completedSpecialTasks: integer('completedSpecialTasks').default(0).notNull(),
  perfectDay: integer('perfectDay').default(0).notNull(), // 0 = false, 1 = true
  penaltyApplied: integer('penaltyApplied').default(0).notNull(), // 0 = false, 1 = true
  taskIds: text('taskIds'), // comma-separated list of completed task IDs for today
}, (table) => ({
  dateIdx: index('daily_logs_date_idx').on(table.date),
  userIdIdx: index('daily_logs_user_id_idx').on(table.userId),
  userDateIdx: uniqueIndex('daily_logs_user_date_uidx').on(table.userId, table.date),
}));

