'use client'

import { useState, useEffect } from 'react'
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
  Calendar,
  LogOut,
  Briefcase,
  Flame,
  Sun,
  Moon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Executive Overview', icon: <Home className="w-4 h-4" /> },
  { id: 'sololeveling', label: '⚔️ SOLO LEVELING', icon: <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> },
  { id: 'wealth', label: 'Wealth Engine', icon: <Gem className="w-4 h-4" /> },
  { id: 'calendar', label: 'Imperial Calendar', icon: <Calendar className="w-4 h-4" /> },
  { id: 'jobs', label: 'Job Search', icon: <Briefcase className="w-4 h-4" /> },
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
  calendar: '📅',
  karna: '★',
  jobs: '💼',
  sololeveling: '⚔',
}

export function Sidebar() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const { 
    currentPage, 
    setCurrentPage, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    mobileMenuOpen,
    setMobileMenuOpen 
  } = useAppStore()

  const [isMobile, setIsMobile] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Define animations based on responsive state
  const animateState = isMobile
    ? { x: mobileMenuOpen ? 0 : -280, width: 280 }
    : { x: 0, width: sidebarCollapsed ? 72 : 260 }

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={animateState}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar fixed left-0 top-0 h-full z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between gap-3 border-b border-border/40">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="God System Logo" 
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 flex-shrink-0"
            />
            {(!sidebarCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="gold-text font-bold text-sm tracking-wider">GOD SYSTEM</h1>
                <p className="text-[10px] dark:text-white/30 text-slate-500 tracking-widest uppercase">Sovereign OS</p>
              </motion.div>
            )}
          </div>
          
          {/* Close button for Mobile Menu */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg dark:text-white/40 text-slate-500 hover:text-slate-900 dark:hover:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 transition-all lg:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id)
                  if (isMobile) setMobileMenuOpen(false)
                }}
                className={cn(
                  'nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                  isActive
                    ? 'active bg-amber-500/10 text-amber-600 dark:text-amber-400 border-l-2 border-amber-500 dark:border-amber-400'
                    : 'text-slate-600 dark:text-white/50 hover:text-slate-950 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/5 border-l-2 border-transparent'
                )}
              >
                <span className={cn('flex-shrink-0', isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-white/40')}>
                  {(sidebarCollapsed && !isMobile) ? <span className="text-base">{navSymbols[item.id]}</span> : item.icon}
                </span>
                {(!sidebarCollapsed || isMobile) && (
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
        <div className="p-3 space-y-2 border-t border-border/40">

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500 hover:text-red-400 text-xs transition-all font-medium"
            title="Logout Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Logout Session</span>}
          </button>

          {/* Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg dark:text-white/20 text-slate-400 hover:text-white/50 hover:bg-white/5 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
