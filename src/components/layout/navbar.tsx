'use client'

import { useAppStore } from '@/store/use-app-store'
import { Search, Bell, Plus, Sparkles, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useState, useEffect } from 'react'

export function Navbar() {
  const { setQuickAddOpen, setQuickAddTab, monthlyIncome, currentPage } = useAppStore()
  const [commandOpen, setCommandOpen] = useState(false)

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
    wealth: 'Wealth Engine',
    budget: 'Budget Intelligence',
    business: 'Business Operations',
    clients: 'Client Empire',
    analytics: 'Analytics Chamber',
    discipline: 'Discipline System',
    warroom: 'War Room',
    karna: 'Karna AI',
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-4 mt-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/[0.06] px-5 py-3 flex items-center justify-between">
          {/* Left: Greeting + Page Name */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-white/30 text-xs">{greeting}, Chandra</p>
              <h2 className="text-white/90 text-sm font-medium">{pageNames[currentPage] || 'Overview'}</h2>
            </div>
          </div>

          {/* Center: Command Search */}
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 text-sm hover:border-amber-500/20 hover:text-white/50 transition-all min-w-[280px]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search commands...</span>
            <kbd className="ml-auto text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/20">⌘K</kbd>
          </button>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* AI Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] text-amber-400/70">Karna Active</span>
            </div>

            {/* Date */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <CalendarDays className="w-3 h-3 text-white/30" />
              <span className="text-[11px] text-white/40">{today}</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-white/40 hover:text-white/70 hover:bg-white/5 h-8 w-8">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400" />
            </Button>

            {/* Quick Add */}
            <Button
              onClick={() => setQuickAddOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-medium text-xs h-8 px-3 rounded-lg"
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
