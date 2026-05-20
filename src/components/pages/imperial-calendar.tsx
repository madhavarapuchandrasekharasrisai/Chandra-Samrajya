'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, ChevronLeft, ChevronRight, IndianRupee,
  TrendingUp, TrendingDown, Users, MessageSquare,
  Phone, Send, CheckCircle2, Clock, Target,
  Sparkles, Crown, X, ArrowUpRight, Bell, Plus
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
  
  // Pad remaining to fill 6 rows
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

// ─── Day Cell ───────────────────────────────────────────────────────────────

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
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={onSelect}
      className={cn(
        'relative w-full aspect-[1.35] rounded-lg border transition-all duration-200 flex flex-col items-center justify-start pt-1 gap-0.5 overflow-hidden',
        isSelected
          ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
          : isToday
          ? 'bg-amber-500/[0.06] border-amber-500/20'
          : isCurrentMonth
          ? 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]'
          : 'bg-transparent border-white/[0.02] opacity-30'
      )}
    >
      {/* Day number */}
      <span className={cn(
        'text-[10px] sm:text-xs font-semibold z-10',
        isToday ? 'text-amber-400' : isCurrentMonth ? 'text-white/70' : 'text-white/20'
      )}>
        {dayNum}
      </span>

      {/* Event dots */}
      {events.length > 0 && (
        <div className="flex items-center gap-[3px] flex-wrap justify-center max-w-full px-0.5 z-10">
          {hasIncome && <div className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />}
          {hasExpense && <div className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />}
          {hasFollowup && <div className="w-1 h-1 rounded-full bg-sky-400 flex-shrink-0" />}
          {hasOutreach && <div className="w-1 h-1 rounded-full bg-purple-400 flex-shrink-0" />}
          {hasNotification && <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />}
        </div>
      )}

      {/* Event count badge */}
      {events.length > 0 && (
        <span className={cn(
          'text-[8px] font-bold mt-auto mb-0.5 z-10',
          isSelected ? 'text-amber-400' : 'text-white/20'
        )}>
          {events.length}
        </span>
      )}

      {/* Today indicator ring */}
      {isToday && (
        <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-amber-400/30 pointer-events-none" />
      )}
    </motion.button>
  )
}

// ─── Day Detail Panel ───────────────────────────────────────────────────────

