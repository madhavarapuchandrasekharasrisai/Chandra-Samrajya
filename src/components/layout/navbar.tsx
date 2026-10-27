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
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true
  const { setQuickAddOpen, setQuickAddTab, monthlyIncome, currentPage, mobileMenuOpen, setMobileMenuOpen, notifications, updateNotification, removeNotification } = useAppStore()
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setMounted(true)
  }, [])

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const pageNames: Record<string, string> = {
    overview: 'Command Center',
    sololeveling: '⚔️ Solo Leveling',
    wealth: 'Wealth Engine',
    budget: 'Budget Intelligence',
    business: 'Business Operations',
    clients: 'Client Empire',
    analytics: 'Analytics Chamber',
    discipline: 'Discipline System',
    warroom: 'War Room',
    karna: 'Karna AI',
    calendar: 'Imperial Calendar',
    jobs: 'Job Search',
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

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      notifications.forEach((notif) => {
        const notifTime = new Date(notif.dateTime)
        if (!notif.read && notifTime <= now && !notifiedIds.has(notif.id)) {
          toast(notif.title, {
            description: notif.message || 'Reminder time has arrived',
            icon: <Bell className="w-4 h-4 text-primary" />,
            duration: 10000,
            action: {
              label: 'Mark Read',
              onClick: () => handleMarkAsRead(notif.id)
            }
          })
          setNotifiedIds(prev => new Set(prev).add(notif.id))
        }
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [notifications, notifiedIds, updateNotification])

  const unreadCount = notifications.filter(n => !n.read).length
  
  const visibleNotifications = useMemo(() => {
    const todayStr = new Date().toDateString()
    return notifications
      .filter(n => !n.read || new Date(n.dateTime).toDateString() === todayStr)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  }, [notifications])

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-3 mt-2.5 rounded-xl bg-card/80 backdrop-blur-xl border border-border px-4 py-2.5 flex items-center justify-between shadow-sm">
          {/* Left: Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all lg:hidden"
            >
              <Menu className="w-5 h-5 text-primary" />
            </button>
            <div>
              <h2 className="text-foreground text-sm font-display font-bold tracking-wide uppercase">
                {pageNames[currentPage] || 'Overview'}
              </h2>
            </div>
          </div>

          {/* Center: Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-lg bg-secondary/50 border border-border text-muted-foreground text-sm hover:border-primary/20 hover:bg-secondary transition-all min-w-[260px]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">Search commands...</span>
            <kbd className="ml-auto text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground/50 font-mono">⌘K</kbd>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Hunter Recognition Pill */}
            <div className="flex items-center gap-2 pl-1 pr-2.5 py-0.5 rounded-full bg-cyan-500/[0.08] border border-cyan-500/25">
              <img
                src="/images/solo-leveling/jinwoo-awakened.jpg"
                alt="Chandra"
                className="w-5 h-5 rounded-full object-cover border border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
              />
              <span className="hidden sm:inline text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-300">
                CHANDRA // AWAKENED
              </span>
            </div>

            {/* System Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/5 border border-primary/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] text-primary font-mono font-medium tracking-wider uppercase">System Online</span>
            </div>

            {/* Date */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 border border-border">
              <CalendarDays className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground font-mono">{today}</span>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 rounded-lg transition-all"
                title={isDark ? "Switch to Morning Light View" : "Switch to Sovereign Night View"}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
              </Button>
            )}

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 rounded-lg">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card animate-pulse" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-popover border-border shadow-2xl rounded-xl">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-display font-bold text-foreground tracking-wide uppercase">Notifications</h4>
                    <p className="text-[10px] text-muted-foreground font-mono">System alerts & reminders</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-[10px] font-mono font-medium px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {visibleNotifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground/60 text-xs">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="font-mono">No active alerts.</p>
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
                              'p-3 border-b border-border/40 transition-colors hover:bg-accent/50 flex gap-3',
                              !notif.read ? 'bg-primary/[0.03]' : 'opacity-60'
                            )}
                          >
                            <div className="mt-0.5">
                              {notif.read ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : isPast ? (
                                <Bell className="w-4 h-4 text-primary animate-pulse" />
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
                              <p className="text-[9px] text-muted-foreground/80 mt-1.5 flex items-center gap-1 font-mono">
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
                                className="w-6 h-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete"
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
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold text-xs h-8 px-3 rounded-lg tracking-wider uppercase"
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
