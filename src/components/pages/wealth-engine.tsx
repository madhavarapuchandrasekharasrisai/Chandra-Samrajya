'use client'

import { useAppStore, type IncomeEntry } from '@/store/use-app-store'
import { cn, formatIndianCommas } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, BarChart, Bar, CartesianGrid } from 'recharts'
import { TrendingUp, TrendingDown, IndianRupee, Plus, Trash2, DollarSign, Globe, Bot, Users, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

// ─── Constants & Types ─────────────────────────────────────────────────────

const INCOME_SOURCES = [
  { key: 'Social Media Websites', label: 'Social Media Websites', icon: Globe, color: 'sky-400', hex: '#38bdf8', target: 15000 },
  { key: 'AI Automation', label: 'AI Automation', icon: Bot, color: 'amber-400', hex: '#fbbf24', target: 40000 },
  { key: 'Retainer Clients', label: 'Retainer Clients', icon: Users, color: 'emerald-400', hex: '#34d399', target: 25000 },
  { key: 'International Freelance', label: 'International Freelance', icon: Briefcase, color: 'purple-400', hex: '#c084fc', target: 20000 },
] as const

const ITEMS_PER_PAGE = 10

type SortField = 'date' | 'amount'
type SortDir = 'asc' | 'desc'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1)
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
}

/** Generate real monthly data for previous months (for charts) */
function generateMockMonthlyData(incomes: IncomeEntry[]) {
  const now = new Date()
  const months: { month: string; revenue: number }[] = []

  // Generate last 6 months including current
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthKey(d)
    const monthIncomes = incomes.filter(inc => {
      const incDate = new Date(inc.date)
      return incDate.getFullYear() === d.getFullYear() && incDate.getMonth() === d.getMonth()
    })
    const realRevenue = monthIncomes.reduce((s, inc) => s + inc.amount, 0)
    months.push({ month: key, revenue: realRevenue })
  }
  return months
}

/** Generate daily trend data for a specific source this month */
function generateDailyTrend(incomes: IncomeEntry[], source: string) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dailyMap: Record<number, number> = {}

  // Aggregate real data by day
  incomes
    .filter(i => i.source === source)
    .forEach(i => {
      const d = new Date(i.date)
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        dailyMap[d.getDate()] = (dailyMap[d.getDate()] || 0) + i.amount
      }
    })

  // Build daily array
  const result: { day: string; value: number }[] = []
  for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
    result.push({
      day: String(d),
      value: dailyMap[d] || 0,
    })
  }

  return result
}

