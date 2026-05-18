'use client'

import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react'
import { useAppStore, type FollowupEntry } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Flame,
  Phone,
  MessageSquare,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Rocket,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Calendar,
  IndianRupee,
  ArrowUpRight,
  Plus,
  Star,
  CircleDot,
  Flag,
  Milestone,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function daysLeftInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate() + 1
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Roadmap Data ───────────────────────────────────────────────────────────

const roadmapMonths = [
  {
    month: 1,
    target: 25000,
    title: 'Foundation & Outreach',
    focus: 'Build daily outreach habits, set up systems, create your service offers',
    outreach: '50 DMs/week, 15 calls/week',
    systems: 'CRM setup, proposal templates, pricing sheet',
  },
  {
    month: 2,
    target: 50000,
    title: 'Client Acquisition',
    focus: 'Convert prospects to clients, build case studies, refine messaging',
    outreach: '75 DMs/week, 20 calls/week',
    systems: 'Onboarding flow, client portal, testimonial system',
  },
  {
    month: 3,
    target: 75000,
    title: 'Retainer Building',
    focus: 'Convert one-off clients to retainers, build recurring revenue base',
    outreach: '50 DMs/week, 10 calls/week',
    systems: 'Retainer packages, SLA templates, monthly review process',
  },
  {
    month: 4,
    target: 100000,
    title: 'Scale & Systemize',
    focus: 'Systemize delivery, build SOPs, prepare for delegation',
    outreach: '40 DMs/week, 8 calls/week',
    systems: 'SOPs, automation workflows, VA hiring plan',
  },
  {
    month: 5,
    target: 150000,
    title: 'AI Automation Focus',
    focus: 'Add AI-powered services, premium pricing, thought leadership',
    outreach: '30 DMs/week, 5 strategic calls',
    systems: 'AI workflows, premium packages, content engine',
  },
  {
    month: 6,
    target: 200000,
    title: 'International Expansion',
    focus: 'Target international clients, USD pricing, global positioning',
    outreach: '20 strategic DMs/week, partnerships',
    systems: 'International billing, timezone management, global portfolio',
  },
  {
    month: 7,
    target: 300000,
    title: 'Empire Consolidation',
    focus: 'Build team, create agency model, passive income streams',
    outreach: 'Team-driven outreach, you focus on strategy',
    systems: 'Team management, agency playbook, revenue diversification',
  },
]

// ─── Outreach Metric Config ─────────────────────────────────────────────────

interface OutreachMetricConfig {
  key: string
  label: string
  icon: React.ReactNode
  dailyTarget: number
  weeklyTarget: number
  color: string
  bgColor: string
  borderColor: string
}

