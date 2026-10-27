'use client'

import React, { useEffect, useState } from 'react'
import { useSoloLevelingStore, DAILY_CORE_PROTOCOLS, WEEKLY_SPECIALIZATIONS } from '@/store/use-solo-leveling-store'
import { getPowerRequiredForLevel, getWeeklyQuests, getWeekKey, FANTASY_POWERS, getUnlockedPowers, getNextPower } from '@/lib/solo-leveling-calc'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Flame,
  Zap,
  Shield,
  Activity,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  MessageSquare,
  Briefcase,
  Lock,
  Sparkles,
  Trash2,
  Trophy,
  Clock,
  Loader2,
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'

// Authentic Solo Leveling Motivation Creed & System Sound
const MOTIVATION_QUOTES = [
  "I am the only one who can level up in this world. Sweat in training, reign in battle.",
  "If I don't move forward, I will be devoured. Only the strong rewrite fate.",
  "Do not rely on luck. Power forged through relentless daily discipline never betrays you.",
  "Pain is temporary. Quitting is an eternal penalty. ARISE.",
  "Every push-up, every minute of deep work, every focused hour extracts your future greatness.",
  "The Monarch does not negotiate with laziness. Crush the daily protocol.",
  "Today's grueling discipline is tomorrow's absolute sovereignty.",
]

function playSystemChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Audio autoplay restrictions or headless environment
  }
}

