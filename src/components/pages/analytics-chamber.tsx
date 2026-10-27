'use client'

import React, { useMemo } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine,
} from 'recharts'
import {
  TrendingUp, TrendingDown, IndianRupee, Activity, PieChart as PieIcon,
  BarChart3, Target, Zap, Wallet,
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function EmptyStateOverlay({ message = "Awaiting transaction logs..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[5px] rounded-2xl border border-border z-10 p-4">
      <div className="p-3 rounded-full bg-primary/5 border border-primary/10 mb-2">
        <Activity className="w-5 h-5 text-amber-500/50 animate-pulse" />
      </div>
      <p className="text-muted-foreground text-xs font-semibold tracking-wide">{message}</p>
      <p className="text-muted-foreground/50 text-[10px] mt-1 text-center max-w-[200px]">Add entries via the Quick Add Dialog to populate real-time analytics</p>
    </div>
  )
}

const CATEGORIES = [
  { key: 'Personal', color: '#d4a849' },
  { key: 'Savings', color: '#10b981' },
  { key: 'Business', color: '#3b82f6' },
  { key: 'Skills', color: '#a855f7' },
  { key: 'Fun', color: '#f43f5e' },
] as const

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || '#d4a849' }} />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="text-foreground font-medium">{typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Section 1: Summary Dashboard ───────────────────────────────────────────

function SummaryMetric({
  label,
  value,
  sub,
  trend,
  icon,
  delay,
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-primary/15 transition-all duration-300"
    >
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center gap-2 mb-3">
        <div className="text-muted-foreground/60">{icon}</div>
        <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">{label}</span>
        {trend && trend !== 'neutral' && (
          <div className={cn('ml-auto flex items-center gap-0.5 text-xs', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          </div>
        )}
      </div>
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      {sub && <p className="text-muted-foreground/60 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

// ─── Chart Card Wrapper ──────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  icon,
  children,
  delay = 0,
}: {
  title: string
  subtitle?: string
  icon: React.ReactNode
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card lg:bg-card/60 lg:backdrop-blur-xl border border-border rounded-2xl p-5 relative overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-muted-foreground/60">{icon}</div>
        <div>
          <h3 className="text-foreground/80 text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-muted-foreground/50 text-[10px]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

// ─── Heatmap Cell ────────────────────────────────────────────────────────────

function HeatmapCell({ value, max, color }: { value: number; max: number; color: string }) {
  const intensity = max > 0 ? value / max : 0
  return (
    <div
      className="w-full aspect-square rounded-md transition-all duration-300 hover:scale-110 cursor-default"
      style={{
        backgroundColor: color,
        opacity: Math.max(0.05, Math.min(1, intensity)),
      }}
      title={`₹${value.toLocaleString('en-IN')}`}
    />
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AnalyticsChamber() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups } = useAppStore()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Current month metrics
  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.category !== 'External'
      })
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses, currentMonth, currentYear])

  const netSavingsRate = monthlyIncome > 0
    ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100
    : 0

  const topCategory = useMemo(() => {
    const catTotals: Record<string, number> = {}
    expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.category !== 'External'
      })
      .forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
      })
    const entries = Object.entries(catTotals)
    if (entries.length === 0) return { category: 'No data', amount: 0 }
    return entries.reduce((max, [cat, amt]) => amt > max.amount ? { category: cat, amount: amt } : max, { category: '', amount: 0 })
  }, [expenses, currentMonth, currentYear])

  const totalExternalSupport = useMemo(() => {
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.category === 'External'
      })
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses, currentMonth, currentYear])

  // Last month income for growth
  const lastMonthIncome = useMemo(() => {
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear
    return incomes
      .filter(i => {
        const d = new Date(i.date)
        return d.getMonth() === lastMonth && d.getFullYear() === lastYear
      })
      .reduce((s, i) => s + i.amount, 0)
  }, [incomes, currentMonth, currentYear])

  const revenueGrowth = lastMonthIncome > 0
    ? ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100
    : 0

  // Monthly data for charts (use real database values)
  const monthlyData = useMemo(() => {
    const data: Array<{ month: string; income: number; expenses: number; savings: number; savingsRate: number }> = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1)
      const m = d.getMonth()
      const y = d.getFullYear()
      const mIncome = incomes
        .filter(inc => {
          const dd = new Date(inc.date)
          return dd.getMonth() === m && dd.getFullYear() === y
        })
        .reduce((s, inc) => s + inc.amount, 0)
      const mExpenses = expenses
        .filter(exp => {
          const dd = new Date(exp.date)
          return dd.getMonth() === m && dd.getFullYear() === y && exp.category !== 'External'
        })
        .reduce((s, exp) => s + exp.amount, 0)
      data.push({
        month: MONTHS[m],
        income: mIncome,
        expenses: mExpenses,
        savings: mIncome - mExpenses,
        savingsRate: mIncome > 0 ? Math.round(((mIncome - mExpenses) / mIncome) * 100) : 0,
      })
    }
    return data
  }, [incomes, expenses, currentMonth, currentYear])

  // Spending by category for pie chart
  const categoryPieData = useMemo(() => {
    const catTotals: Record<string, number> = {}
    expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .forEach(e => {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount
      })

    return CATEGORIES.map(cat => ({
      name: cat.key,
      value: catTotals[cat.key] || 0,
      color: cat.color,
    }))
  }, [expenses, currentMonth, currentYear])

  const totalPieValue = categoryPieData.reduce((s, d) => s + d.value, 0)

  // Stream performance data
  const streamData = useMemo(() => {
    const sourceMap: Record<string, number> = {}
    incomes.forEach(i => {
      sourceMap[i.source] = (sourceMap[i.source] || 0) + i.amount
    })
    const entries = Object.entries(sourceMap)
    return entries.map(([source, actual]) => ({
      source,
      actual,
      target: Math.round(monthlyTarget / Math.max(entries.length, 1)),
    }))
  }, [incomes, monthlyTarget])

  // Forecast data
  const forecastData = useMemo(() => {
    // Build from real monthly data
    const data = monthlyData.map(d => ({
      month: d.month,
      actual: d.income,
      target: monthlyTarget,
      upper: Math.round(d.income * 1.1),
      lower: Math.round(d.income * 0.9),
      income: d.income,
      expenses: d.expenses,
      savings: d.savings,
      savingsRate: d.savingsRate,
    }))
    
    // Add 3 projection months with linear trend from real monthData
    const lastIncome = monthlyData[monthlyData.length - 1]?.income || 0
    const secondLastIncome = monthlyData[monthlyData.length - 2]?.income || 0
    const trend = lastIncome - secondLastIncome // simple trend estimate

    for (let i = 1; i <= 3; i++) {
      const d = new Date(currentYear, currentMonth + i, 1)
      const projected = Math.max(0, Math.round(lastIncome + trend * i * 0.5))
      data.push({
        month: MONTHS[d.getMonth()],
        actual: projected,
        target: monthlyTarget,
        upper: Math.round(projected * 1.15),
        lower: Math.round(projected * 0.85),
        income: projected,
        expenses: 0,
        savings: 0,
        savingsRate: 0,
      })
    }
    return data
  }, [monthlyData, monthlyTarget, currentMonth, currentYear])

  // Heatmap data: spending by category per day of week
  const heatmapData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const catExpenses: Record<string, number[]> = {}

    CATEGORIES.forEach(cat => {
      catExpenses[cat.key] = new Array(7).fill(0)
    })

    expenses.forEach(e => {
      const d = new Date(e.date)
      let dayIndex = d.getDay() - 1 // Monday = 0
      if (dayIndex < 0) dayIndex = 6 // Sunday = 6
      if (catExpenses[e.category]) {
        catExpenses[e.category][dayIndex] += e.amount
      }
    })

    return { days, catExpenses }
  }, [expenses])

  // Checking data completeness flags for premium Empty State Overlays
  const hasRealMonthlyData = useMemo(() => {
    return monthlyData.some(d => d.income > 0 || d.expenses > 0)
  }, [monthlyData])

  const hasPieData = useMemo(() => {
    return categoryPieData.some(d => d.value > 0)
  }, [categoryPieData])

  const hasStreamData = useMemo(() => {
    return streamData.length > 0 && streamData.some(d => d.actual > 0)
  }, [streamData])

  const hasForecastData = useMemo(() => {
    return monthlyData.some(d => d.income > 0)
  }, [monthlyData])

  const hasHeatmapData = useMemo(() => {
    return Object.values(heatmapData.catExpenses).some(arr => arr.some(v => v > 0))
  }, [heatmapData])

  // Find max for heatmap
  const heatmapMax = useMemo(() => {
    let max = 0
    Object.values(heatmapData.catExpenses).forEach(arr => {
      arr.forEach(v => { if (v > max) max = v })
    })
    return max || 1000
  }, [heatmapData])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER — Analytics Chamber
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/[0.05] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-6"
      >
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />
        <div className="relative z-10">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">Strategic Intelligence</p>
          <h1 className="gold-text text-3xl lg:font-display text-4xl font-bold tracking-tight">Analytics Chamber</h1>
          <p className="text-muted-foreground/60 text-sm mt-1">Deep insights into your financial patterns and performance</p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — Summary Dashboard
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <SummaryMetric
          label="Income vs Expenses"
          value={formatINR(monthlyIncome - totalExpenses)}
          sub={`Income ${formatINR(monthlyIncome)} — Expenses ${formatINR(totalExpenses)}`}
          trend={monthlyIncome - totalExpenses >= 0 ? 'up' : 'down'}
          icon={<IndianRupee className="w-4 h-4" />}
          delay={0.1}
        />
        <SummaryMetric
          label="Net Savings Rate"
          value={`${netSavingsRate.toFixed(1)}%`}
          sub={netSavingsRate >= 25 ? 'Above 25% target' : 'Below 25% target'}
          trend={netSavingsRate >= 25 ? 'up' : 'down'}
          icon={<Activity className="w-4 h-4" />}
          delay={0.15}
        />
        <SummaryMetric
          label="Top Spending"
          value={topCategory.category}
          sub={formatINR(topCategory.amount)}
          trend="neutral"
          icon={<Wallet className="w-4 h-4" />}
          delay={0.2}
        />
        <SummaryMetric
          label="Revenue Growth"
          value={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
          sub="vs last month"
          trend={revenueGrowth >= 0 ? 'up' : 'down'}
          icon={<TrendingUp className="w-4 h-4" />}
          delay={0.25}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-secondary/50 backdrop-blur-xl border border-teal-500/10 rounded-2xl p-5 relative overflow-hidden group hover:border-teal-500/25 transition-all duration-300"
        >
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-2 mb-3">
            <div className="text-teal-400/50"><Zap className="w-4 h-4" /></div>
            <span className="text-teal-400/70 text-[11px] uppercase tracking-wider font-semibold">Household Duties</span>
          </div>
          <div className="font-display text-2xl font-bold text-teal-400">{formatINR(totalExternalSupport)}</div>
          <p className="text-teal-400/40 text-xs mt-1">Isolated from budget distributions</p>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — Charts Grid (2x2)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Income vs Expenses */}
        <ChartCard title="Income vs Expenses" subtitle="6-month trend" icon={<Activity className="w-4 h-4" />} delay={0.3}>
          <div className="h-64 relative">
            {!hasRealMonthlyData && <EmptyStateOverlay message="Awaiting historical records..." />}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a849" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#d4a849" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#d4a849" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chart 2: Savings Trend */}
        <ChartCard title="Savings Trend" subtitle="Monthly savings rate" icon={<Target className="w-4 h-4" />} delay={0.35}>
          <div className="h-64 relative">
            {!hasRealMonthlyData && <EmptyStateOverlay message="Awaiting savings records..." />}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" name="Savings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Savings rate annotation */}
          <div className="flex items-center gap-2 mt-2 px-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-muted-foreground/60 text-[10px]">Current rate: {monthlyData[monthlyData.length - 1]?.savingsRate || 0}%</span>
          </div>
        </ChartCard>

        {/* Chart 3: Spending Behavior (Donut) */}
        <ChartCard title="Spending Behavior" subtitle="Category breakdown" icon={<PieIcon className="w-4 h-4" />} delay={0.4}>
          <div className="flex items-center gap-6 relative">
            {!hasPieData && <EmptyStateOverlay message="Awaiting recorded expenses..." />}
            <div className="h-56 w-56 flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.75} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-foreground text-lg font-bold">{formatINR(totalPieValue)}</span>
                <span className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider">Total</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2.5 font-sans">
              {categoryPieData.map((item) => {
                const percent = totalPieValue > 0 ? ((item.value / totalPieValue) * 100).toFixed(0) : '0'
                return (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground text-xs flex-1">{item.name}</span>
                    <span className="text-muted-foreground text-[10px]">{percent}%</span>
                    <span className="text-foreground/70 text-xs font-medium">{formatINR(item.value)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </ChartCard>

        {/* Chart 4: Stream Performance */}
        <ChartCard title="Stream Performance" subtitle="Revenue by source vs target" icon={<BarChart3 className="w-4 h-4" />} delay={0.45}>
          <div className="h-64 relative">
            {!hasStreamData && <EmptyStateOverlay message="Awaiting stream revenue..." />}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="target" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} name="Target" />
                <Bar dataKey="actual" fill="#d4a849" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Chart 5: Revenue Forecast (Full Width) */}
      <ChartCard title="Revenue Forecast" subtitle="Projected income trajectory with confidence band" icon={<Zap className="w-4 h-4" />} delay={0.5}>
        <div className="h-64 relative">
          {!hasForecastData && <EmptyStateOverlay message="Awaiting historical trajectory..." />}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a849" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#d4a849" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a849" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#d4a849" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" name="Upper Bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="url(#bandGrad)" name="Lower Bound" />
              <Area type="monotone" dataKey="actual" stroke="#d4a849" strokeWidth={2} fill="url(#forecastGrad)" name="Revenue" />
              <ReferenceLine y={monthlyTarget} stroke="rgba(255,255,255,0.15)" strokeDasharray="6 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-amber-400 rounded" />
            <span className="text-muted-foreground/60 text-[10px]">Actual / Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 border-t border-dashed border-white/20" />
            <span className="text-muted-foreground/60 text-[10px]">Target ({formatINR(monthlyTarget)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 bg-primary/10 rounded" />
            <span className="text-muted-foreground/60 text-[10px]">Confidence Band</span>
          </div>
        </div>
      </ChartCard>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — Category Heatmap
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="bg-secondary/30 backdrop-blur-xl border border-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-foreground/80 text-sm font-semibold">Spending Heatmap</h3>
            <p className="text-muted-foreground/50 text-[10px]">Category spending intensity by day of week</p>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {!hasHeatmapData && <EmptyStateOverlay message="Awaiting weekly spending logs..." />}
          <div className="min-w-[400px]">
            {/* Header row */}
            <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
              <div />
              {heatmapData.days.map(day => (
                <div key={day} className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider text-center font-medium">{day}</div>
              ))}
            </div>
            {/* Category rows */}
            {CATEGORIES.map(cat => (
              <div key={cat.key} className="grid gap-2 mb-2 items-center" style={{ gridTemplateColumns: '100px repeat(7, 1fr)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-muted-foreground text-xs font-medium">{cat.key}</span>
                </div>
                {(heatmapData.catExpenses[cat.key] || new Array(7).fill(0)).map((value: number, idx: number) => (
                  <HeatmapCell key={idx} value={value} max={heatmapMax} color={cat.color} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Intensity legend */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
          <span className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider">Intensity:</span>
          <div className="flex items-center gap-1">
            {[0.05, 0.25, 0.5, 0.75, 1].map((opacity, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{ backgroundColor: '#d4a849', opacity }}
              />
            ))}
          </div>
          <span className="text-muted-foreground/50 text-[10px]">Low → High</span>
        </div>
      </motion.div>
    </div>
  )
}
