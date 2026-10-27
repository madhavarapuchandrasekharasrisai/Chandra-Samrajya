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
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from 'next-themes'

const navItems: { id: PageType; label: string; icon: React.ReactNode; rank?: string }[] = [
  { id: 'overview', label: 'Command Center', icon: <Home className="w-4 h-4" />, rank: 'HQ' },
  { id: 'sololeveling', label: 'Solo Leveling', icon: <Flame className="w-4 h-4" />, rank: 'SL' },
  { id: 'wealth', label: 'Wealth Engine', icon: <Gem className="w-4 h-4" />, rank: 'WE' },
  { id: 'calendar', label: 'Imperial Calendar', icon: <Calendar className="w-4 h-4" />, rank: 'IC' },
  { id: 'jobs', label: 'Job Search', icon: <Briefcase className="w-4 h-4" />, rank: 'JS' },
  { id: 'budget', label: 'Budget Intel', icon: <CircleDot className="w-4 h-4" />, rank: 'BI' },
  { id: 'business', label: 'Business Ops', icon: <Zap className="w-4 h-4" />, rank: 'BO' },
  { id: 'clients', label: 'Client Empire', icon: <Target className="w-4 h-4" />, rank: 'CE' },
  { id: 'analytics', label: 'Analytics', icon: <Hexagon className="w-4 h-4" />, rank: 'AN' },
  { id: 'discipline', label: 'Discipline', icon: <Star className="w-4 h-4" />, rank: 'DS' },
  { id: 'warroom', label: 'War Room', icon: <Sword className="w-4 h-4" />, rank: 'WR' },
  { id: 'karna', label: 'Karna AI', icon: <Bot className="w-4 h-4" />, rank: 'AI' },
]

export function Sidebar() {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted ? (resolvedTheme || theme) === 'dark' : true

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

  const animateState = isMobile
    ? { x: mobileMenuOpen ? 0 : -280, width: 280 }
    : { x: 0, width: sidebarCollapsed ? 72 : 260 }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-card/95 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={animateState}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-sidebar fixed left-0 top-0 h-full z-50 flex flex-col"
      >
        {/* ── Logo Header ── */}
        <div className="p-4 flex items-center justify-between gap-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img 
                src="/logo.jpg" 
                alt="God System" 
                className="w-10 h-10 rounded-lg object-cover border border-primary/30"
              />
              {/* System active indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-sidebar" />
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="gold-text font-display font-bold text-sm tracking-[0.15em] uppercase">GOD SYSTEM</h1>
                <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-mono">Sovereign OS</p>
              </motion.div>
            )}
          </div>
          
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all lg:hidden"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>
          )}
        </div>

        {/* ── Hunter Identity Card ── */}
        <div className="px-3 py-2 border-b border-border/60">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-cyan-500/[0.04] dark:bg-cyan-950/20 border border-cyan-500/20">
            <div className="relative flex-shrink-0">
              <img 
                src="/images/solo-leveling/jinwoo-awakened.jpg" 
                alt="Hunter Chandra" 
                className="w-8 h-8 rounded-lg object-cover border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 ring-1 ring-background animate-pulse" />
            </div>
            {(!sidebarCollapsed || isMobile) && (
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-foreground truncate font-mono">CHANDRASEKHAR</p>
                <p className="text-[9px] text-cyan-600 dark:text-cyan-400 font-mono font-semibold uppercase tracking-wider">Awakened Sovereign</p>
              </div>
            )}
          </div>
        </div>

        {/* ── System Navigation ── */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
          {/* Section label */}
          {(!sidebarCollapsed || isMobile) && (
            <p className="text-[9px] text-muted-foreground/60 font-mono uppercase tracking-[0.2em] px-3 py-2 font-semibold">
              System Modules
            </p>
          )}
          
          {navItems.map((item, index) => {
            const isActive = currentPage === item.id
            const isSoloLeveling = item.id === 'sololeveling'
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                onClick={() => {
                  setCurrentPage(item.id)
                  if (isMobile) setMobileMenuOpen(false)
                }}
                className={cn(
                  'nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative group',
                  isActive
                    ? 'active text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-transparent',
                  isSoloLeveling && !isActive && 'text-purple-600 dark:text-purple-400'
                )}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-lg"
                    transition={{ type: "spring", duration: 0.4 }}
                  />
                )}
                
                <span className={cn(
                  'flex-shrink-0 relative z-10 transition-colors',
                  isActive ? 'text-primary' : isSoloLeveling ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  {(sidebarCollapsed && !isMobile) ? (
                    <span className="text-[10px] font-mono font-bold tracking-wider">{item.rank}</span>
                  ) : item.icon}
                </span>
                
                {(!sidebarCollapsed || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate text-[13px] relative z-10 font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* ── Bottom Controls ── */}
        <div className="p-3 space-y-2 border-t border-border/60">
          {/* Theme Toggle */}
          {mounted && (!sidebarCollapsed || isMobile) && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-accent/60 hover:bg-accent border border-border text-foreground text-xs transition-all font-semibold font-mono shadow-2xs"
              title={isDark ? "Switch to Morning Light View" : "Switch to Sovereign Night View"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-primary" />}
              <span>{isDark ? 'Switch to Morning' : 'Switch to Night'}</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-destructive/5 hover:bg-destructive/10 border border-destructive/10 hover:border-destructive/20 text-destructive text-xs transition-all font-medium"
            title="Logout Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
          </button>

          {/* Collapse Toggle */}
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {!sidebarCollapsed && <span className="text-xs font-mono">Collapse</span>}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
