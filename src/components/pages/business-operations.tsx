'use client'

import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react'
import { useAppStore, type FollowupEntry } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  X,
  History,
  Trash2,
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
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
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
      className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-6 lg:p-8"
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
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[11px] text-primary/70 uppercase tracking-widest font-medium">Mission Control</span>
            </div>
            <h1 className="gold-text text-3xl lg:font-display text-4xl font-bold tracking-tight">
              {formatINR(monthlyTarget)} Mission
            </h1>
            <p className="text-muted-foreground/60 text-sm mt-1">Revenue growth headquarters — every rupee counts</p>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl border',
            isTargetHit
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-primary/10 border-primary/20 text-amber-400'
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
            className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-4"
          >
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-1">Earned This Month</p>
            <p className="gold-text font-display text-2xl font-bold">{formatINR(monthlyIncome)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-4"
          >
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-1">Target</p>
            <p className="text-foreground/80 font-display text-2xl font-bold">{formatINR(monthlyTarget)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-4"
          >
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-1">Remaining</p>
            <p className={cn(
              'font-display text-2xl font-bold',
              remaining > 0 ? 'text-amber-400' : 'text-emerald-400'
            )}>
              {remaining > 0 ? formatINR(remaining) : 'Done! ✓'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-4"
          >
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-1">Required / Day</p>
            <p className={cn(
              'font-display text-2xl font-bold',
              requiredDaily > 0 ? 'text-foreground/80' : 'text-emerald-400'
            )}>
              {remaining > 0 ? `${formatINR(Math.round(requiredDaily))}` : '—'}
            </p>
            <p className="text-muted-foreground/60 text-[10px] mt-0.5">{daysLeft} days left</p>
          </motion.div>
        </div>

        {/* Cinematic Progress Bar */}
        <div className="relative">
          <div className="w-full h-4 bg-secondary/50 rounded-full overflow-hidden relative">
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
                    isReached ? 'bg-amber-400/60' : 'bg-accent'
                  )} />
                  {/* Label */}
                  <span className={cn(
                    'text-[9px] font-medium mt-0.5',
                    isReached ? 'text-amber-400' : 'text-muted-foreground/40'
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
  const { followups, clients, outreachRecords, removeOutreachRecord } = useAppStore()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [logType, setLogType] = useState('')
  const [contactName, setContactName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [logNotes, setLogNotes] = useState('')
  
  // History Inspect Modal State
  const [inspectCategory, setInspectCategory] = useState<string | null>(null)

  const openLogModal = (type: string) => {
    setLogType(type)
    setContactName('')
    setPhoneNumber('')
    setLogNotes('')
    setModalOpen(true)
  }

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName.trim()) return

    try {
      const res = await fetch('/api/outreach-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          platform: 'direct',
          type: logType,
          status: 'completed',
          notes: logNotes.trim() || undefined,
          date: new Date().toISOString(),
          projectValue: 0
        }),
      })

      if (res.ok) {
        const newLog = await res.json()
        useAppStore.getState().addOutreachRecord(newLog)
        setModalOpen(false)
        toast.success(`Logged ${logType}!`)
      } else {
        throw new Error('Failed to log outreach record')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to log outreach record')
    }
  }

  // Calculate counts from actual outreach records (this week)
  const outreachCounts = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const thisWeekRecords = outreachRecords.filter(r => {
      const d = new Date(r.date)
      return d >= weekAgo
    })

    return {
      dm: thisWeekRecords.filter(r => r.type === 'dm').length,
      call: thisWeekRecords.filter(r => r.type === 'call').length,
      proposal: thisWeekRecords.filter(r => r.type === 'proposal').length +
        clients.filter(c => c.pipelineStage === 'proposal').length,
      meeting: thisWeekRecords.filter(r => r.type === 'meeting').length,
      close: clients.filter(c => c.pipelineStage === 'completed').length,
    }
  }, [outreachRecords, clients])

  // ── Weekly Outreach Streak Calculation ──
  // Count how many consecutive weeks (ending this week or last week) the user logged outreach records
  const weeklyStreak = useMemo(() => {
    if (outreachRecords.length === 0) return 0

    // Group records into 7-day weekly buckets starting from today
    // Week 0: 0-6 days ago, Week 1: 7-13 days ago, etc.
    const recordsByWeek: Record<number, number> = {}
    const now = new Date()

    outreachRecords.forEach(r => {
      const recordDate = new Date(r.date)
      const diffTime = Math.abs(now.getTime() - recordDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor((diffDays - 1) / 7)
      recordsByWeek[weekIndex] = (recordsByWeek[weekIndex] || 0) + 1
    })

    // If no outreach in both Week 0 and Week 1, streak is 0
    if ((recordsByWeek[0] || 0) === 0 && (recordsByWeek[1] || 0) === 0) {
      return 0
    }

    // Start checking from Week 0 if they have activity this week, otherwise Week 1
    let currentStreak = 0
    const startWeek = (recordsByWeek[0] || 0) > 0 ? 0 : 1

    for (let w = startWeek; w < 52; w++) {
      if ((recordsByWeek[w] || 0) > 0) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  }, [outreachRecords])

  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/outreach-records?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        removeOutreachRecord(id)
        toast.success('Log removed')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete log')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Rocket className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Outreach Tracker</h2>
            <p className="text-muted-foreground/60 text-[10px]">Daily & weekly execution metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">{weeklyStreak} Wk Streak</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/5 border border-primary/10">
            <span className="text-[10px] text-primary/70 uppercase tracking-wider">This Week</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {outreachMetrics.map((metric, index) => {
          const count = outreachCounts[metric.key as keyof typeof outreachCounts] || 0
          const weeklyProgress = metric.weeklyTarget > 0 ? Math.min(100, (count / metric.weeklyTarget) * 100) : 0
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
                'bg-card lg:bg-card/60 border rounded-xl p-4 hover:border-border transition-all duration-300 relative overflow-hidden group',
                isHittingWeekly ? 'border-primary/30' : 'border-border'
              )}
            >
              {/* Ambient glow for hitting targets */}
              {isHittingWeekly && (
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl opacity-10 bg-amber-500" />
              )}

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
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
                    <span className="text-foreground font-display text-2xl font-bold">{count}</span>
                    <span className="text-muted-foreground/60 text-xs">/ {metric.weeklyTarget}</span>
                  </div>
                  <p className={cn('text-xs font-medium uppercase tracking-wider', metric.color)}>
                    {metric.label}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden mt-3">
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
                    <p className="text-muted-foreground/40 text-[9px] mt-1.5">
                      Daily: {metric.dailyTarget} · Weekly: {metric.weeklyTarget}
                    </p>
                  )}
                  {metric.dailyTarget === 0 && (
                    <p className="text-muted-foreground/40 text-[9px] mt-1.5">
                      Weekly target: {metric.weeklyTarget}
                    </p>
                  )}
                </div>

                {/* Card Control Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => openLogModal(metric.key)}
                    disabled={isLoading}
                    className="h-8 text-[10px] text-muted-foreground hover:text-amber-400 hover:bg-primary/10 border border-border hover:border-primary/20 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setInspectCategory(metric.key)}
                    className="h-8 text-[10px] text-muted-foreground hover:text-amber-400 hover:bg-primary/10 border border-border hover:border-primary/20 transition-all flex items-center justify-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" /> History
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Log Entry Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-secondary border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground tracking-tight">Log {logType.toUpperCase()}</h3>
                <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground ml-1">Contact Name</label>
                  <Input 
                    required 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    placeholder="Enter name..." 
                    className="bg-secondary/50 border-border text-foreground" 
                  />
                </div>

                {logType === 'call' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground ml-1">Phone Number</label>
                    <Input 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)} 
                      placeholder="Enter phone number..." 
                      className="bg-secondary/50 border-border text-foreground" 
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground ml-1">Notes (Optional)</label>
                  <Input 
                    value={logNotes} 
                    onChange={e => setLogNotes(e.target.value)} 
                    placeholder="Any quick notes..." 
                    className="bg-secondary/50 border-border text-foreground" 
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10">
                    Save Record
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric History Inspect Modal */}
      <AnimatePresence>
        {inspectCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-secondary border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight capitalize">{inspectCategory} Outreach History</h3>
                  <p className="text-muted-foreground text-xs">All registered {inspectCategory} outreach attempts</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setInspectCategory(null)} className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {outreachRecords.filter(r => r.type === inspectCategory).length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground/60 text-sm">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    No logs found for {inspectCategory}.
                  </div>
                ) : (
                  outreachRecords
                    .filter(r => r.type === inspectCategory)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:bg-secondary/60 transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground/80 text-sm font-semibold truncate">{log.contactName}</span>
                            {log.phoneNumber && (
                              <span className="text-muted-foreground text-xs truncate">({log.phoneNumber})</span>
                            )}
                          </div>
                          {log.notes && (
                            <p className="text-muted-foreground text-xs mt-1 truncate">{log.notes}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/40 mt-1">
                            {new Date(log.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLog(log.id)}
                          className="w-8 h-8 text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Flag className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Business Roadmap</h2>
            <p className="text-muted-foreground/60 text-[10px]">7-month empire building plan</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary/30 border border-border">
          <Milestone className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Month {currentMonthIndex + 1}</span>
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
                    ? 'bg-primary/20 border-2 border-amber-400 shadow-[0_0_20px_rgba(212,168,73,0.2)]'
                    : isCompleted
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : 'bg-secondary/50 border border-border'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrentMonth ? (
                    <Flame className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className="text-muted-foreground/60 text-xs font-bold">{month.month}</span>
                  )}
                </div>

                {/* Card */}
                <div className={cn(
                  'bg-card lg:bg-card/60 border rounded-2xl p-4 transition-all duration-300 hover:bg-secondary/60',
                  isCurrentMonth
                    ? 'border-primary/30 shadow-[0_0_30px_rgba(212,168,73,0.08)]'
                    : 'border-border hover:border-border'
                )}>
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-xs font-bold uppercase tracking-wider',
                        isCurrentMonth ? 'text-amber-400' : isCompleted ? 'text-emerald-400/70' : 'text-muted-foreground'
                      )}>
                        Month {month.month}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-amber-400 border border-primary/20 font-medium">
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
                      isCurrentMonth ? 'gold-text' : isCompleted ? 'text-emerald-400/70' : 'text-muted-foreground'
                    )}>
                      {formatINR(month.target)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className={cn(
                    'text-sm font-semibold mb-2',
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {month.title}
                  </h4>

                  {/* Focus strategy */}
                  <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                    {month.focus}
                  </p>

                  {/* Progress bar for current month */}
                  {isCurrentMonth && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Revenue Progress</span>
                        <span className="text-amber-400 text-[10px] font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
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
                    <div className="bg-secondary/30 rounded-lg p-2.5 border border-white/[0.03]">
                      <p className="text-muted-foreground/40 font-mono text-[9px] uppercase tracking-wider mb-1">Outreach</p>
                      <p className="text-muted-foreground text-[11px] leading-snug">{month.outreach}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2.5 border border-white/[0.03]">
                      <p className="text-muted-foreground/40 font-mono text-[9px] uppercase tracking-wider mb-1">Systems</p>
                      <p className="text-muted-foreground text-[11px] leading-snug">{month.systems}</p>
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
