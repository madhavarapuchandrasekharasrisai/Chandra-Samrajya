'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, IndianRupee,
  TrendingUp, TrendingDown, Users, MessageSquare,
  Phone, Send, CheckCircle2, Clock, Target,
  Sparkles, Crown, X, ArrowUpRight, Bell, Plus, CalendarClock
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // Pad with previous month days to start on Monday
  const startDow = (firstDay.getDay() + 6) % 7 // Mon = 0
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push(d)
  }
  
  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  
  // Pad remaining to fill 6 rows (42 total cells)
  while (days.length < 42) {
    days.push(new Date(year, month + 1, days.length - lastDay.getDate() - startDow + 1))
  }
  
  return days
}

function dateKey(d: Date | string): string {
  if (typeof d === 'string') {
    const matches = d.match(/^(\d{4}-\d{2}-\d{2})/)
    if (matches) {
      return matches[1]
    }
    d = new Date(d)
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface DayEvent {
  id: string
  type: 'income' | 'expense' | 'followup' | 'outreach' | 'client' | 'notification'
  label: string
  detail: string
  amount?: number
  color: string
  icon: React.ReactNode
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Day Cell Component ───────────────────────────────────────────────────────

function DayCell({
  date,
  events,
  isCurrentMonth,
  isToday,
  isSelected,
  onSelect,
}: {
  date: Date
  events: DayEvent[]
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const dayNum = date.getDate()
  const hasIncome = events.some(e => e.type === 'income')
  const hasExpense = events.some(e => e.type === 'expense')
  const hasFollowup = events.some(e => e.type === 'followup')
  const hasOutreach = events.some(e => e.type === 'outreach')
  const hasNotification = events.some(e => e.type === 'notification')

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={cn(
        'relative w-full aspect-[1.1] sm:aspect-[1.25] md:aspect-[1.3] rounded-xl border transition-all duration-200 flex flex-col items-center justify-between p-1 sm:p-1.5 overflow-hidden group',
        isSelected
          ? 'bg-primary/20 border-primary ring-2 ring-primary/40 shadow-md shadow-primary/20'
          : isToday
          ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-400 dark:border-amber-400/80 ring-1 ring-amber-400/50'
          : isCurrentMonth
          ? 'bg-card hover:bg-accent/60 border-border/80 shadow-2xs'
          : 'bg-muted/10 border-border/30 opacity-40 hover:opacity-70'
      )}
    >
      {/* Top Header: Day number & today marker */}
      <div className="w-full flex items-center justify-between">
        <span className={cn(
          'text-[10px] sm:text-xs font-mono font-bold leading-none',
          isSelected
            ? 'text-primary'
            : isToday
            ? 'text-amber-700 dark:text-amber-400 font-black'
            : isCurrentMonth
            ? 'text-foreground'
            : 'text-muted-foreground'
        )}>
          {dayNum}
        </span>
        {isToday && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        )}
      </div>

      {/* Middle: Event Color Dots */}
      <div className="flex items-center gap-1 flex-wrap justify-center w-full my-auto px-0.5">
        {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" title="Income" />}
        {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" title="Expense" />}
        {hasFollowup && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_4px_rgba(14,165,233,0.5)]" title="Followup" />}
        {hasOutreach && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_4px_rgba(168,85,247,0.5)]" title="Outreach" />}
        {hasNotification && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]" title="Reminder" />}
      </div>

      {/* Bottom: Event Count Pill */}
      {events.length > 0 ? (
        <span className={cn(
          'text-[8px] sm:text-[9px] font-mono font-bold px-1 py-0.2 rounded-full leading-none',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : isToday
            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
            : 'bg-secondary text-muted-foreground group-hover:text-foreground'
        )}>
          {events.length}
        </span>
      ) : (
        <span className="h-2" />
      )}
    </motion.button>
  )
}

// ─── Month Summary Cards Component ──────────────────────────────────────────

function MonthSummary({
  monthIncome,
  monthExpense,
  followupCount,
  outreachCount,
}: {
  monthIncome: number
  monthExpense: number
  followupCount: number
  outreachCount: number
}) {
  const netCashflow = monthIncome - monthExpense

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Income */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-emerald-500/30 rounded-2xl p-4 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-emerald-500" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
            Total Income
          </span>
          <div className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-lg sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
          {formatINR(monthIncome)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Recorded cashflow</p>
      </motion.div>

      {/* Total Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card border border-red-500/30 rounded-2xl p-4 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-red-500" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-red-700 dark:text-red-400">
            Total Expenses
          </span>
          <div className="p-1 rounded bg-red-500/10 text-red-600 dark:text-red-400">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-lg sm:text-2xl font-black font-mono text-red-700 dark:text-red-400">
          {formatINR(monthExpense)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Monthly burn rate</p>
      </motion.div>

      {/* Active Followups */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-sky-500/30 rounded-2xl p-4 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-sky-500" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-sky-700 dark:text-sky-400">
            Client Followups
          </span>
          <div className="p-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-lg sm:text-2xl font-black font-mono text-sky-700 dark:text-sky-400">
          {followupCount}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled client checkpoints</p>
      </motion.div>

      {/* Outreach Operations */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-card border border-purple-500/30 rounded-2xl p-4 shadow-xs relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-[2px] bg-purple-500" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">
            Outreach Ops
          </span>
          <div className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Send className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-lg sm:text-2xl font-black font-mono text-purple-700 dark:text-purple-400">
          {outreachCount}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">DMs, calls & proposals</p>
      </motion.div>
    </div>
  )
}

// ─── Selected Day Schedule Panel ─────────────────────────────────────────────

function DaySchedulePanel({
  date,
  events,
  onClose,
}: {
  date: Date
  events: DayEvent[]
  onClose?: () => void
}) {
  const dateStr = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const totalIncome = events.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0)
  const totalExpense = events.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount || 0), 0)

  const { addNotification } = useAppStore()
  const [newNotif, setNewNotif] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNotif = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNotif.trim()) return
    
    setIsAdding(true)
    const d = new Date(date)
    d.setHours(12, 0, 0, 0)
    
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newNotif.trim(),
          dateTime: d.toISOString(),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        addNotification(data)
        toast.success('Reminder added to Imperial Calendar!')
        setNewNotif('')
      } else {
        throw new Error(data.error || 'Failed to save reminder')
      }
    } catch (err: unknown) {
      console.error(err)
      toast.error('Failed to add reminder')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full space-y-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
              TIMELINE BRIEFING
            </span>
            <h3 className="text-base sm:text-lg font-bold text-foreground font-display">
              {dateStr}
            </h3>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Daily Financial Mini-Tally */}
        {(totalIncome > 0 || totalExpense > 0) && (
          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
              <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                Day Income
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-700 dark:text-emerald-400">
                {formatINR(totalIncome)}
              </span>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
              <span className="text-[9px] font-mono text-red-700 dark:text-red-400 font-bold uppercase tracking-wider block">
                Day Expense
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-red-700 dark:text-red-400">
                {formatINR(totalExpense)}
              </span>
            </div>
          </div>
        )}

        {/* Chronological Event List */}
        <div className="space-y-2 mt-3 max-h-[380px] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-border/60 rounded-xl bg-secondary/10">
              <CalendarClock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-mono font-bold text-foreground">Zero Scheduled Events</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Use the prompt below to log a reminder or milestone.</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-secondary/20 hover:bg-secondary/40 border border-border/70 rounded-xl transition-all"
              >
                <div className={cn('p-2 rounded-lg flex-shrink-0', event.color)}>
                  {event.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs sm:text-sm font-semibold truncate">{event.label}</p>
                  <p className="text-muted-foreground text-[10px] sm:text-xs truncate">{event.detail}</p>
                </div>
                {event.amount !== undefined && event.amount > 0 && (
                  <span className={cn(
                    'text-xs sm:text-sm font-mono font-bold flex-shrink-0',
                    event.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {formatINR(event.amount)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Reminder Form */}
      <div className="pt-3 border-t border-border/60">
        <form onSubmit={handleAddNotif} className="flex items-center gap-2">
          <Input 
            placeholder="Add calendar reminder or action..."
            value={newNotif}
            onChange={(e) => setNewNotif(e.target.value)}
            disabled={isAdding}
            className="flex-1 bg-secondary/30 border-border text-foreground placeholder:text-muted-foreground/50 h-9 text-xs font-mono"
          />
          <Button 
            type="submit" 
            disabled={!newNotif.trim() || isAdding}
            className="h-9 px-3 bg-primary text-primary-foreground font-mono text-xs font-bold flex-shrink-0 rounded-lg gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── Main Imperial Calendar Component ────────────────────────────────────────

export function ImperialCalendar() {
  const { incomes, expenses, followups, outreachRecords, clients, notifications } = useAppStore()
  const today = useMemo(() => new Date(), [])
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date>(today)

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  const days = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth])

  // Build events map for the visible date range
  const eventsMap = useMemo(() => {
    const map: Record<string, DayEvent[]> = {}

    const addEvent = (key: string, event: DayEvent) => {
      if (!map[key]) map[key] = []
      map[key].push(event)
    }

    // Incomes
    incomes.forEach(inc => {
      const key = dateKey(inc.date)
      addEvent(key, {
        id: `inc-${inc.id}`,
        type: 'income',
        label: inc.source,
        detail: inc.clientName || inc.description || 'Income entry',
        amount: inc.amount,
        color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
        icon: <TrendingUp className="w-3.5 h-3.5" />,
      })
    })

    // Expenses
    expenses.forEach(exp => {
      const key = dateKey(exp.date)
      addEvent(key, {
        id: `exp-${exp.id}`,
        type: 'expense',
        label: exp.category,
        detail: exp.description || 'Expense entry',
        amount: exp.amount,
        color: 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/20',
        icon: <TrendingDown className="w-3.5 h-3.5" />,
      })
    })

    // Followups
    followups.forEach(f => {
      const key = dateKey(f.dueDate)
      const clientName = f.clientName || clients.find(c => c.id === f.clientId)?.name || 'Client'
      addEvent(key, {
        id: `fol-${f.id}`,
        type: 'followup',
        label: `${f.type.toUpperCase()} · ${clientName}`,
        detail: f.note || `${f.status} status`,
        color: f.status === 'completed'
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
          : 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/20',
        icon: f.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />,
      })
    })

    // Outreach Records
    outreachRecords.forEach(o => {
      const key = dateKey(o.date)
      addEvent(key, {
        id: `out-${o.id}`,
        type: 'outreach',
        label: `${o.type.toUpperCase()} → ${o.contactName}`,
        detail: `${o.platform} · ${o.status}${o.notes ? ' — ' + o.notes : ''}`,
        amount: o.projectValue || undefined,
        color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/20',
        icon: o.type === 'call' ? <Phone className="w-3.5 h-3.5" /> : o.type === 'dm' ? <MessageSquare className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />,
      })
    })

    // Notifications
    notifications.forEach(n => {
      const key = dateKey(n.dateTime)
      addEvent(key, {
        id: `not-${n.id}`,
        type: 'notification',
        label: n.title,
        detail: n.message || 'Notification alert',
        color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20',
        icon: <Bell className="w-3.5 h-3.5" />,
      })
    })

    return map
  }, [incomes, expenses, followups, outreachRecords, clients, notifications])

  // Month summary stats
  const monthStats = useMemo(() => {
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const monthFollowups = followups.filter(f => {
      const d = new Date(f.dueDate)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const monthOutreach = outreachRecords.filter(o => {
      const d = new Date(o.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    return {
      income: monthIncomes.reduce((s, i) => s + i.amount, 0),
      expense: monthExpenses.reduce((s, e) => s + e.amount, 0),
      followups: monthFollowups.length,
      outreach: monthOutreach.length,
    }
  }, [incomes, expenses, followups, outreachRecords, currentMonth, currentYear])

  const selectedEvents = useMemo(() => {
    return eventsMap[dateKey(selectedDate)] || []
  }, [selectedDate, eventsMap])

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }, [currentMonth])

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }, [currentMonth])

  const goToToday = useCallback(() => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(today)
  }, [today])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER: IMPERIAL CALENDAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/[0.04] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                <Crown className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                TIMELINE INTELLIGENCE CHRONICLE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-foreground">
              Imperial Calendar
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Unified command schedule — monitor cashflow, strategic outreach, and client deadlines across time.
            </p>
          </div>

          {/* Month Navigator Controls in Header */}
          <div className="flex items-center gap-2 bg-card border border-border/80 rounded-xl p-1.5 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevMonth}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs sm:text-sm font-mono font-bold text-foreground px-2 min-w-[120px] text-center">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextMonth}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 text-xs font-mono font-bold text-primary border-primary/20 hover:bg-primary/10 px-2.5"
            >
              Today
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Month Summary Stat Cards */}
      <MonthSummary
        monthIncome={monthStats.income}
        monthExpense={monthStats.expense}
        followupCount={monthStats.followups}
        outreachCount={monthStats.outreach}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          EXECUTIVE 2-COLUMN WORKSPACE: CALENDAR GRID + SCHEDULE PANEL
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: Calendar Grid (7 cols on large desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="lg:col-span-7 xl:col-span-8 bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs"
        >
          {/* Legend indicators bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Expense
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Followup
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Outreach
              </span>
              <span className="flex items-center gap-1.5 text-foreground/80">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Reminder
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
              Tap any date to inspect
            </span>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
            {WEEKDAYS.map(day => (
              <div key={day} className="py-1">
                <span className="text-[10px] sm:text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* 42 Date Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((date, idx) => {
              const key = dateKey(date)
              const events = eventsMap[key] || []
              const isCurrentMonth = date.getMonth() === currentMonth
              const isTodayDate = dateKey(date) === dateKey(today)
              const isSelected = dateKey(date) === dateKey(selectedDate)

              return (
                <DayCell
                  key={idx}
                  date={date}
                  events={events}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isTodayDate}
                  isSelected={isSelected}
                  onSelect={() => setSelectedDate(date)}
                />
              )
            })}
          </div>
        </motion.div>

        {/* RIGHT: Selected Day Schedule Panel (5 cols on large desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-5 xl:col-span-4"
        >
          <DaySchedulePanel
            date={selectedDate}
            events={selectedEvents}
          />
        </motion.div>
      </div>
    </div>
  )
}
