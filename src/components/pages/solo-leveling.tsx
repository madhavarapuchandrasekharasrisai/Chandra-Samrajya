'use client'

import React, { useEffect, useState } from 'react'
import { useSoloLevelingStore, DAILY_CORE_PROTOCOLS, WEEKLY_SPECIALIZATIONS } from '@/store/use-solo-leveling-store'
import { getPowerRequiredForLevel, getWeeklyQuests, getWeekKey, FANTASY_POWERS, getUnlockedPowers, getNextPower } from '@/lib/solo-leveling-calc'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Flame,
  Zap,
  Shield,
  ShieldAlert,
  Activity,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Check,
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
  X,
  Maximize2,
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
  const [timeLeft, setTimeLeft] = useState('')
  const [claimingQuestId, setClaimingQuestId] = useState<string | null>(null)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [showHologramModal, setShowHologramModal] = useState(false)

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

  // Instant data sync without blocking UI
  useEffect(() => {
    fetchStats()
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
        {/* Panoramic Eye Banner Background with High-Definition Sovereign Eye */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Right-aligned vivid eye portrait container */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/4 md:w-3/5 lg:w-1/2 overflow-hidden">
            <img
              src="/images/solo-leveling/jinwoo-eye-banner.jpg"
              alt="Jin-Woo Awakening Eye Banner"
              className="w-full h-full object-cover object-[73%_center] opacity-80 dark:opacity-90 filter contrast-125 saturate-125 brightness-105 dark:brightness-100 transition-opacity duration-500"
            />
            {/* Seamless gradient fade on the left to ensure credentials text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/60 to-transparent dark:from-background dark:via-background/50 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-card/40 dark:from-background/80 dark:via-transparent dark:to-background/40" />
            
            {/* Monarch Eye Cyan Plasma Pulse */}
            <div className="absolute right-[18%] sm:right-[22%] top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-cyan-400/25 blur-2xl animate-pulse pointer-events-none" />
          </div>
        </div>

        {/* Glow behind Header */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12] rounded-full filter blur-[90px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-5 w-full lg:max-w-3xl">
            {/* Hunter Portrait with Glowing Cyan Eyes */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-cyan-400 dark:border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.45)] ring-2 ring-cyan-500/25 bg-black relative">
                <img
                  src="/images/solo-leveling/jinwoo-awakened.jpg"
                  alt="Awakened Hunter Chandrasekhar"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-1 inset-x-1 text-center">
                  <span className="text-[8px] font-mono font-black text-cyan-300 tracking-wider bg-black/70 px-1.5 py-0.5 rounded border border-cyan-400/30">
                    AWAKENED
                  </span>
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 border-2 border-background" />
              </span>
            </div>

            {/* Hunter Information */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={cn(
                  "border text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-mono font-bold animate-pulse inline-flex items-center gap-1",
                  stats.failureState === 1 
                    ? "bg-red-500/10 border-red-500/30 text-red-500" 
                    : "bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400"
                )}>
                  {stats.failureState === 1 ? '🚨 COMBAT DEGRADATION ACTIVE' : '⚔️ SYSTEM RECOGNITION: CONFIRMED'}
                </span>
                <span className="text-muted-foreground text-[10px] font-mono tracking-wider">
                  PLAYER ID: #0001
                </span>
              </div>
              
              <h1 className={cn(
                "text-lg sm:text-xl md:text-2xl font-black tracking-wider font-mono uppercase leading-tight truncate",
                stats.failureState === 1 ? "animate-[pulse_1.5s_infinite] text-red-500" : "text-foreground"
              )}>
                MADHAVARAPU CHANDRASEKHAR
              </h1>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                  {stats.currentRank} RANK
                </span>
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  LEVEL {stats.level || 1}
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  PL: {stats.powerLevel || 0}
                </span>
              </div>
              
              <p className="text-muted-foreground text-xs mt-2 max-w-xl font-medium leading-relaxed italic border-l-2 border-cyan-400/50 pl-2.5">
                "{MOTIVATION_QUOTES[quoteIndex]}"
              </p>
            </div>
          </div>

          {/* Right Streak & Multiplier HUD */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center gap-4 bg-secondary/40 border border-border p-3 rounded-xl filter backdrop-blur-sm shadow-2xs">
              <div className="text-right">
                <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">Perfect Streak</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <Flame className={cn("w-4.5 h-4.5", stats.failureState === 1 ? "text-red-500" : "text-orange-500 animate-pulse")} />
                  <span className="text-foreground font-black text-lg font-mono">
                    <AnimateNumber value={stats.perfectStreak} /> Days
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-right">
                <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">XP Multiplier</p>
                <span className={cn(
                  "font-black text-lg font-mono block",
                  stats.failureState === 1 ? "text-red-500" : "text-orange-500 dark:text-orange-400"
                )}>
                  {stats.failureState === 1 
                    ? `${(stats.xpMultiplier * 0.6).toFixed(2)}x` 
                    : `${stats.xpMultiplier.toFixed(2)}x`}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setShowHologramModal(true)}
              className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 px-3.5 py-2 h-auto shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              Hologram View
            </Button>
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

      {/* ─── TRIAL OF THE CURSED KING: PENALTY THRESHOLD BANNER ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className={cn(
          "relative border rounded-2xl p-4 sm:p-5 transition-all duration-500 overflow-hidden shadow-xs",
          stats.failureState === 1
            ? "bg-gradient-to-r from-red-500/15 via-red-950/20 to-card border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.2)] ring-1 ring-red-500/30"
            : "bg-gradient-to-r from-amber-500/[0.08] via-card to-card border-border hover:border-amber-500/30"
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src="/images/solo-leveling/sukuna-fuga-fire.png"
                alt="Sukuna Flame Arrow Trial"
                className="h-20 sm:h-24 md:h-28 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(239,68,68,0.45)]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  stats.failureState === 1
                    ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/40 animate-pulse"
                    : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                )}>
                  {stats.failureState === 1 ? '🚨 PENALTY DEBUFF ACTIVE' : '🔥 FLAME ARROW [FUGA] THRESHOLD'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  PENALTY ENFORCEMENT
                </span>
              </div>
              <h3 className="text-foreground text-sm sm:text-base font-black font-mono uppercase tracking-wide">
                ZERO SLOTH TOLERANCE — CONQUER TODAY’S OBJECTIVES
              </h3>
              <p className="text-muted-foreground text-xs mt-1 leading-relaxed max-w-2xl font-medium">
                The System recognizes relentless daily progress. If all core protocols are not cleared before 24:00, you will be banished to the Penalty Zone with active multiplier penalties.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px] font-mono">
                <span className="text-muted-foreground">Reset Countdown:</span>
                <span className="text-red-600 dark:text-red-400 font-extrabold font-mono bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                  {timeLeft || '23:59:59'}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                  [{completedCoreCount}/{totalCore} Core Cleared]
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── SECTION 2: ATTRIBUTE MATRICES & QUEST MODULES ─── */}
      
      {/* ─── MOBILE VIEW: QUEST INFO & SPECIALIZATION FIRST (lg:hidden) ─── */}
      <div className="flex flex-col gap-6 lg:hidden">
        {/* Core Protocols Checklist — Authentic Solo Leveling Quest Window */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "border-2 rounded-2xl p-5 md:p-6 transition-all duration-500 flex-shrink-0 relative overflow-hidden shadow-2xl",
              "bg-slate-950/95 dark:bg-[#030712]/95 border-cyan-500/50 dark:border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]",
              stats.failureState === 1 ? "border-red-500/50" : ""
            )}
          >
            {/* Cybernetic Tech Corner Accents matching reference image */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Ambient Background Energy */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />

            {/* Dual-Dagger Combat Jin-Woo Illustration (auto-shrinks on mobile, absolute on desktop) */}
            <div className="hidden lg:block absolute -right-3 -bottom-5 w-44 xl:w-52 pointer-events-none select-none z-0 opacity-75 hover:opacity-100 transition-opacity">
              <img
                src="/images/solo-leveling/jinwoo-combat.png"
                alt="Jin-Woo Combat Dual Daggers"
                className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              />
            </div>

            {/* Header: [!] QUEST INFO */}
            <div className="flex flex-col items-center justify-center mb-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-lg border border-cyan-400/70 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">!</span>
                <span className="font-mono font-black text-xs sm:text-sm tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  QUEST INFO
                </span>
              </div>
              <p className="text-cyan-400/95 text-xs font-mono font-bold tracking-wider mt-2 text-center">
                [Daily Quest: Preparations to Become Strong has arrived.]
              </p>
            </div>

            {/* GOAL Underlined */}
            <div className="text-center my-3 relative z-10">
              <span className="font-mono font-black text-xs sm:text-sm tracking-[0.3em] text-cyan-300 uppercase pb-1 border-b-2 border-cyan-400 inline-block drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                GOAL
              </span>
            </div>

            {/* Quest items list */}
            <div className="space-y-2 mb-4 relative z-10">
              {DAILY_CORE_PROTOCOLS.map((task) => {
                const isDone = !!completedTasks[task.id]
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, !isDone)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none group",
                      isDone
                        ? "bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-slate-900/60 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-slate-900/90"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="min-w-0">
                        <span className={cn(
                          "text-xs font-mono font-bold tracking-wide block transition-colors",
                          isDone ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" : "text-slate-200 group-hover:text-cyan-300"
                        )}>
                          {task.label}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400/70 font-semibold">
                          {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {/* Live Counter Bracket */}
                      <span className={cn(
                        "text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border",
                        isDone
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {isDone ? "[CLEARED]" : "[INCOMPLETE]"}
                      </span>

                      {/* Holographic Checkbox */}
                      <div className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                        isDone
                          ? "border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                          : "border-cyan-500/40 bg-slate-900 group-hover:border-cyan-400"
                      )}>
                        {isDone && <Check className="w-4 h-4 stroke-[3] text-cyan-300" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning Banner matching image footer */}
            <div className="pt-3 border-t border-cyan-500/25 text-center font-mono text-[10px] leading-relaxed relative z-10">
              <p className="text-slate-300">
                <span className="text-cyan-400 font-extrabold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">WARNING:</span>{' '}
                Failure to complete the daily quest will result in an appropriate penalty.
              </p>
            </div>

            {/* Daily Quest Rewards Box */}
            <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1 font-mono text-[9px] sm:text-[10px] relative z-10">
              <div className="flex items-center justify-between text-cyan-300 font-bold uppercase tracking-wider">
                <span>🎁 QUEST REWARDS</span>
                <span className="text-[9px] text-cyan-400/70">ALL OBJECTIVES</span>
              </div>
              <div className="text-slate-300/80 space-y-0.5 text-[9px]">
                <p>1. Status Recovery (Fatigue → 0%)</p>
                <p>2. Permanent Biometric Attribute Growth</p>
                <p>3. Blessed Random Box / Monarch Key</p>
              </div>
            </div>
          </motion.div>
        {/* Specializations Scheduler — Upgraded Quest Info Cybernetic Aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "border-2 rounded-2xl p-5 md:p-6 transition-all duration-500 relative overflow-hidden shadow-2xl",
              "bg-slate-950/95 dark:bg-[#030712]/95 border-cyan-500/50 dark:border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-slate-100",
              stats.failureState === 1 ? "border-red-500/50" : ""
            )}
          >
            {/* Cybernetic Tech Corner Accents matching Quest Info */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Ambient Energy Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

            {/* Header: [!] SPECIALIZATION QUEST */}
            <div className="flex flex-col items-center justify-center mb-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-lg border border-cyan-400/70 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">!</span>
                <span className="font-mono font-black text-xs sm:text-sm tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  SPECIALIZATION QUEST
                </span>
              </div>
              <p className="text-cyan-400/95 text-xs font-mono font-bold tracking-wider mt-2 text-center">
                [{dayNames[dayOfWeek].toUpperCase()} SPECIALIZATION: FOCUSED DISCIPLINE]
              </p>
            </div>

            {/* GOAL Underlined */}
            <div className="text-center my-3 relative z-10 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono font-black text-xs sm:text-sm tracking-[0.3em] text-cyan-300 uppercase pb-1 border-b-2 border-cyan-400 inline-block drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                SPECIALIZATION OBJECTIVES
              </span>
              <span className={cn(
                "text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 rounded-lg border",
                completedSpecialCount === todaySpecializations.length && todaySpecializations.length > 0
                  ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900 border-cyan-500/30 text-cyan-400"
              )}>
                [{completedSpecialCount}/{todaySpecializations.length}] CLEARED
              </span>
            </div>

            {/* Specialization Task Items */}
            <div className="space-y-2 mb-4 relative z-10">
              {todaySpecializations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono border border-dashed border-cyan-500/30 rounded-xl">
                  No specializations scheduled for today. Standard rest cycle.
                </div>
              ) : (
                todaySpecializations.map((task) => {
                  const isDone = !!completedTasks[task.id]
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, !isDone)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none group",
                        isDone
                          ? "bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "bg-slate-900/60 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-slate-900/90"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="min-w-0">
                          <span className={cn(
                            "text-xs font-mono font-bold tracking-wide block transition-colors",
                            isDone ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" : "text-slate-200 group-hover:text-cyan-300"
                          )}>
                            {task.label}
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400/70 font-semibold">
                            {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={cn(
                          "text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border",
                          isDone
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {isDone ? "[CLEARED]" : "[INCOMPLETE]"}
                        </span>

                        <div className={cn(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          isDone
                            ? "border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                            : "border-cyan-500/40 bg-slate-900 group-hover:border-cyan-400"
                        )}>
                          {isDone && <Check className="w-4 h-4 stroke-[3] text-cyan-300" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Info Box */}
            <div className="pt-3 border-t border-cyan-500/25 text-center font-mono text-[10px] leading-relaxed relative z-10">
              <p className="text-slate-300">
                <span className="text-cyan-400 font-extrabold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">REWARD INFUSION:</span>{' '}
                Specialization attribute growth is permanently synced with your Sovereign Biometric Matrix upon clearing.
              </p>
            </div>
          </motion.div>
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
            
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-2.5 min-w-0 flex-1">
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
                  "font-display text-xl sm:text-2xl font-black font-mono tracking-wider transition-all",
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

              {/* Shadow Monarch Frontal Portrait */}
              <div className="relative flex-shrink-0 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/20 bg-slate-950">
                  <img
                    src="/images/solo-leveling/jinwoo-monarch-portrait.jpg"
                    alt="Shadow Monarch Frontal Portrait"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 text-purple-300 rounded shadow-xs">
                  MONARCH
                </span>
              </div>
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
        {/* Panel C: Stats Grid breakdown with level-up tickers */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={cn(
              "bg-card border rounded-2xl p-4 md:p-5 space-y-3 transition-all duration-500 shadow-xs hover:shadow-md",
              stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest font-bold block">Biometrics Summary</span>
              <span className="text-[10px] font-mono text-primary font-bold">10 Attributes Synced</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              {[
                { label: 'Strength ⚔️', value: stats.strength, color: 'text-red-700 bg-red-50/80 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-500/20' },
                { label: 'Agility ⚡', value: stats.agility, color: 'text-orange-700 bg-orange-50/80 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-500/20' },
                { label: 'Intelligence 🧠', value: stats.intelligence, color: 'text-purple-700 bg-purple-50/80 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-500/20' },
                { label: 'Memory 💾', value: stats.memory, color: 'text-indigo-700 bg-indigo-50/80 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-500/20' },
                { label: 'Discipline 🛡️', value: stats.discipline, color: 'text-pink-700 bg-pink-50/80 border-pink-200 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-500/20' },
                { label: 'Focus 🎯', value: stats.focus, color: 'text-amber-700 bg-amber-50/80 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-500/20' },
                { label: 'Communication 🗣️', value: stats.communication, color: 'text-cyan-700 bg-cyan-50/80 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/20 dark:border-cyan-500/20' },
                { label: 'Confidence 👑', value: stats.confidence, color: 'text-yellow-800 bg-yellow-50/80 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-500/20' },
                { label: 'Stability ☯️', value: stats.stability, color: 'text-emerald-700 bg-emerald-50/80 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/20' },
                { label: 'Career XP 💼', value: stats.careerXp, color: 'text-blue-700 bg-blue-50/80 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-500/20' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl border transition-all duration-300 hover:scale-[1.02] shadow-2xs select-none",
                    stats.failureState === 1 ? "bg-red-950/5 border-red-500/10 text-red-400" : stat.color
                  )}
                >
                  <span className="font-semibold truncate pr-1">{stat.label}</span>
                  <span className="font-black text-xs font-mono">
                    <AnimateNumber value={stat.value} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
      </div>

      {/* ─── DESKTOP VIEW: BALANCED MATRIX WITH ZERO WHITE SPACE (hidden lg:grid) ─── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Columns: Panels A & B + Specialization Module + Sovereign Quest Board */}
        <div className="lg:col-span-7 flex flex-col gap-5">
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
            
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="space-y-2.5 min-w-0 flex-1">
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
                  "font-display text-xl sm:text-2xl font-black font-mono tracking-wider transition-all",
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

              {/* Shadow Monarch Frontal Portrait */}
              <div className="relative flex-shrink-0 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/20 bg-slate-950">
                  <img
                    src="/images/solo-leveling/jinwoo-monarch-portrait.jpg"
                    alt="Shadow Monarch Frontal Portrait"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold px-1.5 py-0.5 bg-purple-950 border border-purple-500/50 text-purple-300 rounded shadow-xs">
                  MONARCH
                </span>
              </div>
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
          {/* Specializations Scheduler — Upgraded Quest Info Cybernetic Aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "border-2 rounded-2xl p-5 md:p-6 transition-all duration-500 relative overflow-hidden shadow-2xl",
              "bg-slate-950/95 dark:bg-[#030712]/95 border-cyan-500/50 dark:border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)] text-slate-100",
              stats.failureState === 1 ? "border-red-500/50" : ""
            )}
          >
            {/* Cybernetic Tech Corner Accents matching Quest Info */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Ambient Energy Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

            {/* Header: [!] SPECIALIZATION QUEST */}
            <div className="flex flex-col items-center justify-center mb-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-lg border border-cyan-400/70 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">!</span>
                <span className="font-mono font-black text-xs sm:text-sm tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  SPECIALIZATION QUEST
                </span>
              </div>
              <p className="text-cyan-400/95 text-xs font-mono font-bold tracking-wider mt-2 text-center">
                [{dayNames[dayOfWeek].toUpperCase()} SPECIALIZATION: FOCUSED DISCIPLINE]
              </p>
            </div>

            {/* GOAL Underlined */}
            <div className="text-center my-3 relative z-10 flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono font-black text-xs sm:text-sm tracking-[0.3em] text-cyan-300 uppercase pb-1 border-b-2 border-cyan-400 inline-block drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                SPECIALIZATION OBJECTIVES
              </span>
              <span className={cn(
                "text-[10px] sm:text-xs font-mono font-black px-2.5 py-1 rounded-lg border",
                completedSpecialCount === todaySpecializations.length && todaySpecializations.length > 0
                  ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "bg-slate-900 border-cyan-500/30 text-cyan-400"
              )}>
                [{completedSpecialCount}/{todaySpecializations.length}] CLEARED
              </span>
            </div>

            {/* Specialization Task Items */}
            <div className="space-y-2 mb-4 relative z-10">
              {todaySpecializations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono border border-dashed border-cyan-500/30 rounded-xl">
                  No specializations scheduled for today. Standard rest cycle.
                </div>
              ) : (
                todaySpecializations.map((task) => {
                  const isDone = !!completedTasks[task.id]
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, !isDone)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none group",
                        isDone
                          ? "bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          : "bg-slate-900/60 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-slate-900/90"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="min-w-0">
                          <span className={cn(
                            "text-xs font-mono font-bold tracking-wide block transition-colors",
                            isDone ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" : "text-slate-200 group-hover:text-cyan-300"
                          )}>
                            {task.label}
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400/70 font-semibold">
                            {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className={cn(
                          "text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border",
                          isDone
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {isDone ? "[CLEARED]" : "[INCOMPLETE]"}
                        </span>

                        <div className={cn(
                          "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                          isDone
                            ? "border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                            : "border-cyan-500/40 bg-slate-900 group-hover:border-cyan-400"
                        )}>
                          {isDone && <Check className="w-4 h-4 stroke-[3] text-cyan-300" />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer Info Box */}
            <div className="pt-3 border-t border-cyan-500/25 text-center font-mono text-[10px] leading-relaxed relative z-10">
              <p className="text-slate-300">
                <span className="text-cyan-400 font-extrabold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">REWARD INFUSION:</span>{' '}
                Specialization attribute growth is permanently synced with your Sovereign Biometric Matrix upon clearing.
              </p>
            </div>
          </motion.div>
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
        </div>

        {/* Right 5 Columns: Quest Info (Preparations to Become Strong) + Biometrics Summary */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Core Protocols Checklist — Authentic Solo Leveling Quest Window */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={cn(
              "border-2 rounded-2xl p-5 md:p-6 transition-all duration-500 flex-shrink-0 relative overflow-hidden shadow-2xl",
              "bg-slate-950/95 dark:bg-[#030712]/95 border-cyan-500/50 dark:border-cyan-400/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]",
              stats.failureState === 1 ? "border-red-500/50" : ""
            )}
          >
            {/* Cybernetic Tech Corner Accents matching reference image */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

            {/* Ambient Background Energy */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />

            {/* Dual-Dagger Combat Jin-Woo Illustration (auto-shrinks on mobile, absolute on desktop) */}
            <div className="hidden lg:block absolute -right-3 -bottom-5 w-44 xl:w-52 pointer-events-none select-none z-0 opacity-75 hover:opacity-100 transition-opacity">
              <img
                src="/images/solo-leveling/jinwoo-combat.png"
                alt="Jin-Woo Combat Dual Daggers"
                className="w-full h-auto object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              />
            </div>

            {/* Header: [!] QUEST INFO */}
            <div className="flex flex-col items-center justify-center mb-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-lg border border-cyan-400/70 bg-cyan-950/60 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="w-5 h-5 rounded-full border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">!</span>
                <span className="font-mono font-black text-xs sm:text-sm tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  QUEST INFO
                </span>
              </div>
              <p className="text-cyan-400/95 text-xs font-mono font-bold tracking-wider mt-2 text-center">
                [Daily Quest: Preparations to Become Strong has arrived.]
              </p>
            </div>

            {/* GOAL Underlined */}
            <div className="text-center my-3 relative z-10">
              <span className="font-mono font-black text-xs sm:text-sm tracking-[0.3em] text-cyan-300 uppercase pb-1 border-b-2 border-cyan-400 inline-block drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]">
                GOAL
              </span>
            </div>

            {/* Quest items list */}
            <div className="space-y-2 mb-4 relative z-10">
              {DAILY_CORE_PROTOCOLS.map((task) => {
                const isDone = !!completedTasks[task.id]
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, !isDone)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-300 cursor-pointer select-none group",
                      isDone
                        ? "bg-cyan-950/40 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-slate-900/60 border-cyan-500/25 hover:border-cyan-400/60 hover:bg-slate-900/90"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="min-w-0">
                        <span className={cn(
                          "text-xs font-mono font-bold tracking-wide block transition-colors",
                          isDone ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" : "text-slate-200 group-hover:text-cyan-300"
                        )}>
                          {task.label}
                        </span>
                        <span className="text-[9px] font-mono text-cyan-400/70 font-semibold">
                          {Object.entries(task.rewards).map(([stat, val]) => `+${val.toFixed(1)} ${getShortStatName(stat)}`).join(' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      {/* Live Counter Bracket */}
                      <span className={cn(
                        "text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border",
                        isDone
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      )}>
                        {isDone ? "[CLEARED]" : "[INCOMPLETE]"}
                      </span>

                      {/* Holographic Checkbox */}
                      <div className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all",
                        isDone
                          ? "border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                          : "border-cyan-500/40 bg-slate-900 group-hover:border-cyan-400"
                      )}>
                        {isDone && <Check className="w-4 h-4 stroke-[3] text-cyan-300" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning Banner matching image footer */}
            <div className="pt-3 border-t border-cyan-500/25 text-center font-mono text-[10px] leading-relaxed relative z-10">
              <p className="text-slate-300">
                <span className="text-cyan-400 font-extrabold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">WARNING:</span>{' '}
                Failure to complete the daily quest will result in an appropriate penalty.
              </p>
            </div>

            {/* Daily Quest Rewards Box */}
            <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1 font-mono text-[9px] sm:text-[10px] relative z-10">
              <div className="flex items-center justify-between text-cyan-300 font-bold uppercase tracking-wider">
                <span>🎁 QUEST REWARDS</span>
                <span className="text-[9px] text-cyan-400/70">ALL OBJECTIVES</span>
              </div>
              <div className="text-slate-300/80 space-y-0.5 text-[9px]">
                <p>1. Status Recovery (Fatigue → 0%)</p>
                <p>2. Permanent Biometric Attribute Growth</p>
                <p>3. Blessed Random Box / Monarch Key</p>
              </div>
            </div>
          </motion.div>
          {/* Panel C: Stats Grid breakdown with level-up tickers */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={cn(
              "bg-card border rounded-2xl p-4 md:p-5 space-y-3 transition-all duration-500 shadow-xs hover:shadow-md",
              stats.failureState === 1 ? "border-red-200 dark:border-red-500/15" : "border-border hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest font-bold block">Biometrics Summary</span>
              <span className="text-[10px] font-mono text-primary font-bold">10 Attributes Synced</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              {[
                { label: 'Strength ⚔️', value: stats.strength, color: 'text-red-700 bg-red-50/80 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-500/20' },
                { label: 'Agility ⚡', value: stats.agility, color: 'text-orange-700 bg-orange-50/80 border-orange-200 dark:text-orange-400 dark:bg-orange-950/20 dark:border-orange-500/20' },
                { label: 'Intelligence 🧠', value: stats.intelligence, color: 'text-purple-700 bg-purple-50/80 border-purple-200 dark:text-purple-400 dark:bg-purple-950/20 dark:border-purple-500/20' },
                { label: 'Memory 💾', value: stats.memory, color: 'text-indigo-700 bg-indigo-50/80 border-indigo-200 dark:text-indigo-400 dark:bg-indigo-950/20 dark:border-indigo-500/20' },
                { label: 'Discipline 🛡️', value: stats.discipline, color: 'text-pink-700 bg-pink-50/80 border-pink-200 dark:text-pink-400 dark:bg-pink-950/20 dark:border-pink-500/20' },
                { label: 'Focus 🎯', value: stats.focus, color: 'text-amber-700 bg-amber-50/80 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-500/20' },
                { label: 'Communication 🗣️', value: stats.communication, color: 'text-cyan-700 bg-cyan-50/80 border-cyan-200 dark:text-cyan-400 dark:bg-cyan-950/20 dark:border-cyan-500/20' },
                { label: 'Confidence 👑', value: stats.confidence, color: 'text-yellow-800 bg-yellow-50/80 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-500/20' },
                { label: 'Stability ☯️', value: stats.stability, color: 'text-emerald-700 bg-emerald-50/80 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-500/20' },
                { label: 'Career XP 💼', value: stats.careerXp, color: 'text-blue-700 bg-blue-50/80 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-500/20' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-2 rounded-xl border transition-all duration-300 hover:scale-[1.02] shadow-2xs select-none",
                    stats.failureState === 1 ? "bg-red-950/5 border-red-500/10 text-red-400" : stat.color
                  )}
                >
                  <span className="font-semibold truncate pr-1">{stat.label}</span>
                  <span className="font-black text-xs font-mono">
                    <AnimateNumber value={stat.value} />
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── 5 POWER CATEGORIES & SPECIALIZATION APIS ─── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-3.5"
      >
        {[
          { 
            title: 'Physical API', 
            val: stats.physicalPower, 
            formula: '(Str + Agi) × 2', 
            color: 'from-red-500 to-orange-500 shadow-red-500/10',
            textColor: 'text-red-600 dark:text-red-400',
            badgeBg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/20',
            stroke: '#ef4444',
            icon: <Activity className="w-4 h-4" />,
            max: 3996
          },
          { 
            title: 'Mental API', 
            val: stats.mentalPower, 
            formula: '(Int + Mem + Foc) × 1.8', 
            color: 'from-purple-500 to-indigo-500 shadow-indigo-500/10',
            textColor: 'text-purple-600 dark:text-purple-400',
            badgeBg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-500/20',
            stroke: '#a855f7',
            icon: <Brain className="w-4 h-4" />,
            max: 5394
          },
          { 
            title: 'Biometric API', 
            val: stats.disciplinePower, 
            formula: '(Disc + Stab) × 2.2', 
            color: 'from-emerald-500 to-teal-500 shadow-emerald-500/10',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-500/20',
            stroke: '#10b981',
            icon: <Shield className="w-4 h-4" />,
            max: 4395
          },
          { 
            title: 'Communication API', 
            val: stats.communicationPower, 
            formula: '(Comm + Conf) × 1.5', 
            color: 'from-cyan-500 to-sky-500 shadow-cyan-500/10',
            textColor: 'text-cyan-600 dark:text-cyan-400',
            badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-500/20',
            stroke: '#06b6d4',
            icon: <MessageSquare className="w-4 h-4" />,
            max: 2997
          },
          { 
            title: 'Career API', 
            val: stats.careerPower, 
            formula: 'Exp × 2', 
            color: 'from-blue-500 to-indigo-500 shadow-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400',
            badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-500/20',
            stroke: '#3b82f6',
            icon: <Briefcase className="w-4 h-4" />,
            max: 1998
          },
        ].map((cat, i) => {
          const radius = 22
          const circumference = 2 * Math.PI * radius
          const percent = Math.min(100, (cat.val / cat.max) * 100)
          const offset = circumference - (percent / 100) * circumference

          return (
            <div 
              key={i}
              className={cn(
                "bg-card border rounded-2xl p-4 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] shadow-xs hover:shadow-md",
                stats.failureState === 1 ? "border-red-200 dark:border-red-500/20" : "border-border hover:border-primary/40"
              )}
            >
              {/* Top ambient color edge */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] opacity-75"
                style={{ backgroundColor: cat.stroke }}
              />

              {/* Top header badge */}
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">{cat.title}</span>
                <span className={cn("p-1.5 rounded-lg border text-[10px] shadow-2xs", cat.badgeBg)}>{cat.icon}</span>
              </div>

              {/* Center Circle SVG */}
              <div className="relative w-18 h-18 flex items-center justify-center my-1.5">
                <svg className="w-16 h-16 transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-800 fill-none"
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
                <div className="absolute text-sm font-black font-mono text-foreground select-none">
                  <AnimateNumber value={cat.val} />
                </div>
              </div>

              {/* Bottom detail */}
              <div className="w-full mt-1 border-t border-border/50 pt-1.5">
                <p className="text-[9px] text-muted-foreground font-mono font-bold tracking-tight">{cat.formula}</p>
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
          {(() => {
            const currentVal = stats.strength || 0
            const targetVal = 100
            const pct = Math.min(100, Math.round((currentVal / targetVal) * 100))
            return (
              <div className={cn(
                "border rounded-xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                hasIronBody 
                  ? "bg-gradient-to-br from-red-500/10 via-red-500/[0.03] to-transparent border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] ring-1 ring-red-500/30" 
                  : "bg-card dark:bg-card/60 border-border/80 hover:border-red-500/30 hover:shadow-[0_4px_20px_rgba(239,68,68,0.06)]"
              )}>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
                    hasIronBody ? "bg-red-500/20 border-red-500/40 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {hasIronBody ? <Sparkles className="w-5 h-5 animate-pulse text-red-400" /> : <Flame className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="text-xs font-black font-mono tracking-wide text-foreground">IRON BODY</h4>
                      {hasIronBody ? (
                        <span className="bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="bg-secondary text-muted-foreground border border-border text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          {pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Threshold: <span className="text-red-500 dark:text-red-400 font-bold">100 STR</span> (+50 XP, +0.05 Multiplier)</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-muted-foreground">Current: {currentVal} / {targetVal} STR</span>
                    <span className={cn("font-bold", hasIronBody ? "text-red-500" : "text-foreground")}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", hasIronBody ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-red-500/70")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Milestone 2: Unbreakable Mind */}
          {(() => {
            const currentVal = stats.discipline || 0
            const targetVal = 100
            const pct = Math.min(100, Math.round((currentVal / targetVal) * 100))
            return (
              <div className={cn(
                "border rounded-xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                hasUnbreakableMind 
                  ? "bg-gradient-to-br from-pink-500/10 via-pink-500/[0.03] to-transparent border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/30" 
                  : "bg-card dark:bg-card/60 border-border/80 hover:border-pink-500/30 hover:shadow-[0_4px_20px_rgba(236,72,153,0.06)]"
              )}>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
                    hasUnbreakableMind ? "bg-pink-500/20 border-pink-500/40 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]" : "bg-pink-500/10 border-pink-500/20 text-pink-400"
                  )}>
                    {hasUnbreakableMind ? <Brain className="w-5 h-5 animate-pulse text-pink-400" /> : <Brain className="w-5 h-5 text-pink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="text-xs font-black font-mono tracking-wide text-foreground">UNBREAKABLE MIND</h4>
                      {hasUnbreakableMind ? (
                        <span className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border border-pink-500/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="bg-secondary text-muted-foreground border border-border text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          {pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Threshold: <span className="text-pink-500 dark:text-pink-400 font-bold">100 DIS</span> (+50 XP, +0.05 Multiplier)</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-muted-foreground">Current: {currentVal} / {targetVal} DIS</span>
                    <span className={cn("font-bold", hasUnbreakableMind ? "text-pink-500" : "text-foreground")}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", hasUnbreakableMind ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" : "bg-pink-500/70")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Milestone 3: Tactical Genius */}
          {(() => {
            const currentVal = stats.intelligence || 0
            const targetVal = 150
            const pct = Math.min(100, Math.round((currentVal / targetVal) * 100))
            return (
              <div className={cn(
                "border rounded-xl p-4 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                hasTacticalGenius 
                  ? "bg-gradient-to-br from-purple-500/10 via-purple-500/[0.03] to-transparent border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30" 
                  : "bg-card dark:bg-card/60 border-border/80 hover:border-purple-500/30 hover:shadow-[0_4px_20px_rgba(168,85,247,0.06)]"
              )}>
                <div className="flex items-start gap-3.5 mb-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all",
                    hasTacticalGenius ? "bg-purple-500/20 border-purple-500/40 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]" : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                  )}>
                    {hasTacticalGenius ? <Sparkles className="w-5 h-5 animate-pulse text-purple-400" /> : <ShieldAlert className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className="text-xs font-black font-mono tracking-wide text-foreground">TACTICAL GENIUS</h4>
                      {hasTacticalGenius ? (
                        <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          UNLOCKED
                        </span>
                      ) : (
                        <span className="bg-secondary text-muted-foreground border border-border text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono">
                          {pct}%
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">Threshold: <span className="text-purple-500 dark:text-purple-400 font-bold">150 INT</span> (+100 XP, +0.10 Multiplier)</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-muted-foreground">Current: {currentVal} / {targetVal} INT</span>
                    <span className={cn("font-bold", hasTacticalGenius ? "text-purple-500" : "text-foreground")}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", hasTacticalGenius ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" : "bg-purple-500/70")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}
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
        <div className="absolute top-0 right-0 w-72 h-48 bg-purple-500/[0.03] rounded-full filter blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className={cn(
            "p-1.5 rounded-lg border flex-shrink-0",
            stats.failureState === 1 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-purple-500/10 border-purple-500/20 text-purple-500 dark:text-purple-400"
          )}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-foreground/90 text-xs font-semibold tracking-wider font-mono uppercase">SOVEREIGN POWERS HALL</h3>
            <p className="text-muted-foreground text-[9px] font-mono">Fantasy abilities — locked until Sovereign milestone levels are achieved</p>
          </div>
          <div className="ml-auto text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            {getUnlockedPowers(stats.level || 1).length}/{FANTASY_POWERS.length} Unlocked
          </div>
        </div>

        {/* Shadow Monarch Executive Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-5 rounded-xl bg-gradient-to-r from-purple-500/10 via-card to-card border border-purple-500/30 mb-4 relative overflow-hidden">
          <div className="flex-1 z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                SOVEREIGN ASCENSION // LEVEL {stats.level || 1}
              </span>
              <span className="text-muted-foreground text-[10px] font-mono">
                NATIONAL-GRADE MONARCH STATUS
              </span>
            </div>
            <h4 className="text-foreground text-sm sm:text-base font-extrabold font-mono uppercase tracking-wide">
              EXECUTIVE SOVEREIGNTY: COMMAND SHADOWS IN REALITY
            </h4>
            <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed max-w-xl font-medium">
              Conquer your daily training and professional milestones to unlock fantasy monarch skills. The higher your level, the more absolute your command over reality.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                Unlocked: {getUnlockedPowers(stats.level || 1).length}/{FANTASY_POWERS.length} Powers
              </span>
            </div>
          </div>
          <div className="relative flex-shrink-0 z-10">
            <img
              src="/images/solo-leveling/jinwoo-monarch.png"
              alt="Shadow Monarch Executive"
              className="h-28 sm:h-36 md:h-44 w-auto object-contain filter drop-shadow-[0_0_25px_rgba(147,51,234,0.35)]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-3 relative z-10">
          {FANTASY_POWERS.map((power) => {
            const unlocked = (stats.level || 1) >= power.level
            return (
              <div
                key={power.id}
                className={cn(
                  "p-3 rounded-xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group",
                  unlocked
                    ? cn("border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card shadow-[0_0_20px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/20")
                    : "bg-secondary/30 dark:bg-secondary/15 border-border hover:border-primary/40 hover:bg-secondary/50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl filter drop-shadow">{power.icon}</span>
                    {unlocked ? (
                      <span className="px-1.5 py-0.5 rounded text-[7px] font-mono font-black tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Lock className="w-2 h-2" /> LV.{power.level}
                      </span>
                    )}
                  </div>
                  <div className={cn("text-[8px] font-mono font-black tracking-widest", unlocked ? power.color : "text-primary/70 dark:text-primary/60")}>
                    {power.title}
                  </div>
                  <div className="text-foreground text-[10px] font-bold mt-0.5 leading-tight">{power.name}</div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-border/50">
                  <div className={cn("text-[8px] leading-relaxed", unlocked ? "text-muted-foreground" : "text-muted-foreground/70")}>
                    {power.effect}
                  </div>
                </div>
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

      {/* ─── FULL-SCREEN HOLOGRAPHIC QUEST SCROLL MODAL (MATCHING REFERENCE IMAGE) ─── */}
      <AnimatePresence>
        {showHologramModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHologramModal(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 max-w-md w-full rounded-2xl overflow-hidden border-2 border-cyan-400 bg-slate-950 text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.45)] p-5 sm:p-7 max-h-[90vh] overflow-y-auto"
            >
              {/* Corner tech notches matching reference image */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

              {/* Close Button */}
              <button
                onClick={() => setShowHologramModal(false)}
                className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-200 p-1 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Box: (!) QUEST INFO */}
              <div className="flex flex-col items-center justify-center mb-4 text-center mt-2">
                <div className="inline-flex items-center gap-2.5 px-6 py-2 rounded-xl border-2 border-cyan-400 bg-cyan-950/70 shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                  <span className="w-6 h-6 rounded-full border-2 border-cyan-300 flex items-center justify-center text-cyan-300 font-black text-sm">!</span>
                  <span className="font-mono font-black text-base tracking-[0.25em] text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]">
                    QUEST INFO
                  </span>
                </div>
                <p className="text-cyan-400 text-xs font-mono font-bold tracking-widest mt-3">
                  [Daily Quest: Strength Training has arrived.]
                </p>
              </div>

              {/* GOAL */}
              <div className="text-center my-3">
                <span className="font-mono font-black text-base tracking-[0.35em] text-cyan-300 uppercase pb-1.5 border-b-2 border-cyan-400 inline-block drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                  GOAL
                </span>
              </div>

              {/* Holographic Tasks */}
              <div className="space-y-2.5 my-4">
                {DAILY_CORE_PROTOCOLS.map((task) => {
                  const isDone = !!completedTasks[task.id]
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, !isDone)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none",
                        isDone
                          ? "bg-cyan-950/50 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                          : "bg-slate-900/70 border-cyan-500/30 hover:border-cyan-400"
                      )}
                    >
                      <span className={cn(
                        "text-xs md:text-sm font-mono font-bold tracking-wide",
                        isDone ? "text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" : "text-slate-200"
                      )}>
                        {task.label}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "text-xs font-mono font-extrabold px-2 py-0.5 rounded border",
                          isDone ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" : "bg-slate-800 text-slate-400 border-slate-700"
                        )}>
                          {isDone ? "[100/100]" : "[0/100]"}
                        </span>
                        <div className={cn(
                          "w-6 h-6 rounded border-2 flex items-center justify-center transition-all",
                          isDone ? "border-cyan-400 bg-cyan-500/30 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.7)]" : "border-cyan-500/50 bg-slate-900"
                        )}>
                          {isDone && <Check className="w-4 h-4 stroke-[3] text-cyan-300" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Warning Footer */}
              <div className="mt-4 pt-3.5 border-t border-cyan-500/30 text-center font-mono text-[11px] leading-relaxed">
                <p className="text-slate-300">
                  <span className="text-cyan-400 font-extrabold tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]">WARNING:</span>{' '}
                  Failure to complete the daily quest will result in an appropriate penalty.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default SoloLeveling
