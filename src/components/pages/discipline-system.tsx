'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Shield, Flame, Target, Zap, TrendingUp, TrendingDown,
  CheckCircle2, AlertTriangle, XCircle, ArrowUpRight,
  ArrowDownRight, Minus, Calendar, Award,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

const CATEGORIES = [
  { key: 'personal', label: 'Personal', color: '#d4a849' },
  { key: 'savings', label: 'Savings', color: '#10b981' },
  { key: 'business', label: 'Business', color: '#3b82f6' },
  { key: 'skills', label: 'Skills', color: '#a855f7' },
  { key: 'fun', label: 'Fun', color: '#f43f5e' },
] as const

function getRatingLabel(score: number): string {
  if (score > 90) return 'Legendary'
  if (score > 80) return 'Excellent'
  if (score > 60) return 'Good'
  if (score > 40) return 'Needs Work'
  return 'Critical'
}

function getScoreColor(score: number): string {
  if (score > 80) return '#d4a849' // gold
  if (score > 50) return '#f59e0b' // amber
  return '#ef4444' // red
}

function getScoreTailwind(score: number): string {
  if (score > 80) return 'text-amber-400'
  if (score > 50) return 'text-amber-500'
  return 'text-red-400'
}

// ─── Circular Progress Ring ─────────────────────────────────────────────────

function DisciplineRing({ score, size = 200 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-white/30 text-xs uppercase tracking-widest mt-1">Discipline Score™</span>
      </div>
    </div>
  )
}

// ─── Score Component Bar ─────────────────────────────────────────────────────

function ScoreComponentBar({
  label,
  score,
  maxScore,
  color,
  delay,
}: {
  label: string
  score: number
  maxScore: number
  color: string
  delay: number
}) {
  const percent = maxScore > 0 ? (score / maxScore) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm font-bold" style={{ color }}>{score.toFixed(1)}</span>
          <span className="text-white/25 text-xs">/ {maxScore}</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: delay + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </motion.div>
  )
}

// ─── Behavioral Insight Card ─────────────────────────────────────────────────

