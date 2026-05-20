'use client'

import { useAppStore } from '@/store/use-app-store'
import { cn, formatIndianCommas } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip } from 'recharts'
import { Wallet, TrendingUp, AlertTriangle, CheckCircle2, ShoppingBag, PiggyBank, Briefcase, GraduationCap, Gamepad2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

const CATEGORIES = [
  { key: 'Personal', label: 'Personal', color: '#d4a849', icon: Wallet, tailwind: 'amber' },
  { key: 'Savings', label: 'Savings', color: '#10b981', icon: PiggyBank, tailwind: 'emerald' },
  { key: 'Business', label: 'Business', color: '#3b82f6', icon: Briefcase, tailwind: 'blue' },
  { key: 'Skills', label: 'Skills', color: '#a855f7', icon: GraduationCap, tailwind: 'purple' },
  { key: 'Fun', label: 'Fun', color: '#f43f5e', icon: Gamepad2, tailwind: 'rose' },
] as const

const ALL_CATEGORIES = [
  ...CATEGORIES,
  { key: 'External', label: "Household Duties", color: '#14b8a6', icon: ArrowDownRight, tailwind: 'teal' },
]

const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Bank Transfer'] as const

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysLeftInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate() + 1
}

function getDynamicColor(percentUsed: number, naturalColor: string): string {
  if (percentUsed > 90) return '#ef4444'
  if (percentUsed >= 70) return '#f59e0b'
  return naturalColor
}

// ─── Section 1: Budget Control Center (Radial Rings) ───────────────────────

