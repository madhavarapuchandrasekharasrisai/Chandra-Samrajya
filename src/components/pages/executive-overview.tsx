'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useAppStore, type IncomeEntry, type ExpenseEntry, type BudgetAllocation } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Plus,
  Trash2,
  Check,
  Square,
  Briefcase,
  Bell,
  X,
  History,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
      className="metric-card bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3 sm:p-4 relative overflow-hidden group"
    >
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="text-white/30 flex-shrink-0">{icon}</div>
          <span className="text-white/40 text-[9px] sm:text-[11px] uppercase tracking-wider font-semibold truncate">{label}</span>
        </div>
        {trend !== 'neutral' && (
          <div className={cn('flex items-center gap-0.5 text-[10px] sm:text-xs flex-shrink-0', trend === 'up' ? 'text-emerald-400' : 'text-red-400')}>
            {trend === 'up' ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {trendLabel && <span className="hidden xs:inline">{trendLabel}</span>}
          </div>
        )}
      </div>

      <div className="text-base sm:text-2xl font-bold text-white/95 tracking-tight truncate mb-1 sm:mb-2">{value}</div>

      <div className="mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <MicroSparkline data={sparkData} color={sparkColor} height={22} />
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
        'bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden',
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
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg border flex-shrink-0', bgMap[category.color])}>
            <span className={colorMap[category.color]}>{category.icon}</span>
          </div>
          <span className="text-white/80 text-[10px] sm:text-xs font-semibold uppercase tracking-wider truncate max-w-[120px] xs:max-w-none">{category.label}</span>
        </div>
        <span className={cn(
          'text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <p className="text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mb-0.5">Budget</p>
          <p className="text-white/85 text-xs sm:text-sm font-semibold truncate">{formatINR(budget)}</p>
        </div>
        <div>
          <p className="text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mb-0.5">Spent</p>
          <p className={cn('text-xs sm:text-sm font-semibold truncate', isDanger ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-white/85')}>
            {formatINR(spent)}
          </p>
        </div>
        <div>
          <p className="text-white/30 text-[8px] sm:text-[10px] uppercase tracking-wider mb-0.5">Remaining</p>
          <p className={cn('text-xs sm:text-sm font-semibold truncate', remaining < 0 ? 'text-red-400' : 'text-emerald-400')}>
            {formatINR(remaining)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
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
      <div className="flex items-center justify-between mb-3 sm:mb-4 text-[10px] sm:text-xs">
        <span className="text-white/30">Safe daily spending</span>
        <span className={cn(
          'font-semibold',
          safeDailySpend <= 0 ? 'text-red-400' : 'text-amber-400/85'
        )}>
          {safeDailySpend > 0 ? `${formatINR(Math.round(safeDailySpend))}/day` : 'Over budget'}
        </span>
      </div>

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <div className="border-t border-white/5 pt-2.5">
          <p className="text-white/25 text-[8px] sm:text-[10px] uppercase tracking-wider mb-1.5">Recent Expenses</p>
          <div className="space-y-1">
            {recentExpenses.slice(0, 3).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-white/50 truncate max-w-[65%]">{exp.description}</span>
                <span className="text-white/40 font-medium flex-shrink-0">{formatINR(exp.amount)}</span>
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
      className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] transition-all group"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white/85 text-xs sm:text-sm font-medium truncate max-w-[100px] xs:max-w-none">{label}</span>
            <span className={cn('text-[8px] sm:text-[10px] px-1.5 py-0.2 sm:py-0.5 rounded-full border leading-none font-medium', config.bg)}>
              {priority}
            </span>
            {amount != null && amount > 0 && (
              <span className="text-amber-400/90 text-[10px] sm:text-sm font-semibold leading-none flex-shrink-0">
                {formatINR(amount)}
              </span>
            )}
          </div>
          <p className="text-white/35 text-[10px] sm:text-xs truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-white/40 hover:text-amber-400 text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 flex-shrink-0 hover:bg-white/5"
      >
        <span className="hidden xs:inline">{actionLabel}</span>
        <ChevronRight className="w-3 h-3 sm:ml-0.5" />
      </Button>
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ExecutiveOverview() {
  const { 
    incomes, 
    expenses, 
    monthlyIncome, 
    monthlyTarget, 
    budgetAllocation, 
    clients, 
    followups, 
    setMonthlyIncome,
    setMonthlyTarget,
    todos,
    addTodo,
    toggleTodo,
    removeTodo,
    setTodos,
    setCurrentPage,
    jobApplications,
    notifications,
    outreachRecords
  } = useAppStore()

  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString())
  const [targetInput, setTargetInput] = useState(monthlyTarget.toString())
  const [mounted, setMounted] = useState(false)
  const [newTodoText, setNewTodoText] = useState('')
  const [isAddingTodo, setIsAddingTodo] = useState(false)

  // Outreach tracker modals state
  const [modalOpen, setModalOpen] = useState(false)
  const [logType, setLogType] = useState<'dm' | 'call' | 'proposal' | 'meeting' | 'close'>('dm')
  const [contactName, setContactName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [inspectCategory, setInspectCategory] = useState<'dm' | 'call' | 'proposal' | 'meeting' | 'close' | null>(null)

  const openLogModal = (type: 'dm' | 'call' | 'proposal' | 'meeting' | 'close') => {
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

  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/outreach-records?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        useAppStore.getState().removeOutreachRecord(id)
        toast.success('Log removed')
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete log')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setIncomeInput(monthlyIncome.toString())
  }, [monthlyIncome])

  useEffect(() => {
    setTargetInput(monthlyTarget.toString())
  }, [monthlyTarget])

  // Checklist item dates rollover logic (keeps incomplete items + items created today)
  const todayTodos = useMemo(() => {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return todos.filter(t => {
      const todoDate = new Date(t.date)
      const isCreatedToday = todoDate >= startOfToday
      return t.completed === 0 || isCreatedToday
    })
  }, [todos])

  const todayNotifications = useMemo(() => {
    return notifications.filter(n => new Date(n.dateTime).toDateString() === new Date().toDateString() && !n.read)
  }, [notifications])

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return

    setIsAddingTodo(true)
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTodoText.trim() }),
      })
      if (res.ok) {
        const added = await res.json()
        addTodo(added)
        setNewTodoText('')
      }
    } catch (err) {
      console.error('Failed to add todo:', err)
    } finally {
      setIsAddingTodo(false)
    }
  }

  const handleToggleTodo = async (id: string, currentCompleted: number) => {
    const nextCompleted = currentCompleted === 1 ? 0 : 1
    toggleTodo(id, nextCompleted === 1)

    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: nextCompleted === 1 }),
      })
      if (!res.ok) {
        toggleTodo(id, currentCompleted === 1) // Rollback
      }
    } catch (err) {
      console.error('Failed to toggle todo:', err)
      toggleTodo(id, currentCompleted === 1) // Rollback
    }
  }

  const handleDeleteTodo = async (id: string) => {
    const previousTodos = [...todos]
    removeTodo(id)

    try {
      const res = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        setTodos(previousTodos) // Rollback
      }
    } catch (err) {
      console.error('Failed to delete todo:', err)
      setTodos(previousTodos) // Rollback
    }
  }

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

  // Daily income and expense mapping for current month
  const dailyProgression = useMemo(() => {
    const incomeMap = new Array(32).fill(0)
    const expenseMap = new Array(32).fill(0)

    incomes.forEach(inc => {
      const d = new Date(inc.date)
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const day = d.getDate()
        if (day >= 1 && day <= 31) {
          incomeMap[day] += inc.amount
        }
      }
    })

    expenses.forEach(exp => {
      const d = new Date(exp.date)
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const day = d.getDate()
        if (day >= 1 && day <= 31) {
          expenseMap[day] += exp.amount
        }
      }
    })

    return { incomeMap, expenseMap }
  }, [incomes, expenses, now])

  const generateRealTimeSparkData = (metricType: 'revenue' | 'net' | 'savings' | 'discipline' | 'velocity' | 'pipeline') => {
    const points: { value: number }[] = []
    const sparkPoints = 10
    const currentDay = Math.max(1, now.getDate())

    for (let i = 0; i < sparkPoints; i++) {
      const targetDay = Math.max(1, Math.round(1 + (i / (sparkPoints - 1)) * (currentDay - 1)))
      
      let sumIncome = 0
      let sumExpense = 0
      for (let day = 1; day <= targetDay; day++) {
        sumIncome += dailyProgression.incomeMap[day] || 0
        sumExpense += dailyProgression.expenseMap[day] || 0
      }

      if (metricType === 'revenue') {
        points.push({ value: sumIncome })
      } else if (metricType === 'net') {
        points.push({ value: sumIncome - sumExpense })
      } else if (metricType === 'savings') {
        const savingsSpent = expenses
          .filter(e => {
            const d = new Date(e.date)
            return d.getDate() <= targetDay && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && e.category === 'Savings'
          })
          .reduce((s, e) => s + e.amount, 0)
        points.push({ value: savingsSpent })
      } else if (metricType === 'discipline') {
        const progressiveTarget = (monthlyTarget / 30) * targetDay
        const ratio = progressiveTarget > 0 ? sumIncome / progressiveTarget : 0
        points.push({ value: Math.min(100, Math.round(ratio * 70 + 30)) })
      } else if (metricType === 'velocity') {
        const avg = sumIncome / targetDay
        points.push({ value: Math.round(avg) })
      } else if (metricType === 'pipeline') {
        const activeClients = clients.filter(c => c.pipelineStage !== 'completed')
        const totalActive = activeClients.length
        if (totalActive > 0) {
          const index = Math.min(totalActive - 1, Math.floor((i / (sparkPoints - 1)) * (totalActive - 1)))
          let runningSum = 0
          for (let j = 0; j <= index; j++) {
            runningSum += activeClients[j].projectValue || 0
          }
          points.push({ value: runningSum })
        } else {
          points.push({ value: 0 })
        }
      }
    }
    return points
  }

  // Sparkline data for metrics
  const revenueSpark = useMemo(() => generateRealTimeSparkData('revenue'), [dailyProgression])
  const netSpark = useMemo(() => generateRealTimeSparkData('net'), [dailyProgression])
  const savingsSpark = useMemo(() => generateRealTimeSparkData('savings'), [expenses, dailyProgression])
  const disciplineSpark = useMemo(() => generateRealTimeSparkData('discipline'), [dailyProgression, monthlyTarget])
  const velocitySpark = useMemo(() => generateRealTimeSparkData('velocity'), [dailyProgression])
  const pipelineSpark = useMemo(() => generateRealTimeSparkData('pipeline'), [clients])

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

  // Calculate counts from actual outreach records (this week)
  const outreachMetrics = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const thisWeekRecords = outreachRecords.filter(r => {
      const d = new Date(r.date)
      return d >= weekAgo
    })

    return {
      dms: thisWeekRecords.filter(r => r.type === 'dm').length,
      calls: thisWeekRecords.filter(r => r.type === 'call').length,
      meetings: thisWeekRecords.filter(r => r.type === 'meeting').length,
      proposals: thisWeekRecords.filter(r => r.type === 'proposal').length +
        clients.filter(c => c.pipelineStage === 'proposal').length,
      closes: clients.filter(c => c.pipelineStage === 'completed').length,
    }
  }, [outreachRecords, clients])

  const totalOutreach = outreachMetrics.dms + outreachMetrics.calls + outreachMetrics.meetings
  const conversionRate = totalOutreach > 0 && outreachMetrics.closes > 0
    ? ((outreachMetrics.closes / totalOutreach) * 100).toFixed(1)
    : '0.0'

  // ── Weekly Outreach Streak Calculation ──
  const weeklyStreak = useMemo(() => {
    if (outreachRecords.length === 0) return 0
    const recordsByWeek: Record<number, number> = {}
    const now = new Date()

    outreachRecords.forEach(r => {
      const recordDate = new Date(r.date)
      const diffTime = Math.abs(now.getTime() - recordDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const weekIndex = Math.floor((diffDays - 1) / 7)
      recordsByWeek[weekIndex] = (recordsByWeek[weekIndex] || 0) + 1
    })

    if ((recordsByWeek[0] || 0) === 0 && (recordsByWeek[1] || 0) === 0) {
      return 0
    }

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

  // ── Daily Job Application Streak Calculation ──
  const jobStreak = useMemo(() => {
    if (jobApplications.length === 0) return 0
    const countByDate: Record<string, number> = {}
    jobApplications.forEach(j => {
      const dateKey = new Date(j.appliedDate).toISOString().split('T')[0]
      countByDate[dateKey] = (countByDate[dateKey] || 0) + 1
    })

    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if ((countByDate[todayStr] || 0) === 0 && (countByDate[yesterdayStr] || 0) === 0) {
      return 0
    }

    let currentStreak = 0
    const startCheckDate = (countByDate[todayStr] || 0) > 0 ? new Date() : yesterday

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date()
      checkDate.setDate(startCheckDate.getDate() - i)
      const key = checkDate.toISOString().split('T')[0]
      if ((countByDate[key] || 0) > 0) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  }, [jobApplications])

  // Handle income input
  const handleIncomeChange = (value: string) => {
    setIncomeInput(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setMonthlyIncome(num)
    }
  }

  // Handle target input
  const handleTargetChange = async (value: string) => {
    setTargetInput(value)
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setMonthlyTarget(num)
      
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monthlyTarget: {
              month: currentMonth,
              income: num,
            }
          }),
        })
      } catch (err) {
        console.error('Failed to persist monthly target settings:', err)
      }
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
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.06] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-4 sm:p-6"
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-6 right-10 w-1 h-1 rounded-full bg-amber-400/30 particle" />
        <div className="absolute top-12 right-20 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-8 left-16 w-1 h-1 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel: Greeting, stats grid, and insights (3 cols out of 5) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
            <div>
              {/* Greeting */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0">{getGreetingIcon()}</div>
                  <div className="min-w-0">
                    <h2 className="text-white/95 text-base sm:text-lg font-semibold tracking-tight truncate">{getGreeting()}, Chandra.</h2>
                    <p className="text-white/40 text-[10px] sm:text-xs truncate">Here&apos;s your executive briefing for today</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentPage('calendar')}
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/15 hover:from-amber-500/25 hover:via-amber-600/20 hover:to-amber-500/25 border-amber-500/40 hover:border-amber-500/70 text-amber-400 text-xs font-semibold gap-2 rounded-xl h-9 px-4 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                >
                  <CalendarClock className="w-4 h-4 text-amber-400" />
                  <span>Imperial Calendar</span>
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                  </span>
                </Button>
              </div>

              {/* Key Stats Grid - adapted to 2 columns for beautiful spacing inside the split */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                {/* Revenue This Month */}
                <div className="bg-[#0a0a0c] lg:bg-white/[0.02] lg:backdrop-blur-sm border border-white/[0.05] rounded-xl p-3 sm:p-4 min-w-0">
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 truncate">Revenue This Month</p>
                  <p className="gold-text text-sm sm:text-xl font-bold truncate">{formatINR(monthlyIncome)}</p>
                </div>

                {/* Remaining to Target */}
                <div className="bg-[#0a0a0c] lg:bg-white/[0.02] lg:backdrop-blur-sm border border-white/[0.05] rounded-xl p-3 sm:p-4 min-w-0">
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 truncate">Remaining to Target</p>
                  <p className={cn(
                    'text-sm sm:text-xl font-bold truncate',
                    remainingToTarget > 0 ? 'text-amber-400' : 'text-emerald-400'
                  )}>
                    {remainingToTarget > 0 ? formatINR(remainingToTarget) : 'Target Hit! ✓'}
                  </p>
                </div>

                {/* Strongest Stream */}
                <div className="bg-[#0a0a0c] lg:bg-white/[0.02] lg:backdrop-blur-sm border border-white/[0.05] rounded-xl p-3 sm:p-4 min-w-0">
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 truncate">Strongest Stream</p>
                  <p className="text-emerald-400 text-xs sm:text-sm font-semibold truncate">{strongestStream.source}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs truncate">{formatINR(strongestStream.amount)}</p>
                </div>

                {/* Weakest Stream */}
                <div className="bg-[#0a0a0c] lg:bg-white/[0.02] lg:backdrop-blur-sm border border-white/[0.05] rounded-xl p-3 sm:p-4 min-w-0">
                  <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 truncate">Weakest Stream</p>
                  <p className="text-amber-400/70 text-xs sm:text-sm font-semibold truncate">{weakestStream.source}</p>
                  <p className="text-white/40 text-[10px] sm:text-xs truncate">{formatINR(weakestStream.amount)}</p>
                </div>
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

              {/* Target Progress */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
                <Target className="w-3 h-3 text-white/30" />
                <span className="text-white/40 text-xs">
                  {monthlyTarget > 0 ? `${((monthlyIncome / monthlyTarget) * 100).toFixed(1)}% of target` : 'No target set'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Daily Focus Checklist Panel (2 columns out of 5) */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="bg-[#0e0e11] lg:bg-white/[0.02] lg:backdrop-blur-md border border-white/[0.08] rounded-xl p-4 flex flex-col h-full justify-between relative overflow-hidden">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.05] pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white/95 text-xs sm:text-sm font-bold tracking-wide">Today&apos;s Focus Checklist</h3>
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                    {todayTodos.filter(t => t.completed === 1).length} / {todayTodos.length} Done
                  </span>
                </div>

                {/* Form to Add Todo */}
                <form onSubmit={handleAddTodo} className="flex gap-1.5 mb-3">
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add dynamic focus task..."
                    disabled={isAddingTodo}
                    className="flex-1 min-w-0 bg-white/[0.03] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/15 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isAddingTodo || !newTodoText.trim()}
                    className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400/90 hover:text-amber-400 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>

                {/* Checklist Scrollable Container */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 select-none">
                  {todayTodos.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-white/[0.04] rounded-lg">
                      <Sparkles className="w-5 h-5 text-white/15 mx-auto mb-1.5" />
                      <p className="text-white/30 text-[10px]">No active tasks focus scheduled today.</p>
                      <p className="text-white/15 text-[9px] mt-0.5">Use the input above to add key goals</p>
                    </div>
                  ) : (
                    todayTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="group flex items-center justify-between gap-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-amber-500/10 rounded-lg p-2 transition-all duration-200"
                      >
                        <div 
                          onClick={() => handleToggleTodo(todo.id, todo.completed)}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {todo.completed === 1 ? (
                              <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center transition-all">
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-3.5 h-3.5 rounded border border-white/20 hover:border-amber-500/50 flex items-center justify-center transition-all" />
                            )}
                          </div>
                          <span className={cn(
                            'text-xs transition-all leading-tight',
                            todo.completed === 1 
                              ? 'text-white/30 line-through' 
                              : 'text-white/80 group-hover:text-white/95'
                          )}>
                            {todo.task}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-white/20 hover:text-red-400 p-0.5 rounded transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — EXECUTIVE METRICS (6 CARDS)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
            <h2 className="gold-text text-lg sm:text-xl font-bold">Wealth Distribution Engine</h2>
            <p className="text-white/30 text-[11px] sm:text-xs mt-0.5">Your income, automatically allocated across 5 wealth pillars</p>
          </div>

          {/* Inputs Row (Income & Target) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Monthly Income Input */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
              <label className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60 text-xs sm:text-sm">₹</span>
                <input
                  type="text"
                  value={incomeInput}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-28 sm:w-36 h-9 pl-7 pr-2.5 rounded-xl bg-white/[0.04] border border-amber-500/15 text-white/90 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-white/20"
                  placeholder="Enter income"
                />
              </div>
            </div>

            {/* Monthly Target Input */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
              <label className="text-white/40 text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap">Monthly Target</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/60 text-xs sm:text-sm">₹</span>
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="w-28 sm:w-36 h-9 pl-7 pr-2.5 rounded-xl bg-white/[0.04] border border-amber-500/15 text-white/90 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder:text-white/20"
                  placeholder="Enter target"
                />
              </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
        className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <CircleDot className="w-4 h-4 text-amber-400" />
          <h3 className="text-white/90 text-sm font-semibold">Active Operations</h3>
          <span className="text-white/20 text-xs ml-1">
            ({todayFollowups.length + pendingProposals.length + overdueClients.length} items)
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Today's Notifications */}
          {todayNotifications.length > 0 && (
            <div className="mb-3">
              <p className="text-white/25 text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3 h-3 text-amber-400" /> Notifications
              </p>
              {todayNotifications.map((n, i) => (
                <OperationItem
                  key={n.id}
                  priority="normal"
                  label={n.title}
                  subtitle={n.message || 'Scheduled Notification'}
                  actionLabel="View"
                  delay={0.65 + i * 0.05}
                />
              ))}
            </div>
          )}

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
        className="hidden md:block bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-white/95 text-base font-bold tracking-tight">Imperial Daily Execution</h3>
              <p className="text-white/30 text-xs mt-0.5">Track, log, and maintain discipline consistency metrics in real-time.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {jobStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>{jobStreak} Day Job Streak</span>
              </div>
            )}
            {weeklyStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>{weeklyStreak} Week Outreach Streak</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              Live Database Sync
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {/* Jobs Applied */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-amber-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400 group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">
                {jobApplications.filter(j => new Date(j.appliedDate).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Jobs Applied</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/[0.04] flex flex-col gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('jobs')}
                className="w-full text-xs bg-white/5 hover:bg-amber-500 hover:text-black transition-colors rounded-lg h-8"
              >
                Open Board
              </Button>
            </div>
          </div>

          {/* DMs Sent */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-blue-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{outreachMetrics.dms}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">DMs Sent</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('dm')}
                className="flex-1 text-xs bg-blue-500/10 hover:bg-blue-500 hover:text-white text-blue-400 border border-blue-500/20 rounded-lg h-8"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('dm')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Calls Completed */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{outreachMetrics.calls}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Calls</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('call')}
                className="flex-1 text-xs bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 rounded-lg h-8"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('call')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-purple-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{outreachMetrics.meetings}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Meetings</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('meeting')}
                className="flex-1 text-xs bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 border border-purple-500/20 rounded-lg h-8"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('meeting')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Proposals Sent */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-amber-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3 text-amber-400 group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{outreachMetrics.proposals}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Proposals</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('proposal')}
                className="flex-1 text-xs bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-400 border border-amber-500/20 rounded-lg h-8"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('proposal')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Closes */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 text-center hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{outreachMetrics.closes}</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Closes</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('close')}
                className="flex-1 text-xs bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 border border-emerald-500/20 rounded-lg h-8"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('close')}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white/[0.02] border border-amber-500/10 rounded-2xl p-4 text-center hover:border-amber-500/25 hover:bg-white/[0.04] transition-all flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-white/90 text-3xl font-extrabold tracking-tight">{conversionRate}%</p>
              <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mt-1">Conv. Rate</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex flex-col gap-2">
              <div className="text-[10px] text-white/30 italic py-1.5">Weekly efficiency</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          INTERACTIVE POPUP MODALS
          ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111113] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white tracking-tight">Log {logType.toUpperCase()}</h3>
                <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/5">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 ml-1">Contact Name</label>
                  <Input 
                    required 
                    value={contactName} 
                    onChange={e => setContactName(e.target.value)} 
                    placeholder="Enter name..." 
                    className="bg-white/5 border-white/10 text-white" 
                  />
                </div>

                {logType === 'call' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/40 ml-1">Phone Number</label>
                    <Input 
                      type="tel" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value)} 
                      placeholder="Enter phone number..." 
                      className="bg-white/5 border-white/10 text-white" 
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-white/40 ml-1">Notes</label>
                  <textarea 
                    value={logNotes} 
                    onChange={e => setLogNotes(e.target.value)} 
                    placeholder="Add operational context or outcome..." 
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 border border-white/10 text-white hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                  >
                    Log Record
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {inspectCategory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111113] border border-white/10 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{inspectCategory.toUpperCase()} Execution History</h3>
                  <p className="text-xs text-white/40 mt-1">Reviewing transaction logs for this execution block.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setInspectCategory(null)} className="w-8 h-8 rounded-full text-white/40 hover:text-white hover:bg-white/5">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {outreachRecords.filter(r => r.type === inspectCategory).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/5 rounded-xl">
                    <History className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No recorded executions for {inspectCategory}</p>
                  </div>
                ) : (
                  outreachRecords.filter(r => r.type === inspectCategory).map(record => (
                    <div 
                      key={record.id} 
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3.5 flex items-start justify-between gap-4 hover:bg-white/[0.04] transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white tracking-tight truncate">{record.contactName}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        {record.phoneNumber && (
                          <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                            <span className="opacity-60">Tel:</span> {record.phoneNumber}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-white/35 mt-2 bg-black/20 p-2 rounded-lg border border-white/[0.02] leading-relaxed">
                            {record.notes}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteLog(record.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2 h-7 text-xs self-start"
                      >
                        Delete
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={() => setInspectCategory(null)} 
                  className="bg-white/10 hover:bg-white/15 text-white font-semibold rounded-lg px-6 h-10"
                >
                  Close History
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
