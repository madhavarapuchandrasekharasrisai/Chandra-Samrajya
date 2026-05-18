'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAppStore, type IncomeEntry, type ExpenseEntry, type BudgetAllocation } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import {
  Sun,
  Moon,
  Sunrise,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Shield,
  Zap,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Phone,
  MessageSquare,
  Users,
  Send,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  IndianRupee,
  CalendarClock,
  CircleDot,
  Activity,
} from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getGreetingIcon() {
  const h = new Date().getHours()
  if (h < 12) return <Sun className="w-5 h-5 text-amber-400" />
  if (h < 17) return <Sunrise className="w-5 h-5 text-orange-400" />
  return <Moon className="w-5 h-5 text-indigo-300" />
}

function daysLeftInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate() + 1
}

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function generateSparkline(base: number, variance: number, points = 10): { value: number }[] {
  return Array.from({ length: points }, (_, i) => ({
    value: Math.max(0, base + (Math.random() - 0.4) * variance * (i / points + 0.3)),
  }))
}

const focusRotation = [
  { label: 'Outreach & Prospecting', icon: <Send className="w-3.5 h-3.5" /> },
  { label: 'Follow-up & Nurturing', icon: <Phone className="w-3.5 h-3.5" /> },
  { label: 'Client Proposals', icon: <Target className="w-3.5 h-3.5" /> },
  { label: 'Skill Development', icon: <Zap className="w-3.5 h-3.5" /> },
  { label: 'Revenue Optimization', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: 'Systems & Automation', icon: <Activity className="w-3.5 h-3.5" /> },
]

const budgetCategories = [
  { key: 'personal' as const, label: 'PERSONAL EXPENSES', color: 'amber-400', icon: <Wallet className="w-4 h-4" /> },
  { key: 'savings' as const, label: 'SAVINGS', color: 'emerald-400', icon: <PiggyBank className="w-4 h-4" /> },
  { key: 'business' as const, label: 'BUSINESS', color: 'blue-400', icon: <Zap className="w-4 h-4" /> },
  { key: 'skills' as const, label: 'SKILLS & TOOLS', color: 'purple-400', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'fun' as const, label: 'FUN', color: 'rose-400', icon: <Flame className="w-4 h-4" /> },
]

// ─── Micro Sparkline Component ──────────────────────────────────────────────

