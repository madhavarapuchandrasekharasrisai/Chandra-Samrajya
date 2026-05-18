'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Target, AlertTriangle, Clock, Zap, ChevronRight,
  IndianRupee, Flame, XCircle, Shield, Crosshair,
  Skull, ArrowUpRight, Users, Send, Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function daysLeftInMonth(): number {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  return lastDay - now.getDate() + 1
}

const CATEGORIES = [
  { key: 'personal', label: 'Personal', color: '#d4a849' },
  { key: 'savings', label: 'Savings', color: '#10b981' },
  { key: 'business', label: 'Business', color: '#3b82f6' },
  { key: 'skills', label: 'Skills', color: '#a855f7' },
  { key: 'fun', label: 'Fun', color: '#f43f5e' },
] as const

// ─── Red Pulse Animation Component ──────────────────────────────────────────

function RedPulse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 rounded-xl animate-ping bg-red-500/10" style={{ animationDuration: '2s' }} />
      {children}
    </div>
  )
}

// ─── Mission Stat ────────────────────────────────────────────────────────────

function MissionStat({
  label,
  value,
  sub,
  accent,
  delay,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'gold' | 'red' | 'amber' | 'white'
  delay: number
}) {
  const accentColors = {
    gold: 'text-amber-400',
    red: 'text-red-400',
    amber: 'text-amber-500',
    white: 'text-white/90',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-black/60 border border-white/[0.04] rounded-xl p-5 text-center relative overflow-hidden group"
    >
      {/* Scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <p className="text-white/25 text-[10px] uppercase tracking-widest mb-2">{label}</p>
      <p className={cn('text-3xl lg:text-4xl font-black tracking-tight', accent ? accentColors[accent] : 'text-white/90')}>
        {value}
      </p>
      {sub && <p className="text-white/20 text-[10px] mt-1 uppercase tracking-wider">{sub}</p>}
    </motion.div>
  )
}

// ─── Urgent Action Card ─────────────────────────────────────────────────────

function UrgentActionCard({
  type,
  title,
  subtitle,
  actionLabel,
  delay,
}: {
  type: 'overdue' | 'high-urgency' | 'over-budget' | 'expiring'
  title: string
  subtitle: string
  actionLabel: string
  delay: number
}) {
  const config = {
    overdue: { borderColor: 'border-red-500/30', dotColor: 'bg-red-400', bgGlow: 'shadow-red-500/5', icon: Clock },
    'high-urgency': { borderColor: 'border-amber-500/20', dotColor: 'bg-amber-400', bgGlow: 'shadow-amber-500/5', icon: AlertTriangle },
    'over-budget': { borderColor: 'border-red-500/20', dotColor: 'bg-red-400', bgGlow: 'shadow-red-500/5', icon: XCircle },
    expiring: { borderColor: 'border-amber-500/20', dotColor: 'bg-amber-400', bgGlow: 'shadow-amber-500/5', icon: Clock },
  }
  const c = config[type]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'bg-black/60 border rounded-xl p-4 flex items-center gap-3 group hover:bg-black/80 transition-all',
        c.borderColor,
        type === 'overdue' && 'shadow-lg',
      )}
    >
      {type === 'overdue' ? (
        <RedPulse className="flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-400" />
        </RedPulse>
      ) : (
        <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', c.dotColor)} />
      )}
      <Icon className={cn('w-4 h-4 flex-shrink-0', type === 'overdue' ? 'text-red-400' : 'text-amber-400')} />
      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm font-medium truncate">{title}</p>
        <p className="text-white/25 text-xs truncate">{subtitle}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'text-xs h-8 px-3 flex-shrink-0 font-semibold border',
          type === 'overdue'
            ? 'text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300'
            : 'text-amber-400 border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-300'
        )}
      >
        {actionLabel}
        <ChevronRight className="w-3 h-3 ml-0.5" />
      </Button>
    </motion.div>
  )
}

// ─── Opportunity Card ────────────────────────────────────────────────────────

function OpportunityCard({
  name,
  projectValue,
  pipelineStage,
  closeProbability,
  index,
}: {
  name: string
  projectValue: number
  pipelineStage: string
  closeProbability: number
  index: number
}) {
  const probColor = closeProbability >= 60 ? 'text-emerald-400' : closeProbability >= 30 ? 'text-amber-400' : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.06 }}
      className="bg-black/60 border border-white/[0.04] rounded-xl p-4 hover:border-amber-500/15 transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">{index + 1}</span>
          </div>
          <div>
            <p className="text-white/80 text-sm font-semibold">{name}</p>
            <p className="text-white/25 text-[10px] uppercase tracking-wider">{pipelineStage}</p>
          </div>
        </div>
        <span className="gold-text text-lg font-bold">{formatINR(projectValue)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white/20 text-[10px] uppercase tracking-wider">Close Probability</span>
          <span className={cn('text-sm font-bold', probColor)}>{closeProbability}%</span>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-xs h-8 px-4 rounded-lg shadow-lg shadow-amber-500/20"
        >
          <Crosshair className="w-3 h-3 mr-1" />
          Execute
        </Button>
      </div>

      {/* Probability bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${closeProbability}%` }}
          transition={{ duration: 0.8, delay: 0.5 + index * 0.06 }}
          className={cn(
            'h-full rounded-full',
            closeProbability >= 60 ? 'bg-emerald-400' : closeProbability >= 30 ? 'bg-amber-400' : 'bg-red-400'
          )}
        />
      </div>
    </motion.div>
  )
}

// ─── Risk Card ───────────────────────────────────────────────────────────────

function RiskCard({
  type,
  description,
  severity,
  index,
}: {
  type: 'over-budget' | 'below-target' | 'missing-outreach' | 'idle-client'
  description: string
  severity: 'critical' | 'high' | 'medium'
  index: number
}) {
  const severityConfig = {
    critical: { icon: Skull, color: 'text-red-400', bg: 'bg-red-500/5 border-red-500/15', label: 'CRITICAL' },
    high: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/15', label: 'HIGH' },
    medium: { icon: Shield, color: 'text-amber-500/70', bg: 'bg-white/[0.02] border-white/[0.04]', label: 'MEDIUM' },
  }
  const c = severityConfig[severity]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 + index * 0.06 }}
      className={cn('border rounded-xl p-4', c.bg)}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', c.color)} />
        <span className={cn('text-[10px] font-bold uppercase tracking-wider', c.color)}>{c.label}</span>
      </div>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function WarRoom() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups } = useAppStore()
  const now = new Date()
  const daysLeft = daysLeftInMonth()
  const targetRemaining = Math.max(0, monthlyTarget - monthlyIncome)
  const requiredDaily = daysLeft > 0 ? targetRemaining / daysLeft : 0

  // Conversion rate
  const conversionRate = useMemo(() => {
    const completedClients = clients.filter(c => c.pipelineStage === 'completed').length
    const totalClients = clients.length
    return totalClients > 0 ? ((completedClients / totalClients) * 100) : 0
  }, [clients])

  // ── Urgent Actions ──
  const urgentActions = useMemo(() => {
    const actions: Array<{ type: 'overdue' | 'high-urgency' | 'over-budget' | 'expiring'; title: string; subtitle: string; actionLabel: string }> = []

    // Overdue followups
    const todayStr = now.toISOString().split('T')[0]
    const overdueFollowups = followups.filter(f => f.dueDate < todayStr && f.status !== 'completed')
    overdueFollowups.slice(0, 3).forEach(f => {
      actions.push({
        type: 'overdue',
        title: f.clientName || 'Unknown Client',
        subtitle: `Overdue followup — ${f.type}${f.note ? ': ' + f.note : ''}`,
        actionLabel: 'Follow Up',
      })
    })

    // High urgency clients
    const urgentClients = clients.filter(c => c.urgencyLevel === 'critical' && c.pipelineStage !== 'completed')
    urgentClients.slice(0, 2).forEach(c => {
      actions.push({
        type: 'high-urgency',
        title: c.name,
        subtitle: `Critical client — Stage: ${c.pipelineStage}`,
        actionLabel: 'Engage',
      })
    })

    // Over-budget categories
    const overBudgetCats = CATEGORIES.filter(cat => {
      const alloc = budgetAllocation[cat.key as keyof typeof budgetAllocation]
      return alloc.budget > 0 && alloc.spent > alloc.budget
    })
    overBudgetCats.forEach(cat => {
      const alloc = budgetAllocation[cat.key as keyof typeof budgetAllocation]
      actions.push({
        type: 'over-budget',
        title: `${cat.label} Over Budget`,
        subtitle: `Spent ${formatINR(alloc.spent)} of ${formatINR(alloc.budget)} — ${formatINR(alloc.spent - alloc.budget)} over`,
        actionLabel: 'Review',
      })
    })

    // Pending proposals (expiring soon = any proposal)
    const proposalClients = clients.filter(c => c.pipelineStage === 'proposal')
    proposalClients.slice(0, 2).forEach(c => {
      actions.push({
        type: 'expiring',
        title: c.name,
        subtitle: `Proposal pending — ${formatINR(c.projectValue)} at stake`,
        actionLabel: 'Close',
      })
    })

    return actions
  }, [followups, clients, budgetAllocation, now])

  // ── High-Value Opportunities ──
  const topOpportunities = useMemo(() => {
    return clients
      .filter(c => c.pipelineStage !== 'completed')
      .sort((a, b) => b.projectValue - a.projectValue)
      .slice(0, 5)
  }, [clients])

  // ── Critical Risks ──
  const criticalRisks = useMemo(() => {
    const risks: Array<{ type: 'over-budget' | 'below-target' | 'missing-outreach' | 'idle-client'; description: string; severity: 'critical' | 'high' | 'medium' }> = []

    // Over-budget categories
    CATEGORIES.forEach(cat => {
      const alloc = budgetAllocation[cat.key as keyof typeof budgetAllocation]
      if (alloc.budget > 0 && alloc.spent > alloc.budget * 1.1) {
        risks.push({
          type: 'over-budget',
          description: `${cat.label} is ${((alloc.spent / alloc.budget - 1) * 100).toFixed(0)}% over budget at ${formatINR(alloc.spent)}. This threatens your overall financial plan.`,
          severity: alloc.spent > alloc.budget * 1.3 ? 'critical' : 'high',
        })
      }
    })

    // Revenue streams below target
    if (monthlyIncome < monthlyTarget * 0.5 && daysLeft <= 15) {
      risks.push({
        type: 'below-target',
        description: `Revenue is only ${((monthlyIncome / monthlyTarget) * 100).toFixed(0)}% of target with ${daysLeft} days left. Need ${formatINR(requiredDaily)}/day to hit target.`,
        severity: 'critical',
      })
    } else if (monthlyIncome < monthlyTarget * 0.7) {
      risks.push({
        type: 'below-target',
        description: `Revenue at ${((monthlyIncome / monthlyTarget) * 100).toFixed(0)}% of target. Acceleration required to close the gap.`,
        severity: 'high',
      })
    }

    // Missing outreach
    const activeFollowups = followups.filter(f => f.status !== 'completed').length
    if (activeFollowups < 3) {
      risks.push({
        type: 'missing-outreach',
        description: `Only ${activeFollowups} active followups in pipeline. Need at least 10 for healthy conversion. Outreach is critically low.`,
        severity: activeFollowups === 0 ? 'critical' : 'high',
      })
    }

    // Idle clients (no contact in 7+ days)
    const idleClients = clients.filter(c => {
      if (c.pipelineStage === 'completed') return false
      if (!c.lastContact) return true
      const lastContact = new Date(c.lastContact)
      const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 7
    })
    if (idleClients.length > 0) {
      risks.push({
        type: 'idle-client',
        description: `${idleClients.length} client${idleClients.length > 1 ? 's' : ''} with no contact in 7+ days: ${idleClients.map(c => c.name).join(', ')}. Risk of losing pipeline momentum.`,
        severity: idleClients.length >= 3 ? 'critical' : 'high',
      })
    }

    // If no risks
    if (risks.length === 0) {
      risks.push({
        type: 'missing-outreach',
        description: 'No critical risks identified. Maintain current pace and discipline.',
        severity: 'medium',
      })
    }

    return risks
  }, [budgetAllocation, monthlyIncome, monthlyTarget, daysLeft, requiredDaily, followups, clients, now])

  return (
    <div className="space-y-6 bg-[#050506] -m-4 lg:-m-6 p-4 lg:p-6 min-h-screen">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — War Room
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden border border-red-500/10 rounded-2xl p-6 bg-gradient-to-br from-red-500/[0.04] via-black/80 to-black/90"
      >
        {/* Red scan line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-red-500/5 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <Crosshair className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-red-400/60 text-xs uppercase tracking-widest">High-Pressure Execution Mode</p>
              <h1 className="text-white/90 text-3xl lg:text-4xl font-black tracking-tight">WAR ROOM</h1>
            </div>
            {urgentActions.filter(a => a.type === 'overdue').length > 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">
                  {urgentActions.filter(a => a.type === 'overdue').length} OVERDUE
                </span>
              </div>
            )}
          </div>
          <p className="text-white/20 text-sm">Execute. No distractions. Close the gap.</p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Mission Status
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MissionStat
          label="Target Remaining"
          value={formatINR(targetRemaining)}
          sub={targetRemaining === 0 ? 'TARGET HIT' : undefined}
          accent={targetRemaining === 0 ? 'gold' : 'red'}
          delay={0.1}
        />
        <MissionStat
          label="Days Left"
          value={daysLeft.toString()}
          sub="in current month"
          accent={daysLeft <= 7 ? 'red' : 'amber'}
          delay={0.15}
        />
        <MissionStat
          label="Required Daily"
          value={formatINR(Math.round(requiredDaily))}
          sub="revenue needed/day"
          accent={requiredDaily > monthlyTarget / 20 ? 'red' : 'amber'}
          delay={0.2}
        />
        <MissionStat
          label="Conversion Rate"
          value={`${conversionRate.toFixed(0)}%`}
          sub="client close rate"
          accent={conversionRate >= 30 ? 'gold' : conversionRate >= 15 ? 'amber' : 'red'}
          delay={0.25}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Urgent Actions
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-black/60 border border-white/[0.04] rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <Flame className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-white/80 text-sm font-semibold">Urgent Actions</h3>
          <span className="text-red-400/60 text-[10px] uppercase tracking-wider ml-auto">
            {urgentActions.length} critical
          </span>
        </div>

        {urgentActions.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {urgentActions.map((action, idx) => (
              <UrgentActionCard
                key={idx}
                type={action.type}
                title={action.title}
                subtitle={action.subtitle}
                actionLabel={action.actionLabel}
                delay={0.35 + idx * 0.05}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-8 h-8 text-emerald-400/20 mx-auto mb-2" />
            <p className="text-white/30 text-sm">All clear — no urgent actions</p>
          </div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — High-Value Opportunities
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="bg-black/60 border border-white/[0.04] rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white/80 text-sm font-semibold">High-Value Opportunities</h3>
            <p className="text-white/20 text-[10px]">Top 5 clients by project value — not yet closed</p>
          </div>
        </div>

        {topOpportunities.length > 0 ? (
          <div className="space-y-3">
            {topOpportunities.map((client, idx) => (
              <OpportunityCard
                key={client.id}
                name={client.name}
                projectValue={client.projectValue}
                pipelineStage={client.pipelineStage}
                closeProbability={client.closeProbability}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-sm">No active opportunities in pipeline</p>
            <p className="text-white/15 text-xs mt-1">Add clients to start tracking high-value deals</p>
          </div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — Critical Risks
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-black/60 border border-white/[0.04] rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-white/80 text-sm font-semibold">Critical Risks</h3>
            <p className="text-white/20 text-[10px]">Threats that could prevent hitting target</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {criticalRisks.map((risk, idx) => (
            <RiskCard
              key={idx}
              type={risk.type}
              description={risk.description}
              severity={risk.severity}
              index={idx}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom tactical bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex items-center justify-center gap-6 py-4 border-t border-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-white/20 text-[10px] uppercase tracking-widest">War Room Active</span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-3 h-3 text-amber-400/40" />
          <span className="text-white/20 text-[10px] uppercase tracking-widest">
            {formatINR(monthlyIncome)} / {formatINR(monthlyTarget)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-white/20" />
          <span className="text-white/20 text-[10px] uppercase tracking-widest">{daysLeft} days remaining</span>
        </div>
      </motion.div>
    </div>
  )
}
