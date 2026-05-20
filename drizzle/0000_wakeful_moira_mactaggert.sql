CREATE TABLE "BudgetConfig" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"personalPercent" double precision DEFAULT 40 NOT NULL,
	"savingsPercent" double precision DEFAULT 25 NOT NULL,
	"businessPercent" double precision DEFAULT 15 NOT NULL,
	"skillsPercent" double precision DEFAULT 10 NOT NULL,
	"funPercent" double precision DEFAULT 10 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Client" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"business" varchar,
	"email" varchar,
	"phone" varchar,
	"projectValue" double precision DEFAULT 0 NOT NULL,
	"pipelineStage" varchar DEFAULT 'prospect' NOT NULL,
	"lastContact" timestamp,
	"urgencyLevel" varchar DEFAULT 'normal' NOT NULL,
	"notes" text,
	"closeProbability" double precision DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DisciplineLog" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"date" timestamp NOT NULL,
	"metrics" text DEFAULT '{}' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Expense" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"category" varchar NOT NULL,
	"description" text NOT NULL,
	"paymentMethod" varchar,
	"date" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Followup" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"clientId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"note" text,
	"dueDate" timestamp NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Income" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"amount" double precision NOT NULL,
	"source" varchar NOT NULL,
	"clientName" varchar,
	"description" text,
	"date" timestamp NOT NULL,
	"status" varchar DEFAULT 'received' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "JobApplication" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"company" varchar NOT NULL,
	"role" varchar NOT NULL,
	"source" varchar,
	"notes" text,
	"appliedDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "MonthlyTarget" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"month" varchar NOT NULL,
	"income" double precision DEFAULT 100000 NOT NULL,
	"targetSocialMedia" double precision DEFAULT 15000 NOT NULL,
	"targetAIAutomation" double precision DEFAULT 40000 NOT NULL,
	"targetRetainer" double precision DEFAULT 25000 NOT NULL,
	"targetFreelance" double precision DEFAULT 20000 NOT NULL,
	"nameSocialMedia" varchar DEFAULT 'Social Media Websites',
	"nameAIAutomation" varchar DEFAULT 'AI Automation',
	"nameRetainer" varchar DEFAULT 'Retainer Clients',
	"nameFreelance" varchar DEFAULT 'International Freelance',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Notification" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"message" text,
	"dateTime" timestamp NOT NULL,
	"read" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OutreachLog" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"date" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "OutreachRecord" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"contactName" varchar NOT NULL,
	"platform" varchar DEFAULT 'instagram' NOT NULL,
	"type" varchar NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"notes" text,
	"date" timestamp NOT NULL,
	"reopenDate" timestamp,
	"projectValue" double precision DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "SoloLevelingDailyLogs" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"userId" varchar(50),
	"date" timestamp NOT NULL,
	"completedCoreTasks" integer DEFAULT 0 NOT NULL,
	"completedSpecialTasks" integer DEFAULT 0 NOT NULL,
	"perfectDay" integer DEFAULT 0 NOT NULL,
	"penaltyApplied" integer DEFAULT 0 NOT NULL,
	"taskIds" text
);
--> statement-breakpoint
CREATE TABLE "SoloLevelingStats" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"userId" varchar(50),
	"strength" integer DEFAULT 10 NOT NULL,
	"agility" integer DEFAULT 10 NOT NULL,
	"intelligence" integer DEFAULT 10 NOT NULL,
	"memory" integer DEFAULT 10 NOT NULL,
	"discipline" integer DEFAULT 10 NOT NULL,
	"focus" integer DEFAULT 10 NOT NULL,
	"communication" integer DEFAULT 10 NOT NULL,
	"confidence" integer DEFAULT 10 NOT NULL,
	"stability" integer DEFAULT 10 NOT NULL,
	"careerXp" integer DEFAULT 10 NOT NULL,
	"powerLevel" integer DEFAULT 100 NOT NULL,
	"physicalPower" integer DEFAULT 0 NOT NULL,
	"mentalPower" integer DEFAULT 0 NOT NULL,
	"disciplinePower" integer DEFAULT 0 NOT NULL,
	"communicationPower" integer DEFAULT 0 NOT NULL,
	"careerPower" integer DEFAULT 0 NOT NULL,
	"unlockedMilestones" text DEFAULT '' NOT NULL,
	"currentRank" varchar(30) DEFAULT 'Civilian' NOT NULL,
	"perfectStreak" integer DEFAULT 0 NOT NULL,
	"weeklyStreak" integer DEFAULT 0 NOT NULL,
	"failureState" integer DEFAULT 0 NOT NULL,
	"xpMultiplier" double precision DEFAULT 1 NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Todo" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" varchar,
	"email" varchar,
	"password" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WarRoomAction" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"actionLabel" varchar DEFAULT 'Execute' NOT NULL,
	"urgency" varchar DEFAULT 'high' NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "WarRoomOpportunity" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"projectValue" double precision DEFAULT 0 NOT NULL,
	"pipelineStage" varchar DEFAULT 'prospect' NOT NULL,
	"closeProbability" double precision DEFAULT 0 NOT NULL,
	"notes" text,
	"status" varchar DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Followup" ADD CONSTRAINT "Followup_clientId_Client_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "daily_logs_date_idx" ON "SoloLevelingDailyLogs" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_logs_user_id_idx" ON "SoloLevelingDailyLogs" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_logs_user_date_uidx" ON "SoloLevelingDailyLogs" USING btree ("userId","date");--> statement-breakpoint
CREATE INDEX "solo_stats_user_id_idx" ON "SoloLevelingStats" USING btree ("userId");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_key" ON "User" USING btree ("email");