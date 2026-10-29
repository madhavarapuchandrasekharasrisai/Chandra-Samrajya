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

function MicroSparkline({ data, color = '#2563eb', height = 26, id }: { data: { value: number }[]; color?: string; height?: number; id?: string }) {
  const gradId = id || `spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="index" hide />
        <Tooltip contentStyle={{ display: 'none' }} cursor={false} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
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
  badgeBg = 'bg-primary/10 text-primary border-primary/20',
  accentColor = '#2563eb',
  delay = 0,
}: {
  label: string
  value: string
  trend: 'up' | 'down' | 'neutral'
  trendLabel?: string
  sparkData: { value: number }[]
  sparkColor: string
  icon: React.ReactNode
  badgeBg?: string
  accentColor?: string
  delay?: number
}) {
  const cardId = `spark-${label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="metric-card bg-card border border-border/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Subtle top border glow with card's accent color */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px] opacity-75 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs', badgeBg)}>
            {icon}
          </div>
          <span className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider font-semibold truncate font-mono">
            {label}
          </span>
        </div>
        {trend !== 'neutral' && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border shadow-2xs flex-shrink-0',
            trend === 'up' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendLabel && <span className="hidden xs:inline">{trendLabel}</span>}
          </div>
        )}
      </div>

      <div className="text-xl sm:font-display sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight truncate mb-1">
        {value}
      </div>

      <div className="mt-2 opacity-85 group-hover:opacity-100 transition-opacity">
        <MicroSparkline data={sparkData} color={sparkColor} height={24} id={cardId} />
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
    'amber-400': 'bg-primary/10 border-primary/20',
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
        'bg-card border rounded-2xl p-4 sm:p-5 transition-all duration-300 relative overflow-hidden shadow-xs hover:shadow-md',
        isDanger
          ? 'border-red-500/30 budget-danger'
          : isWarning
          ? 'border-amber-500/30 dark:border-primary/20 budget-warning'
          : 'border-border',
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
          <span className="text-foreground/90 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[120px] xs:max-w-none">{category.label}</span>
        </div>
        <span className={cn(
          'text-[9px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border',
          isDanger
            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            : isWarning
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-primary/10 dark:text-amber-400 dark:border-primary/20'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
        )}>
          {percentUsed.toFixed(0)}%
        </span>
      </div>

      {/* Budget / Spent / Remaining */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div>
          <p className="text-muted-foreground text-[8px] sm:font-mono text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Budget</p>
          <p className="text-foreground text-xs sm:text-sm font-bold truncate">{formatINR(budget)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-[8px] sm:font-mono text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Spent</p>
          <p className={cn('text-xs sm:text-sm font-bold truncate', isDanger ? 'text-red-500' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-foreground')}>
            {formatINR(spent)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-[8px] sm:font-mono text-[10px] uppercase tracking-wider mb-0.5 font-semibold">Remaining</p>
          <p className={cn('text-xs sm:text-sm font-bold truncate', remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400')}>
            {formatINR(remaining)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-secondary/80 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentUsed)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full budget-progress',
            percentUsed < 70
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : percentUsed < 90
              ? 'bg-gradient-to-r from-amber-500 to-orange-400'
              : 'bg-gradient-to-r from-red-500 to-red-400'
          )}
        />
      </div>

      {/* Safe Daily Spending */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 text-[10px] sm:text-xs">
        <span className="text-muted-foreground font-medium">Safe daily spending</span>
        <span className={cn(
          'font-bold',
          safeDailySpend <= 0 ? 'text-red-500' : 'text-amber-600 dark:text-amber-400'
        )}>
          {safeDailySpend > 0 ? `${formatINR(Math.round(safeDailySpend))}/day` : 'Over budget'}
        </span>
      </div>

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <div className="border-t border-border pt-2.5">
          <p className="text-muted-foreground/50 text-[8px] sm:font-mono text-[10px] uppercase tracking-wider mb-1.5">Recent Expenses</p>
          <div className="space-y-1">
            {recentExpenses.slice(0, 3).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between text-[10px] sm:text-xs">
                <span className="text-muted-foreground truncate max-w-[65%]">{exp.description}</span>
                <span className="text-muted-foreground font-medium flex-shrink-0">{formatINR(exp.amount)}</span>
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
    critical: { bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20', dot: 'bg-red-500' },
    high: { bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-primary/10 dark:text-amber-400 dark:border-primary/20', dot: 'bg-amber-500' },
    normal: { bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20', dot: 'bg-blue-500' },
  }
  const config = priorityConfig[priority]

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-all shadow-2xs group"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dot)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-foreground text-xs sm:text-sm font-semibold truncate max-w-[100px] xs:max-w-none">{label}</span>
            <span className={cn('text-[8px] sm:text-[10px] px-1.5 py-0.2 sm:py-0.5 rounded-full border leading-none font-semibold uppercase', config.bg)}>
              {priority}
            </span>
            {amount != null && amount > 0 && (
              <span className="text-amber-600 dark:text-amber-400/90 text-[10px] sm:text-sm font-semibold leading-none flex-shrink-0">
                {formatINR(amount)}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-[10px] sm:text-xs truncate mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-primary text-[10px] sm:text-xs h-6 sm:h-7 px-1.5 sm:px-2 flex-shrink-0 hover:bg-secondary/80"
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
    outreachRecords,
    nameSocialMedia,
    nameAIAutomation,
    nameRetainer,
    nameFreelance,
    targetSocialMedia,
    targetAIAutomation,
    targetRetainer,
    targetFreelance,
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

  // All 4 configured streams analysis
  const allStreams = useMemo(() => {
    const list = [
      { key: 'Social Media Websites', label: nameSocialMedia || 'Social Media Websites', target: targetSocialMedia || 15000 },
      { key: 'AI Automation', label: nameAIAutomation || 'AI Automation', target: targetAIAutomation || 40000 },
      { key: 'Retainer Clients', label: nameRetainer || 'Retainer Clients', target: targetRetainer || 30000 },
      { key: 'International Freelance', label: nameFreelance || 'International Freelance', target: targetFreelance || 15000 },
    ]

    const currentDate = new Date()
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
    })

    return list.map(stream => {
      const amount = monthIncomes
        .filter(i => i.source === stream.key || i.source === stream.label)
        .reduce((sum, i) => sum + i.amount, 0)
      return {
        source: stream.label,
        amount,
        target: stream.target,
      }
    })
  }, [incomes, nameSocialMedia, nameAIAutomation, nameRetainer, nameFreelance, targetSocialMedia, targetAIAutomation, targetRetainer, targetFreelance])

  const strongestStream = useMemo(() => {
    const sorted = [...allStreams].sort((a, b) => b.amount - a.amount)
    return sorted[0] || { source: 'No data', amount: 0 }
  }, [allStreams])

  const weakestStream = useMemo(() => {
    // Sort ascending by revenue
    const sorted = [...allStreams].sort((a, b) => a.amount - b.amount)
    // Find the lowest stream that is NOT the strongest stream so they never duplicate
    const different = sorted.find(s => s.source !== strongestStream.source)
    return different || sorted[1] || sorted[0] || { source: 'No data', amount: 0 }
  }, [allStreams, strongestStream])

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
        className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-4 sm:p-6"
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-6 right-10 w-1 h-1 rounded-full bg-primary/30 particle" />
        <div className="absolute top-12 right-20 w-0.5 h-0.5 rounded-full bg-primary/20 particle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-8 left-16 w-1 h-1 rounded-full bg-primary/20 particle" style={{ animationDelay: '4s' }} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left panel: Greeting, stats grid, and insights (3 cols out of 5) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-4">
            <div>
              {/* Greeting */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex-shrink-0">{getGreetingIcon()}</div>
                  <div className="min-w-0">
                    <h2 className="text-foreground text-base sm:text-lg font-semibold tracking-tight truncate">{getGreeting()}, Chandra.</h2>
                    <p className="text-muted-foreground text-[10px] sm:text-xs truncate">Here&apos;s your executive briefing for today</p>
                  </div>
                </div>
                <Button
                  onClick={() => setCurrentPage('calendar')}
                  variant="ghost"
                  size="sm"
                  className="imperial-calendar-btn gap-2 rounded-xl h-9 px-4 shadow-sm"
                >
                  <CalendarClock className="w-4 h-4 text-inherit" />
                  <span>Imperial Calendar</span>
                  <span className="relative flex h-1.5 w-1.5 ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                  </span>
                </Button>
              </div>

              {/* Key Stats Grid - adapted to 2 columns for beautiful spacing inside the split */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                {/* Revenue This Month */}
                <div className="premium-stats-card rounded-2xl p-3.5 sm:p-4 min-w-0 bg-card border border-border shadow-xs">
                  <p className="text-muted-foreground text-[9px] sm:font-mono text-[10px] uppercase tracking-wider mb-1 truncate font-semibold">Revenue This Month</p>
                  <p className="gold-text text-base sm:text-2xl font-bold truncate">{formatINR(monthlyIncome)}</p>
                </div>

                {/* Remaining to Target */}
                <div className="premium-stats-card rounded-2xl p-3.5 sm:p-4 min-w-0 bg-card border border-border shadow-xs">
                  <p className="text-muted-foreground text-[9px] sm:font-mono text-[10px] uppercase tracking-wider mb-1 truncate font-semibold">Remaining to Target</p>
                  <p className={cn(
                    'text-base sm:text-2xl font-bold truncate',
                    remainingToTarget > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                  )}>
                    {remainingToTarget > 0 ? (
                      formatINR(remainingToTarget)
                    ) : (
                      <span className="flex items-baseline gap-1.5 flex-wrap">
                        <span>{formatINR(monthlyTarget)}</span>
                        <span className="text-xs sm:text-sm font-semibold opacity-90">Target Hit! ✓</span>
                      </span>
                    )}
                  </p>
                </div>

                {/* Strongest Stream */}
                <div className="premium-stats-card rounded-2xl p-3.5 sm:p-4 min-w-0 bg-card border border-border shadow-xs hover:border-emerald-500/30 transition-all">
                  <p className="text-muted-foreground text-[9px] sm:font-mono text-[10px] uppercase tracking-wider mb-1 truncate font-semibold">Strongest Stream</p>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold truncate">{strongestStream.source}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs truncate font-medium">
                    {formatINR(strongestStream.amount)} <span className="text-[9px] opacity-60">/ {formatINR(strongestStream.target)}</span>
                  </p>
                </div>

                {/* Weakest Stream */}
                <div className="premium-stats-card rounded-2xl p-3.5 sm:p-4 min-w-0 bg-card border border-border shadow-xs hover:border-amber-500/30 transition-all">
                  <p className="text-muted-foreground text-[9px] sm:font-mono text-[10px] uppercase tracking-wider mb-1 truncate font-semibold">Weakest Stream</p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-bold truncate">{weakestStream.source}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs truncate font-medium">
                    {formatINR(weakestStream.amount)} <span className="text-[9px] opacity-60">/ {formatINR(weakestStream.target)}</span>
                  </p>
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/30 border border-border">
                <Target className="w-3 h-3 text-muted-foreground/60" />
                <span className="text-muted-foreground text-xs">
                  {monthlyTarget > 0 ? `${((monthlyIncome / monthlyTarget) * 100).toFixed(1)}% of target` : 'No target set'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Daily Focus Checklist Panel (2 columns out of 5) */}
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col h-full justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-foreground text-xs sm:text-sm font-bold tracking-wide">Today&apos;s Focus Checklist</h3>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono font-bold px-2 py-0.5 rounded-full bg-secondary border border-border">
                    {todayTodos.filter(t => t.completed === 1).length} / {todayTodos.length} Done
                  </span>
                </div>

                {/* Form to Add Todo */}
                <form onSubmit={handleAddTodo} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Add dynamic focus task..."
                    disabled={isAddingTodo}
                    className="flex-1 min-w-0 bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 shadow-2xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isAddingTodo || !newTodoText.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>

                {/* Checklist Scrollable Container */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 select-none">
                  {todayTodos.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-xl bg-secondary/30">
                      <Sparkles className="w-5 h-5 text-muted-foreground/40 mx-auto mb-1.5" />
                      <p className="text-muted-foreground text-[10px] font-medium">No active tasks focus scheduled today.</p>
                      <p className="text-muted-foreground/50 text-[9px] mt-0.5">Use the input above to add key goals</p>
                    </div>
                  ) : (
                    todayTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={cn(
                          "group flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all duration-200 select-none",
                          todo.completed === 1
                            ? "bg-muted/40 border-border/50 opacity-70"
                            : "bg-card hover:bg-accent/40 border-border hover:border-primary/40 shadow-2xs hover:shadow-xs"
                        )}
                      >
                        <div 
                          onClick={() => handleToggleTodo(todo.id, todo.completed)}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {todo.completed === 1 ? (
                              <div className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-md border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary transition-colors flex items-center justify-center bg-card" />
                            )}
                          </div>
                          <span className={cn(
                            'text-xs transition-all leading-tight font-medium',
                            todo.completed === 1 
                              ? 'text-muted-foreground/60 line-through' 
                              : 'text-foreground'
                          )}>
                            {todo.task}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="text-muted-foreground/40 hover:text-red-500 p-1 rounded transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
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
          WORK HARD, ENJOY LIFE
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-md transition-all relative group"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch min-h-[160px]">
          {/* Contemplation artwork still */}
          <div className="md:col-span-4 lg:col-span-3 relative h-44 md:h-auto min-h-[160px] overflow-hidden bg-black flex-shrink-0 border-b md:border-b-0 md:border-r border-border/60">
            <img
              src="/images/solo-leveling/se7en-reflection.jpg"
              alt="Work Hard, Enjoy Life"
              className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-card/80" />
            <div className="absolute bottom-2.5 left-3">
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-black/80 px-2 py-0.5 rounded border border-amber-400/30">
                DAILY REMINDER
              </span>
            </div>
          </div>

          {/* Clean, Simple & Heartfelt Text */}
          <div className="md:col-span-8 lg:col-span-9 p-4 sm:p-5 lg:p-6 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  ✨ WORK HARD · ENJOY LIFE
                </span>
                <span className="text-muted-foreground text-[10px] font-mono">
                  CHANDRA&apos;S PURPOSE
                </span>
              </div>
              <h3 className="text-foreground text-sm sm:text-base font-extrabold font-mono uppercase tracking-wide">
                WORK HARD, ENJOY LIFE
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-medium mt-1">
                Work hard and earn well with honest dedication, so you have the freedom to truly enjoy your life, spend time happily, and take care of the people and dreams that matter most to you.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono border-t border-border/50">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                Earn with Dedication
              </span>
              <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded">
                Enjoy with Peace of Mind
              </span>
              <span className="text-muted-foreground ml-auto hidden sm:inline">
                &ldquo;Work hard, live happily.&rdquo;
              </span>
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
          sparkColor="#2563eb"
          accentColor="#2563eb"
          badgeBg="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-500/20"
          icon={<IndianRupee className="w-4 h-4" />}
          delay={0.1}
        />
        <MetricCard
          label="Net Balance"
          value={formatINR(netBalance)}
          trend={netBalance >= 0 ? 'up' : 'down'}
          trendLabel={netBalance >= 0 ? 'Positive' : 'Negative'}
          sparkData={netSpark}
          sparkColor={netBalance >= 0 ? '#10b981' : '#ef4444'}
          accentColor={netBalance >= 0 ? '#10b981' : '#ef4444'}
          badgeBg={netBalance >= 0 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-500/20"
          }
          icon={<Wallet className="w-4 h-4" />}
          delay={0.15}
        />
        <MetricCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          trend={savingsRate >= 20 ? 'up' : 'down'}
          trendLabel={savingsRate >= 20 ? 'On track' : 'Below target'}
          sparkData={savingsSpark}
          sparkColor="#8b5cf6"
          accentColor="#8b5cf6"
          badgeBg="bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-500/20"
          icon={<PiggyBank className="w-4 h-4" />}
          delay={0.2}
        />
        <MetricCard
          label="Discipline Score"
          value={`${disciplineScore}`}
          trend={disciplineScore >= 70 ? 'up' : 'down'}
          trendLabel={disciplineScore >= 70 ? 'Strong' : 'Needs work'}
          sparkData={disciplineSpark}
          sparkColor="#d97706"
          accentColor="#d97706"
          badgeBg="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-500/20"
          icon={<Shield className="w-4 h-4" />}
          delay={0.25}
        />
        <MetricCard
          label="Revenue Velocity"
          value={`${formatINR(revenueVelocity)}/day`}
          trend={revenueVelocity >= monthlyTarget / 30 ? 'up' : 'down'}
          trendLabel="daily avg"
          sparkData={velocitySpark}
          sparkColor="#06b6d4"
          accentColor="#06b6d4"
          badgeBg="bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-500/20"
          icon={<Zap className="w-4 h-4" />}
          delay={0.3}
        />
        <MetricCard
          label="Opportunity Pipeline"
          value={formatINR(pipelineValue)}
          trend={pipelineValue > 0 ? 'up' : 'neutral'}
          trendLabel={`${clients.filter(c => c.pipelineStage !== 'completed').length} active`}
          sparkData={pipelineSpark}
          sparkColor="#6366f1"
          accentColor="#6366f1"
          badgeBg="bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-500/20"
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
            <p className="text-muted-foreground/60 text-[11px] sm:text-xs mt-0.5">Your income, automatically allocated across 5 wealth pillars</p>
          </div>

          {/* Inputs Row (Income & Target) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {/* Monthly Income Input */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
              <label className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap font-medium">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs sm:text-sm">₹</span>
                <input
                  type="text"
                  value={incomeInput}
                  onChange={(e) => handleIncomeChange(e.target.value)}
                  className="w-28 sm:w-36 h-9 pl-7 pr-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold shadow-2xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground/40"
                  placeholder="Enter income"
                />
              </div>
            </div>

            {/* Monthly Target Input */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5 w-full sm:w-auto">
              <label className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap font-medium">Monthly Target</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-bold text-xs sm:text-sm">₹</span>
                <input
                  type="text"
                  value={targetInput}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="w-28 sm:w-36 h-9 pl-7 pr-2.5 rounded-xl bg-card border border-border text-foreground text-xs sm:text-sm font-semibold shadow-2xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground/40"
                  placeholder="Enter target"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Visual Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-secondary/50 rounded-full overflow-hidden flex">
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
        className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <CircleDot className="w-4 h-4 text-amber-400" />
          <h3 className="text-foreground text-sm font-semibold">Active Operations</h3>
          <span className="text-muted-foreground/40 text-xs ml-1">
            ({todayFollowups.length + pendingProposals.length + overdueClients.length} items)
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Today's Notifications */}
          {todayNotifications.length > 0 && (
            <div className="mb-3">
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
              <p className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
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
              <p className="text-muted-foreground/60 text-sm">All clear — no urgent actions right now</p>
              <p className="text-muted-foreground/30 text-xs mt-1">Use Quick Add to create followups and clients</p>
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
        className="hidden md:block bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <h3 className="text-foreground text-base font-bold tracking-tight">Imperial Daily Execution</h3>
              <p className="text-muted-foreground/60 text-xs mt-0.5">Track, log, and maintain discipline consistency metrics in real-time.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {jobStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-primary/10 dark:border-primary/20 dark:text-amber-400 text-xs font-semibold shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 dark:fill-amber-400" />
                <span>{jobStreak} Day Job Streak</span>
              </div>
            )}
            {weeklyStreak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-400 text-xs font-semibold shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 dark:fill-orange-400" />
                <span>{weeklyStreak} Week Outreach Streak</span>
              </div>
            )}
            <div className="px-2.5 py-1 rounded-lg bg-secondary/50 border border-border text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Live Database Sync
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* Jobs Applied */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-amber-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-primary/10 dark:text-amber-400 dark:border-primary/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">
                {jobApplications.filter(j => new Date(j.appliedDate).toDateString() === new Date().toDateString()).length}
              </p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Jobs Applied</p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('jobs')}
                className="w-full text-xs font-semibold bg-secondary/80 hover:bg-amber-500 hover:text-white transition-colors rounded-lg h-8"
              >
                Open Board
              </Button>
            </div>
          </div>

          {/* DMs Sent */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-blue-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{outreachMetrics.dms}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">DMs Sent</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('dm')}
                className="flex-1 text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 dark:bg-blue-500/10 dark:hover:bg-blue-500 dark:text-blue-400 dark:border-blue-500/20 rounded-lg h-8 transition-colors"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('dm')}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Calls Completed */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-emerald-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{outreachMetrics.calls}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Calls</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('call')}
                className="flex-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:border-emerald-500/20 rounded-lg h-8 transition-colors"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('call')}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-purple-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{outreachMetrics.meetings}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Meetings</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('meeting')}
                className="flex-1 text-xs font-semibold bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 dark:bg-purple-500/10 dark:hover:bg-purple-500 dark:text-purple-400 dark:border-purple-500/20 rounded-lg h-8 transition-colors"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('meeting')}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Proposals Sent */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-amber-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 dark:bg-primary/10 dark:text-amber-400 dark:border-primary/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{outreachMetrics.proposals}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Proposals</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('proposal')}
                className="flex-1 text-xs font-semibold bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200 dark:bg-primary/10 dark:hover:bg-amber-500 dark:text-amber-400 dark:border-primary/20 rounded-lg h-8 transition-colors"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('proposal')}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Closes */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-emerald-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{outreachMetrics.closes}</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Closes</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <Button 
                onClick={() => openLogModal('close')}
                className="flex-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500 dark:text-emerald-400 dark:border-emerald-500/20 rounded-lg h-8 transition-colors"
              >
                Log
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => setInspectCategory('close')}
                className="w-8 h-8 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-card border border-border/80 rounded-2xl p-4 text-center hover:border-indigo-400/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-foreground font-display text-3xl font-extrabold tracking-tight">{conversionRate}%</p>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-semibold mt-1">Conv. Rate</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
              <div className="text-[10px] text-muted-foreground font-medium italic py-1.5">Weekly efficiency</div>
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
                  <label className="text-xs text-muted-foreground ml-1">Notes</label>
                  <textarea 
                    value={logNotes} 
                    onChange={e => setLogNotes(e.target.value)} 
                    placeholder="Add operational context or outcome..." 
                    rows={3}
                    className="w-full bg-secondary/50 border border-border text-foreground rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 border border-border text-foreground hover:bg-secondary/50"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-card backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-secondary border border-border rounded-2xl p-6 w-full max-w-xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight">{inspectCategory.toUpperCase()} Execution History</h3>
                  <p className="text-xs text-muted-foreground mt-1">Reviewing transaction logs for this execution block.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setInspectCategory(null)} className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {outreachRecords.filter(r => r.type === inspectCategory).length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <History className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                    <p className="text-muted-foreground/60 text-sm">No recorded executions for {inspectCategory}</p>
                  </div>
                ) : (
                  outreachRecords.filter(r => r.type === inspectCategory).map(record => (
                    <div 
                      key={record.id} 
                      className="bg-secondary/30 border border-border rounded-xl p-3.5 flex items-start justify-between gap-4 hover:bg-secondary/60 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground tracking-tight truncate">{record.contactName}</h4>
                          <span className="text-[9px] px-2 py-0.5 rounded bg-secondary/50 border border-border text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </span>
                        </div>
                        {record.phoneNumber && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <span className="opacity-60">Tel:</span> {record.phoneNumber}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-2 bg-secondary/50 p-2 rounded-lg border border-border/40 leading-relaxed">
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

              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <Button 
                  onClick={() => setInspectCategory(null)} 
                  className="bg-accent hover:bg-white/15 text-foreground font-semibold rounded-lg px-6 h-10"
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