function DayDetailPanel({
  date,
  events,
  onClose,
}: {
  date: Date
  events: DayEvent[]
  onClose: () => void
}) {
  const dateStr = date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const totalIncome = events.filter(e => e.type === 'income').reduce((s, e) => s + (e.amount || 0), 0)
  const totalExpense = events.filter(e => e.type === 'expense').reduce((s, e) => s + (e.amount || 0), 0)

  const { addNotification } = useAppStore()
  const [newNotif, setNewNotif] = useState('')

  const handleAddNotif = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNotif.trim()) return
    
    // Create a date preserving the year, month, date of `date` but current time or noon
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
        toast.success('Notification saved to database')
        setNewNotif('')
      } else {
        throw new Error(data.error || 'Failed to save notification')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to add notification')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0e0e11]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl shadow-black/40 max-w-3xl mx-auto w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-amber-400/60 text-[10px] uppercase tracking-widest">Daily Summary</p>
          <h3 className="text-white/90 text-lg font-bold">{dateStr}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/30 hover:text-white/80 hover:bg-white/5 h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      {(totalIncome > 0 || totalExpense > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
            <p className="text-emerald-400/60 text-[9px] uppercase tracking-wider">Income</p>
            <p className="text-emerald-400 text-lg font-bold">{formatINR(totalIncome)}</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
            <p className="text-red-400/60 text-[9px] uppercase tracking-wider">Expense</p>
            <p className="text-red-400 text-lg font-bold">{formatINR(totalExpense)}</p>
          </div>
        </div>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <p className="text-white/25 text-sm">No activity on this day</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-all"
            >
              <div className={cn('p-2 rounded-lg flex-shrink-0', event.color)}>
                {event.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{event.label}</p>
                <p className="text-white/30 text-xs truncate">{event.detail}</p>
              </div>
              {event.amount !== undefined && event.amount > 0 && (
                <span className={cn(
                  'text-sm font-bold flex-shrink-0',
                  event.type === 'income' ? 'text-emerald-400' : event.type === 'expense' ? 'text-red-400' : 'gold-text'
                )}>
                  {formatINR(event.amount)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Notification Form */}
      <div className="mt-4 pt-4 border-t border-white/[0.04]">
        <form onSubmit={handleAddNotif} className="flex items-center gap-2">
          <Input 
            placeholder="Add a notification/reminder for this day..."
            value={newNotif}
            onChange={(e) => setNewNotif(e.target.value)}
            className="flex-1 bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/20 h-9"
          />
          <Button 
            type="submit" 
            disabled={!newNotif.trim()}
            className="h-9 w-9 p-0 bg-amber-500 hover:bg-amber-400 text-black flex-shrink-0 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  )
}

// ─── Month Summary Stats ────────────────────────────────────────────────────

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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400/60 text-[9px] uppercase tracking-wider">Income</span>
        </div>
        <p className="text-emerald-400 text-xl font-bold">{formatINR(monthIncome)}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-red-500/5 border border-red-500/15 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400/60 text-[9px] uppercase tracking-wider">Expenses</span>
        </div>
        <p className="text-red-400 text-xl font-bold">{formatINR(monthExpense)}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-sky-400/60 text-[9px] uppercase tracking-wider">Followups</span>
        </div>
        <p className="text-sky-400 text-xl font-bold">{followupCount}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Send className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-purple-400/60 text-[9px] uppercase tracking-wider">Outreach</span>
        </div>
        <p className="text-purple-400 text-xl font-bold">{outreachCount}</p>
      </motion.div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ImperialCalendar() {
  const { incomes, expenses, followups, outreachRecords, clients, notifications } = useAppStore()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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
        detail: inc.clientName || inc.description || 'Income',
        amount: inc.amount,
        color: 'bg-emerald-400/10 text-emerald-400',
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
        detail: exp.description,
        amount: exp.amount,
        color: 'bg-red-400/10 text-red-400',
        icon: <TrendingDown className="w-3.5 h-3.5" />,
      })
    })

    // Followups
    followups.forEach(f => {
      const key = dateKey(f.dueDate)
      const clientName = f.clientName || clients.find(c => c.id === f.clientId)?.name || 'Unknown'
      addEvent(key, {
        id: `fol-${f.id}`,
        type: 'followup',
        label: `${f.type.charAt(0).toUpperCase() + f.type.slice(1)} — ${clientName}`,
        detail: f.note || `${f.status} followup`,
        color: f.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-sky-400/10 text-sky-400',
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
        color: 'bg-purple-400/10 text-purple-400',
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
        detail: n.message || 'Notification',
        color: 'bg-amber-400/10 text-amber-400',
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
    if (!selectedDate) return []
    return eventsMap[dateKey(selectedDate)] || []
  }, [selectedDate, eventsMap])

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
    setSelectedDate(null)
  }, [currentMonth])

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
    setSelectedDate(null)
  }, [currentMonth])

  const goToToday = useCallback(() => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(today)
  }, [today])

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-black/40 to-black/60 border border-amber-500/10 rounded-2xl p-6 lg:p-8"
      >
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />
        <div className="absolute top-6 right-12 w-1 h-1 rounded-full bg-amber-400/30 particle" />
        <div className="absolute top-16 right-24 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[11px] text-amber-400/70 uppercase tracking-widest font-medium">Timeline Intelligence</span>
          </div>
          <h1 className="gold-text text-3xl lg:text-4xl font-bold tracking-tight">
            Imperial Calendar
          </h1>
          <p className="text-white/30 text-sm mt-1">
            Your unified empire timeline — track income, expenses, outreach, and followups across time
          </p>
        </div>
      </motion.div>

      {/* Month Summary Stats */}
      <MonthSummary
        monthIncome={monthStats.income}
        monthExpense={monthStats.expense}
        followupCount={monthStats.followups}
        outreachCount={monthStats.outreach}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          CALENDAR GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-[#0e0e11] lg:bg-white/[0.03] lg:backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 max-w-3xl mx-auto w-full"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevMonth}
              className="text-white/40 hover:text-white/80 hover:bg-white/5 h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-white/90 text-lg font-bold min-w-[180px] text-center">
              {monthLabel}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="text-white/40 hover:text-white/80 hover:bg-white/5 h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/10 text-xs h-8 px-3 border border-amber-500/15"
            >
              Today
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/30 text-[10px]">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-white/30 text-[10px]">Expense</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-white/30 text-[10px]">Followup</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-white/30 text-[10px]">Outreach</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-white/30 text-[10px]">Notification</span>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map(day => (
            <div key={day} className="text-center">
              <span className="text-white/25 text-[10px] uppercase tracking-wider font-medium">
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((date, idx) => {
            const key = dateKey(date)
            const events = eventsMap[key] || []
            const isCurrentMonth = date.getMonth() === currentMonth
            const isTodayDate = dateKey(date) === dateKey(today)
            const isSelected = selectedDate ? dateKey(date) === dateKey(selectedDate) : false

            return (
              <DayCell
                key={idx}
                date={date}
                events={events}
                isCurrentMonth={isCurrentMonth}
                isToday={isTodayDate}
                isSelected={isSelected}
                onSelect={() => setSelectedDate(isSelected ? null : date)}
              />
            )
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SELECTED DAY DETAIL
          ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedDate && (
          <DayDetailPanel
            date={selectedDate}
            events={selectedEvents}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