function MicroSparkline({ data, color = '#f59e0b', height = 32 }: { data: { value: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="index" hide />
        <Tooltip
          contentStyle={{ display: 'none' }}
          cursor={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Metric Card Component ──────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  trend,
  trendLabel,
  sparkData,
  sparkColor,
  icon,
  delay = 0,
}: {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  trendLabel?: string
  sparkData: { value: number }[]
  sparkColor: string
  icon: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="metric-card bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 relative overflow-hidden group"
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-white/30">{icon}</div>
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-medium">{label}</span>
        </div>
        {trend !== 'neutral' && (
          <div className={cn('flex items-center gap-0.5 text-xs', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-white/90 mb-2">{value}</div>

      <div className="mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <MicroSparkline data={sparkData} color={sparkColor} height={28} />
      </div>
    </motion.div>
  )
}

// ─── Budget Category Card ───────────────────────────────────────────────────

function BudgetCategoryCard({
  category,
  budget,
  spent,
  remaining,
  percentUsed,
  daysLeft,
  recentExpenses,
  delay = 0,
}: {
  category: typeof budgetCategories[number]
  budget: number
  spent: number
  remaining: number
  percentUsed: number
  daysLeft: number
  recentExpenses: ExpenseEntry[]
  delay?: number
}) {
  const safeDailySpend = daysLeft > 0 ? Math.max(0, remaining / daysLeft) : 0
  const isWarning = percentUsed >= 70
  const isDanger = percentUsed >= 90

  const colorMap: Record<string, string> = {
    'amber-400': 'text-amber-400',
    'emerald-400': 'text-emerald-400',
    'blue-400': 'text-blue-400',
    'purple-400': 'text-purple-400',
    'rose-400': 'text-rose-400',
  }

  const bgMap: Record<string, string> = {
    'amber-400': 'bg-amber-400/10 border-amber-400/20',
    'emerald-400': 'bg-emerald-400/10 border-emerald-400/20',
    'blue-400': 'bg-blue-400/10 border-blue-400/20',
    'purple-400': 'bg-purple-400/10 border-purple-400/20',
    'rose-400': 'bg-rose-400/10 border-rose-400/20',
  }

  const strokeMap: Record<string, string> = {
    'amber-400': '#fbbf24',
    'emerald-400': '#34d399',
    'blue-400': '#60a5fa',
    'purple-400': '#c084fc',
    'rose-400': '#fb7185',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'bg-white/[0.03] backdrop-blur-xl border rounded-2xl p-5 transition-all duration-300 relative overflow-hidden',
        isDanger
          ? 'border-red-500/30 budget-danger'
          : isWarning
          ? 'border-amber-500/20 budget-warning'
          : 'border-white/[0.06]',
        isDanger && 'shadow-[0_0_24px_rgba(239,68,68,0.08)]'
      )}
    >
      {/* Category ambient glow */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10',
        category.color === 'amber-400' && 'bg-amber-500',
        category.color === 'emerald-400' && 'bg-emerald-500',
        category.color === 'blue-400' && 'bg-blue-500',
        category.color === 'purple-400' && 'bg-purple-500',
        category.color === 'rose-400' && 'bg-rose-500',
      )} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded-lg border', bgMap[category.color])}>
            <span className={colorMap[category.color]}>{category.icon}</span>
          </div>
          <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{category.label}</span>
        </div>
        <span className={cn(
          'text-[11px] font-bold px-2 py-0.5 rounded-full',
          isDanger
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : isWarning
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        )}>
          {percentUsed.toFixed(0)}%
        </span>
      </div>

      {/* Budget / Spent / Remaining */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Budget</p>
          <p className="text-white/80 text-sm font-semibold">{formatINR(budget)}</p>
        </div>
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Spent</p>
          <p className={cn('text-sm font-semibold', isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/80')}>
            {formatINR(spent)}
          </p>
        </div>
        <div>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Remaining</p>
          <p className={cn('text-sm font-semibold', remaining < 0 ? 'text-red-400' : 'text-emerald-400')}>
            {formatINR(remaining)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentUsed)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full budget-progress',
            percentUsed < 70
              ? 'bg-gradient-to-r from-amber-500 to-amber-300'
              : percentUsed < 90
              ? 'bg-gradient-to-r from-amber-500 to-orange-400'
              : 'bg-gradient-to-r from-red-500 to-red-400'
          )}
        />
      </div>

      {/* Safe Daily Spending */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/30 text-[11px]">Safe daily spending</span>
        <span className={cn(
          'text-xs font-semibold',
          safeDailySpend <= 0 ? 'text-red-400' : 'text-amber-400/80'
        )}>
          {safeDailySpend > 0 ? `${formatINR(Math.round(safeDailySpend))}/day` : 'Over budget'}
        </span>
      </div>

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <div className="border-t border-white/5 pt-3">
          <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2">Recent Expenses</p>
          <div className="space-y-1.5">
            {recentExpenses.slice(0, 3).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between text-xs">
                <span className="text-white/50 truncate max-w-[60%]">{exp.description}</span>
                <span className="text-white/40 font-medium">{formatINR(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── Active Operations Item ─────────────────────────────────────────────────

function OperationItem({
  priority,
  label,
  subtitle,
  amount,
  actionLabel,
  delay = 0,
}: {
  priority: 'critical' | 'high' | 'normal'
  label: string
  subtitle: string
  amount?: number
  actionLabel: string
  delay?: number
}) {
  const priorityConfig = {
    critical: { bg: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
    high: { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    normal: { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', dot: 'bg-blue-400' },
  }
  const config = priorityConfig[priority]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
    >
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', config.dot)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-medium truncate">{label}</span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border', config.bg)}>
            {priority}
          </span>
        </div>
        <p className="text-white/30 text-xs truncate">{subtitle}</p>
      </div>
      {amount != null && amount > 0 && (
        <span className="text-amber-400/80 text-sm font-semibold flex-shrink-0">{formatINR(amount)}</span>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="text-white/30 hover:text-amber-400 text-xs h-7 px-2 flex-shrink-0"
      >
        {actionLabel}
        <ChevronRight className="w-3 h-3 ml-0.5" />
      </Button>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ExecutiveOverview() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups, setMonthlyIncome } = useAppStore()

  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIncomeInput(monthlyIncome.toString())
  }, [monthlyIncome])

  // ── Derived Metrics ──
  const now = new Date()
  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  const netBalance = monthlyIncome - totalExpenses
  const savingsRate = monthlyIncome > 0 ? ((budgetAllocation.savings.spent) / monthlyIncome * 100) : 0
  const disciplineScore = monthlyTarget > 0 ? Math.min(100, Math.round((monthlyIncome / monthlyTarget) * 70 + 30)) : 30
  const daysLeft = daysLeftInMonth()
  const currentDay = now.getDate()
  const revenueVelocity = currentDay > 0 ? Math.round(monthlyIncome / currentDay) : 0

  const pipelineValue = useMemo(() => {
    return clients
      .filter(c => c.pipelineStage !== 'completed')
      .reduce((s, c) => s + c.projectValue, 0)
  }, [clients])

  // Income streams analysis
  const incomeBySource = useMemo(() => {
    const map: Record<string, number> = {}
    incomes.forEach(i => {
      map[i.source] = (map[i.source] || 0) + i.amount
    })
    return map
  }, [incomes])

  const strongestStream = useMemo(() => {
    const entries = Object.entries(incomeBySource)
    if (entries.length === 0) return { source: 'No data', amount: 0 }
    return entries.reduce((max, [source, amount]) => amount > max.amount ? { source, amount } : max, { source: '', amount: 0 })
  }, [incomeBySource])

  const weakestStream = useMemo(() => {
    const entries = Object.entries(incomeBySource)
    if (entries.length === 0) return { source: 'No data', amount: 0 }
    return entries.reduce((min, [source, amount]) => amount < min.amount ? { source, amount } : min, { source: '', amount: Infinity })
  }, [incomeBySource])

  // Discipline warning
  const personalBudgetPercent = budgetAllocation.personal.budget > 0
    ? (budgetAllocation.personal.spent / budgetAllocation.personal.budget) * 100
    : 0
  const disciplineWarning = personalBudgetPercent > 80

  // Daily focus
  const dailyFocusIndex = now.getDate() % focusRotation.length
  const dailyFocus = focusRotation[dailyFocusIndex]

  // Sparkline data for metrics
  const revenueSpark = useMemo(() => generateSparkline(monthlyIncome * 0.8, monthlyIncome * 0.3), [monthlyIncome])
  const netSpark = useMemo(() => generateSparkline(netBalance * 0.8, Math.abs(netBalance) * 0.3 || 5000), [netBalance])
  const savingsSpark = useMemo(() => generateSparkline(savingsRate * 0.8, 10), [savingsRate])
  const disciplineSpark = useMemo(() => generateSparkline(disciplineScore * 0.8, 10), [disciplineScore])
  const velocitySpark = useMemo(() => generateSparkline(revenueVelocity * 0.8, revenueVelocity * 0.3 || 500), [revenueVelocity])
  const pipelineSpark = useMemo(() => generateSparkline(pipelineValue * 0.8, pipelineValue * 0.3 || 10000), [pipelineValue])

  // Remaining to target
  const remainingToTarget = Math.max(0, monthlyTarget - monthlyIncome)

  // Category expenses
  const categoryExpenses = useMemo(() => {
    const map: Record<string, ExpenseEntry[]> = {}
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    monthExpenses.forEach(e => {
      if (!map[e.category]) map[e.category] = []
      map[e.category].push(e)
    })
    return map
  }, [expenses])

  // Active operations
  const todayStr = now.toISOString().split('T')[0]
  const todayFollowups = useMemo(() => {
    return followups.filter(f => f.dueDate === todayStr && f.status !== 'completed').slice(0, 5)
  }, [followups, todayStr])

  const pendingProposals = useMemo(() => {
    return clients.filter(c => c.pipelineStage === 'proposal').slice(0, 3)
  }, [clients])

  const overdueClients = useMemo(() => {
    return clients.filter(c => c.urgencyLevel === 'critical' && c.pipelineStage !== 'completed').slice(0, 3)
  }, [clients])

  // Outreach metrics (simulated from followup data)
  const outreachMetrics = useMemo(() => {
    const thisWeek = followups.filter(f => {
      const d = new Date(f.dueDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return d >= weekAgo
    })
    return {
      dms: thisWeek.filter(f => f.type === 'dm').length,
      calls: thisWeek.filter(f => f.type === 'call').length,
      meetings: thisWeek.filter(f => f.type === 'meeting').length,
      proposals: clients.filter(c => c.pipelineStage === 'proposal').length,
      closes: clients.filter(c => c.pipelineStage === 'completed').length,
    }
  }, [followups, clients])

  const totalOutreach = outreachMetrics.dms + outreachMetrics.calls + outreachMetrics.meetings
  const conversionRate = totalOutreach > 0 && outreachMetrics.closes > 0
    ? ((outreachMetrics.closes / totalOutreach) * 100).toFixed(1)
    : '0.0'

  // Handle income input
  const handleIncomeChange = (value: string) => {
    setIncomeInput(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setMonthlyIncome(num)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — KARNA EXECUTIVE BRIEFING (HERO PANEL)
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.06] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-6"
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-6 right-10 w-1 h-1 rounded-full bg-amber-400/30 particle" />
        <div className="absolute top-12 right-20 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-8 left-16 w-1 h-1 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '4s' }} />

        <div className="relative z-10">
          {/* Greeting */}
          <div className="flex items-center gap-3 mb-4">
            {getGreetingIcon()}
            <div>
              <h2 className="text-white/90 text-lg font-semibold">{getGreeting()}, Chandra.</h2>
              <p className="text-white/40 text-xs">Here&apos;s your executive briefing for today</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-400/70">Karna AI</span>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Revenue This Month */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Revenue This Month</p>
              <p className="gold-text text-xl font-bold">{formatINR(monthlyIncome)}</p>
            </div>

            {/* Remaining to Target */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Remaining to Target</p>
              <p className={cn(
                'text-xl font-bold',
                remainingToTarget > 0 ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {remainingToTarget > 0 ? formatINR(remainingToTarget) : 'Target Hit! ✓'}
              </p>
            </div>

            {/* Strongest Stream */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Strongest Stream</p>
              <p className="text-emerald-400 text-sm font-semibold">{strongestStream.source}</p>
              <p className="text-white/50 text-xs">{formatINR(strongestStream.amount)}</p>
            </div>

            {/* Weakest Stream */}
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Weakest Stream</p>
              <p className="text-amber-400/70 text-sm font-semibold">{weakestStream.source}</p>
              <p className="text-white/50 text-xs">{formatINR(weakestStream.amount)}</p>
            </div>
          </div>

          {/* Insights Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Discipline Warning */}
            {disciplineWarning && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/15">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-xs">Personal spending exceeds 80% of budget</span>
              </div>
            )}

            {/* Daily Focus */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <span className="text-white/40 text-xs">Today&apos;s Focus:</span>
              <span className="text-amber-400 text-xs font-medium flex items-center gap-1.5">
                {dailyFocus.icon}
                {dailyFocus.label}
              </span>
            </div>

            {/* Target Progress */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <Target className="w-3 h-3 text-white/30" />
              <span className="text-white/40 text-xs">
                {monthlyTarget > 0 ? `${((monthlyIncome / monthlyTarget) * 100).toFixed(1)}% of target` : 'No target set'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — EXECUTIVE METRICS (6 CARDS)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatINR(monthlyIncome)}
          trend={monthlyIncome >= monthlyTarget * 0.5 ? 'up' : 'down'}
          trendLabel={monthlyIncome > 0 ? `${((monthlyIncome / monthlyTarget) * 100).toFixed(0)}%` : undefined}
          sparkData={revenueSpark}
          sparkColor="#f59e0b"
          icon={<IndianRupee className="w-4 h-4" />}
          delay={0.1}
        />
        <MetricCard
          label="Net Balance"
          value={formatINR(netBalance)}
          trend={netBalance >= 0 ? 'up' : 'down'}
          trendLabel={netBalance >= 0 ? 'Positive' : 'Negative'}
          sparkData={netSpark}
          sparkColor={netBalance >= 0 ? '#34d399' : '#f87171'}
          icon={<Wallet className="w-4 h-4" />}
          delay={0.15}
        />
        <MetricCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          trend={savingsRate >= 20 ? 'up' : 'down'}
          trendLabel={savingsRate >= 20 ? 'On track' : 'Below target'}
          sparkData={savingsSpark}
          sparkColor="#34d399"
          icon={<PiggyBank className="w-4 h-4" />}
          delay={0.2}
        />
        <MetricCard
          label="Discipline Score"
          value={`${disciplineScore}`}
          trend={disciplineScore >= 70 ? 'up' : 'down'}
          trendLabel={disciplineScore >= 70 ? 'Strong' : 'Needs work'}
          sparkData={disciplineSpark}
          sparkColor="#d4a849"
          icon={<Shield className="w-4 h-4" />}
          delay={0.25}
        />
        <MetricCard
          label="Revenue Velocity"
          value={`${formatINR(revenueVelocity)}/day`}
          trend={revenueVelocity >= monthlyTarget / 30 ? 'up' : 'down'}
          trendLabel="daily avg"
          sparkData={velocitySpark}
          sparkColor="#f59e0b"
          icon={<Zap className="w-4 h-4" />}
          delay={0.3}
        />
        <MetricCard
          label="Opportunity Pipeline"
          value={formatINR(pipelineValue)}
          trend={pipelineValue > 0 ? 'up' : 'neutral'}
          trendLabel={`${clients.filter(c => c.pipelineStage !== 'completed').length} active`}
          sparkData={pipelineSpark}
          sparkColor="#60a5fa"
          icon={<Target className="w-4 h-4" />}
          delay={0.35}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — WEALTH DISTRIBUTION ENGINE (MOST IMPORTANT)
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative"
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="gold-text text-xl font-bold">Wealth Distribution Engine</h2>
            <p className="text-white/30 text-xs mt-0.5">Your income, automatically allocated across 5 wealth pillars</p>
          </div>

          {/* Monthly Income Input */}
          <div className="flex items-center gap-3">
            <label className="text-white/40 text-xs uppercase tracking-wider whitespace-nowrap">Monthly Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60 text-sm">₹</span>
              <input
                type="text"
                value={incomeInput}
                onChange={(e) => handleIncomeChange(e.target.value)}
                className="w-44 h-10 pl-7 pr-3 rounded-xl bg-white/[0.04] border border-amber-500/15 text-white/90 text-sm font-semibold focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-white/20"
                placeholder="Enter amount"
              />
            </div>
          </div>
        </div>

        {/* Distribution Visual Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-white/[0.03] rounded-full overflow-hidden flex">
            {budgetCategories.map((cat) => {
              const alloc = budgetAllocation[cat.key]
              const width = monthlyIncome > 0 ? (alloc.budget / monthlyIncome) * 100 : cat.key === 'personal' ? 40 : cat.key === 'savings' ? 25 : cat.key === 'business' ? 15 : 10
              const colorMap: Record<string, string> = {
                'amber-400': 'bg-amber-400/60',
                'emerald-400': 'bg-emerald-400/60',
                'blue-400': 'bg-blue-400/60',
                'purple-400': 'bg-purple-400/60',
                'rose-400': 'bg-rose-400/60',
              }
              return (
                <motion.div
                  key={cat.key}
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn('h-full', colorMap[cat.color])}
                  title={`${cat.label}: ${width.toFixed(0)}%`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            {budgetCategories.map((cat) => {
              const alloc = budgetAllocation[cat.key]
              const percent = monthlyIncome > 0 ? ((alloc.budget / monthlyIncome) * 100).toFixed(0) : alloc.percent
              const colorMap: Record<string, string> = {
                'amber-400': 'text-amber-400',
                'emerald-400': 'text-emerald-400',
                'blue-400': 'text-blue-400',
                'purple-400': 'text-purple-400',
                'rose-400': 'text-rose-400',
              }
              return (
                <span key={cat.key} className={cn('text-[10px] font-medium', colorMap[cat.color])}>
                  {percent}%
                </span>
              )
            })}
          </div>
        </div>

        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgetCategories.map((cat, index) => {
            const alloc = budgetAllocation[cat.key]
            const percentUsed = alloc.budget > 0 ? (alloc.spent / alloc.budget) * 100 : 0
            const categoryLabel = cat.key.charAt(0).toUpperCase() + cat.key.slice(1)
            const recentExpenses = (categoryExpenses[categoryLabel] || [])
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            return (
              <BudgetCategoryCard
                key={cat.key}
                category={cat}
                budget={alloc.budget}
                spent={alloc.spent}
                remaining={alloc.budget - alloc.spent}
                percentUsed={percentUsed}
                daysLeft={daysLeft}
                recentExpenses={recentExpenses}
                delay={0.5 + index * 0.08}
              />
            )
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — ACTIVE OPERATIONS
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <CircleDot className="w-4 h-4 text-amber-400" />
          <h3 className="text-white/90 text-sm font-semibold">Active Operations</h3>
          <span className="text-white/20 text-xs ml-1">
            ({todayFollowups.length + pendingProposals.length + overdueClients.length} items)
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Followups Due Today */}
          {todayFollowups.length > 0 && (
            <div className="mb-3">
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Due Today
              </p>
              {todayFollowups.map((f, i) => (
                <OperationItem
                  key={f.id}
                  priority={f.status === 'overdue' ? 'critical' : 'high'}
                  label={f.clientName || 'Unknown Client'}
                  subtitle={`${f.type.charAt(0).toUpperCase() + f.type.slice(1)} — ${f.note || 'No details'}`}
                  actionLabel="Complete"
                  delay={0.7 + i * 0.05}
                />
              ))}
            </div>
          )}

          {/* Pending Proposals */}
          {pendingProposals.length > 0 && (
            <div className="mb-3">
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Send className="w-3 h-3" /> Pending Proposals
              </p>
              {pendingProposals.map((c, i) => (
                <OperationItem
                  key={c.id}
                  priority="high"
                  label={c.name}
                  subtitle={c.business || 'No business info'}
                  amount={c.projectValue}
                  actionLabel="Follow up"
                  delay={0.8 + i * 0.05}
                />
              ))}
            </div>
          )}

          {/* Overdue/Urgent Clients */}
          {overdueClients.length > 0 && (
            <div className="mb-3">
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3" /> Urgent Clients
              </p>
              {overdueClients.map((c, i) => (
                <OperationItem
                  key={c.id}
                  priority="critical"
                  label={c.name}
                  subtitle={`Stage: ${c.pipelineStage} — ${c.notes || 'Action required'}`}
                  amount={c.projectValue}
                  actionLabel="Engage"
                  delay={0.9 + i * 0.05}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {todayFollowups.length === 0 && pendingProposals.length === 0 && overdueClients.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-white/30 text-sm">All clear — no urgent actions right now</p>
              <p className="text-white/15 text-xs mt-1">Use Quick Add to create followups and clients</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5 — DAILY EXECUTION
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h3 className="text-white/90 text-sm font-semibold">Daily Execution</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <span className="text-[10px] text-amber-400/70 uppercase tracking-wider">This Week</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* DMs Sent */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-amber-500/10 transition-all">
            <MessageSquare className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{outreachMetrics.dms}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">DMs Sent</p>
            {outreachMetrics.dms >= 5 && (
              <div className="flex items-center justify-center gap-0.5 mt-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-medium">Streak!</span>
              </div>
            )}
          </div>

          {/* Calls Completed */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-amber-500/10 transition-all">
            <Phone className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{outreachMetrics.calls}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Calls</p>
            {outreachMetrics.calls >= 3 && (
              <div className="flex items-center justify-center gap-0.5 mt-1.5">
                <Flame className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 text-[10px] font-medium">Streak!</span>
              </div>
            )}
          </div>

          {/* Meetings */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-amber-500/10 transition-all">
            <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{outreachMetrics.meetings}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Meetings</p>
          </div>

          {/* Proposals Sent */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-amber-500/10 transition-all">
            <Send className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{outreachMetrics.proposals}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Proposals</p>
          </div>

          {/* Closes */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-amber-500/10 transition-all">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{outreachMetrics.closes}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Closes</p>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white/[0.02] border border-amber-500/10 rounded-xl p-3 text-center hover:border-amber-500/20 transition-all">
            <TrendingUp className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-white/90 text-2xl font-bold">{conversionRate}%</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wider mt-1">Conv. Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
