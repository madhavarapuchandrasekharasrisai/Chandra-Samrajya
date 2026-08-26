'use client'

import { useAppStore } from '@/store/use-app-store'
import { Search, Bell, Plus, Sparkles, CalendarDays, Menu, Check, Clock, X, Trash2, Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useState, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { setQuickAddOpen, setQuickAddTab, monthlyIncome, currentPage, mobileMenuOpen, setMobileMenuOpen, notifications, updateNotification, removeNotification } = useAppStore()
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pageNames: Record<string, string> = {
    overview: 'Executive Overview',
    sololeveling: '⚔️ Solo Leveling',
    wealth: 'Wealth Engine',
    budget: 'Budget Intelligence',
    business: 'Business Operations',
    clients: 'Client Empire',
    analytics: 'Analytics Chamber',
    discipline: 'Discipline System',
    warroom: 'War Room',
    karna: 'Karna AI',
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      })
      if (res.ok) {
        updateNotification(id, { read: true })
      }
    } catch (error) {
      console.error('Failed to mark read:', error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        removeNotification(id)
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Timer for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      notifications.forEach((notif) => {
        const notifTime = new Date(notif.dateTime)
        // If the time has passed in the last minute and we haven't notified yet
        if (!notif.read && notifTime <= now && !notifiedIds.has(notif.id)) {
          toast(notif.title, {
            description: notif.message || 'Reminder time has arrived',
            icon: <Bell className="w-4 h-4 text-amber-500" />,
            duration: 10000,
            action: {
              label: 'Mark Read',
              onClick: () => handleMarkAsRead(notif.id)
            }
          })
          setNotifiedIds(prev => new Set(prev).add(notif.id))
        }
      })
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [notifications, notifiedIds, updateNotification])

  const unreadCount = notifications.filter(n => !n.read).length
  
  // Show all unread notifications + any read notifications for today
  const visibleNotifications = useMemo(() => {
    const todayStr = new Date().toDateString()
    return notifications
      .filter(n => !n.read || new Date(n.dateTime).toDateString() === todayStr)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  }, [notifications])

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-4 mt-3 rounded-2xl bg-black/40 dark:bg-black/60 backdrop-blur-xl border border-border px-5 py-3 flex items-center justify-between shadow-sm">
          {/* Left: Greeting + Page Name + Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all lg:hidden"
            >
              <Menu className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </button>
            <div>
              <h2 className="text-foreground text-xs sm:text-sm font-semibold tracking-wide">{pageNames[currentPage] || 'Overview'}</h2>
            </div>
          </div>

          {/* Center: Command Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-muted/30 border border-border text-muted-foreground/60 text-sm hover:border-amber-500/20 hover:text-muted-foreground/80 transition-all min-w-[280px]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search commands...</span>
            <kbd className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground/30">⌘K</kbd>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* AI Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-[11px] text-amber-700/85 dark:text-amber-400/70 font-medium">Karna Active</span>
            </div>

            {/* Date */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border">
              <CalendarDays className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground">{today}</span>
            </div>

            {/* Theme Toggle Button */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8 rounded-xl transition-all"
                title={theme === 'dark' ? "Switch to Morning" : "Switch to Night"}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </Button>
            )}

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 w-8">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-background" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-popover border-border shadow-2xl rounded-xl">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                    <p className="text-[10px] text-muted-foreground">Reminders & updates</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {visibleNotifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground/60 text-xs">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      No notifications for today.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {visibleNotifications.map((notif) => {
                        const notifDate = new Date(notif.dateTime)
                        const isPast = notifDate < new Date()
                        return (
                          <div
                            key={notif.id}
                            className={cn(
                              'p-3 border-b border-border/40 transition-colors hover:bg-muted/30 flex gap-3',
                              !notif.read ? 'bg-amber-500/5' : 'opacity-60'
                            )}
                          >
                            <div className="mt-0.5">
                              {notif.read ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : isPast ? (
                                <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
                              ) : (
                                <Clock className="w-4 h-4 text-sky-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={cn('text-xs font-medium truncate', !notif.read ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                                {notif.title}
                              </h5>
                              {notif.message && (
                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                                  {notif.message}
                                </p>
                              )}
                              <p className="text-[9px] text-muted-foreground/80 mt-1.5 flex items-center gap-1">
                                {notifDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                <span>•</span>
                                {notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex flex-col gap-1 items-center">
                              {!notif.read && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="w-6 h-6 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteNotification(notif.id)}
                                className="w-6 h-6 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                title="Delete notification"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Quick Add */}
            <Button
              onClick={() => setQuickAddOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium text-xs h-8 px-3 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Quick Add
            </Button>
          </div>
        </div>
      </header>

      {/* Command Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {Object.entries(pageNames).map(([id, name]) => (
              <CommandItem
                key={id}
                onSelect={() => {
                  useAppStore.getState().setCurrentPage(id as any)
                  setCommandOpen(false)
                }}
              >
                {name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setQuickAddTab('income'); setQuickAddOpen(true); setCommandOpen(false) }}>
              Add Income
            </CommandItem>
            <CommandItem onSelect={() => { setQuickAddTab('expense'); setQuickAddOpen(true); setCommandOpen(false) }}>
              Add Expense
            </CommandItem>
            <CommandItem onSelect={() => { setQuickAddTab('client'); setQuickAddOpen(true); setCommandOpen(false) }}>
              Add Client
            </CommandItem>
            <CommandItem onSelect={() => { setQuickAddTab('followup'); setQuickAddOpen(true); setCommandOpen(false) }}>
              Add Followup
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