function InsightCard({
  type,
  message,
  delay,
}: {
  type: 'positive' | 'warning' | 'negative'
  message: string
  delay: number
}) {
  const config = {
    positive: { icon: CheckCircle2, borderColor: 'border-l-emerald-400', iconColor: 'text-emerald-400', label: 'Strength' },
    warning: { icon: AlertTriangle, borderColor: 'border-l-amber-400', iconColor: 'text-amber-400', label: 'Pattern' },
    negative: { icon: XCircle, borderColor: 'border-l-red-400', iconColor: 'text-red-400', label: 'Risk' },
  }
  const c = config[type]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'bg-white/[0.02] border border-white/[0.04] border-l-2 rounded-xl p-4 hover:bg-white/[0.03] transition-all',
        c.borderColor
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', c.iconColor)} />
        <div>
          <span className="text-white/25 text-[10px] uppercase tracking-wider font-medium">{c.label}</span>
          <p className="text-white/70 text-sm mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Weekly Day Cell ─────────────────────────────────────────────────────────

function DayCell({
  day,
  spendingScore,
  outreachDone,
  savingsContrib,
  isToday,
}: {
  day: string
  spendingScore: 'good' | 'warning' | 'bad' | 'none'
  outreachDone: boolean
  savingsContrib: number
  isToday: boolean
}) {
  const scoreColors = {
    good: 'bg-emerald-400/20 text-emerald-400',
    warning: 'bg-amber-400/20 text-amber-400',
    bad: 'bg-red-400/20 text-red-400',
    none: 'bg-white/5 text-white/20',
  }

  return (
    <div className={cn(
      'bg-white/[0.02] border rounded-xl p-3 text-center transition-all',
      isToday ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.04]'
    )}>
      <p className={cn('text-white/50 text-[10px] uppercase tracking-wider mb-2', isToday && 'text-amber-400/70')}>{day}</p>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-xs font-bold', scoreColors[spendingScore])}>
        {spendingScore === 'good' ? '✓' : spendingScore === 'warning' ? '!' : spendingScore === 'bad' ? '✗' : '—'}
      </div>
      <div className="flex items-center justify-center gap-1 mb-1">
        {outreachDone ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-white/10" />
        )}
        <span className="text-white/25 text-[9px]">Outreach</span>
      </div>
      {savingsContrib > 0 && (
        <p className="text-emerald-400/60 text-[9px] font-medium">{formatINR(savingsContrib)}</p>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DisciplineSystem() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups } = useAppStore()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // ── Discipline Score Components ──

  // 1. Spending Discipline (30 pts)
  const spendingDiscipline = useMemo(() => {
    const categories = ['personal', 'savings', 'business', 'skills', 'fun'] as const
    let totalAdherence = 0
    let count = 0

    categories.forEach(cat => {
      const alloc = budgetAllocation[cat]
      if (alloc.budget > 0) {
        const adherence = alloc.spent <= alloc.budget ? 1 : Math.max(0, 1 - (alloc.spent - alloc.budget) / alloc.budget)
        totalAdherence += adherence
        count++
      }
    })

    const avgAdherence = count > 0 ? totalAdherence / count : 0.5
    return avgAdherence * 30
  }, [budgetAllocation])

  // 2. Savings Consistency (40 pts)
  const savingsConsistency = useMemo(() => {
    const savingsPercent = monthlyIncome > 0 ? (budgetAllocation.savings.spent / monthlyIncome) * 100 : 0
    return Math.min(40, (savingsPercent / 25) * 40)
  }, [monthlyIncome, budgetAllocation])

  // 3. Outreach Consistency (30 pts)
  const outreachConsistency = useMemo(() => {
    const activeFollowups = followups.filter(f => f.status !== 'completed').length
    const completedFollowups = followups.filter(f => f.status === 'completed').length
    const totalActive = activeFollowups + completedFollowups
    return Math.min(30, (totalActive / 10) * 30)
  }, [followups])

  const totalScore = Math.round(spendingDiscipline + savingsConsistency + outreachConsistency)
  const ratingLabel = getRatingLabel(totalScore)
  const scoreColor = getScoreColor(totalScore)

  // ── Per-Category Adherence ──
  const categoryAdherence = useMemo(() => {
    return CATEGORIES.map(cat => {
      const alloc = budgetAllocation[cat.key as keyof typeof budgetAllocation]
      const adherence = alloc.budget > 0
        ? alloc.spent <= alloc.budget
          ? 100
          : Math.max(0, ((alloc.budget - (alloc.spent - alloc.budget)) / alloc.budget) * 100)
        : 50
      return {
        ...cat,
        adherence: Math.min(100, Math.max(0, adherence)),
        budget: alloc.budget,
        spent: alloc.spent,
      }
    })
  }, [budgetAllocation])

  // ── Behavioral Insights ──
  const insights = useMemo(() => {
    const result: Array<{ type: 'positive' | 'warning' | 'negative'; message: string }> = []

    // Weekend spending analysis
    const weekendExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return (d.getDay() === 0 || d.getDay() === 6) &&
        d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const funWeekend = weekendExpenses.filter(e => e.category === 'Fun')
    if (funWeekend.length > 0) {
      const funAmount = funWeekend.reduce((s, e) => s + e.amount, 0)
      if (funAmount > 5000) {
        result.push({ type: 'warning', message: `You tend to overspend on Fun during weekends — ${formatINR(funAmount)} this month on weekends alone.` })
      }
    }

    // Savings improvement
    if (savingsConsistency > 25) {
      result.push({ type: 'positive', message: 'Your savings rate has improved this month. You\'re consistently hitting your savings targets.' })
    } else if (savingsConsistency < 15) {
      result.push({ type: 'negative', message: 'Savings rate is critically low. You need to allocate at least 25% of income to savings.' })
    }

    // Outreach patterns
    const completedFollowups = followups.filter(f => f.status === 'completed')
    if (completedFollowups.length > 0) {
      // Find most productive day
      const dayMap: Record<string, number> = {}
      completedFollowups.forEach(f => {
        const d = new Date(f.dueDate)
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
        dayMap[dayName] = (dayMap[dayName] || 0) + 1
      })
      const bestDay = Object.entries(dayMap).reduce((max, [day, count]) => count > max.count ? { day, count } : max, { day: '', count: 0 })
      if (bestDay.day) {
        result.push({ type: 'positive', message: `You're most productive on ${bestDay.day}sdays for outreach — ${bestDay.count} followups completed.` })
      }
    }

    // Personal spending pattern
    if (budgetAllocation.personal.budget > 0 && budgetAllocation.personal.spent > budgetAllocation.personal.budget * 0.8) {
      result.push({ type: 'warning', message: 'Personal expenses approaching budget limit. Consider reducing discretionary spending this week.' })
    }

    // Budget discipline
    const overBudgetCount = CATEGORIES.filter(cat => {
      const alloc = budgetAllocation[cat.key as keyof typeof budgetAllocation]
      return alloc.budget > 0 && alloc.spent > alloc.budget
    }).length
    if (overBudgetCount > 0) {
      result.push({ type: 'negative', message: `${overBudgetCount} categor${overBudgetCount === 1 ? 'y is' : 'ies are'} over budget this month. Immediate course correction needed.` })
    }

    // Business investment
    if (budgetAllocation.business.budget > 0 && budgetAllocation.business.spent < budgetAllocation.business.budget * 0.3) {
      result.push({ type: 'warning', message: 'Business investment is lagging. Under-investing in growth could slow revenue acceleration.' })
    }

    // Default
    if (result.length === 0) {
      result.push({ type: 'positive', message: 'Your financial discipline looks solid this month. Keep maintaining consistent habits.' })
    }

    return result
  }, [expenses, followups, budgetAllocation, savingsConsistency, currentMonth, currentYear])

  // ── Weekly Discipline Log ──
  const weeklyLog = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = now.getDay() // 0=Sun
    const todayIdx = today === 0 ? 6 : today - 1 // 0=Mon

    return days.map((day, idx) => {
      const dayDate = new Date(now)
      dayDate.setDate(now.getDate() - (todayIdx - idx))

      const dayExpenses = expenses.filter(e => e.date === dayDate.toISOString().split('T')[0])
      const dayTotal = dayExpenses.reduce((s, e) => s + e.amount, 0)
      const dailyBudget = monthlyIncome > 0 ? monthlyIncome * 0.75 / 30 : 0

      const spendingScore: 'good' | 'warning' | 'bad' | 'none' = dayTotal === 0
        ? 'none'
        : dayTotal <= dailyBudget * 0.8
        ? 'good'
        : dayTotal <= dailyBudget * 1.2
        ? 'warning'
        : 'bad'

      const dayFollowups = followups.filter(f => f.dueDate === dayDate.toISOString().split('T')[0] && f.status === 'completed')
      const outreachDone = dayFollowups.length > 0

      const savingsContrib = dayExpenses.filter(e => e.category === 'Savings').reduce((s, e) => s + e.amount, 0)

      return {
        day,
        spendingScore,
        outreachDone,
        savingsContrib,
        isToday: idx === todayIdx,
      }
    })
  }, [expenses, followups, monthlyIncome, now])

  // Streak counter
  const streak = useMemo(() => {
    let count = 0
    const todayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1
    for (let i = todayIdx; i >= 0; i--) {
      const log = weeklyLog[i]
      if (log.spendingScore === 'good' && log.outreachDone) {
        count++
      } else {
        break
      }
    }
    return count
  }, [weeklyLog, now])

  // Trend
  const trend = useMemo(() => {
    const thisWeek = weeklyLog.filter(l => l.spendingScore === 'good').length
    if (thisWeek >= 5) return 'improving'
    if (thisWeek <= 2) return 'declining'
    return 'stable'
  }, [weeklyLog])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — Discipline System
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.06] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-6"
      >
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />
        <div className="relative z-10">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Behavioral Operating Layer</p>
          <h1 className="gold-text text-3xl lg:text-4xl font-bold tracking-tight">Discipline System</h1>
          <p className="text-white/30 text-sm mt-1">Track, measure, and optimize your financial behavior</p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Discipline Score™ (Hero)
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: scoreColor }}
        />

        <div className="relative z-10 flex flex-col items-center">
          <DisciplineRing score={totalScore} size={220} />

          {/* Rating */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-4 flex items-center gap-2"
          >
            <Award className="w-5 h-5" style={{ color: scoreColor }} />
            <span className="text-xl font-bold" style={{ color: scoreColor }}>{ratingLabel}</span>
          </motion.div>

          <p className="text-white/30 text-xs mt-2 text-center max-w-md">
            Computed from: 30% spending discipline + 40% savings consistency + 30% outreach consistency
          </p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Consistency Analytics
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white/90 text-sm font-semibold">Consistency Analytics</h3>
            <p className="text-white/25 text-[10px]">Breakdown of your discipline score components</p>
          </div>
        </div>

        {/* Three main components */}
        <div className="space-y-6 mb-8">
          <ScoreComponentBar
            label="Spending Discipline"
            score={spendingDiscipline}
            maxScore={30}
            color="#d4a849"
            delay={0.3}
          />
          <ScoreComponentBar
            label="Savings Consistency"
            score={savingsConsistency}
            maxScore={40}
            color="#10b981"
            delay={0.35}
          />
          <ScoreComponentBar
            label="Outreach Consistency"
            score={outreachConsistency}
            maxScore={30}
            color="#3b82f6"
            delay={0.4}
          />
        </div>

        {/* Per-Category Adherence */}
        <div className="border-t border-white/[0.04] pt-5">
          <p className="text-white/40 text-xs uppercase tracking-wider font-medium mb-4">Per-Category Budget Adherence</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categoryAdherence.map((cat, idx) => (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + idx * 0.05 }}
                className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-center hover:border-white/[0.08] transition-all"
              >
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: cat.color }} />
                <p className="text-white/60 text-xs font-medium mb-1">{cat.label}</p>
                <p className="text-lg font-bold" style={{ color: cat.adherence >= 80 ? '#10b981' : cat.adherence >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {cat.adherence.toFixed(0)}%
                </p>
                <p className="text-white/25 text-[9px] mt-1">
                  {formatINR(cat.spent)} / {formatINR(cat.budget)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — Behavioral Analysis
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white/90 text-sm font-semibold">Behavioral Analysis</h3>
            <p className="text-white/25 text-[10px]">AI-generated insights from your patterns</p>
          </div>
          <span className="ml-auto text-[10px] text-amber-400/50 uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-400/5 border border-amber-400/10">Karna AI</span>
        </div>

        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <InsightCard
              key={idx}
              type={insight.type}
              message={insight.message}
              delay={0.4 + idx * 0.08}
            />
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — Weekly Discipline Log
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white/90 text-sm font-semibold">Weekly Discipline Log</h3>
              <p className="text-white/25 text-[10px]">7-day behavioral tracker</p>
            </div>
          </div>

          {/* Streak & Trend */}
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 text-xs font-bold">{streak}-day streak</span>
              </div>
            )}
            <div className={cn(
              'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border',
              trend === 'improving' ? 'bg-emerald-500/5 border-emerald-500/10' :
              trend === 'declining' ? 'bg-red-500/5 border-red-500/10' :
              'bg-white/5 border-white/10'
            )}>
              {trend === 'improving' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> :
               trend === 'declining' ? <ArrowDownRight className="w-3.5 h-3.5 text-red-400" /> :
               <Minus className="w-3.5 h-3.5 text-white/40" />}
              <span className={cn(
                'text-xs font-medium capitalize',
                trend === 'improving' ? 'text-emerald-400' :
                trend === 'declining' ? 'text-red-400' :
                'text-white/40'
              )}>{trend}</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-400/20 flex items-center justify-center text-emerald-400 text-[8px] font-bold">✓</div>
            <span className="text-white/25 text-[10px]">Under budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-400/20 flex items-center justify-center text-amber-400 text-[8px] font-bold">!</div>
            <span className="text-white/25 text-[10px]">Near limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-400/20 flex items-center justify-center text-red-400 text-[8px] font-bold">✗</div>
            <span className="text-white/25 text-[10px]">Over budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-white/25 text-[10px]">Outreach done</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weeklyLog.map((log, idx) => (
            <DayCell key={idx} {...log} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
