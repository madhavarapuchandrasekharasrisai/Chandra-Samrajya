'use client'

import { useAppStore, type PageType } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import {
  Home,
  Gem,
  CircleDot,
  Zap,
  Target,
  Hexagon,
  Star,
  Sword,
  Bot,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
} from 'lucide-react'
import { motion } from 'framer-motion'

const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Executive Overview', icon: <Home className="w-4 h-4" /> },
  { id: 'wealth', label: 'Wealth Engine', icon: <Gem className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget Intelligence', icon: <CircleDot className="w-4 h-4" /> },
  { id: 'business', label: 'Business Operations', icon: <Zap className="w-4 h-4" /> },
  { id: 'clients', label: 'Client Empire', icon: <Target className="w-4 h-4" /> },
  { id: 'analytics', label: 'Analytics Chamber', icon: <Hexagon className="w-4 h-4" /> },
  { id: 'discipline', label: 'Discipline System', icon: <Star className="w-4 h-4" /> },
  { id: 'warroom', label: 'War Room', icon: <Sword className="w-4 h-4" /> },
  { id: 'karna', label: 'Karna AI', icon: <Bot className="w-4 h-4" /> },
]

const navSymbols: Record<PageType, string> = {
  overview: '⌂',
  wealth: '◈',
  budget: '◎',
  business: '⚡',
  clients: '◉',
  analytics: '⬡',
  discipline: '✦',
  warroom: '⚔',
  karna: '★',
}

export function Sidebar() {
  const { currentPage, setCurrentPage, sidebarCollapsed, setSidebarCollapsed, monthlyTarget, monthlyIncome } = useAppStore()

  const disciplineScore = monthlyTarget > 0 ? Math.min(100, Math.round((monthlyIncome / monthlyTarget) * 70 + 30)) : 30
  const now = new Date()
  const monthStr = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="glass-sidebar fixed left-0 top-0 h-full z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-400 font-bold text-lg">D</span>
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="gold-text font-bold text-sm tracking-wider">DHANAVI</h1>
            <p className="text-[10px] text-white/30 tracking-widest uppercase">Samrajya</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'active bg-amber-500/10 text-amber-400 border-l-2 border-amber-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent'
              )}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-amber-400' : 'text-white/40')}>
                {sidebarCollapsed ? <span className="text-base">{navSymbols[item.id]}</span> : item.icon}
              </span>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate text-[13px]"
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom Info */}
      <div className="p-3 space-y-3 border-t border-white/5">
        {/* Discipline Score */}
        <div className={cn('rounded-xl p-3', sidebarCollapsed ? 'bg-amber-500/5' : 'bg-amber-500/5 border border-amber-500/10')}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-xs font-bold">{disciplineScore}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-amber-400/70 uppercase tracking-wider">Discipline</span>
                <span className="text-amber-400 font-bold text-sm">{disciplineScore}</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full budget-progress"
                  style={{ width: `${disciplineScore}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Monthly Target */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl p-3 bg-white/[0.02] border border-white/5"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-white/30" />
              <span className="text-[11px] text-white/30 uppercase tracking-wider">{monthStr}</span>
            </div>
            <div className="text-white/60 text-xs">
              Target: <span className="text-amber-400/80">₹{monthlyTarget.toLocaleString('en-IN')}</span>
            </div>
          </motion.div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  )
}
