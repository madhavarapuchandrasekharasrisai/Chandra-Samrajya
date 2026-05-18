import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const [budgetConfig, monthlyTarget] = await Promise.all([
      db.budgetConfig.findFirst(),
      db.monthlyTarget.findFirst({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // If no budget config exists, return defaults
    const budget = budgetConfig || {
      personalPercent: 40,
      savingsPercent: 25,
      businessPercent: 15,
      skillsPercent: 10,
      funPercent: 10,
    }

    // If no monthly target exists, return default
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const target = monthlyTarget || {
      month: currentMonth,
      income: 100000,
    }

    return NextResponse.json({ budgetConfig: budget, monthlyTarget: target })
  } catch (error) {
    console.error('Failed to fetch settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { budgetConfig, monthlyTarget } = body

    const results: { budgetConfig?: unknown; monthlyTarget?: unknown } = {}

    // Update or create budget config
    if (budgetConfig) {
      const existing = await db.budgetConfig.findFirst()

      if (existing) {
        results.budgetConfig = await db.budgetConfig.update({
          where: { id: existing.id },
          data: {
            ...(budgetConfig.personalPercent !== undefined && { personalPercent: parseFloat(budgetConfig.personalPercent) }),
            ...(budgetConfig.savingsPercent !== undefined && { savingsPercent: parseFloat(budgetConfig.savingsPercent) }),
            ...(budgetConfig.businessPercent !== undefined && { businessPercent: parseFloat(budgetConfig.businessPercent) }),
            ...(budgetConfig.skillsPercent !== undefined && { skillsPercent: parseFloat(budgetConfig.skillsPercent) }),
            ...(budgetConfig.funPercent !== undefined && { funPercent: parseFloat(budgetConfig.funPercent) }),
          },
        })
      } else {
        results.budgetConfig = await db.budgetConfig.create({
          data: {
            personalPercent: budgetConfig.personalPercent ? parseFloat(budgetConfig.personalPercent) : 40,
            savingsPercent: budgetConfig.savingsPercent ? parseFloat(budgetConfig.savingsPercent) : 25,
            businessPercent: budgetConfig.businessPercent ? parseFloat(budgetConfig.businessPercent) : 15,
            skillsPercent: budgetConfig.skillsPercent ? parseFloat(budgetConfig.skillsPercent) : 10,
            funPercent: budgetConfig.funPercent ? parseFloat(budgetConfig.funPercent) : 10,
          },
        })
      }
    }

    // Update or create monthly target
    if (monthlyTarget) {
      const { month, income } = monthlyTarget

      if (month && income !== undefined) {
        const existing = await db.monthlyTarget.findFirst({
          where: { month },
        })

        if (existing) {
          results.monthlyTarget = await db.monthlyTarget.update({
            where: { id: existing.id },
            data: { income: parseFloat(income) },
          })
        } else {
          results.monthlyTarget = await db.monthlyTarget.create({
            data: {
              month,
              income: parseFloat(income),
            },
          })
        }
      }
    }

    return NextResponse.json(results, { status: 201 })
  } catch (error) {
    console.error('Failed to update settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