const outreachMetrics: OutreachMetricConfig[] = [
  {
    key: 'dm',
    label: 'DMs',
    icon: <MessageSquare className="w-5 h-5" />,
    dailyTarget: 10,
    weeklyTarget: 50,
    color: 'text-sky-400',
    bgColor: 'bg-sky-400/10',
    borderColor: 'border-sky-400/20',
  },
  {
    key: 'call',
    label: 'Calls',
    icon: <Phone className="w-5 h-5" />,
    dailyTarget: 3,
    weeklyTarget: 15,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
  },
  {
    key: 'proposal',
    label: 'Proposals',
    icon: <Send className="w-5 h-5" />,
    dailyTarget: 2,
    weeklyTarget: 10,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20',
  },
  {
    key: 'meeting',
    label: 'Meetings',
    icon: <Users className="w-5 h-5" />,
    dailyTarget: 1,
    weeklyTarget: 5,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
  {
    key: 'close',
    label: 'Closes',
    icon: <CheckCircle2 className="w-5 h-5" />,
    dailyTarget: 0,
    weeklyTarget: 2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
  },
]

// ─── Section 1: ₹1 Lakh Mission Tracker ─────────────────────────────────────

function MissionTracker() {
  const { monthlyIncome, monthlyTarget } = useAppStore()
  const progress = monthlyTarget > 0 ? (monthlyIncome / monthlyTarget) * 100 : 0
  const clampedProgress = Math.min(100, progress)
  const remaining = Math.max(0, monthlyTarget - monthlyIncome)
  const daysLeft = daysLeftInMonth()
  const requiredDaily = daysLeft > 0 ? remaining / daysLeft : 0
  const isTargetHit = monthlyIncome >= monthlyTarget

  const milestones = [25, 50, 75, 100]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-6 lg:p-8"
    >
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 ambient-gradient pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute top-6 right-12 w-1 h-1 rounded-full bg-amber-400/30 particle" />
      <div className="absolute top-16 right-24 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-20 w-1 h-1 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '4s' }} />
      <div className="absolute top-20 left-1/3 w-0.5 h-0.5 rounded-full bg-amber-300/15 particle" style={{ animationDelay: '3s' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[11px] text-amber-400/70 uppercase tracking-widest font-medium">Mission Control</span>
            </div>
            <h1 className="gold-text text-3xl lg:text-4xl font-bold tracking-tight">
              ₹1 Lakh Mission
            </h1>
            <p className="text-white/30 text-sm mt-1">Revenue growth headquarters — every rupee counts</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border',
            isTargetHit
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          )}>
            {isTargetHit ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">{clampedProgress.toFixed(1)}%</span>
            <span className="text-xs opacity-60">complete</span>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Earned This Month</p>
            <p className="gold-text text-2xl font-bold">{formatINR(monthlyIncome)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Target</p>
            <p className="text-white/80 text-2xl font-bold">{formatINR(monthlyTarget)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Remaining</p>
            <p className={cn(
              'text-2xl font-bold',
              remaining > 0 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {remaining > 0 ? formatINR(remaining) : 'Done! ✓'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Required / Day</p>
            <p className={cn(
              'text-2xl font-bold',
              requiredDaily > 0 ? 'text-white/80' : 'text-emerald-400'
            )}>
              {remaining > 0 ? `${formatINR(Math.round(requiredDaily))}` : '—'}
            </p>
            <p className="text-white/30 text-[10px] mt-0.5">{daysLeft} days left</p>
          </motion.div>
        </div>

        {/* Cinematic Progress Bar */}
        <div className="relative">
          <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden relative">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${clampedProgress}%` }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-300 rounded-full budget-progress relative"
            >
              {/* Glow on the progress bar edge */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-400/30 blur-md" />
            </motion.div>
          </div>

          {/* Milestone markers */}
          <div className="relative h-8 mt-1">
            {milestones.map((milestone) => {
              const milestonePosition = milestone
              const isReached = clampedProgress >= milestone
              return (
                <div
                  key={milestone}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: `${milestonePosition}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Tick mark */}
                  <div className={cn(
                    'w-px h-3',
                    isReached ? 'bg-amber-400/60' : 'bg-white/10'
                  )} />
                  {/* Label */}
                  <span className={cn(
                    'text-[9px] font-medium mt-0.5',
                    isReached ? 'text-amber-400' : 'text-white/20'
                  )}>
                    {milestone}%
                  </span>
                  {/* Star for reached milestones */}
                  {isReached && (
                    <Star className="w-2.5 h-2.5 text-amber-400 mt-0.5" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section 2: Outreach Tracker ────────────────────────────────────────────

function OutreachTracker() {
  const { followups, clients } = useAppStore()
  const [outreachCounts, setOutreachCounts] = useState<Record<string, number>>({
    dm: 0,
    call: 0,
    proposal: 0,
    meeting: 0,
    close: 0,
  })
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Calculate current counts from followups + clients data
  useEffect(() => {
    const now = new Date()
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const todayStr = getTodayStr()

    const thisWeekFollowups = followups.filter(f => {
      const d = new Date(f.dueDate)
      return d >= weekAgo
    })

    const todayFollowups = followups.filter(f => f.dueDate === todayStr)

    setOutreachCounts({
      dm: thisWeekFollowups.filter(f => f.type === 'dm').length,
      call: thisWeekFollowups.filter(f => f.type === 'call').length,
      proposal: clients.filter(c => c.pipelineStage === 'proposal').length,
      meeting: thisWeekFollowups.filter(f => f.type === 'meeting').length,
      close: clients.filter(c => c.pipelineStage === 'completed').length,
    })
  }, [followups, clients])

  const handleIncrement = useCallback(async (metricKey: string) => {
    setLoading(prev => ({ ...prev, [metricKey]: true }))
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: metricKey, date: getTodayStr(), count: 1 }),
      })
      setOutreachCounts(prev => ({
        ...prev,
        [metricKey]: (prev[metricKey] || 0) + 1,
      }))
      toast.success(`${metricKey.charAt(0).toUpperCase() + metricKey.slice(1)} logged!`)
    } catch {
      toast.error('Failed to log outreach')
    } finally {
      setLoading(prev => ({ ...prev, [metricKey]: false }))
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Rocket className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Outreach Tracker</h2>
            <p className="text-white/30 text-[10px]">Daily & weekly execution metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <span className="text-[10px] text-amber-400/70 uppercase tracking-wider">This Week</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {outreachMetrics.map((metric, index) => {
          const count = outreachCounts[metric.key] || 0
          const weeklyProgress = metric.weeklyTarget > 0 ? Math.min(100, (count / metric.weeklyTarget) * 100) : 0
          const dailyProgress = metric.dailyTarget > 0 ? Math.min(100, (count / metric.dailyTarget) * 100) : 0
          const isHittingDaily = metric.dailyTarget > 0 && count >= metric.dailyTarget
          const isHittingWeekly = count >= metric.weeklyTarget
          const isLoading = loading[metric.key] || false

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 + index * 0.06 }}
              className={cn(
                'bg-white/[0.02] border rounded-xl p-4 hover:border-white/[0.1] transition-all duration-300 relative overflow-hidden group',
                isHittingWeekly ? 'border-amber-500/30' : 'border-white/[0.04]'
              )}
            >
              {/* Ambient glow for hitting targets */}
              {isHittingWeekly && (
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-10 bg-amber-500" />
              )}

              <div className="relative z-10">
                {/* Icon + Label */}
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-lg', metric.bgColor, metric.borderColor)} style={{ border: `1px solid` }}>
                    <span className={metric.color}>{metric.icon}</span>
                  </div>
                  {isHittingDaily && (
                    <span className="text-sm">🔥</span>
                  )}
                </div>

                {/* Count */}
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-white/90 text-2xl font-bold">{count}</span>
                  <span className="text-white/30 text-xs">/ {metric.weeklyTarget}</span>
                </div>
                <p className={cn('text-xs font-medium uppercase tracking-wider', metric.color)}>
                  {metric.label}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weeklyProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full budget-progress',
                      isHittingWeekly
                        ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                        : 'bg-gradient-to-r from-white/20 to-white/10'
                    )}
                  />
                </div>

                {/* Daily target info */}
                {metric.dailyTarget > 0 && (
                  <p className="text-white/20 text-[9px] mt-1.5">
                    Daily: {metric.dailyTarget} · Weekly: {metric.weeklyTarget}
                  </p>
                )}
                {metric.dailyTarget === 0 && (
                  <p className="text-white/20 text-[9px] mt-1.5">
                    Weekly target: {metric.weeklyTarget}
                  </p>
                )}

                {/* Increment Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleIncrement(metric.key)}
                  disabled={isLoading}
                  className="w-full mt-3 h-7 text-[11px] text-white/40 hover:text-amber-400 hover:bg-amber-500/10 border border-white/[0.04] hover:border-amber-500/20 transition-all"
                >
                  {isLoading ? (
                    <span className="w-3 h-3 border-2 border-white/20 border-t-amber-400 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Log {metric.label}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Section 3: Business Roadmap ────────────────────────────────────────────

function BusinessRoadmap() {
  const { monthlyIncome } = useAppStore()

  // Determine current month based on income progression
  const currentMonthIndex = useMemo(() => {
    for (let i = roadmapMonths.length - 1; i >= 0; i--) {
      if (monthlyIncome >= roadmapMonths[i].target * 0.7) {
        return i
      }
    }
    return 0
  }, [monthlyIncome])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <Flag className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Business Roadmap</h2>
            <p className="text-white/30 text-[10px]">7-month empire building plan</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/5">
          <Milestone className="w-3 h-3 text-white/30" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Month {currentMonthIndex + 1}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/[0.06]" />

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {roadmapMonths.map((month, index) => {
            const isCurrentMonth = index === currentMonthIndex
            const isCompleted = index < currentMonthIndex
            const isFuture = index > currentMonthIndex
            const progress = monthlyIncome > 0 && isCurrentMonth
              ? Math.min(100, (monthlyIncome / month.target) * 100)
              : isCompleted ? 100 : 0

            return (
              <motion.div
                key={month.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.06 }}
                className={cn(
                  'relative pl-12 group',
                  isFuture && 'opacity-50'
                )}
              >
                {/* Timeline dot */}
                <div className={cn(
                  'absolute left-0 top-4 w-10 h-10 rounded-xl flex items-center justify-center z-10 transition-all',
                  isCurrentMonth
                    ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(212,168,73,0.2)]'
                    : isCompleted
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-white/[0.03] border border-white/[0.06]'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrentMonth ? (
                    <Flame className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="text-white/30 text-xs font-bold">{month.month}</span>
                  )}
                </div>

                {/* Card */}
                <div className={cn(
                  'bg-white/[0.02] border rounded-2xl p-4 transition-all duration-300 hover:bg-white/[0.04]',
                  isCurrentMonth
                    ? 'border-amber-500/30 shadow-[0_0_30px_rgba(212,168,73,0.08)]'
                    : 'border-white/[0.04] hover:border-white/[0.08]'
                )}>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs font-bold uppercase tracking-wider',
                        isCurrentMonth ? 'text-amber-400' : isCompleted ? 'text-emerald-400/70' : 'text-white/40'
                      )}>
                        Month {month.month}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          CURRENT
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      'text-lg font-bold',
                      isCurrentMonth ? 'gold-text' : isCompleted ? 'text-emerald-400/70' : 'text-white/50'
                    )}>
                      {formatINR(month.target)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={cn(
                    'text-sm font-semibold mb-2',
                    isCurrentMonth ? 'text-white/90' : 'text-white/60'
                  )}>
                    {month.title}
                  </h4>

                  {/* Focus strategy */}
                  <p className="text-white/40 text-xs leading-relaxed mb-3">
                    {month.focus}
                  </p>

                  {/* Progress bar for current month */}
                  {isCurrentMonth && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/30 text-[9px] uppercase tracking-wider">Revenue Progress</span>
                        <span className="text-amber-400 text-[10px] font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full budget-progress"
                        />
                      </div>
                    </div>
                  )}

                  {/* Outreach & Systems */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                      <p className="text-white/20 text-[9px] uppercase tracking-wider mb-1">Outreach</p>
                      <p className="text-white/50 text-[11px] leading-snug">{month.outreach}</p>
                    </div>
                    <div className="bg-white/[0.02] rounded-lg p-2.5 border border-white/[0.03]">
                      <p className="text-white/20 text-[9px] uppercase tracking-wider mb-1">Systems</p>
                      <p className="text-white/50 text-[11px] leading-snug">{month.systems}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function BusinessOperations() {
  return (
    <div className="space-y-6">
      <MissionTracker />
      <OutreachTracker />
      <BusinessRoadmap />
    </div>
  )
}
