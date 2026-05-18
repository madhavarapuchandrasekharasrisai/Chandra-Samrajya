import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

    // Fetch this month's incomes and expenses
    const [incomes, expenses] = await Promise.all([
      db.income.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      db.expense.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ])

    // Total revenue & expenses
    const totalRevenue = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netBalance = totalRevenue - totalExpenses

    // Savings rate: savings expenses / revenue * 100
    const savingsExpenses = expenses
      .filter((e) => e.category.toLowerCase() === 'savings')
      .reduce((sum, e) => sum + e.amount, 0)
    const savingsRate = totalRevenue > 0 ? (savingsExpenses / totalRevenue) * 100 : 0

    // Income by source
    const incomeBySource: Record<string, number> = {}
    for (const income of incomes) {
      incomeBySource[income.source] = (incomeBySource[income.source] || 0) + income.amount
    }

    // Expenses by category
    const expensesByCategory: Record<string, number> = {}
    for (const expense of expenses) {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount
    }

    // Strongest & weakest income streams
    const sourceEntries = Object.entries(incomeBySource)
    const strongestStream = sourceEntries.length > 0
      ? sourceEntries.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
      : null
    const weakestStream = sourceEntries.length > 0
      ? sourceEntries.reduce((a, b) => (a[1] < b[1] ? a : b))[0]
      : null

    // Monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const trendDate = new Date(currentYear, currentMonth - i, 1)
      const tStart = new Date(trendDate.getFullYear(), trendDate.getMonth(), 1)
      const tEnd = new Date(trendDate.getFullYear(), trendDate.getMonth() + 1, 0, 23, 59, 59, 999)

      const [monthIncomes, monthExpenses] = await Promise.all([
        db.income.findMany({
          where: { date: { gte: tStart, lte: tEnd } },
        }),
        db.expense.findMany({
          where: { date: { gte: tStart, lte: tEnd } },
        }),
      ])

      const monthIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0)
      const monthExpense = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

      monthlyTrend.push({
        month: trendDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpense,
        net: monthIncome - monthExpense,
      })
    }

    // Discipline score: based on spending discipline and outreach consistency
    // Spending discipline: how close actual savings rate is to budget config
    // Outreach consistency: how consistent outreach has been this month
    const budgetConfig = await db.budgetConfig.findFirst()
    const targetSavingsPercent = budgetConfig?.savingsPercent ?? 25

    const outreachLogs = await db.outreachLog.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    })
    const totalOutreach = outreachLogs.reduce((sum, o) => sum + o.count, 0)
    const outreachDays = new Set(
      outreachLogs.map((o) => o.date.toISOString().split('T')[0])
    ).size

    // Spending discipline: 50 points max
    // Full marks if savings rate >= target, partial if lower
    const savingsRatio = targetSavingsPercent > 0 ? savingsRate / targetSavingsPercent : 0
    const spendingScore = Math.min(50, Math.round(savingsRatio * 50))

    // Outreach consistency: 50 points max
    // Based on how many days had outreach (target ~20 days/month)
    const outreachScore = Math.min(50, Math.round((outreachDays / 20) * 50))

    const disciplineScore = spendingScore + outreachScore

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netBalance,
      savingsRate: Math.round(savingsRate * 100) / 100,
      disciplineScore,
      incomeBySource,
      expensesByCategory,
      monthlyTrend,
      strongestStream,
      weakestStream,
      totalOutreach,
      outreachDays,
    })
  } catch (error) {
    console.error('Failed to compute analytics:', error)
    return NextResponse.json(
      { error: 'Failed to compute analytics' },
      { status: 500 }
    )
  }
}