function BudgetRing({
  category,
  spent,
  budget,
  daysLeft,
  delay,
}: {
  category: typeof CATEGORIES[number]
  spent: number
  budget: number
  daysLeft: number
  delay: number
}) {
  const percentUsed = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
  const remaining = budget - spent
  const safeDailySpend = daysLeft > 0 ? Math.max(0, remaining / daysLeft) : 0

  // Projected overspend calculation
  const now = new Date()
  const currentDay = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const projectedSpend = currentDay > 0 ? (spent / currentDay) * daysInMonth : 0
  const projectedOverspend = projectedSpend > budget ? projectedSpend - budget : 0

  const dynamicColor = getDynamicColor(percentUsed, category.color)
  const Icon = category.icon

  // SVG ring calculations
  // circumference = 2 * PI * 45 ≈ 282.74
  const circumference = 2 * Math.PI * 45
  const dashOffset = circumference - (percentUsed / 100) * circumference

  const isDanger = percentUsed > 90
  const isWarning = percentUsed >= 70 && percentUsed <= 90

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border rounded-2xl p-5 flex flex-col items-center relative overflow-hidden group hover:border-white/[0.1] transition-all duration-300',
        isDanger
          ? 'border-red-500/30 budget-danger'
          : isWarning
          ? 'border-amber-500/20 budget-warning'
          : 'border-white/[0.06]'
      )}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: category.color }}
      />

      {/* SVG Ring */}
      <div className="relative mb-4">
        <svg viewBox="0 0 100 100" className="w-32 h-32">
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={dynamicColor}
            strokeWidth="6"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            className="budget-ring-track"
            style={{
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color: dynamicColor }} />
          <span
            className="text-xl font-bold"
            style={{ color: dynamicColor }}
          >
            {percentUsed.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Category label */}
      <h4 className="text-white/80 text-sm font-semibold mb-3">{category.label}</h4>

      {/* Stats */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Remaining</span>
          <span className={cn(
            'text-xs font-semibold',
            remaining < 0 ? 'text-red-400' : 'text-emerald-400'
          )}>
            {formatINR(Math.abs(remaining))}
            {remaining < 0 && ' over'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/30 text-[10px] uppercase tracking-wider">Safe Daily</span>
          <span className={cn(
            'text-xs font-semibold',
            safeDailySpend <= 0 ? 'text-red-400' : 'text-amber-400/80'
          )}>
            {safeDailySpend > 0 ? `${formatINR(Math.round(safeDailySpend))}/day` : 'Over budget'}
          </span>
        </div>
        {projectedOverspend > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-white/30 text-[10px] uppercase tracking-wider">Projected Over</span>
            <span className="text-red-400 text-xs font-semibold">
              {formatINR(Math.round(projectedOverspend))}
            </span>
          </div>
        )}
      </div>

      {/* Budget / Spent summary */}
      <div className="w-full mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <div>
          <p className="text-white/25 text-[10px] uppercase tracking-wider">Budget</p>
          <p className="text-white/70 text-xs font-semibold">{formatINR(budget)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/25 text-[10px] uppercase tracking-wider">Spent</p>
          <p className={cn(
            'text-xs font-semibold',
            isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/70'
          )}>
            {formatINR(spent)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section 2: Spending Entry System ──────────────────────────────────────

function SpendingEntryForm({ onAdded }: { onAdded: () => void }) {
  const { addExpense } = useAppStore()

  const [form, setForm] = useState({
    amount: '',
    category: '',
    description: '',
    paymentMethod: '',
    date: getTodayStr(),
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.amount || parseFloat(form.amount.replace(/,/g, '')) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!form.category) {
      toast.error('Please select a category')
      return
    }
    if (!form.description.trim()) {
      toast.error('Please add a description')
      return
    }
    if (!form.date) {
      toast.error('Please select a date')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount.replace(/,/g, '')) }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to add expense')
      }

      const data = await res.json()
      addExpense(data)
      toast.success('Expense added — budget updated')

      // Reset form
      setForm({
        amount: '',
        category: '',
        description: '',
        paymentMethod: '',
        date: getTodayStr(),
      })

      onAdded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-white/90 text-sm font-semibold">Add Expense</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-xs uppercase tracking-wider">Amount (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/50 text-sm">₹</span>
              <Input
                type="text"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: formatIndianCommas(e.target.value) }))}
                className="pl-9 bg-white/[0.04] border-white/[0.08] text-white/90 placeholder:text-white/20 focus:border-amber-500/30 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-xs uppercase tracking-wider">Category</Label>
            <Select value={form.category} onValueChange={(val) => setForm(prev => ({ ...prev, category: val }))}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white/90 focus:ring-amber-500/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1e] border-white/[0.08]">
                {ALL_CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  return (
                    <SelectItem key={cat.key} value={cat.key} className="text-white/80 focus:bg-white/[0.06] focus:text-white">
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                        {cat.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-xs uppercase tracking-wider">Description</Label>
            <Input
              placeholder="What was this expense for?"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/[0.04] border-white/[0.08] text-white/90 placeholder:text-white/20 focus:border-amber-500/30 focus:ring-amber-500/20"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-white/40 text-xs uppercase tracking-wider">Payment Method</Label>
            <Select value={form.paymentMethod} onValueChange={(val) => setForm(prev => ({ ...prev, paymentMethod: val }))}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white/90 focus:ring-amber-500/20">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1e] border-white/[0.08]">
                {PAYMENT_METHODS.map(method => (
                  <SelectItem key={method} value={method} className="text-white/80 focus:bg-white/[0.06] focus:text-white">
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-white/40 text-xs uppercase tracking-wider">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="bg-white/[0.04] border-white/[0.08] text-white/90 focus:border-amber-500/30 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-400 text-black font-semibold h-11 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Adding...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Add Expense
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  )
}

// ─── Section 3: Recent Expenses ────────────────────────────────────────────

function RecentExpenses() {
  const { expenses, removeExpense } = useAppStore()

  const handleDelete = async (id: string) => {
    try {
      removeExpense(id)
      await fetch('/api/expenses?id=' + id, { method: 'DELETE' })
      toast.success('Expense removed')
    } catch {
      toast.error('Failed to remove expense')
    }
  }

  const categoryConfig = useMemo(() => {
    const map: Record<string, { icon: typeof Wallet; color: string; bgClass: string; textClass: string; borderClass: string }> = {}
    ALL_CATEGORIES.forEach(cat => {
      map[cat.key] = {
        icon: cat.icon,
        color: cat.color,
        bgClass: `bg-${cat.tailwind}-400/10`,
        textClass: `text-${cat.tailwind}-400`,
        borderClass: `border-${cat.tailwind}-400/20`,
      }
    })
    return map
  }, [])

  // Sort by date descending
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-4 h-4 text-amber-400" />
        <h3 className="text-white/90 text-sm font-semibold">Recent Expenses</h3>
        <span className="text-white/20 text-xs">({expenses.length})</span>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No expenses recorded yet</p>
          <p className="text-white/15 text-xs mt-1">Add your first expense above</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          {sortedExpenses.map((expense) => {
            const config = categoryConfig[expense.category] || {
              icon: Wallet,
              color: '#d4a849',
              bgClass: 'bg-white/5',
              textClass: 'text-white/50',
              borderClass: 'border-white/10',
            }
            const Icon = config.icon

            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
              >
                {/* Category Icon */}
                <div
                  className={cn('p-2 rounded-lg flex-shrink-0', config.bgClass, config.borderClass)}
                  style={{ border: `1px solid ${config.color}20`, backgroundColor: `${config.color}10` }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white/80 text-sm font-medium truncate">{expense.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                      style={{
                        color: config.color,
                        borderColor: `${config.color}30`,
                        backgroundColor: `${config.color}10`,
                      }}
                    >
                      {expense.category}
                    </span>
                    {expense.paymentMethod && (
                      <span className="text-white/25 text-[10px]">{expense.paymentMethod}</span>
                    )}
                  </div>
                </div>

                {/* Amount & Date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 text-sm font-semibold">{formatINR(expense.amount)}</p>
                  <p className="text-white/25 text-[10px]">
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="h-8 w-8 p-0 text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </Button>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─── Section 4: Karna Spending Insights ────────────────────────────────────

interface Insight {
  type: 'positive' | 'warning' | 'negative'
  message: string
}

function generateInsights(
  expenses: { amount: number; category: string; date: string }[],
  budgetAllocation: Record<string, { spent: number; budget: number; percent: number }>,
  monthlyIncome: number
): Insight[] {
  const insights: Insight[] = []
  const now = new Date()

  // Current month expenses
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  // This week vs last week
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - now.getDay())
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

  const thisWeekExpenses = currentMonthExpenses.filter(e => new Date(e.date) >= startOfThisWeek)
  const lastWeekExpenses = currentMonthExpenses.filter(e => {
    const d = new Date(e.date)
    return d >= startOfLastWeek && d < startOfThisWeek
  })

  // Per-category comparison
  CATEGORIES.forEach(cat => {
    const thisWeekTotal = thisWeekExpenses
      .filter(e => e.category === cat.key)
      .reduce((s, e) => s + e.amount, 0)
    const lastWeekTotal = lastWeekExpenses
      .filter(e => e.category === cat.key)
      .reduce((s, e) => s + e.amount, 0)

    if (lastWeekTotal > 0 && thisWeekTotal > 0) {
      const changePercent = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100

      if (changePercent > 15) {
        insights.push({
          type: cat.key === 'Savings' ? 'negative' : 'warning',
          message: `Your ${cat.label} spending increased by ${changePercent.toFixed(0)}% this week.`,
        })
      } else if (changePercent < -10) {
        insights.push({
          type: cat.key === 'Savings' ? 'positive' : 'positive',
          message: `${cat.label} spending decreased by ${Math.abs(changePercent).toFixed(0)}% this week — well controlled.`,
        })
      }
    }
  })

  // Over-budget projection
  const currentDay = now.getDate()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()

  CATEGORIES.forEach(cat => {
    const alloc = budgetAllocation[cat.key.toLowerCase()]
    if (alloc && alloc.budget > 0 && currentDay > 0) {
      const projectedSpend = (alloc.spent / currentDay) * daysInMonth
      if (projectedSpend > alloc.budget) {
        const overspend = Math.round(projectedSpend - alloc.budget)
        if (overspend > 500) {
          insights.push({
            type: 'negative',
            message: `At current pace, ${cat.label} may exceed target by ${formatINR(overspend)}.`,
          })
        }
      }
    }
  })

  // Savings consistency
  const savingsAlloc = budgetAllocation['savings']
  if (savingsAlloc && savingsAlloc.budget > 0) {
    const savingsPercent = (savingsAlloc.spent / savingsAlloc.budget) * 100
    const expectedProgress = (currentDay / daysInMonth) * 100

    if (savingsPercent >= expectedProgress * 0.8 && savingsAlloc.spent > 0) {
      insights.push({
        type: 'positive',
        message: 'Savings consistency improved this month. You\'re on track with your savings target.',
      })
    } else if (savingsPercent < expectedProgress * 0.3 && currentDay > 10) {
      insights.push({
        type: 'warning',
        message: 'Savings rate is lagging behind schedule. Consider allocating more this week.',
      })
    }
  }

  // Overall spending pattern
  const totalSpent = currentMonthExpenses.reduce((s, e) => s + e.amount, 0)
  if (monthlyIncome > 0 && totalSpent > 0) {
    const spendRatio = (totalSpent / monthlyIncome) * 100
    const expectedSpendRatio = (currentDay / daysInMonth) * 80 // assuming 80% spending at most

    if (spendRatio > expectedSpendRatio + 15) {
      insights.push({
        type: 'negative',
        message: `Total spending is at ${spendRatio.toFixed(0)}% of income, ahead of schedule. Reduce discretionary spending.`,
      })
    } else if (spendRatio < expectedSpendRatio && totalSpent > 0) {
      insights.push({
        type: 'positive',
        message: `Spending pace is well managed at ${spendRatio.toFixed(0)}% of income. Keep it up!`,
      })
    }
  }

  // Category distribution insight
  const personalExpenses = currentMonthExpenses.filter(e => e.category === 'Personal')
  const funExpenses = currentMonthExpenses.filter(e => e.category === 'Fun')
  const skillsExpenses = currentMonthExpenses.filter(e => e.category === 'Skills')

  if (funExpenses.reduce((s, e) => s + e.amount, 0) > skillsExpenses.reduce((s, e) => s + e.amount, 0) * 2 && funExpenses.length > 0) {
    insights.push({
      type: 'warning',
      message: 'Fun spending exceeds Skills investment by 2x. Rebalance toward growth.',
    })
  }

  // Default insight if none generated
  if (insights.length === 0) {
    if (currentMonthExpenses.length === 0) {
      insights.push({
        type: 'positive',
        message: 'No expenses recorded yet this month. Start tracking to get personalized insights.',
      })
    } else {
      insights.push({
        type: 'positive',
        message: 'Your spending patterns look healthy this month. Keep monitoring for changes.',
      })
    }
  }

  return insights
}

function KarnaInsights() {
  const { expenses, budgetAllocation, monthlyIncome } = useAppStore()

  const insights = useMemo(() => {
    return generateInsights(expenses, budgetAllocation as unknown as Record<string, { spent: number; budget: number; percent: number }>, monthlyIncome)
  }, [expenses, budgetAllocation, monthlyIncome])

  const iconMap = {
    positive: CheckCircle2,
    warning: AlertTriangle,
    negative: TrendingUp,
  }

  const borderColorMap = {
    positive: 'border-l-emerald-400',
    warning: 'border-l-amber-400',
    negative: 'border-l-red-400',
  }

  const iconColorMap = {
    positive: 'text-emerald-400',
    warning: 'text-amber-400',
    negative: 'text-red-400',
  }

  const labelMap = {
    positive: 'Insight',
    warning: 'Caution',
    negative: 'Alert',
  }

  const labelColorMap = {
    positive: 'text-emerald-400/60',
    warning: 'text-amber-400/60',
    negative: 'text-red-400/60',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-white/90 text-sm font-semibold">Karna Spending Insights</h3>
        <span className="text-white/20 text-[10px] uppercase tracking-wider ml-auto">AI-Generated</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const Icon = iconMap[insight.type]
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + idx * 0.08 }}
              className={cn(
                'bg-white/[0.02] border border-white/[0.04] border-l-2 rounded-xl p-4 hover:bg-white/[0.03] transition-all',
                borderColorMap[insight.type]
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', iconColorMap[insight.type])} />
                <div>
                  <span className={cn('text-[10px] uppercase tracking-wider font-medium', labelColorMap[insight.type])}>
                    {labelMap[insight.type]}
                  </span>
                  <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Budget Distribution Overview (Pie Chart) ──────────────────────────────

function BudgetDistributionChart() {
  const { budgetAllocation, monthlyIncome } = useAppStore()

  const pieData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const key = cat.key.toLowerCase() as keyof typeof budgetAllocation
      const alloc = budgetAllocation[key]
      return {
        name: cat.label,
        value: alloc.budget > 0 ? alloc.budget : monthlyIncome * alloc.percent / 100,
        spent: alloc.spent,
        color: cat.color,
      }
    })
  }, [budgetAllocation, monthlyIncome])

  const totalBudget = pieData.reduce((s, d) => s + d.value, 0)
  const totalSpent = pieData.reduce((s, d) => s + d.spent, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white/90 text-sm font-semibold">Budget Distribution</h3>
          <p className="text-white/30 text-[10px] mt-0.5">Allocation vs Spending</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <span className="text-[10px] text-amber-400/70 uppercase tracking-wider">This Month</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Pie Chart */}
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => [formatINR(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Stats */}
        <div className="flex-1 space-y-2.5">
          {pieData.map((item) => {
            const percent = totalBudget > 0 ? (item.value / totalBudget) * 100 : 0
            return (
              <div key={item.name} className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white/60 text-xs flex-1">{item.name}</span>
                <span className="text-white/40 text-[10px]">{percent.toFixed(0)}%</span>
                <span className="text-white/70 text-xs font-medium">{formatINR(item.value)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Total Summary */}
      <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Budget</p>
          <p className="gold-text text-lg font-bold">{formatINR(totalBudget)}</p>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Spent</p>
          <p className={cn(
            'text-lg font-bold',
            totalSpent > totalBudget ? 'text-red-400' : 'text-white/80'
          )}>
            {formatINR(totalSpent)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function BudgetIntelligence() {
  const { expenses, budgetAllocation, monthlyIncome, addExpense, removeExpense } = useAppStore()
  const [refreshKey, setRefreshKey] = useState(0)

  const daysLeft = useMemo(() => daysLeftInMonth(), [])

  // Derived per-category data
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const key = cat.key.toLowerCase() as keyof typeof budgetAllocation
      const alloc = budgetAllocation[key]
      return {
        category: cat,
        spent: alloc.spent,
        budget: alloc.budget,
        percent: alloc.percent,
      }
    })
  }, [budgetAllocation, refreshKey])

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Total summary metrics
  const totalBudget = categoryData.reduce((s, c) => s + c.budget, 0)
  const totalSpent = categoryData.reduce((s, c) => s + c.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const totalExternalSpent = useMemo(() => {
    return expenses
      .filter(e => e.category === 'External')
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — Budget Intelligence
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-6 lg:p-8"
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-6 right-12 w-1 h-1 rounded-full bg-amber-400/30 particle" />
        <div className="absolute top-16 right-24 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-20 w-1 h-1 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '4s' }} />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Budget Intelligence</p>
              <h1 className="gold-text text-3xl lg:text-4xl font-bold tracking-tight">
                Budget Control Center
              </h1>
              <p className="text-white/30 text-sm mt-1">Track, control, and optimize every rupee</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Overall Budget Health */}
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border',
                overallPercent > 90
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : overallPercent >= 70
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              )}>
                {overallPercent > 90 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : overallPercent >= 70 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">{overallPercent.toFixed(0)}%</span>
                <span className="text-xs opacity-60">used</span>
              </div>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0c] lg:bg-white/[0.03] lg:backdrop-blur-sm border border-white/[0.06] rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Budget</p>
              <p className="gold-text text-xl font-bold">{formatINR(totalBudget)}</p>
            </div>
            <div className="bg-[#0a0a0c] lg:bg-white/[0.03] lg:backdrop-blur-sm border border-white/[0.06] rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Spent</p>
              <p className={cn(
                'text-xl font-bold',
                totalSpent > totalBudget ? 'text-red-400' : 'text-white/80'
              )}>
                {formatINR(totalSpent)}
              </p>
            </div>
            <div className="bg-[#0a0a0c] lg:bg-white/[0.03] lg:backdrop-blur-sm border border-white/[0.06] rounded-xl p-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Remaining</p>
              <p className={cn(
                'text-xl font-bold',
                totalRemaining < 0 ? 'text-red-400' : 'text-emerald-400'
              )}>
                {formatINR(Math.abs(totalRemaining))}
                {totalRemaining < 0 && <span className="text-xs ml-1">over</span>}
              </p>
            </div>
            <div className="bg-[#0a0a0c] lg:bg-white/[0.03] lg:backdrop-blur-sm border border-teal-500/10 rounded-xl p-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-teal-500/[0.02] pointer-events-none group-hover:bg-teal-500/[0.04] transition-colors" />
              <p className="text-teal-400/70 text-[10px] uppercase tracking-wider font-semibold">Household Duties</p>
              <p className="text-teal-400 text-xl font-bold">{formatINR(totalExternalSpent)}</p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, overallPercent)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  overallPercent < 70
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-300'
                    : overallPercent < 90
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                )}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-white/30 text-[10px]">{daysLeft} days left in month</span>
              <span className="text-white/30 text-[10px]">{overallPercent.toFixed(1)}% utilized</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Budget Control Center (Radial Rings)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Budget Rings</h2>
            <p className="text-white/30 text-[10px]">Real-time category utilization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {categoryData.map((data, index) => (
            <BudgetRing
              key={data.category.key}
              category={data.category}
              spent={data.spent}
              budget={data.budget}
              daysLeft={daysLeft}
              delay={0.1 + index * 0.08}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Budget Distribution & Spending Entry
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BudgetDistributionChart />
        <SpendingEntryForm onAdded={handleExpenseAdded} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — Recent Expenses
          ═══════════════════════════════════════════════════════════════════════ */}
      <RecentExpenses />

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — Karna Spending Insights
          ═══════════════════════════════════════════════════════════════════════ */}
      <KarnaInsights />
    </div>
  )
}