/** Generate cumulative daily income for velocity chart */
function generateCumulativeDaily(incomes: IncomeEntry[]) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const dailyMap: Record<number, number> = {}

  const monthIncomes = incomes.filter(i => {
    const d = new Date(i.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  monthIncomes.forEach(i => {
    const d = new Date(i.date)
    dailyMap[d.getDate()] = (dailyMap[d.getDate()] || 0) + i.amount
  })

  let cumulative = 0
  const result: { day: string; cumulative: number }[] = []
  for (let d = 1; d <= Math.min(now.getDate(), daysInMonth); d++) {
    cumulative += dailyMap[d] || 0
    result.push({ day: String(d), cumulative })
  }

  return result
}

/** Generate stream comparison data for bar chart */
function generateStreamComparison(incomes: IncomeEntry[]) {
  const now = new Date()
  const monthIncomes = incomes.filter(i => {
    const d = new Date(i.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const state = useAppStore.getState()
  const getSourceLabel = (key: string) => {
    if (key === 'Social Media Websites') return state.nameSocialMedia || 'Social Media Websites'
    if (key === 'AI Automation') return state.nameAIAutomation || 'AI Automation'
    if (key === 'Retainer Clients') return state.nameRetainer || 'Retainer Clients'
    if (key === 'International Freelance') return state.nameFreelance || 'International Freelance'
    return key
  }

  const dynamicSources = [
    { key: 'Social Media Websites', label: getSourceLabel('Social Media Websites'), icon: Globe, color: 'sky-400', hex: '#38bdf8', target: state.targetSocialMedia },
    { key: 'AI Automation', label: getSourceLabel('AI Automation'), icon: Bot, color: 'amber-400', hex: '#fbbf24', target: state.targetAIAutomation },
    { key: 'Retainer Clients', label: getSourceLabel('Retainer Clients'), icon: Users, color: 'emerald-400', hex: '#34d399', target: state.targetRetainer },
    { key: 'International Freelance', label: getSourceLabel('International Freelance'), icon: Briefcase, color: 'purple-400', hex: '#c084fc', target: state.targetFreelance },
  ]

  return dynamicSources.map(src => {
    const revenue = monthIncomes
      .filter(i => i.source === src.key)
      .reduce((s, i) => s + i.amount, 0)

    // Truncate name if too long for chart label
    const displayName = src.label.length > 15 ? src.label.slice(0, 15) + '...' : src.label;

    return {
      source: displayName,
      revenue: revenue,
      target: src.target,
      fill: src.hex,
    }
  })
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card backdrop-blur-xl border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{ color: entry.color || '#d4a849' }} className="font-semibold">
          {entry.name}: {formatINR(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Section 1: Monthly Income Header ──────────────────────────────────────

function MonthlyIncomeHeader({ monthlyIncome, incomes }: { monthlyIncome: number; incomes: IncomeEntry[] }) {
  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const prevMonthIncome = useMemo(() => {
    return incomes
      .filter(i => {
        const d = new Date(i.date)
        return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear()
      })
      .reduce((s, i) => s + i.amount, 0)
  }, [incomes, prevMonth])

  const growthPercent = prevMonthIncome > 0
    ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-6 lg:p-8"
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
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">This Month Revenue</p>
            <h1 className="gold-text text-4xl lg:text-5xl font-bold tracking-tight">
              {formatINR(monthlyIncome)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {growthPercent !== null ? (
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl border',
                growthPercent >= 0
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              )}>
                {growthPercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">{Math.abs(growthPercent).toFixed(1)}%</span>
                <span className="text-xs opacity-60">vs last month</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/50 border border-border text-muted-foreground">
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="text-xs">First month tracking</span>
              </div>
            )}
          </div>
        </div>

        {/* Revenue bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider">Monthly Target Progress</span>
            <span className="text-amber-400/60 text-xs font-medium">
              {monthlyIncome > 0 ? ((monthlyIncome / 100000) * 100).toFixed(1) : '0'}% of ₹1,00,000
            </span>
          </div>
          <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (monthlyIncome / 100000) * 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section 2: Income Stream Card ─────────────────────────────────────────

function IncomeStreamCard({
  source,
  incomes,
  delay,
  onTargetChange,
  onNameChange,
}: {
  source: typeof INCOME_SOURCES[number]
  incomes: IncomeEntry[]
  delay: number
  onTargetChange?: (key: string, value: number) => void
  onNameChange?: (key: string, value: string) => void
}) {
  const {
    targetSocialMedia, targetAIAutomation, targetRetainer, targetFreelance,
    nameSocialMedia, nameAIAutomation, nameRetainer, nameFreelance
  } = useAppStore()

  const target = useMemo(() => {
    if (source.key === 'Social Media Websites') return targetSocialMedia
    if (source.key === 'AI Automation') return targetAIAutomation
    if (source.key === 'Retainer Clients') return targetRetainer
    if (source.key === 'International Freelance') return targetFreelance
    return (source as any).target
  }, [source.key, targetSocialMedia, targetAIAutomation, targetRetainer, targetFreelance])

  const label = useMemo(() => {
    const labels: Record<(typeof INCOME_SOURCES)[number]['key'], string> = {
      'Social Media Websites': nameSocialMedia || 'Social Media Websites',
      'AI Automation': nameAIAutomation || 'AI Automation',
      'Retainer Clients': nameRetainer || 'Retainer Clients',
      'International Freelance': nameFreelance || 'International Freelance',
    }
    return labels[source.key]
  }, [source.key, nameSocialMedia, nameAIAutomation, nameRetainer, nameFreelance])

  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const currentRevenue = useMemo(() => {
    return incomes
      .filter(i => i.source === source.key)
      .filter(i => {
        const d = new Date(i.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, i) => s + i.amount, 0)
  }, [incomes, source.key, now])

  const prevRevenue = useMemo(() => {
    return incomes
      .filter(i => i.source === source.key)
      .filter(i => {
        const d = new Date(i.date)
        return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear()
      })
      .reduce((s, i) => s + i.amount, 0)
  }, [incomes, source.key, prevMonth])

  const growthPercent = prevRevenue > 0
    ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
    : currentRevenue > 0 ? 100 : null

  const activeProjects = useMemo(() => {
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && i.source === source.key
    })
    const uniqueClients = new Set(monthIncomes.map(i => i.clientName).filter(Boolean))
    return uniqueClients.size || (currentRevenue > 0 ? 1 : 0)
  }, [incomes, source.key, currentRevenue, now])

  const projectedMonthEnd = currentRevenue > 0
    ? Math.round((currentRevenue / now.getDate()) * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())
    : 0

  const dailyTrend = useMemo(() => generateDailyTrend(incomes, source.key), [incomes, source.key])

  const progressPercent = target > 0 ? Math.min(100, (currentRevenue / target) * 100) : 0

  const Icon = source.icon

  // Color maps
  const borderColorMap: Record<string, string> = {
    'sky-400': 'border-t-sky-400/60',
    'amber-400': 'border-t-amber-400/60',
    'emerald-400': 'border-t-emerald-400/60',
    'purple-400': 'border-t-purple-400/60',
  }
  const iconBgMap: Record<string, string> = {
    'sky-400': 'bg-sky-400/10 text-sky-400',
    'amber-400': 'bg-primary/10 text-amber-400',
    'emerald-400': 'bg-emerald-400/10 text-emerald-400',
    'purple-400': 'bg-purple-400/10 text-purple-400',
  }
  const ambientBgMap: Record<string, string> = {
    'sky-400': 'bg-sky-500',
    'amber-400': 'bg-amber-500',
    'emerald-400': 'bg-emerald-500',
    'purple-400': 'bg-purple-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border border-t-2 rounded-2xl p-5 relative overflow-hidden group hover:border-border transition-all duration-300',
        borderColorMap[source.color]
      )}
    >
      {/* Ambient glow */}
      <div className={cn('absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-10', ambientBgMap[source.color])} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 z-10 w-full min-w-0">
          <div className={cn('p-2 rounded-lg shrink-0', iconBgMap[source.color])}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <input
              type="text"
              value={label}
              onChange={(e) => {
                onNameChange?.(source.key, e.target.value)
              }}
              placeholder="Stream Name"
              className="bg-transparent font-semibold text-foreground hover:border-b hover:border-white/20 focus:border-b focus:border-amber-400/50 text-sm outline-none w-full transition-all border-b border-transparent truncate"
            />
            <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
              <span className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider">Target: ₹</span>
              <input
                type="text"
                value={target === 0 ? '' : target.toLocaleString('en-IN')}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/[^0-9]/g, '')
                  const numVal = rawVal ? parseInt(rawVal) : 0
                  onTargetChange?.(source.key, numVal)
                }}
                className="bg-transparent border-b border-border hover:border-white/20 focus:border-b focus:border-amber-400/50 text-[10px] font-semibold text-muted-foreground focus:text-foreground outline-none w-16 px-0.5 transition-all"
              />
            </div>
          </div>
        </div>
        {growthPercent !== null && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium shrink-0',
            growthPercent >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          )}>
            {growthPercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growthPercent).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Revenue */}
      <div className="mb-3">
        <p className="gold-text font-display text-2xl font-bold">{formatINR(currentRevenue)}</p>
        <p className="text-muted-foreground/60 text-[10px] mt-0.5">this month</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: source.hex, opacity: 0.7 }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider">Active Projects</p>
          <p className="text-foreground/70 text-sm font-semibold">{activeProjects}</p>
        </div>
        <div>
          <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider">Projected</p>
          <p className="text-foreground/70 text-sm font-semibold">{formatINR(projectedMonthEnd)}</p>
        </div>
      </div>

      {/* Mini area chart */}
      {dailyTrend.length > 1 && (
        <div className="h-16 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrend} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id={`stream-${source.key.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={source.hex} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={source.hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={source.hex}
                strokeWidth={1.5}
                fill={`url(#stream-${source.key.replace(/\s/g, '')})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}

// ─── Section 3: Add Income Panel ───────────────────────────────────────────

function AddIncomePanel({ onAdded }: { onAdded: (income: IncomeEntry) => void }) {
  const { nameSocialMedia, nameAIAutomation, nameRetainer, nameFreelance } = useAppStore()
  const getSourceLabel = (key: string) => {
    if (key === 'Social Media Websites') return nameSocialMedia || 'Social Media Websites'
    if (key === 'AI Automation') return nameAIAutomation || 'AI Automation'
    if (key === 'Retainer Clients') return nameRetainer || 'Retainer Clients'
    if (key === 'International Freelance') return nameFreelance || 'International Freelance'
    return key
  }

  const [form, setForm] = useState({
    amount: '',
    source: '',
    clientName: '',
    description: '',
    date: getTodayStr(),
    status: 'received',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!form.amount || parseFloat(form.amount.replace(/,/g, '')) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!form.source) {
      toast.error('Please select an income source')
      return
    }
    if (!form.date) {
      toast.error('Please select a date')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount.replace(/,/g, '')) }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to add income')
      }

      const data = await res.json()
      onAdded(data)
      toast.success('Revenue added successfully')

      // Reset form
      setForm({
        amount: '',
        source: '',
        clientName: '',
        description: '',
        date: getTodayStr(),
        status: 'received',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add revenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Plus className="w-4 h-4 text-amber-400" />
        </div>
        <h3 className="text-foreground text-sm font-semibold">Add Revenue</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
              <Input
                type="text"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm(prev => ({ ...prev, amount: formatIndianCommas(e.target.value) }))}
                className="pl-9 bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Income Source</Label>
            <Select value={form.source} onValueChange={(val) => setForm(prev => ({ ...prev, source: val }))}>
              <SelectTrigger className="bg-secondary/60 border-border text-foreground focus:ring-amber-500/20">
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent className="bg-accent border-border">
                {INCOME_SOURCES.map(src => (
                  <SelectItem key={src.key} value={src.key} className="text-foreground/80 focus:bg-white/[0.06] focus:text-foreground">
                    {getSourceLabel(src.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Name */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Client Name <span className="text-muted-foreground/40">(optional)</span></Label>
            <Input
              placeholder="Enter client name"
              value={form.clientName}
              onChange={(e) => setForm(prev => ({ ...prev, clientName: e.target.value }))}
              className="bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-amber-500/20"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="bg-secondary/60 border-border text-foreground focus:border-primary/30 focus:ring-amber-500/20"
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Payment Status</Label>
            <Select value={form.status} onValueChange={(val) => setForm(prev => ({ ...prev, status: val }))}>
              <SelectTrigger className="bg-secondary/60 border-border text-foreground focus:ring-amber-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-accent border-border">
                <SelectItem value="received" className="text-foreground/80 focus:bg-white/[0.06] focus:text-foreground">Received</SelectItem>
                <SelectItem value="pending" className="text-foreground/80 focus:bg-white/[0.06] focus:text-foreground">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
            <Textarea
              placeholder="Add a note about this income..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="bg-secondary/60 border-border text-foreground placeholder:text-muted-foreground/40 focus:border-primary/30 focus:ring-amber-500/20 resize-none"
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
              <Plus className="w-4 h-4" />
              Add Revenue
            </span>
          )}
        </Button>
      </form>
    </motion.div>
  )
}

// ─── Section 4: Income Table ───────────────────────────────────────────────

function IncomeTable({
  incomes,
  onDelete,
}: {
  incomes: IncomeEntry[]
  onDelete: (id: string) => void
}) {
  const { nameSocialMedia, nameAIAutomation, nameRetainer, nameFreelance } = useAppStore()
  const getSourceLabel = (key: string) => {
    if (key === 'Social Media Websites') return nameSocialMedia || 'Social Media Websites'
    if (key === 'AI Automation') return nameAIAutomation || 'AI Automation'
    if (key === 'Retainer Clients') return nameRetainer || 'Retainer Clients'
    if (key === 'International Freelance') return nameFreelance || 'International Freelance'
    return key
  }

  const [searchSource, setSearchSource] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let data = [...incomes]

    // Filter by source
    if (searchSource !== 'all') {
      data = data.filter(i => i.source === searchSource)
    }

    // Sort
    data.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortField === 'date') {
        return dir * (new Date(a.date).getTime() - new Date(b.date).getTime())
      }
      return dir * (a.amount - b.amount)
    })

    return data
  }, [incomes, searchSource, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <h3 className="text-foreground text-sm font-semibold">Income Records</h3>
          <span className="text-muted-foreground/40 text-xs">({filtered.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={searchSource} onValueChange={(val) => { setSearchSource(val); setPage(1) }}>
            <SelectTrigger className="w-48 h-8 text-xs bg-secondary/60 border-border text-foreground/70 focus:ring-amber-500/20">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent className="bg-accent border-border">
              <SelectItem value="all" className="text-foreground/80 focus:bg-white/[0.06]">All Sources</SelectItem>
              {INCOME_SOURCES.map(src => (
                <SelectItem key={src.key} value={src.key} className="text-foreground/80 focus:bg-white/[0.06]">{getSourceLabel(src.key)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <IndianRupee className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground/60 text-sm">No income records yet</p>
          <p className="text-muted-foreground/30 text-xs mt-1">Add your first revenue entry above</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-5 px-5 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent pr-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th
                    className="text-left text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2 cursor-pointer hover:text-muted-foreground transition-colors"
                    onClick={() => toggleSort('date')}
                  >
                    Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2">Source</th>
                  <th className="text-left text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2">Client</th>
                  <th className="text-left text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2 hidden md:table-cell">Description</th>
                  <th
                    className="text-right text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2 cursor-pointer hover:text-muted-foreground transition-colors"
                    onClick={() => toggleSort('amount')}
                  >
                    Amount {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2">Status</th>
                  <th className="text-center text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((income) => {
                  const sourceConfig = INCOME_SOURCES.find(s => s.key === income.source)
                  return (
                    <tr
                      key={income.id}
                      className="border-b border-white/[0.03] hover:bg-secondary/30 transition-colors group"
                    >
                      <td className="py-3 px-2 text-muted-foreground text-xs whitespace-nowrap">
                        {new Date(income.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium',
                          sourceConfig?.color === 'sky-400' && 'bg-sky-400/10 text-sky-400 border-sky-400/20',
                          sourceConfig?.color === 'amber-400' && 'bg-primary/10 text-amber-400 border-primary/20',
                          sourceConfig?.color === 'emerald-400' && 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
                          sourceConfig?.color === 'purple-400' && 'bg-purple-400/10 text-purple-400 border-purple-400/20',
                          !sourceConfig && 'bg-secondary/50 text-muted-foreground border-border',
                        )}>
                          {getSourceLabel(income.source)}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-[120px] truncate">
                        {income.clientName || '—'}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs max-w-[180px] truncate hidden md:table-cell">
                        {income.description || '—'}
                      </td>
                      <td className="py-3 px-2 text-right text-primary font-semibold text-xs whitespace-nowrap">
                        {formatINR(income.amount)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider',
                          income.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-primary/10 text-amber-400 border-primary/20'
                        )}>
                          {income.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(income.id)}
                          className="h-7 w-7 p-0 text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-muted-foreground/60 text-xs">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className="h-7 px-2.5 text-muted-foreground hover:text-foreground/70 text-xs"
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(p)}
                    className={cn(
                      'h-7 w-7 p-0 text-xs',
                      p === page
                        ? 'bg-primary/20 text-amber-400 border border-primary/20'
                        : 'text-muted-foreground/60 hover:text-muted-foreground'
                    )}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  className="h-7 px-2.5 text-muted-foreground hover:text-foreground/70 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

// ─── Section 5: Revenue Analytics ──────────────────────────────────────────

function RevenueAnalytics({ incomes, monthlyIncome }: { incomes: IncomeEntry[]; monthlyIncome: number }) {
  const monthlyData = useMemo(() => generateMockMonthlyData(incomes), [incomes])
  const streamData = useMemo(() => generateStreamComparison(incomes), [incomes])
  const cumulativeData = useMemo(() => generateCumulativeDaily(incomes), [incomes])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-amber-400" />
        <h3 className="text-foreground text-sm font-semibold">Revenue Analytics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Growth Area Chart */}
        <div className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Monthly Growth</p>
              <p className="text-muted-foreground/60 text-[10px]">Last 6 months revenue trend</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary/70 font-mono text-[10px] uppercase tracking-wider">6 Months</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData.map(d => ({ ...d, month: getMonthLabel(d.month) }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a849" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#d4a849" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#d4a849" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#d4a849"
                  strokeWidth={2}
                  fill="url(#monthlyGradient)"
                  dot={{ r: 3, fill: '#d4a849', stroke: '#0a0a0c', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#d4a849', stroke: '#0a0a0c', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stream Comparison Bar Chart */}
        <div className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Stream Comparison</p>
              <p className="text-muted-foreground/60 text-[10px]">Revenue vs Target by source</p>
            </div>
            <div className="px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
              <span className="text-primary/70 font-mono text-[10px] uppercase tracking-wider">This Month</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a849" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d4a849" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="source"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="target" name="Target" fill="url(#barTarget)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="revenue" name="Revenue" fill="url(#barRevenue)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Velocity — full width */}
        <div className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-xs font-medium">Income Velocity</p>
              <p className="text-muted-foreground/60 text-[10px]">Cumulative daily income this month</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400/60 text-xs font-medium">{formatINR(monthlyIncome)} total</span>
              <div className="px-2 py-1 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-primary/70 font-mono text-[10px] uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e8c97a" stopOpacity={0.35} />
                    <stop offset="50%" stopColor="#d4a849" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#b8860b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="#e8c97a"
                  strokeWidth={2}
                  fill="url(#velocityGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#e8c97a', stroke: '#0a0a0c', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function WealthEngine() {
  const {
    incomes,
    monthlyIncome,
    monthlyTarget,
    targetSocialMedia,
    targetAIAutomation,
    targetRetainer,
    targetFreelance,
    setTargetSocialMedia,
    setTargetAIAutomation,
    setTargetRetainer,
    setTargetFreelance,
    setNameSocialMedia,
    setNameAIAutomation,
    setNameRetainer,
    setNameFreelance,
    addIncome,
    removeIncome,
    setIncomes
  } = useAppStore()

  const handleAddIncome = (income: IncomeEntry) => {
    addIncome(income)
  }

  const handleDeleteIncome = async (id: string) => {
    try {
      removeIncome(id)
      await fetch('/api/income?id=' + id, { method: 'DELETE' })
      toast.success('Income record deleted')
    } catch {
      toast.error('Failed to delete income')
    }
  }

  const handleTargetChange = async (key: string, value: number) => {
    if (key === 'Social Media Websites') setTargetSocialMedia(value)
    else if (key === 'AI Automation') setTargetAIAutomation(value)
    else if (key === 'Retainer Clients') setTargetRetainer(value)
    else if (key === 'International Freelance') setTargetFreelance(value)

    try {
      const now = new Date()
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const payload: Record<string, any> = { month: monthStr }
      if (key === 'Social Media Websites') payload.targetSocialMedia = value
      else if (key === 'AI Automation') payload.targetAIAutomation = value
      else if (key === 'Retainer Clients') payload.targetRetainer = value
      else if (key === 'International Freelance') payload.targetFreelance = value

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTarget: payload
        })
      })
    } catch (err) {
      console.error('Failed to save dynamic stream target:', err)
    }
  }

  const handleNameChange = async (key: string, name: string) => {
    if (key === 'Social Media Websites') setNameSocialMedia(name)
    else if (key === 'AI Automation') setNameAIAutomation(name)
    else if (key === 'Retainer Clients') setNameRetainer(name)
    else if (key === 'International Freelance') setNameFreelance(name)

    try {
      const now = new Date()
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      const payload: Record<string, any> = { month: monthStr }
      if (key === 'Social Media Websites') payload.nameSocialMedia = name
      else if (key === 'AI Automation') payload.nameAIAutomation = name
      else if (key === 'Retainer Clients') payload.nameRetainer = name
      else if (key === 'International Freelance') payload.nameFreelance = name

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTarget: payload
        })
      })
    } catch (err) {
      console.error('Failed to save dynamic stream name:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1 — Monthly Income Header */}
      <MonthlyIncomeHeader monthlyIncome={monthlyIncome} incomes={incomes} />

      {/* Section 2 — Income Stream Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {INCOME_SOURCES.map((source, idx) => (
          <IncomeStreamCard
            key={source.key}
            source={source}
            incomes={incomes}
            delay={0.1 + idx * 0.08}
            onTargetChange={handleTargetChange}
            onNameChange={handleNameChange}
          />
        ))}
      </div>

      {/* Section 3 — Add Income Panel */}
      <AddIncomePanel onAdded={handleAddIncome} />

      {/* Section 4 — Income Table */}
      <IncomeTable incomes={incomes} onDelete={handleDeleteIncome} />

      {/* Section 5 — Revenue Analytics */}
      <RevenueAnalytics incomes={incomes} monthlyIncome={monthlyIncome} />
    </div>
  )
}