// Addictive count-up number animation component
function AnimateNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.floor(value)
    if (end === 0) {
      setDisplayValue(0)
      return
    }
    if (start === end) {
      setDisplayValue(end)
      return
    }
    
    // Quick speed calibration based on target value
    const steps = Math.min(end, 50)
    const stepTime = Math.max(10, Math.floor(duration / steps))
    const increment = Math.ceil(end / steps)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        clearInterval(timer)
        setDisplayValue(end)
      } else {
        setDisplayValue(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{displayValue}</span>
}

const getShortStatName = (stat: string) => {
  const mapping: Record<string, string> = {
    strength: 'STR',
    agility: 'AGI',
    intelligence: 'INT',
    memory: 'MEM',
    discipline: 'DISC',
    focus: 'FOC',
    communication: 'COMM',
    confidence: 'CONF',
    stability: 'STAB',
    careerXp: 'EXP',
  }
  return mapping[stat] || stat.toUpperCase()
}

export function SoloLeveling() {
  const storeStats = useSoloLevelingStore((s) => s.stats)
  const { completedTasks, isLoading, fetchStats, completeTask, resetDaily, purgeStats } = useSoloLevelingStore()
  const [systemBooting, setSystemBooting] = useState(true)
  const [bootProgress, setBootProgress] = useState(0)
  const [consoleLogs, setConsoleLogs] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState('')
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null)
  const [showDiagnostic, setShowDiagnostic] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MOTIVATION_QUOTES.length)
    }, 7000)
    return () => clearInterval(quoteInterval)
  }, [])

  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    if (isCompleted) {
      playSystemChime()
    }
    completeTask(taskId, isCompleted)
  }

  const handlePurge = () => {
    if (window.confirm('⚠️ WARNING: This will completely purge all biometrics, streaks, milestones, and daily logs. Are you sure you want to reset your system to a Civilian state (start from zero)?')) {
      purgeStats()
    }
  }

  // Define dynamic fallback stats when storeStats is null (under sovereign loader cover)
  const stats = storeStats || {
    id: '',
    strength: 10,
    agility: 10,
    intelligence: 10,
    memory: 10,
    discipline: 10,
    focus: 10,
    communication: 10,
    confidence: 10,
    stability: 10,
    careerXp: 10,
    powerLevel: 0,
    physicalPower: 0,
    mentalPower: 0,
    disciplinePower: 0,
    communicationPower: 0,
    careerPower: 0,
    unlockedMilestones: '',
    currentRank: 'Civilian',
    perfectStreak: 0,
    weeklyStreak: 0,
    failureState: 0,
    xpMultiplier: 1.0,
    level: 1,
    weeklyQuestWeek: '',
    weeklyQuestsCleared: '',
    lastUpdated: '',
  }

  // Dramatic load sequence
  useEffect(() => {
    fetchStats()
    
    // Fast boot sequences
    setConsoleLogs([])
    const logs = [
      '⚔️ SOVEREIGN PROTOCOL: CONNECTING...',
      '📡 SYNCING SATELLITE CORE BIOMETRICS...',
      '🧬 ATOMIC STAT FACTOR LOADED (DISCIPLINE: 1.7X)',
      '🔋 CALCULATING QUANTUM POWER DEVIATION...',
      '🛡️ SOVEREIGN SUITE AWAKENED!'
    ]

    let currentLogIndex = 0
    const logInterval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setConsoleLogs(prev => [...prev, logs[currentLogIndex]])
        currentLogIndex++
      } else {
        clearInterval(logInterval)
      }
    }, 250)

    const diagTimeout = setTimeout(() => {
      setShowDiagnostic(true)
    }, 4000)

    const progressInterval = setInterval(() => {
      setBootProgress(prev => {
        const currentStats = useSoloLevelingStore.getState().stats
        // Hold at 90% if stats are still not loaded from database
        if (prev >= 90 && !currentStats) {
          return 90
        }
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => setSystemBooting(false), 300)
          return 100
        }
        return prev + 5
      })
    }, 80)

    return () => {
      clearInterval(logInterval)
      clearInterval(progressInterval)
      clearTimeout(diagTimeout)
    }
  }, [fetchStats])

  // Midnight countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setUTCHours(24, 0, 0, 0)
      const diff = midnight.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [])

  const currentWeekKey = getWeekKey()
  const weeklyQuests = getWeeklyQuests(currentWeekKey)
  const isCurrentWeek = stats.weeklyQuestWeek === currentWeekKey
  const claimedQuestIds = isCurrentWeek
    ? (stats.weeklyQuestsCleared || '').split(',').filter(Boolean)
    : []

  const handleClaimQuest = async (questId: string) => {
    setClaimingQuestId(questId)
    try {
      const res = await fetch('/api/solo-leveling/weekly-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questId }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Quest Reward Claimed! ⚡', { description: data.reward })
        await fetchStats()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to claim reward')
      }
    } catch {
      toast.error('Failed to claim quest reward')
    } finally {
      setClaimingQuestId(null)
    }
  }

  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todaySpecializations = WEEKLY_SPECIALIZATIONS[dayOfWeek] || []

  // Complete curated design themes for each Rank
  const getRankDetails = (rank: string) => {
    switch (rank) {
      case 'Shadow Monarch':
        return {
          title: 'SHADOW MONARCH',
          badgeText: '👑 THE APEX SOVEREIGN',
          color: 'text-purple-700 border-purple-200 bg-purple-50 dark:text-[#9d4edd] dark:border-[#7b2cbf]/40 dark:bg-purple-950/15',
          glow: 'shadow-[0_4px_20px_rgba(157,78,221,0.12)] border-purple-200/60 dark:shadow-[0_0_35px_rgba(157,78,221,0.5)] dark:border-[#9d4edd]/50',
          auraClass: 'bg-gradient-to-r from-purple-500/10 via-white to-indigo-500/10 dark:from-purple-600/20 dark:via-background dark:to-indigo-600/20 shadow-purple-500/5 dark:shadow-purple-500/25 animate-pulse',
          description: 'Monarch of the Absolute Void. Your discipline stands absolute, ruling over shadows and mortal boundaries.',
          requiredLevel: '15001+',
          particleColor: 'bg-purple-500',
        }
      case 'Monarch':
        return {
          title: 'SOVEREIGN MONARCH',
          badgeText: '⚔️ MONARCH CLASS',
          color: 'text-indigo-700 border-indigo-200 bg-indigo-50 dark:text-[#c77dff] dark:border-[#b5179e]/30 dark:bg-purple-900/10',
          glow: 'shadow-[0_4px_20px_rgba(199,125,255,0.08)] border-indigo-200/50 dark:shadow-[0_0_25px_rgba(199,125,255,0.3)] dark:border-[#c77dff]/35',
          auraClass: 'bg-purple-50/50 dark:bg-purple-900/10 shadow-indigo-500/5 dark:shadow-indigo-500/15',
          description: 'Awakened ruler of the System. Extreme mental consistency and focus allow you to manifest reality at will.',
          requiredLevel: '9001 - 15000',
          particleColor: 'bg-indigo-400',
        }
      case 'Commander':
        return {
          title: 'IMPERIAL COMMANDER',
          badgeText: '🎖️ COMMANDER CLASS',
          color: 'text-red-700 border-red-200 bg-red-50 dark:text-[#e63946] dark:border-[#d90429]/30 dark:bg-red-950/10',
          glow: 'shadow-[0_4px_20px_rgba(230,57,70,0.08)] border-red-200/50 dark:shadow-[0_0_20px_rgba(230,57,70,0.3)] dark:border-[#e63946]/35',
          auraClass: 'bg-red-50/50 dark:bg-red-950/10 shadow-red-500/5 dark:shadow-red-500/15',
          description: 'Military tactician. Your stats dictate the execution of massive projects and absolute strategic mastery.',
          requiredLevel: '5001 - 9000',
          particleColor: 'bg-red-500',
        }
      case 'Elite':
        return {
          title: 'ELITE VANGUARD',
          badgeText: '🔥 ELITE CLASS',
          color: 'text-amber-700 border-amber-200 bg-amber-50 dark:text-[#ffb703] dark:border-[#fb8500]/30 dark:bg-amber-950/10',
          glow: 'shadow-[0_4px_20px_rgba(255,183,3,0.08)] border-amber-200/50 dark:shadow-[0_0_20px_rgba(255,183,3,0.25)] dark:border-[#ffb703]/35',
          auraClass: 'bg-amber-50/50 dark:bg-amber-950/10 shadow-amber-500/5 dark:shadow-amber-500/15',
          description: 'A relentless powerhouse of focus. Consistently crushing limits and ascending above standard benchmarks.',
          requiredLevel: '2501 - 5000',
          particleColor: 'bg-amber-400',
        }
      case 'Warrior':
        return {
          title: 'SOVEREIGN WARRIOR',
          badgeText: '⚔️ WARRIOR CLASS',
          color: 'text-teal-700 border-teal-200 bg-teal-50 dark:text-[#00f5d4] dark:border-[#00bbf9]/30 dark:bg-teal-950/10',
          glow: 'shadow-[0_4px_20px_rgba(0,245,212,0.06)] border-teal-200/50 dark:shadow-[0_0_15px_rgba(0,245,212,0.2)] dark:border-[#00f5d4]/35',
          auraClass: 'bg-teal-50/30 dark:bg-teal-950/5 shadow-teal-500/5 dark:shadow-teal-500/10',
          description: 'Highly trained fighter. Base physical and intellectual parameters are fully integrated into daily habits.',
          requiredLevel: '1201 - 2500',
          particleColor: 'bg-teal-400',
        }
      case 'Aspirant':
        return {
          title: 'SYSTEM ASPIRANT',
          badgeText: '⚡ ASPIRANT CLASS',
          color: 'text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-[#55a630] dark:border-[#38b000]/20 dark:bg-emerald-950/10',
          glow: 'shadow-[0_4px_20px_rgba(85,166,48,0.05)] border-emerald-200/50 dark:shadow-[0_0_12px_rgba(85,166,48,0.15)] dark:border-[#55a630]/25',
          auraClass: 'bg-emerald-50/30 dark:bg-emerald-950/5 shadow-emerald-500/5 dark:shadow-emerald-500/5',
          description: 'Potential awakened. The system is beginning to synchronize with your focus cycles. Keep grinding.',
          requiredLevel: '501 - 1200',
          particleColor: 'bg-emerald-400',
        }
      default:
        return {
          title: 'UNRANKED CIVILIAN',
          badgeText: '💀 CIVILIAN CLASS',
          color: 'text-slate-500 border-slate-200 bg-slate-50 dark:text-muted-foreground dark:border-border dark:bg-secondary/50',
          glow: 'shadow-none border-slate-200 dark:border-border',
          auraClass: 'bg-slate-50/40 dark:bg-secondary/50 shadow-transparent',
          description: 'Biometrics inactive. Awaken your inner Monarch by completing base protocols and breaking limit values.',
          requiredLevel: '0 - 500',
          particleColor: 'bg-white',
        }
    }
  }

  const rankInfo = getRankDetails(stats.currentRank)

  // Experience bounds mapping for the progress gauge
  let nextRankName = 'Aspirant'
  let prevThreshold = 0
  let nextThreshold = 500

  if (stats.powerLevel >= 15001) {
    nextRankName = 'Max Ascended Rank'
    prevThreshold = 15001
    nextThreshold = 30000
  } else if (stats.powerLevel >= 9001) {
    nextRankName = 'Shadow Monarch'
    prevThreshold = 9001
    nextThreshold = 15000
  } else if (stats.powerLevel >= 5001) {
    nextRankName = 'Monarch'
    prevThreshold = 5001
    nextThreshold = 9000
  } else if (stats.powerLevel >= 2501) {
    nextRankName = 'Commander'
    prevThreshold = 2501
    nextThreshold = 5000
  } else if (stats.powerLevel >= 1201) {
    nextRankName = 'Elite'
    prevThreshold = 1201
    nextThreshold = 2500
  } else if (stats.powerLevel >= 501) {
    nextRankName = 'Warrior'
    prevThreshold = 501
    nextThreshold = 1200
  }

  const rankProgressPercent = Math.min(
    100,
    Math.max(0, ((stats.powerLevel - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
  )

  const radarData = [
    { subject: 'STR', value: stats.strength },
    { subject: 'AGI', value: stats.agility },
    { subject: 'INT', value: stats.intelligence },
    { subject: 'MEM', value: stats.memory },
    { subject: 'DISC', value: stats.discipline },
    { subject: 'FOC', value: stats.focus },
    { subject: 'COMM', value: stats.communication },
    { subject: 'CONF', value: stats.confidence },
    { subject: 'STAB', value: stats.stability },
    { subject: 'EXP', value: stats.careerXp },
  ]

  const totalCore = DAILY_CORE_PROTOCOLS.length
  const completedCoreCount = DAILY_CORE_PROTOCOLS.filter((p) => completedTasks[p.id]).length
  const completedSpecialCount = todaySpecializations.filter((p) => completedTasks[p.id]).length

  // Parse unlocked milestones
  const unlockedMilestonesArray = stats.unlockedMilestones
    ? stats.unlockedMilestones.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const hasIronBody = unlockedMilestonesArray.includes('Iron Body')
  const hasUnbreakableMind = unlockedMilestonesArray.includes('Unbreakable Mind')
  const hasTacticalGenius = unlockedMilestonesArray.includes('Tactical Genius')

  return (
    <div className="space-y-6 lg:space-y-5 relative overflow-hidden pb-10">
      {/* Immersive Sovereign Ambient Portal Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-purple-500/[0.03] filter blur-[60px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-orange-500/[0.02] filter blur-[80px] animate-pulse" />
        <div className="absolute top-[60%] left-[40%] w-80 h-80 rounded-full bg-indigo-500/[0.02] filter blur-[70px] animate-pulse" />
        
        {/* Floating Ember Particles */}
        <div className="absolute top-[15%] left-[25%] w-1.5 h-1.5 rounded-full bg-orange-400/30 filter blur-[0.5px] particle" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="absolute top-[45%] right-[15%] w-2 h-2 rounded-full bg-purple-400/25 filter blur-[0.5px] particle" style={{ animationDelay: '1.5s', animationDuration: '9s' }} />
        <div className="absolute bottom-[35%] left-[15%] w-1 h-1 rounded-full bg-amber-400/20 filter blur-[0.5px] particle" style={{ animationDelay: '3s', animationDuration: '6s' }} />
        <div className="absolute top-[75%] left-[55%] w-2 h-2 rounded-full bg-indigo-400/25 filter blur-[0.5px] particle" style={{ animationDelay: '0.5s', animationDuration: '8s' }} />
        <div className="absolute bottom-[15%] right-[35%] w-1.5 h-1.5 rounded-full bg-red-400/20 filter blur-[0.5px] particle" style={{ animationDelay: '4.2s', animationDuration: '10s' }} />
      </div>
      {/* Dramatic Glitch Matrix Calibration sequence */}
      <AnimatePresence>
        {systemBooting && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-background z-[999] flex flex-col items-center justify-center p-6"
          >
            <div className="max-w-md w-full space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
                <h1 className="font-display text-2xl font-black text-foreground tracking-widest font-mono">GOD SYSTEM</h1>
              </div>
              <div className="border border-border rounded-xl p-4 bg-card font-mono text-[10px] space-y-1.5 text-muted-foreground h-36 overflow-hidden">
                {consoleLogs.map((log, i) => (
                  <p key={i} className="animate-pulse">{log}</p>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-600 to-indigo-500"
                    style={{ width: `${bootProgress}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground/60">
                  <span>SYSTEM CALIBRATION</span>
                  <span>{bootProgress}%</span>
                </div>
              </div>

              {showDiagnostic && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border border-yellow-500/20 bg-yellow-950/10 rounded-xl p-4 space-y-3 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-yellow-500 font-mono text-[10px] font-bold">
                    <AlertTriangle className="w-4 h-4 animate-bounce text-yellow-500" />
                    <span>DATABASE SYNCHRONIZATION DELAYED</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-mono leading-relaxed max-w-sm mx-auto">
                    The system is waiting for database synchronization. If you just deployed, make sure to add your database environment variables (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY) in your Vercel project settings and redeploy.
                  </p>
                  <button
                    onClick={() => {
                      setSystemBooting(false);
                      toast.info("Offline System Mode loaded. Showing biometrics baseline.", {
                        description: "Establish a database connection to sync live statistics.",
                      });
                    }}
                    className="w-full py-1.5 px-3 border border-orange-500/30 hover:border-orange-500/60 bg-orange-950/20 text-orange-400 hover:text-orange-300 font-mono text-[9px] font-bold rounded-lg transition-all"
                  >
                    ⚡ BYPASS SYNC & ENTER OFFLINE PROTOCOL
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure State flickering Red Overlay & Glitch Warnings */}
      {stats.failureState === 1 && (
        <>
          <div className="fixed inset-0 border-[8px] border-red-500/20 pointer-events-none z-[49] animate-[ping_1.5s_infinite] bg-red-950/[0.03]" />
          <div className="fixed top-20 right-6 z-[49] pointer-events-none font-mono text-[10px] text-red-500 bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>SOLO LEVELING SYNCHRONIZATION WEAKENING</span>
          </div>
          <div className="fixed bottom-24 left-6 z-[49] pointer-events-none font-mono text-[10px] text-red-500 bg-red-950/20 border border-red-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DISCIPLINE COLLAPSE DETECTED</span>
          </div>
        </>
      )}

      {/* ─── SECTION 1: WARPATH HEADER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "relative overflow-hidden border rounded-2xl p-6 shadow-xl transition-all duration-500 bg-gradient-to-br",
          stats.failureState === 1 
            ? "from-destructive/10 via-background to-background border-red-500/20" 
            : "from-primary/5 via-background to-background border-border"
        )}
      >
        {/* Glow behind Header */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/[0.02] rounded-full filter blur-[80px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="w-full lg:max-w-3xl">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
              <span className={cn(
                "border text-[9px] sm:font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded font-mono font-bold animate-pulse inline-block w-fit",
                stats.failureState === 1 
                  ? "bg-red-500/10 border-red-500/30 text-red-400" 
                  : "bg-orange-500/10 border-orange-500/25 text-orange-400"
              )}>
                {stats.failureState === 1 ? '🚨 COMBAT CAPABILITY FALLING' : '⚔️ MONARCH AWAKENING PROTOCOL'}
              </span>
              <span className="text-muted-foreground text-[10px] font-mono tracking-wider">
                SYSTEM SYNC: {dayNames[dayOfWeek].toUpperCase()} SEQUENCE
              </span>
            </div>
            
            <h1 className={cn(
              "text-lg sm:text-2xl md:font-display text-3xl font-black tracking-wider font-mono uppercase leading-tight",
              stats.failureState === 1 ? "animate-[pulse_1.5s_infinite] text-red-500" : "text-foreground"
            )}>
              {stats.failureState === 1 ? (
                <span>DEGRADED SOVEREIGN SUITE</span>
              ) : (
                <span>
                  SOLO LEVELING <span className="text-orange-500 block sm:inline mt-1 sm:mt-0">PROTOCOL</span>
                </span>
              )}
            </h1>
            
            <p className="text-slate-500 dark:text-muted-foreground text-xs mt-2.5 max-w-xl font-medium leading-relaxed">
              God System RPG Engine. Keep core streaks intact to secure massive multipliers. Faltering triggers combat degradation and accelerated stat decay.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-secondary/30 border border-border p-3 rounded-xl filter backdrop-blur-sm">
            <div className="text-right">
              <p className="text-muted-foreground/60 text-[9px] uppercase font-mono tracking-wider font-bold">Perfect Streak</p>
              <div className="flex items-center gap-1.5 justify-end">
                <Flame className={cn("w-4.5 h-4.5", stats.failureState === 1 ? "text-red-500" : "text-orange-500 animate-pulse")} />
                <span className="text-foreground font-extrabold text-lg font-mono">
                  <AnimateNumber value={stats.perfectStreak} /> Days
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-accent" />
            <div className="text-right">
              <p className="text-muted-foreground/60 text-[9px] uppercase font-mono tracking-wider font-bold">XP Multiplier</p>
              <span className={cn(
                "font-extrabold text-lg font-mono block",
                stats.failureState === 1 ? "text-red-500" : "text-orange-400"
              )}>
                {stats.failureState === 1 
                  ? `${(stats.xpMultiplier * 0.6).toFixed(2)}x` 
                  : `${stats.xpMultiplier.toFixed(2)}x`}
              </span>
            </div>
          </div>
        </div>

        {/* Severe Failure state warnings - Detailed Gaming HUD Penalty Assessment */}
        <AnimatePresence>
          {stats.failureState === 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border border-red-500/25 rounded-2xl bg-gradient-to-br from-destructive/10 via-background to-destructive/5 shadow-[0_0_30px_rgba(239,68,68,0.08)] relative overflow-hidden"
            >
              {/* Pulsing warning overlay */}
              <div className="absolute inset-0 bg-red-500/[0.01] pointer-events-none animate-pulse" />
              
              {/* Moving laser scan lines */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/20 animate-[ping_2s_infinite]" />
              
              <div className="p-4 md:p-5 flex flex-col md:flex-row items-start gap-4 z-10 relative">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                
                <div className="space-y-3 w-full">
                  <div>
                    <h3 className="text-red-500 font-mono text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2">
                      🚨 ACTIVE SYSTEM DEBUFFS & PENALTY REPORT
                    </h3>
                    <p className="text-muted-foreground text-[10px] font-mono mt-0.5">
                      Sovereignty calibration collapsed. Failing to complete yesterday's daily protocols triggered stat decays and power reduction.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="p-2.5 rounded-xl bg-red-950/15 border border-red-500/10 space-y-1">
                      <div className="flex justify-between text-red-400 font-bold uppercase">
                        <span>📉 POWER RESTRICTION</span>
                        <span>-10% Applied</span>
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        <p>Estimated Raw Power: <span className="text-foreground font-extrabold">{Math.floor(stats.powerLevel / 0.9)}</span></p>
                        <p>Debuffed Display Power: <span className="text-red-500 font-extrabold">{stats.powerLevel}</span></p>
                        <p className="text-red-400/80">Penalty Loss: -{Math.floor(stats.powerLevel / 0.9) - stats.powerLevel} points</p>
                      </div>
                    </div>
                    
                    <div className="p-2.5 rounded-xl bg-red-950/15 border border-red-500/10 space-y-1">
                      <div className="flex justify-between text-red-400 font-bold uppercase">
                        <span>🧪 REWARD DEGRADATION</span>
                        <span>-40% Yield</span>
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        <p>Active Multiplier: <span className="text-red-400 font-extrabold">{(stats.xpMultiplier * 0.6).toFixed(2)}x</span></p>
                        <p>Standard Multiplier: <span className="text-foreground font-extrabold">{stats.xpMultiplier.toFixed(2)}x</span></p>
                        <p className="text-red-400/80">Rewards scaled back by 40% during failure</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-red-950/15 border border-red-500/10 space-y-1">
                      <div className="flex justify-between text-red-400 font-bold uppercase">
                        <span>💔 ACCELERATED DECAY</span>
                        <span>Applied At Reset</span>
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        <p>Mental & Discipline Stats: <span className="text-red-400 font-extrabold">-8% / -12%</span> decay</p>
                        <p>All Other Base Biometrics: <span className="text-red-400 font-extrabold">-2%</span> decay</p>
                        <p className="text-red-400/80">Triggered by missing 3+ core protocols</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-red-950/15 border border-red-500/10 space-y-1">
                      <div className="flex justify-between text-red-400 font-bold uppercase">
                        <span>🔥 STREAK HALTED</span>
                        <span>Resonance Frozen</span>
                      </div>
                      <div className="text-muted-foreground space-y-0.5">
                        <p>Perfect Streak: <span className="text-red-500 font-extrabold">0 Days</span></p>
                        <p>Weekly Streak: <span className="text-red-500 font-extrabold">0 Weeks</span></p>
                        <p className="text-red-400/80">Streak progression halted and reset</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-[10px] font-mono text-center font-black uppercase tracking-wider text-red-400 animate-pulse">
                    🏆 RESOLUTION DIRECTIVE: Clear {totalCore}/{totalCore} daily combat protocols today and click "Evaluate Protocol Cycle" to regain sovereign synchronization!
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── HOLOGRAPHIC PLAYER STATUS SCREEN (SUNG JIN-WOO SYSTEM HUD) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="relative border border-primary/25 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-primary/[0.08] via-secondary/40 to-background/95 shadow-[0_0_30px_rgba(59,130,246,0.12)] overflow-hidden"
      >
        {/* Holographic background aura */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        {/* Corner system brackets */}
        <div className="absolute top-2 left-2 text-primary font-mono text-sm select-none opacity-60">⌜</div>
        <div className="absolute top-2 right-2 text-primary font-mono text-sm select-none opacity-60">⌝</div>
        <div className="absolute bottom-2 left-2 text-primary font-mono text-sm select-none opacity-60">⌞</div>
        <div className="absolute bottom-2 right-2 text-primary font-mono text-sm select-none opacity-60">⌟</div>

        {/* Player Vital Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/40 flex items-center justify-center font-display font-black text-2xl text-primary shadow-[0_0_15px_rgba(59,130,246,0.35)] flex-shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-primary font-black uppercase tracking-widest">[SYSTEM PLAYER]</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-foreground font-display text-lg font-black tracking-wider uppercase truncate">CHANDRA</h2>
              <p className="text-muted-foreground text-[10px] font-mono truncate">TITLE: THE ONE WHO AWAKENED</p>
            </div>
          </div>

          {/* HP Gauge */}
          <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs">
            <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> HP (HEALTH)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400/90 font-bold">1,000 / 1,000</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-emerald-500/30">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] w-full" />
            </div>
            <p className="text-[9px] text-muted-foreground font-mono mt-1">Physical integrity optimal</p>
          </div>

          {/* MP Gauge */}
          <div className="bg-card border border-border/80 rounded-xl p-3 shadow-2xs">
            <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
              <span className="text-primary font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> MP (MANA)
              </span>
              <span className="text-primary font-bold">250 / 250</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-primary/30">
              <div className="h-full bg-gradient-to-r from-blue-600 via-primary to-purple-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] w-full animate-pulse" />
            </div>
            <p className="text-[9px] text-muted-foreground font-mono mt-1">Shadow power capacity full</p>
          </div>

          {/* Fatigue / Condition */}
          <div className="bg-card border border-border/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[9px] font-mono text-muted-foreground uppercase font-bold">FATIGUE INDEX</p>
              <p className="text-base font-mono font-black text-emerald-600 dark:text-emerald-400">
                {completedCoreCount === totalCore ? '0%' : `${Math.max(0, 100 - Math.round((completedCoreCount / totalCore) * 100))}%`}
              </p>
              <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                {completedCoreCount === totalCore ? 'Optimal combat ready' : `${completedCoreCount}/${totalCore} protocols clear`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/25 text-primary inline-block">
                {completedCoreCount === totalCore ? '🏆 RECOVERED' : '⚔️ QUEST ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Motivational Creed Ticker */}
        <div className="pt-3 border-t border-border/40 flex items-center gap-2.5 text-xs font-mono text-muted-foreground relative z-10">
          <Sparkles className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
          <span className="text-primary font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">MONARCH'S RESOLVE:</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={quoteIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.35 }}
              className="text-foreground/90 italic truncate"
            >
              "{MOTIVATION_QUOTES[quoteIndex]}"
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ─── SECTION 2: ATTRIBUTE MATRICES (HUD CLASS SYSTEM) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 lg:items-start">

        {/* Left 2/3: Panels A + B + Quest Board */}
        <div className="lg:col-span-2 flex flex-col gap-6 lg:gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-5 items-stretch">
          {/* Panel A: Combined Power Level & Auric Rank Card */}
          <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className={cn(
            "p-4 md:p-5 flex flex-col justify-between space-y-4 md:space-y-5 min-h-[280px] lg:min-h-[340px] relative overflow-hidden transition-all duration-500 rounded-2xl",
            stats.failureState === 1
              ? "bg-destructive/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              : "premium-rank-card animate-sweep-shine"
          )}
        >
          {/* Thunder-sky background & lightning overlays */}
          {stats.failureState !== 1 && (
            <>
              <div className="thunder-sky-overlay" />
              <div className="thunder-sky-flash" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="70%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient id="lightningGradTL" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <linearGradient id="lightningGradTR" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00bbf9" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <linearGradient id="lightningGradBL" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="#00f5d4" />
                  </linearGradient>
                  <linearGradient id="lightningGradBR" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="#00bbf9" />
                  </linearGradient>
                  <filter id="lightningGlow">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Top-to-bottom bolts */}
                <path 
                  d="M 45 0 L 42 15 L 49 28 L 38 48 L 46 62 L 35 85 L 39 100" 
                  stroke="url(#lightningGrad)" 
                  strokeWidth="0.35" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-1" 
                />
                <path 
                  d="M 75 0 L 72 12 L 78 24 L 69 40 L 74 54 L 66 72 L 70 85 L 65 100" 
                  stroke="url(#lightningGrad)" 
                  strokeWidth="0.25" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-2" 
                />
                {/* Extra Central Dynamic Bolt */}
                <path 
                  d="M 20 0 L 25 15 L 18 35 L 28 50 L 22 75 L 30 100" 
                  stroke="url(#lightningGrad)" 
                  strokeWidth="0.28" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-5" 
                />
                <path 
                  d="M 55 0 L 52 20 L 60 42 L 53 65 L 58 82 L 50 100" 
                  stroke="url(#lightningGrad)" 
                  strokeWidth="0.3" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-6" 
                />
                {/* Top-left corner bolt */}
                <path 
                  d="M 0 8 L 12 15 L 8 22 L 22 32 L 18 40 L 35 52 L 30 58" 
                  stroke="url(#lightningGradTL)" 
                  strokeWidth="0.3" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Fork on top-left corner bolt */}
                <path 
                  d="M 12 15 L 20 12 L 28 22" 
                  stroke="url(#lightningGradTL)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Top-right corner bolt */}
                <path 
                  d="M 100 5 L 88 14 L 92 22 L 78 30 L 84 38 L 70 48" 
                  stroke="url(#lightningGradTR)" 
                  strokeWidth="0.28" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-4" 
                />
                {/* Bottom-left corner bolt */}
                <path 
                  d="M 5 100 L 14 88 L 10 80 L 24 70 L 18 62 L 32 50" 
                  stroke="url(#lightningGradBL)" 
                  strokeWidth="0.25" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Extra Bottom-left bolt */}
                <path 
                  d="M 0 70 L 10 75 L 8 85 L 18 90" 
                  stroke="url(#lightningGradBL)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-5" 
                />
                {/* Bottom-right corner bolt */}
                <path 
                  d="M 95 100 L 86 90 L 92 82 L 80 72 L 85 65 L 72 55" 
                  stroke="url(#lightningGradBR)" 
                  strokeWidth="0.22" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-4" 
                />
                {/* Extra Bottom-right bolt */}
                <path 
                  d="M 100 75 L 90 80 L 93 90" 
                  stroke="url(#lightningGradBR)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlow)" 
                  className="animate-lightning-bolt-6" 
                />
              </svg>
            </>
          )}

          {/* Holographic scanline indicator */}
          {stats.failureState !== 1 && <div className="premium-scanline" />}

          {/* Neon Rank Wave background effects */}
          {stats.failureState !== 1 && (
            <div className={cn("absolute inset-0 opacity-15 pointer-events-none filter blur-xl transition-all", rankInfo.auraClass)} />
          )}

          <div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest font-bold font-mono">Rank & Resonance</span>
              <Award className={cn("w-4.5 h-4.5", stats.failureState === 1 ? "text-red-500 animate-pulse" : "text-yellow-400")} />
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-muted-foreground/60 text-[9px] uppercase font-mono tracking-widest font-extrabold">System Standing</h3>
              <div className={cn(
                "inline-flex px-3.5 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase border filter backdrop-blur transition-all",
                stats.failureState === 1 
                  ? 'text-red-500/50 border-red-500/20 bg-red-950/10 shadow-none' 
                  : rankInfo.color
              )}>
                {stats.failureState === 1 ? '⚠️ SYSTEM CORRUPTED' : rankInfo.badgeText}
              </div>
              <h2 className={cn(
                "font-display text-2xl font-black font-mono tracking-wider transition-all",
                stats.failureState === 1 ? "text-red-600/70" : cn(rankInfo.color.split(' ')[0], "premium-rank-text")
              )}>
                {stats.failureState === 1 ? 'DEGRADED CIVILIAN' : rankInfo.title}
              </h2>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {stats.failureState === 1 
                  ? 'Your biometric parameters collapsed due to inconsistent discipline. System resonance drops to minimum safety.'
                  : rankInfo.description}
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-baseline justify-between mb-2 font-mono">
              <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">Power resonance</span>
              <span className={cn(
                "font-display font-black text-4xl md:text-5xl tracking-wider select-none",
                stats.failureState === 1 ? "text-red-500 font-bold" : "text-resonance-glow"
              )}>
                <AnimateNumber value={stats.powerLevel} />
              </span>
            </div>
            
            {/* Rank progress bar */}
            <div className="space-y-1.5">
              <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                    stats.failureState === 1 
                      ? "from-red-800 to-red-600" 
                      : "from-orange-600 via-amber-400 to-cyan-400"
                  )}
                  style={{ width: `${rankProgressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono font-bold text-muted-foreground/60">
                <span>Threshold: {prevThreshold}</span>
                <span>Next Rank: {nextRankName} ({nextThreshold})</span>
              </div>
            </div>

            {/* Level Badge Row */}
            <div className="flex items-center gap-2 flex-wrap mt-3 pt-3 border-t border-border">
              <div className={cn(
                "font-mono font-black text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 select-none border",
                stats.failureState === 1
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-orange-600/15 border-orange-500/25 text-orange-400"
              )}>
                <Trophy className="w-3 h-3" />
                LV. {stats.level || 1}
              </div>
              {(stats.level || 1) < 100 && (
                <span className="text-muted-foreground/50 text-[9px] font-mono">
                  → LV.{(stats.level || 1) + 1} @ PL {getPowerRequiredForLevel((stats.level || 1) + 1)}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Panel B: Recharts Radar Polygon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            "p-4 md:p-5 flex flex-col items-center justify-between min-h-[280px] lg:min-h-[340px] relative overflow-hidden transition-all duration-500 rounded-2xl",
            stats.failureState === 1
              ? "bg-destructive/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              : "premium-rank-card animate-sweep-shine"
          )}
        >
          {/* Thunder-sky background & lightning overlays */}
          {stats.failureState !== 1 && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="thunder-sky-overlay" />
              <div className="thunder-sky-flash" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lightningGradB" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="70%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient id="lightningGradTLB" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <linearGradient id="lightningGradTRB" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00bbf9" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <linearGradient id="lightningGradBLB" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="#00f5d4" />
                  </linearGradient>
                  <linearGradient id="lightningGradBRB" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="#00bbf9" />
                  </linearGradient>
                  <filter id="lightningGlowB">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {/* Top-to-bottom bolts */}
                <path 
                  d="M 45 0 L 42 15 L 49 28 L 38 48 L 46 62 L 35 85 L 39 100" 
                  stroke="url(#lightningGradB)" 
                  strokeWidth="0.35" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-1" 
                />
                <path 
                  d="M 75 0 L 72 12 L 78 24 L 69 40 L 74 54 L 66 72 L 70 85 L 65 100" 
                  stroke="url(#lightningGradB)" 
                  strokeWidth="0.25" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-2" 
                />
                {/* Extra Central Dynamic Bolt */}
                <path 
                  d="M 20 0 L 25 15 L 18 35 L 28 50 L 22 75 L 30 100" 
                  stroke="url(#lightningGradB)" 
                  strokeWidth="0.28" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-5" 
                />
                <path 
                  d="M 55 0 L 52 20 L 60 42 L 53 65 L 58 82 L 50 100" 
                  stroke="url(#lightningGradB)" 
                  strokeWidth="0.3" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-6" 
                />
                {/* Top-left corner bolt */}
                <path 
                  d="M 0 8 L 12 15 L 8 22 L 22 32 L 18 40 L 35 52 L 30 58" 
                  stroke="url(#lightningGradTLB)" 
                  strokeWidth="0.3" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Fork on top-left corner bolt */}
                <path 
                  d="M 12 15 L 20 12 L 28 22" 
                  stroke="url(#lightningGradTLB)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Top-right corner bolt */}
                <path 
                  d="M 100 5 L 88 14 L 92 22 L 78 30 L 84 38 L 70 48" 
                  stroke="url(#lightningGradTRB)" 
                  strokeWidth="0.28" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-4" 
                />
                {/* Bottom-left corner bolt */}
                <path 
                  d="M 5 100 L 14 88 L 10 80 L 24 70 L 18 62 L 32 50" 
                  stroke="url(#lightningGradBLB)" 
                  strokeWidth="0.25" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-3" 
                />
                {/* Extra Bottom-left bolt */}
                <path 
                  d="M 0 70 L 10 75 L 8 85 L 18 90" 
                  stroke="url(#lightningGradBLB)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-5" 
                />
                {/* Bottom-right corner bolt */}
                <path 
                  d="M 95 100 L 86 90 L 92 82 L 80 72 L 85 65 L 72 55" 
                  stroke="url(#lightningGradBRB)" 
                  strokeWidth="0.22" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-4" 
                />
                {/* Extra Bottom-right bolt */}
                <path 
                  d="M 100 75 L 90 80 L 93 90" 
                  stroke="url(#lightningGradBRB)" 
                  strokeWidth="0.2" 
                  fill="none" 
                  filter="url(#lightningGlowB)" 
                  className="animate-lightning-bolt-6" 
                />
              </svg>
              <div className="premium-scanline" />
              <div className={cn("absolute inset-0 opacity-15 pointer-events-none filter blur-xl transition-all", rankInfo.auraClass)} />
            </div>
          )}

          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest font-bold font-mono self-start mb-4 relative z-10">Resonance Field</span>
          <div className="w-full h-[180px] md:h-[220px] lg:h-[300px] flex items-center justify-center relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke={stats.failureState === 1 ? "#ef4444" : "var(--border)"} strokeOpacity={0.6} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--foreground)', fontSize: 9, fontWeight: 'bold', fontFamily: 'monospace' }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 200]} tick={false} axisLine={false} />
                <Radar
                  name="Sovereign"
                  dataKey="value"
                  stroke={stats.failureState === 1 ? "#ef4444" : "#f97316"}
                  strokeWidth={2.5}
                  fill={stats.failureState === 1 ? "#ef4444" : "#f97316"}
                  fillOpacity={stats.failureState === 1 ? 0.18 : 0.38}
                  dot={{ r: 2.5, fill: stats.failureState === 1 ? '#ef4444' : '#ffb703', stroke: '#060608', strokeWidth: 1 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
          </div>{/* end inner panels grid */}

          {/* ─── SOVEREIGN QUEST BOARD & CHRONICLE ─── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className={cn(
              "bg-white dark:bg-card border rounded-2xl p-4 md:p-5 transition-all duration-500 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_15px_rgba(255,255,255,0.05)]",
              stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
            )}
          >
            <div className="absolute top-0 right-0 w-60 h-40 bg-orange-500/[0.01] rounded-full filter blur-[60px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg border flex-shrink-0",
                  stats.failureState === 1 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                )}>
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-foreground/80 text-xs font-semibold tracking-wider font-mono uppercase">SOVEREIGN QUEST BOARD</h3>
                  <p className="text-muted-foreground/50 text-[9px] font-mono">Active leveling objectives &amp; cycle chronicle</p>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap flex-shrink-0",
                stats.failureState === 1 ? "text-red-400 bg-red-500/5 border-red-500/10" : "text-orange-400 bg-orange-500/5 border-orange-500/10"
              )}>
                <Clock className="w-3 h-3" />
                <span className="text-muted-foreground">Reset in:</span>
                <span>{timeLeft || '--:--:--'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Weekly Quests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-muted-foreground/60 text-[9px] uppercase font-mono tracking-wider font-bold">⚡ Weekly Sovereign Quests</h4>
                  <span className="text-[8px] font-mono text-muted-foreground/40">Resets {currentWeekKey}</span>
                </div>
                {weeklyQuests.map((quest) => {
                  const { current, target, met } = quest.checkProgress(stats)
                  const progress = Math.min(100, (current / target) * 100)
                  const isClaimed = claimedQuestIds.includes(quest.id)
                  const isClaiming = claimingQuestId === quest.id
                  return (
                    <div
                      key={quest.id}
                      className={cn(
                        "p-3 rounded-xl border transition-all duration-300",
                        isClaimed
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : met
                          ? "bg-orange-500/5 border-orange-500/20 shadow-[0_0_12px_rgba(249,115,22,0.08)]"
                          : "bg-white/[0.01] border-border"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm flex-shrink-0">{quest.icon}</span>
                          <span className={cn("text-[10px] font-mono font-bold truncate", isClaimed ? 'text-emerald-400' : quest.color)}>
                            {isClaimed ? '✅ ' : met ? '🔲 ' : '🔐 '}{quest.title}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground/60 flex-shrink-0">{current}/{target}</span>
                      </div>
                      <div className="h-1 bg-secondary/50 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                            isClaimed ? 'from-emerald-600 to-emerald-400' : 'from-orange-600 to-amber-400'
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[8px] text-muted-foreground/50 font-mono mb-2">{quest.description}</p>
                      {isClaimed ? (
                        <div className="text-[9px] font-mono text-emerald-400/70 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Reward claimed — {quest.rewardText}
                        </div>
                      ) : met ? (
                        <button
                          onClick={() => handleClaimQuest(quest.id)}
                          disabled={isClaiming}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 hover:border-orange-500/30 text-orange-400 transition-all disabled:opacity-50"
                        >
                          {isClaiming ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Claiming...</>
                          ) : (
                            <>⚡ Claim Reward — {quest.rewardText}</>
                          )}
                        </button>
                      ) : (
                        <div className="text-[8px] font-mono text-muted-foreground/40">
                          Reward: {quest.rewardText}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Chronicle Events */}
              <div>
                <h4 className="text-muted-foreground/60 text-[9px] uppercase font-mono tracking-wider font-bold mb-3">📜 Sovereign Chronicle</h4>
                <div className="space-y-0">
                  {[
                    { icon: '⚡', event: `System Standing: ${stats.currentRank}`, time: 'LIVE', color: 'text-orange-400' },
                    { icon: '🔥', event: `Perfect Streak: ${stats.perfectStreak} Day${stats.perfectStreak !== 1 ? 's' : ''}`, time: 'NOW', color: 'text-amber-400' },
                    { icon: '⚔️', event: `Power Level: ${stats.powerLevel}`, time: 'LATEST', color: 'text-muted-foreground' },
                    { icon: '🧬', event: `Level ${stats.level || 1} Hunter — ${stats.xpMultiplier.toFixed(2)}x Multiplier`, time: 'ACTIVE', color: 'text-purple-400' },
                    { icon: '🛡️', event: `Milestones: ${unlockedMilestonesArray.length}/3 Unlocked`, time: 'STATUS', color: 'text-teal-400' },
                    { icon: stats.failureState === 1 ? '🚨' : '✅', event: stats.failureState === 1 ? 'SYSTEM FAILURE — Degraded State' : 'Protocol Sync: Nominal', time: 'SYS', color: stats.failureState === 1 ? 'text-red-400' : 'text-emerald-400' },
                  ].map((entry, ei) => (
                    <div key={ei} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                      <span className="text-sm flex-shrink-0">{entry.icon}</span>
                      <p className={cn("text-[10px] font-mono font-semibold flex-grow truncate", entry.color)}>{entry.event}</p>
                      <span className="text-[8px] font-mono text-muted-foreground/40 flex-shrink-0">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>{/* end lg:col-span-2 */}

        {/* Column 3: Biometrics Summary & Habits stacked */}
        <div className="space-y-6 lg:space-y-4 flex flex-col">
          {/* Panel C: Stats Grid breakdown with level-up tickers */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={cn(
              "bg-white dark:bg-card border rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4 overflow-y-auto max-h-[280px] lg:max-h-[240px] no-scrollbar transition-all duration-500 flex-shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_15px_rgba(255,255,255,0.05)]",
              stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
            )}
          >
            <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest font-bold font-mono block">Biometrics Summary</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              {[
                { label: 'Strength ⚔️', value: stats.strength, color: 'text-red-700 bg-red-50/70 border-red-100 dark:text-red-400 dark:bg-red-950/10 dark:border-red-500/5' },
                { label: 'Agility ⚡', value: stats.agility, color: 'text-orange-700 bg-orange-50/70 border-orange-100 dark:text-orange-400 dark:bg-orange-950/10 dark:border-orange-500/5' },
                { label: 'Intelligence 🧠', value: stats.intelligence, color: 'text-purple-700 bg-purple-50/70 border-purple-100 dark:text-purple-400 dark:bg-purple-950/10 dark:border-purple-500/5' },
                { label: 'Memory 💾', value: stats.memory, color: 'text-indigo-700 bg-indigo-50/70 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/10 dark:border-indigo-500/5' },
                { label: 'Discipline 🛡️', value: stats.discipline, color: 'text-pink-700 bg-pink-50/70 border-pink-100 dark:text-pink-400 dark:bg-pink-950/10 dark:border-pink-500/5' },
                { label: 'Focus 🎯', value: stats.focus, color: 'text-amber-700 bg-amber-50/70 border-amber-100 dark:text-amber-400 dark:bg-amber-950/10 dark:border-amber-500/5' },
                { label: 'Communication 🗣️', value: stats.communication, color: 'text-cyan-700 bg-cyan-50/70 border-cyan-100 dark:text-cyan-400 dark:bg-cyan-950/10 dark:border-cyan-500/5' },
                { label: 'Confidence 👑', value: stats.confidence, color: 'text-yellow-800 bg-yellow-50/70 border-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/10 dark:border-yellow-500/5' },
                { label: 'Stability ☯️', value: stats.stability, color: 'text-emerald-700 bg-emerald-50/70 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/10 dark:border-emerald-500/5' },
                { label: 'Career XP 💼', value: stats.careerXp, color: 'text-blue-700 bg-blue-50/70 border-blue-100 dark:text-blue-400 dark:bg-blue-950/10 dark:border-blue-500/5' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-1.5 md:p-2 rounded-xl border transition-all duration-300 hover:opacity-90 select-none",
                    stats.failureState === 1 ? "bg-red-950/5 border-red-500/5" : stat.color
                  )}
                >
                  <span className="text-inherit opacity-75">{stat.label}</span>
                  <span className="font-black text-xs">
                    <AnimateNumber value={stat.value} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Core Protocols Checklist — Authentic Solo Leveling Quest Window */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "border rounded-2xl p-4 md:p-5 transition-all duration-500 flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-secondary/40 to-card shadow-[0_4px_25px_rgba(59,130,246,0.06)]",
              stats.failureState === 1 
                ? "border-red-500/20 bg-red-950/10" 
                : "border-primary/30 hover:border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.08)]"
            )}
          >
            {/* System brackets */}
            <div className="absolute top-2 left-2 text-primary/40 text-xs font-mono select-none">⌜</div>
            <div className="absolute top-2 right-2 text-primary/40 text-xs font-mono select-none">⌝</div>

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div>
                <span className="text-[9px] font-mono font-bold text-primary tracking-widest uppercase block">[QUEST INFO]</span>
                <h3 className="text-foreground text-xs sm:text-sm font-bold tracking-wider font-mono">
                  DAILY QUEST: PREPARATIONS TO BECOME STRONG
                </h3>
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 rounded-lg border",
                completedCoreCount === totalCore
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-primary/10 border-primary/25 text-primary"
              )}>
                [{completedCoreCount}/{totalCore}] CLEARED
              </span>
            </div>

            {/* Penalty Zone Warning Alert */}
            <div className="mb-3 p-2 rounded-xl bg-red-950/20 border border-red-500/20 text-[9px] sm:text-[10px] font-mono text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-red-400" />
              <span>PENALTY WARNING: Incomplete protocols before 24:00 trigger Penalty Zone banishment.</span>
            </div>

            <div className="space-y-2 mb-3">
              {DAILY_CORE_PROTOCOLS.map((task) => {
                const isDone = !!completedTasks[task.id]
                return (
                  <div 
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, !isDone)}
                    className={cn(
                      "flex items-start justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none gap-3 group",
                      isDone 
                        ? "bg-primary/15 border-primary/40 text-foreground shadow-[0_0_12px_rgba(59,130,246,0.12)]" 
                        : "bg-card/70 border-border hover:border-primary/40 hover:bg-secondary/40 text-muted-foreground"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-1">
                      <div className={cn(
                        "w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all mt-0.5",
                        isDone 
                          ? "border-primary bg-primary text-black shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
                          : "border-border/80 group-hover:border-primary/60"
                      )}>
                        {isDone && <CheckCircle className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold tracking-wide text-left leading-relaxed block break-words">{task.label}</span>
                        {isDone && (
                          <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider inline-block">
                            [STATUS: CLEARED]
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={cn(
                      "text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5",
                      isDone
                        ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                        : "bg-secondary/60 border-border/60 text-muted-foreground"
                    )}>
                      {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Daily Quest Rewards Box */}
            <div className="p-3 rounded-xl bg-primary/[0.05] border border-primary/20 space-y-1 font-mono text-[9px] sm:text-[10px]">
              <div className="flex items-center justify-between text-primary font-bold uppercase tracking-wider">
                <span>🎁 QUEST REWARDS</span>
                <span className="text-[9px] text-primary/70">ALL OBJECTIVES</span>
              </div>
              <div className="text-muted-foreground/80 space-y-0.5 text-[9px]">
                <p>1. Status Recovery (Fatigue → 0%)</p>
                <p>2. Permanent Biometric Attribute Growth</p>
                <p>3. Blessed Random Box / Monarch Key</p>
              </div>
            </div>
          </motion.div>

          {/* Specializations Scheduler */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className={cn(
              "border rounded-2xl p-4 md:p-5 transition-all duration-500 flex-shrink-0 relative overflow-hidden bg-gradient-to-b from-secondary/40 to-card shadow-[0_4px_25px_rgba(59,130,246,0.06)]",
              stats.failureState === 1 
                ? "border-red-500/20 bg-red-950/10" 
                : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-primary tracking-widest uppercase block">[SPECIALIZATION MODULE]</span>
                <h3 className="text-foreground text-xs sm:text-sm font-bold tracking-wider font-mono uppercase">
                  {dayNames[dayOfWeek].toUpperCase()} SPECIALIZATION
                </h3>
              </div>
              <span className={cn(
                "text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 rounded-lg border",
                completedSpecialCount === todaySpecializations.length && todaySpecializations.length > 0
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-primary/10 border-primary/25 text-primary"
              )}>
                [{completedSpecialCount}/{todaySpecializations.length}] CLEARED
              </span>
            </div>

            <div className="space-y-2">
              {todaySpecializations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground/40 text-xs font-mono">
                  No specializations logged for today. Standard rest cycle.
                </div>
              ) : (
                todaySpecializations.map((task) => {
                  const isDone = !!completedTasks[task.id]
                  return (
                    <div 
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, !isDone)}
                      className={cn(
                        "flex items-start justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none gap-3 group",
                        isDone 
                          ? "bg-primary/15 border-primary/40 text-foreground shadow-[0_0_12px_rgba(59,130,246,0.12)]" 
                          : "bg-card/70 border-border hover:border-primary/40 hover:bg-secondary/40 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-1">
                        <div className={cn(
                          "w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 transition-all mt-0.5",
                          isDone 
                            ? "border-primary bg-primary text-black shadow-[0_0_10px_rgba(59,130,246,0.6)]" 
                            : "border-border/80 group-hover:border-primary/60"
                        )}>
                          {isDone && <CheckCircle className="w-3.5 h-3.5 text-black stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold tracking-wide text-left leading-relaxed block break-words">{task.label}</span>
                          {isDone && (
                            <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider inline-block">
                              [STATUS: CLEARED]
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded border flex-shrink-0 mt-0.5",
                        isDone
                          ? "bg-cyan-500/10 border-cyan-500/25 text-cyan-400"
                          : "bg-secondary/60 border-border/60 text-muted-foreground"
                      )}>
                        {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── NEW SECTION: 5 POWER CATEGORIES & CIRCULAR PROGRESS CARDS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3"
      >
        {[
          { 
            title: 'Physical Power', 
            val: stats.physicalPower, 
            formula: '(Str + Agi) * 2', 
            color: 'from-red-500 to-orange-500 shadow-red-500/10',
            textColor: 'text-red-400',
            stroke: '#ef4444',
            icon: <Activity className="w-4 h-4" />,
            max: 3996
          },
          { 
            title: 'Mental Power', 
            val: stats.mentalPower, 
            formula: '(Int + Mem + Foc) * 1.8', 
            color: 'from-purple-500 to-indigo-500 shadow-indigo-500/10',
            textColor: 'text-purple-400',
            stroke: '#a855f7',
            icon: <Brain className="w-4 h-4" />,
            max: 5394
          },
          { 
            title: 'Discipline Power', 
            val: stats.disciplinePower, 
            formula: '(Disc + Stab) * 2.2', 
            color: 'from-pink-500 to-rose-500 shadow-pink-500/10',
            textColor: 'text-pink-400',
            stroke: '#ec4899',
            icon: <Shield className="w-4 h-4" />,
            max: 4395
          },
          { 
            title: 'Communication Power', 
            val: stats.communicationPower, 
            formula: '(Comm + Conf) * 1.5', 
            color: 'from-cyan-500 to-teal-500 shadow-cyan-500/10',
            textColor: 'text-cyan-400',
            stroke: '#06b6d4',
            icon: <MessageSquare className="w-4 h-4" />,
            max: 2997
          },
          { 
            title: 'Career Power', 
            val: stats.careerPower, 
            formula: 'Exp * 2', 
            color: 'from-blue-500 to-sky-500 shadow-blue-500/10',
            textColor: 'text-blue-400',
            stroke: '#3b82f6',
            icon: <Briefcase className="w-4 h-4" />,
            max: 1998
          },
        ].map((cat, i) => {
          // Circular progress calculations
          const radius = 22
          const circumference = 2 * Math.PI * radius
          const percent = Math.min(100, (cat.val / cat.max) * 100)
          const offset = circumference - (percent / 100) * circumference

          return (
            <div 
              key={i}
              className={cn(
                "bg-white dark:bg-card border rounded-xl p-3 md:p-4 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)]",
                stats.failureState === 1 ? "border-red-200 dark:border-red-500/15 shadow-none" : "border-border hover:border-primary/30"
              )}
            >
              {/* Top info */}
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-muted-foreground/60 font-bold uppercase">{cat.title.split(' ')[0]} API</span>
                <span className={cn("p-1 rounded bg-secondary/50 text-[9px] font-mono", cat.textColor)}>{cat.icon}</span>
              </div>

              {/* Center Circle SVG */}
              <div className="relative w-16 h-16 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="stroke-white/[0.04] fill-none"
                    strokeWidth="3.5"
                  />
                  {/* Progress Indicator */}
                  <motion.circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="fill-none"
                    strokeWidth="3.5"
                    stroke={stats.failureState === 1 ? '#ef4444' : cat.stroke}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-xs font-black font-mono text-foreground select-none">
                  <AnimateNumber value={cat.val} />
                </div>
              </div>

              {/* Bottom detail */}
              <div className="w-full mt-1">
                <p className="text-[10px] text-white/55 font-bold font-mono tracking-wide">{cat.title}</p>
                <p className="text-[8px] text-muted-foreground/40 font-mono font-medium">{cat.formula}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* ─── NEW SECTION: THE SOVEREIGN COEFFICIENT MATRIX (POWER CALCULATIONS) ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className={cn(
          "bg-white dark:bg-card border rounded-2xl p-4 md:p-5 transition-all duration-500 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_15px_rgba(255,255,255,0.05)]",
          stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
        )}
      >
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/[0.01] rounded-full filter blur-[60px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-foreground/80 text-sm font-semibold tracking-wider font-mono uppercase flex items-center gap-2">
              ⚡ THE SOVEREIGN COEFFICIENT MATRIX
            </h3>
            <p className="text-muted-foreground/40 text-[10px] font-mono">
              Deterministic dynamic project engine. Level up high-impact parameters to accelerate your standing ascension.
            </p>
          </div>
          <span className="text-[11px] font-mono text-orange-400 font-bold bg-orange-500/5 border border-orange-500/10 px-2.5 py-0.5 rounded-lg">
            Active Multiplier: {stats.failureState === 1 ? `${(stats.xpMultiplier * 0.6).toFixed(2)}x (Debuffed)` : `${stats.xpMultiplier.toFixed(2)}x`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left formula graphic display */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50/50 dark:bg-secondary border border-slate-100 dark:border-border space-y-4 flex flex-col justify-center min-h-[160px]">
            <h4 className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider font-bold">Calculation Algorithm</h4>
            
            {/* The weighted formula equation block */}
            <div className="space-y-2 font-mono text-[11px] select-none text-left">
              <div className="p-3 rounded-lg bg-white dark:bg-card border border-slate-200/60 dark:border-border font-semibold text-slate-800 dark:text-foreground leading-relaxed space-y-1.5">
                <p className="text-orange-400 font-extrabold uppercase text-[9px] tracking-widest">weighted resonance equation</p>
                <p className="text-xs md:text-sm text-center py-2 font-black tracking-wide text-foreground">
                  Power = <span className="text-orange-400">Σ (Stat × Coeff)</span> × <span className="text-amber-300">Multiplier</span>
                </p>
                {stats.failureState === 1 && (
                  <p className="text-red-500 font-bold text-center text-[10px] uppercase">
                    ❌ SYSTEM FAULT DETECTED: × 0.9 debuff factor applied!
                  </p>
                )}
              </div>
            </div>

            {/* Strategy tip */}
            <div className="text-[9px] font-mono text-muted-foreground flex items-start gap-2 bg-primary/5 border border-primary/10 p-2 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <span>
                <strong>System Optimization Tip:</strong> Discipline carries the highest scaling factor (<strong className="text-foreground">1.7x</strong>), followed by Strength & Intelligence (<strong className="text-foreground">1.5x</strong>). Focus your training on these modules for hyper-growth!
              </span>
            </div>
          </div>

          {/* Right breakdown grid of stats */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono">
            {[
              { name: 'Strength', val: stats.strength, mult: 1.5, color: 'text-red-400', tag: '🔥 CORE' },
              { name: 'Agility', val: stats.agility, mult: 1.4, color: 'text-orange-400', tag: '⚡ AGILE' },
              { name: 'Intelligence', val: stats.intelligence, mult: 1.5, color: 'text-purple-400', tag: '🔥 MIND' },
              { name: 'Memory', val: stats.memory, mult: 1.3, color: 'text-indigo-400', tag: 'MEM' },
              { name: 'Discipline', val: stats.discipline, mult: 1.7, color: 'text-pink-400', tag: '💎 APEX' },
              { name: 'Focus', val: stats.focus, mult: 1.2, color: 'text-amber-400', tag: 'FOC' },
              { name: 'Communication', val: stats.communication, mult: 1.1, color: 'text-cyan-400', tag: 'COMM' },
              { name: 'Confidence', val: stats.confidence, mult: 1.1, color: 'text-yellow-400', tag: 'CONF' },
              { name: 'Stability', val: stats.stability, mult: 1.2, color: 'text-emerald-400', tag: 'STAB' },
              { name: 'Career XP', val: stats.careerXp, mult: 1.4, color: 'text-blue-400', tag: '⚡ EXP' },
            ].map((s, idx) => {
              const contribution = s.val * s.mult
              return (
                <div key={idx} className="p-2 rounded-xl bg-slate-50/55 dark:bg-secondary border border-slate-100 dark:border-border flex flex-col justify-between space-y-1.5 hover:border-slate-200/80 dark:hover:border-border transition-all">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-bold uppercase text-[8px] truncate">{s.name}</span>
                    <span className={cn("text-[7px] font-bold px-1 rounded bg-secondary/50", s.color)}>{s.tag}</span>
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline font-bold">
                      <span className="text-muted-foreground text-xs">{s.val}</span>
                      <span className="text-muted-foreground/60 text-[8px]">×{s.mult}</span>
                    </div>
                    <div className="h-1 bg-secondary/50 rounded-full mt-1 overflow-hidden">
                      <div className={cn("h-full rounded-full", s.color.replace('text', 'bg'))} style={{ width: `${Math.min(100, (s.val / 200) * 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-muted-foreground/60 text-[8px] font-bold">
                    <span>Contrib:</span>
                    <span className="text-foreground">{contribution.toFixed(1)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* ─── NEW SECTION: ELITE MILESTONE BONUS BADGES ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={cn(
          "bg-white dark:bg-card border rounded-2xl p-4 md:p-5 transition-all duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_15px_rgba(255,255,255,0.05)]",
          stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-foreground/80 text-sm font-semibold tracking-wider font-mono uppercase">ELITE SOVEREIGN MILESTONES</h3>
            <p className="text-muted-foreground/40 text-[10px] font-mono">Unlock permanent attribute resonance boosters by hitting core thresholds.</p>
          </div>
          <span className="text-[11px] font-mono text-orange-500 font-bold">
            {unlockedMilestonesArray.length}/3 Milestones Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Milestone 1: Iron Body */}
          <div className={cn(
            "border rounded-xl p-3 md:p-4 transition-all duration-300 flex items-center gap-3 md:gap-4 relative overflow-hidden",
            hasIronBody 
              ? "bg-red-500/[0.03] border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.03)]" 
              : "bg-white/[0.01] border-border opacity-50"
          )}>
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
              hasIronBody ? "bg-red-950/20 border-red-500/20 text-red-400" : "bg-black border-border text-muted-foreground/40"
            )}>
              {hasIronBody ? <Sparkles className="w-5.5 h-5.5 md:w-6 md:h-6 animate-pulse" /> : <Lock className="w-4.5 h-4.5 md:w-5 md:h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black font-mono tracking-wide text-foreground">IRON BODY</h4>
                {hasIronBody && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] px-1 py-0.5 rounded font-bold font-mono">UNLOCKED</span>}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Strength Threshold: <span className="text-red-400 font-bold">100</span> (Gains: +50 Exp, permanent +0.05 Multiplier)</p>
            </div>
          </div>

          {/* Milestone 2: Unbreakable Mind */}
          <div className={cn(
            "border rounded-xl p-3 md:p-4 transition-all duration-300 flex items-center gap-3 md:gap-4 relative overflow-hidden",
            hasUnbreakableMind 
              ? "bg-pink-500/[0.03] border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.03)]" 
              : "bg-white/[0.01] border-border opacity-50"
          )}>
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
              hasUnbreakableMind ? "bg-pink-950/20 border-pink-500/20 text-pink-400" : "bg-black border-border text-muted-foreground/40"
            )}>
              {hasUnbreakableMind ? <Brain className="w-5.5 h-5.5 md:w-6 md:h-6 animate-pulse" /> : <Lock className="w-4.5 h-4.5 md:w-5 md:h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black font-mono tracking-wide text-foreground">UNBREAKABLE MIND</h4>
                {hasUnbreakableMind && <span className="bg-pink-500/10 text-pink-500 border border-pink-500/20 text-[8px] px-1 py-0.5 rounded font-bold font-mono">UNLOCKED</span>}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Discipline Threshold: <span className="text-pink-400 font-bold">100</span> (Gains: +50 Exp, permanent +0.05 Multiplier)</p>
            </div>
          </div>

          {/* Milestone 3: Tactical Genius */}
          <div className={cn(
            "border rounded-xl p-3 md:p-4 transition-all duration-300 flex items-center gap-3 md:gap-4 relative overflow-hidden",
            hasTacticalGenius 
              ? "bg-purple-500/[0.03] border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.03)]" 
              : "bg-white/[0.01] border-border opacity-50"
          )}>
            <div className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
              hasTacticalGenius ? "bg-purple-950/20 border-purple-500/20 text-purple-400" : "bg-black border-border text-muted-foreground/40"
            )}>
              {hasTacticalGenius ? <Sparkles className="w-5.5 h-5.5 md:w-6 md:h-6 animate-pulse" /> : <Lock className="w-4.5 h-4.5 md:w-5 md:h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs font-black font-mono tracking-wide text-foreground">TACTICAL GENIUS</h4>
                {hasTacticalGenius && <span className="bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[8px] px-1 py-0.5 rounded font-bold font-mono">UNLOCKED</span>}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Intelligence Threshold: <span className="text-purple-400 font-bold">150</span> (Gains: +100 Exp, permanent +0.10 Multiplier)</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── SOVEREIGN POWERS HALL ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className={cn(
          "bg-white dark:bg-card border rounded-2xl p-4 md:p-5 transition-all duration-500 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_1px_10px_rgba(255,255,255,0.02)] hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_2px_15px_rgba(255,255,255,0.05)]",
          stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
        )}
      >
        <div className="absolute top-0 right-0 w-72 h-48 bg-purple-500/[0.015] rounded-full filter blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className={cn(
            "p-1.5 rounded-lg border flex-shrink-0",
            stats.failureState === 1 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
          )}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-foreground/80 text-xs font-semibold tracking-wider font-mono uppercase">SOVEREIGN POWERS HALL</h3>
            <p className="text-muted-foreground/50 text-[9px] font-mono">Fantasy abilities — locked until Sovereign milestone levels are achieved</p>
          </div>
          <div className="ml-auto text-[9px] font-mono text-muted-foreground/60">
            {getUnlockedPowers(stats.level || 1).length}/{FANTASY_POWERS.length} Unlocked
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-3 relative z-10">
          {FANTASY_POWERS.map((power) => {
            const unlocked = (stats.level || 1) >= power.level
            return (
              <div
                key={power.id}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300 relative overflow-hidden",
                  unlocked
                    ? cn("border", power.bgColor)
                    : "bg-white/[0.01] border-border opacity-40 grayscale"
                )}
              >
                <div className="text-xl mb-1">{power.icon}</div>
                <div className={cn("text-[8px] font-mono font-black tracking-widest", unlocked ? power.color : "text-muted-foreground/40")}>
                  {power.title}
                </div>
                <div className="text-muted-foreground text-[9px] font-semibold mt-0.5 leading-tight">{power.name}</div>
                <div className="text-muted-foreground/40 text-[8px] font-mono mt-1">LV.{power.level}</div>
                {unlocked ? (
                  <div className="text-muted-foreground text-[8px] mt-1.5 leading-relaxed border-t border-border pt-1.5">{power.effect}</div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-muted-foreground/20" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {(() => {
          const next = getNextPower(stats.level || 1)
          if (!next) return (
            <div className="p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 relative z-10">
              <p className="text-[9px] font-mono text-yellow-400 font-bold">👑 ALL POWERS UNLOCKED — TRUE SOVEREIGN ACHIEVED</p>
            </div>
          )
          return (
            <div className="p-3 rounded-xl border border-border bg-white/[0.01] relative z-10">
              <p className="text-muted-foreground/60 text-[9px] font-mono">
                <span className="text-purple-400 font-bold">NEXT POWER</span>{' '}
                <span className={next.color}>{next.icon} {next.name}</span>{' '}({next.title}) unlocks at{' '}
                <span className="text-orange-400 font-bold">LV.{next.level}</span>{' '}(PL {getPowerRequiredForLevel(next.level)} required)
              </p>
            </div>
          )
        })()}
      </motion.div>

      {/* Checklists relocated to Column 3 of Section 2 */}

      {/* ─── SECTION 4: SYSTEM COMMANDS TERMINAL ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={cn(
          "border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-500 bg-gradient-to-r",
          stats.failureState === 1
            ? "from-red-950/[0.03] to-background border-red-500/10"
            : "from-orange-500/[0.03] to-amber-500/[0.01] border-border"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl border animate-pulse flex-shrink-0",
            stats.failureState === 1 
              ? "bg-red-500/10 border-red-500/20 text-red-500" 
              : "bg-orange-500/10 border-orange-500/20 text-orange-500"
          )}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-foreground/80 text-xs font-semibold tracking-wider font-mono">SYSTEM CYCLE CONTROLLER</h4>
            <p className="text-muted-foreground/60 text-[10px] font-mono">Evaluate daily sequences, check penalties, and synchronize biometric states.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handlePurge}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase font-mono transition-all duration-300 border bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            title="Wipe biometrics, clear streaks, and start fresh from Level 1 Civilian"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Awaken Anew (Reset To Zero)
          </button>

          <button
            onClick={resetDaily}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase font-mono transition-all duration-300 border",
              stats.failureState === 1
                ? "bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/30 text-red-400"
                : "bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary/50 text-primary shadow-[0_0_12px_rgba(59,130,246,0.15)]"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            Evaluate Protocol Cycle
          </button>
        </div>
      </motion.div>
    </div>
  )
}
export default SoloLeveling
