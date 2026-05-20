import { db } from '@/lib/db';
import { budgetConfig, monthlyTarget } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const budgetConfigs = await db.select().from(budgetConfig).limit(1);
    const monthlyTargets = await db.select().from(monthlyTarget).orderBy(desc(monthlyTarget.createdAt)).limit(1);

    const budgetConfigVal = budgetConfigs[0] || null;
    const monthlyTargetVal = monthlyTargets[0] || null;

    // If no budget config exists, return defaults
    const budget = budgetConfigVal || {
      personalPercent: 40,
      savingsPercent: 25,
      businessPercent: 15,
      skillsPercent: 10,
      funPercent: 10,
    };

    // If no monthly target exists, return default
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const target = monthlyTargetVal ? {
      ...monthlyTargetVal,
      nameSocialMedia: monthlyTargetVal.nameSocialMedia || 'Social Media Websites',
      nameAIAutomation: monthlyTargetVal.nameAIAutomation || 'AI Automation',
      nameRetainer: monthlyTargetVal.nameRetainer || 'Retainer Clients',
      nameFreelance: monthlyTargetVal.nameFreelance || 'International Freelance',
    } : {
      month: currentMonth,
      income: 100000,
      targetSocialMedia: 15000,
      targetAIAutomation: 40000,
      targetRetainer: 25000,
      targetFreelance: 20000,
      nameSocialMedia: 'Social Media Websites',
      nameAIAutomation: 'AI Automation',
      nameRetainer: 'Retainer Clients',
      nameFreelance: 'International Freelance',
    };

    return NextResponse.json({ budgetConfig: budget, monthlyTarget: target });
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budgetConfig: budgetConfigInput, monthlyTarget: monthlyTargetInput } = body;

    const results: { budgetConfig?: unknown; monthlyTarget?: unknown } = {};

    // Update or create budget config
    if (budgetConfigInput) {
      const existing = await db.select().from(budgetConfig).limit(1);

      const dataToSet: Record<string, number> = {};
      if (budgetConfigInput.personalPercent !== undefined) dataToSet.personalPercent = parseFloat(budgetConfigInput.personalPercent);
      if (budgetConfigInput.savingsPercent !== undefined) dataToSet.savingsPercent = parseFloat(budgetConfigInput.savingsPercent);
      if (budgetConfigInput.businessPercent !== undefined) dataToSet.businessPercent = parseFloat(budgetConfigInput.businessPercent);
      if (budgetConfigInput.skillsPercent !== undefined) dataToSet.skillsPercent = parseFloat(budgetConfigInput.skillsPercent);
      if (budgetConfigInput.funPercent !== undefined) dataToSet.funPercent = parseFloat(budgetConfigInput.funPercent);

      if (existing.length > 0) {
        const [updated] = await db.update(budgetConfig)
          .set(dataToSet)
          .where(eq(budgetConfig.id, existing[0].id))
          .returning();
        results.budgetConfig = updated;
      } else {
        const [created] = await db.insert(budgetConfig).values({
          personalPercent: budgetConfigInput.personalPercent ? parseFloat(budgetConfigInput.personalPercent) : 40,
          savingsPercent: budgetConfigInput.savingsPercent ? parseFloat(budgetConfigInput.savingsPercent) : 25,
          businessPercent: budgetConfigInput.businessPercent ? parseFloat(budgetConfigInput.businessPercent) : 15,
          skillsPercent: budgetConfigInput.skillsPercent ? parseFloat(budgetConfigInput.skillsPercent) : 10,
          funPercent: budgetConfigInput.funPercent ? parseFloat(budgetConfigInput.funPercent) : 10,
        }).returning();
        results.budgetConfig = created;
      }
    }

    // Update or create monthly target
    if (monthlyTargetInput) {
      const {
        month,
        income,
        targetSocialMedia,
        targetAIAutomation,
        targetRetainer,
        targetFreelance,
        nameSocialMedia,
        nameAIAutomation,
        nameRetainer,
        nameFreelance
      } = monthlyTargetInput;

      if (month) {
        const existing = await db.select()
          .from(monthlyTarget)
          .where(eq(monthlyTarget.month, month))
          .orderBy(desc(monthlyTarget.createdAt))
          .limit(1);

        const dataToSet: any = {};
        if (income !== undefined) dataToSet.income = parseFloat(income);
        if (targetSocialMedia !== undefined) dataToSet.targetSocialMedia = parseFloat(targetSocialMedia);
        if (targetAIAutomation !== undefined) dataToSet.targetAIAutomation = parseFloat(targetAIAutomation);
        if (targetRetainer !== undefined) dataToSet.targetRetainer = parseFloat(targetRetainer);
        if (targetFreelance !== undefined) dataToSet.targetFreelance = parseFloat(targetFreelance);
        if (nameSocialMedia !== undefined) dataToSet.nameSocialMedia = nameSocialMedia;
        if (nameAIAutomation !== undefined) dataToSet.nameAIAutomation = nameAIAutomation;
        if (nameRetainer !== undefined) dataToSet.nameRetainer = nameRetainer;
        if (nameFreelance !== undefined) dataToSet.nameFreelance = nameFreelance;

        if (existing.length > 0) {
          const [updated] = await db.update(monthlyTarget)
            .set(dataToSet)
            .where(eq(monthlyTarget.id, existing[0].id))
            .returning();
          results.monthlyTarget = updated;
        } else {
          const [created] = await db.insert(monthlyTarget).values({
            month,
            income: income !== undefined ? parseFloat(income) : 100000,
            targetSocialMedia: targetSocialMedia !== undefined ? parseFloat(targetSocialMedia) : 15000,
            targetAIAutomation: targetAIAutomation !== undefined ? parseFloat(targetAIAutomation) : 40000,
            targetRetainer: targetRetainer !== undefined ? parseFloat(targetRetainer) : 25000,
            targetFreelance: targetFreelance !== undefined ? parseFloat(targetFreelance) : 20000,
            nameSocialMedia: nameSocialMedia !== undefined ? nameSocialMedia : 'Social Media Websites',
            nameAIAutomation: nameAIAutomation !== undefined ? nameAIAutomation : 'AI Automation',
            nameRetainer: nameRetainer !== undefined ? nameRetainer : 'Retainer Clients',
            nameFreelance: nameFreelance !== undefined ? nameFreelance : 'International Freelance',
          }).returning();
          results.monthlyTarget = created;
        }
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
