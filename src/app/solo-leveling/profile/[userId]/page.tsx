'use client'

import React, { useEffect, useState, use } from 'react'
import { cn } from '@/lib/utils'
import { Flame, Zap, Shield, Activity, Award, Brain, MessageSquare, Briefcase, Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

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

export default function PublicHunterProfile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [stats, setStats] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/solo-leveling/profile/${userId}`)
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Hunter license not registered in Sovereign Database.')
          }
          throw new Error('Failed to retrieve hunter biometrics.')
        }
        const data = await res.json()
        setStats(data.stats)
        setHistory(data.history || [])
      } catch (err: any) {
        setError(err.message || 'System error')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-orange-500 animate-spin mx-auto" />
          <p className="text-orange-500 font-mono text-xs animate-pulse tracking-widest uppercase">
            ⚡ SEARCHING HUNTER ARCHIVES...
          </p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-6 border border-red-500/20 bg-red-950/5 rounded-2xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
          <h2 className="text-red-500 font-mono font-bold tracking-widest uppercase">TRANSMISSION TERMINATED</h2>
          <p className="text-white/60 text-xs font-mono">{error || 'Unknown classification database error.'}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 font-mono text-xs uppercase transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Main System
          </a>
        </div>
      </div>
    )
  }

  const getRankDetails = (rank: string) => {
    switch (rank) {
      case 'Shadow Monarch':
        return {
          title: 'SHADOW MONARCH',
          badgeText: '👑 THE APEX SOVEREIGN',
          color: 'text-[#9d4edd] border-[#7b2cbf]/40 bg-purple-950/15',
          glow: 'shadow-[0_0_35px_rgba(157,78,221,0.5)] border-[#9d4edd]/50',
          auraClass: 'bg-gradient-to-r from-purple-600/20 via-black to-indigo-600/20 shadow-purple-500/25 animate-pulse',
          description: 'Monarch of the Absolute Void. Your discipline stands absolute, ruling over shadows and mortal boundaries.',
        }
      case 'Monarch':
        return {
          title: 'SOVEREIGN MONARCH',
          badgeText: '⚔️ MONARCH CLASS',
          color: 'text-[#c77dff] border-[#b5179e]/30 bg-purple-900/10',
          glow: 'shadow-[0_0_25px_rgba(199,125,255,0.3)] border-[#c77dff]/35',
          auraClass: 'bg-purple-900/10 shadow-indigo-500/15',
          description: 'Awakened ruler of the System. Extreme mental consistency and focus allow you to manifest reality at will.',
        }
      case 'Commander':
        return {
          title: 'IMPERIAL COMMANDER',
          badgeText: '🎖️ COMMANDER CLASS',
          color: 'text-[#e63946] border-[#d90429]/30 bg-red-950/10',
          glow: 'shadow-[0_0_20px_rgba(230,57,70,0.3)] border-[#e63946]/35',
          auraClass: 'bg-red-950/10 shadow-red-500/15',
          description: 'Military tactician. Your stats dictate the execution of massive projects and absolute strategic mastery.',
        }
      case 'Elite':
        return {
          title: 'ELITE VANGUARD',
          badgeText: '🔥 ELITE CLASS',
          color: 'text-[#ffb703] border-[#fb8500]/30 bg-amber-950/10',
          glow: 'shadow-[0_0_20px_rgba(255,183,3,0.25)] border-[#ffb703]/35',
          auraClass: 'bg-amber-950/10 shadow-amber-500/15',
          description: 'A relentless powerhouse of focus. Consistently crushing limits and ascending above standard benchmarks.',
        }
      case 'Warrior':
        return {
          title: 'SOVEREIGN WARRIOR',
          badgeText: '⚔️ WARRIOR CLASS',
          color: 'text-[#00f5d4] border-[#00bbf9]/30 bg-teal-950/10',
          glow: 'shadow-[0_0_15px_rgba(0,245,212,0.2)] border-[#00f5d4]/35',
          auraClass: 'bg-teal-950/5 shadow-teal-500/10',
          description: 'Highly trained fighter. Base physical and intellectual parameters are fully integrated into daily habits.',
        }
      case 'Aspirant':
        return {
          title: 'SYSTEM ASPIRANT',
          badgeText: '⚡ ASPIRANT CLASS',
          color: 'text-[#55a630] border-[#38b000]/20 bg-emerald-950/10',
          glow: 'shadow-[0_0_12px_rgba(85,166,48,0.15)] border-[#55a630]/25',
          auraClass: 'bg-emerald-950/5 shadow-emerald-500/5',
          description: 'Potential awakened. The system is beginning to synchronize with your focus cycles. Keep grinding.',
        }
      default:
        return {
          title: 'UNRANKED CIVILIAN',
          badgeText: '💀 CIVILIAN CLASS',
          color: 'text-white/40 border-white/10 bg-white/5',
          glow: 'shadow-none border-white/10',
          auraClass: 'bg-white/5 shadow-transparent',
          description: 'Biometrics inactive. Awaken your inner Monarch by completing base protocols and breaking limit values.',
        }
    }
  }

  const rankInfo = getRankDetails(stats.currentRank)

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

  return (
    <div className="min-h-screen bg-[#060608] text-white flex flex-col justify-between relative overflow-hidden p-4 sm:p-6 md:p-10 font-sans">
      {/* Dynamic Ambient Background Portal Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 rounded-full bg-purple-500/[0.03] filter blur-[90px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] rounded-full bg-orange-500/[0.02] filter blur-[100px] animate-pulse" />
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <span className="font-mono text-sm font-black tracking-widest text-slate-900 dark:text-white">SAMRAJYA OS HUD</span>
        </div>
        <a
          href="/"
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-white/40 hover:text-white transition-all bg-white/[0.02] border border-white/5 py-1.5 px-3 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return System
        </a>
      </div>

      {/* Main License Card */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 my-auto items-stretch">
        
        {/* Left Column: Hunter License Card */}
        <div 
          className={cn(
            "lg:col-span-7 flex flex-col justify-between p-6 rounded-2xl relative overflow-hidden transition-all duration-700 min-h-[380px] sm:min-h-[420px] md:min-h-[460px] border shadow-2xl",
            stats.failureState === 1
              ? "bg-[#180808]/50 border-red-500/25"
              : "premium-rank-card animate-sweep-shine"
          )}
        >
          {/* Lightning Storm Vectors */}
          {stats.failureState !== 1 && (
            <>
              <div className="thunder-sky-overlay" />
              <div className="thunder-sky-flash" />
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pubLightning" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="70%" stopColor="#9d4edd" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient id="pubLightningTL" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f5d4" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <linearGradient id="pubLightningTR" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00bbf9" />
                    <stop offset="100%" stopColor="#9d4edd" />
                  </linearGradient>
                  <filter id="pubGlow">
                    <feGaussianBlur stdDeviation="1" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path d="M 40 0 L 37 18 L 46 32 L 32 52 L 42 68 L 30 90 L 35 100" stroke="url(#pubLightning)" strokeWidth="0.4" fill="none" filter="url(#pubGlow)" className="animate-lightning-bolt-1" />
                <path d="M 70 0 L 68 15 L 75 28 L 64 45 L 71 60 L 60 82" stroke="url(#pubLightning)" strokeWidth="0.3" fill="none" filter="url(#pubGlow)" className="animate-lightning-bolt-2" />
                <path d="M 0 5 L 15 12 L 10 20 L 25 30 L 20 42 L 35 55" stroke="url(#pubLightningTL)" strokeWidth="0.3" fill="none" filter="url(#pubGlow)" className="animate-lightning-bolt-3" />
                <path d="M 100 10 L 85 18 L 90 28 L 75 36 L 80 48 M 65 60" stroke="url(#pubLightningTR)" strokeWidth="0.28" fill="none" filter="url(#pubGlow)" className="animate-lightning-bolt-4" />
              </svg>
              <div className="premium-scanline" />
              <div className={cn("absolute inset-0 opacity-20 pointer-events-none filter blur-xl transition-all", rankInfo.auraClass)} />
            </>
          )}

          {/* Top Panel Information */}
          <div className="relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 font-mono">
              <div>
                <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">SOVEREIGN ASSOCIATION</span>
                <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-white/90">AWAKENED HUNTER LICENSE</h1>
              </div>
              <div className="text-right">
                <span className="text-white/40 text-[9px] uppercase tracking-widest block font-bold">LICENSE ID</span>
                <span className="text-[10px] text-orange-500 font-bold">HL-{userId.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Hunter Biometric Hologram Avatar */}
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <div className={cn(
                  "w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border flex items-center justify-center bg-black/60 relative overflow-hidden",
                  stats.failureState === 1 ? "border-red-500/30" : "border-orange-500/20"
                )}>
                  {/* Avatar scanlines */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent animate-pulse" />
                  
                  {/* Hunter Icon */}
                  <div className="text-center space-y-1 z-10">
                    <span className="text-3xl sm:text-4xl block select-none filter drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]">
                      {stats.failureState === 1 ? '💀' : '👑'}
                    </span>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-orange-500 block animate-pulse">AWAKENED</span>
                  </div>
                </div>

                {/* Level Tag Overlay */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-600 to-amber-500 border border-orange-400/30 text-white font-mono font-extrabold text-[10px] px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1 select-none">
                  <span>LV.</span>
                  <span className="text-xs tracking-wider"><AnimateNumber value={stats.level || 1} /></span>
                </div>
              </div>

              {/* Hunter Description & Standings */}
              <div className="space-y-3.5 text-center sm:text-left flex-grow">
                <div>
                  <span className="text-white/40 text-[9px] uppercase tracking-widest font-mono font-bold">Class Standing</span>
                  <div className="mt-1 flex flex-wrap justify-center sm:justify-start gap-2 items-center">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border filter backdrop-blur",
                      stats.failureState === 1 ? 'text-red-500/60 border-red-500/20 bg-red-950/10' : rankInfo.color
                    )}>
                      {stats.failureState === 1 ? 'DEGRADED' : rankInfo.badgeText}
                    </span>
                  </div>
                  <h2 className={cn(
                    "text-xl sm:text-2xl font-black font-mono tracking-widest mt-1.5 uppercase",
                    stats.failureState === 1 ? 'text-red-500 animate-pulse' : 'text-orange-400 premium-rank-text'
                  )}>
                    {stats.failureState === 1 ? 'DEGRADED CIVILIAN' : rankInfo.title}
                  </h2>
                </div>

                <p className="text-white/50 text-[11px] font-medium leading-relaxed max-w-sm">
                  {stats.failureState === 1
                    ? 'This user faltered in daily discipline protocols, triggering core biometrics decay and temporal power constraints.'
                    : rankInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Panel Power Level Bar */}
          <div className="relative z-10 mt-6 sm:mt-0">
            <div className="flex items-baseline justify-between border-t border-white/5 pt-4 mb-2.5 font-mono">
              <span className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Resonance Coefficient</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[10px] text-white/30 font-bold uppercase">PL</span>
                <span className={cn(
                  "font-black text-3xl sm:text-4xl tracking-wider select-none",
                  stats.failureState === 1 ? 'text-red-500' : 'text-resonance-glow'
                )}>
                  <AnimateNumber value={stats.powerLevel} />
                </span>
              </div>
            </div>

            {/* Streak tags */}
            <div className="flex gap-2 font-mono text-[9px] mb-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1 text-white/60 flex items-center gap-1.5">
                <Flame className={cn("w-3.5 h-3.5", stats.failureState === 1 ? "text-red-500" : "text-orange-500 animate-pulse")} />
                <span>Perfect Streak: <strong>{stats.perfectStreak} Days</strong></span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1 text-white/60 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Multiplier: <strong>{stats.failureState === 1 ? `${(stats.xpMultiplier * 0.3).toFixed(2)}x` : `${stats.xpMultiplier.toFixed(2)}x`}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Attribute Radar Map & Numbers */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6 items-stretch">
          
          {/* Panel B: Recharts Radar */}
          <div className={cn(
            "p-5 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden min-h-[220px] transition-all duration-500",
            stats.failureState === 1
              ? "bg-[#180808]/40 border-red-500/20"
              : "bg-black/30 border-white/5 premium-rank-card animate-sweep-shine"
          )}>
            {stats.failureState !== 1 && (
              <>
                <div className="thunder-sky-overlay" />
                <div className="thunder-sky-flash" />
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15 z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 45 0 L 42 20 L 49 35 L 38 55 L 46 72 L 35 90 L 39 100" stroke="url(#pubLightning)" strokeWidth="0.3" fill="none" className="animate-lightning-bolt-1" />
                  <path d="M 75 0 L 72 15 L 78 30 L 69 48 L 74 62 L 66 85" stroke="url(#pubLightning)" strokeWidth="0.2" fill="none" className="animate-lightning-bolt-2" />
                </svg>
                <div className="premium-scanline" />
                <div className={cn("absolute inset-0 opacity-15 pointer-events-none filter blur-xl transition-all", rankInfo.auraClass)} />
              </>
            )}

            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold font-mono self-start mb-3 relative z-10">Resonance Field</span>
            
            <div className="w-full h-[180px] flex items-center justify-center relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke={stats.failureState === 1 ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.18)"} />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 8.5, fontWeight: 'bold', fontFamily: 'monospace' }} 
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
          </div>

          {/* Biometrics Summary breakdown */}
          <div className={cn(
            "p-4 rounded-2xl border flex-grow space-y-3",
            stats.failureState === 1 ? "border-red-500/15 bg-red-950/[0.01]" : "bg-[#0e0e12] border-white/12 hover:border-white/20"
          )}>
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold font-mono block">Biometrics Matrix</span>
            
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              {[
                { label: 'Strength ⚔️', value: stats.strength, color: 'text-red-400 bg-red-950/10 border-red-500/5' },
                { label: 'Agility ⚡', value: stats.agility, color: 'text-orange-400 bg-orange-950/10 border-orange-500/5' },
                { label: 'Intelligence 🧠', value: stats.intelligence, color: 'text-purple-400 bg-purple-950/10 border-purple-500/5' },
                { label: 'Memory 💾', value: stats.memory, color: 'text-indigo-400 bg-indigo-950/10 border-indigo-500/5' },
                { label: 'Discipline 🛡️', value: stats.discipline, color: 'text-pink-400 bg-pink-950/10 border-pink-500/5' },
                { label: 'Focus 🎯', value: stats.focus, color: 'text-amber-400 bg-amber-950/10 border-amber-500/5' },
                { label: 'Communication 🗣️', value: stats.communication, color: 'text-cyan-400 bg-cyan-950/10 border-cyan-500/5' },
                { label: 'Confidence 👑', value: stats.confidence, color: 'text-yellow-400 bg-yellow-950/10 border-yellow-500/5' },
                { label: 'Stability ☯️', value: stats.stability, color: 'text-emerald-400 bg-emerald-950/10 border-emerald-500/5' },
                { label: 'Career XP 💼', value: stats.careerXp, color: 'text-blue-400 bg-blue-950/10 border-blue-500/5' },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center justify-between p-1.5 rounded-lg border transition-all duration-300",
                    stats.failureState === 1 ? "bg-red-950/5 border-red-500/5" : stat.color
                  )}
                >
                  <span className="text-white/50">{stat.label}</span>
                  <span className="font-black text-xs">
                    <AnimateNumber value={stat.value} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Standing */}
      <div className="max-w-4xl w-full mx-auto text-center border-t border-border/40 pt-6 mt-8 relative z-10 font-mono text-[9px] dark:text-white/20 text-slate-500 uppercase tracking-widest space-y-1">
        <p>AWAKENED POWER REGISTERED SYSTEM INDEPENDENT NODE</p>
        <p>SAMRAJYA SOVEREIGN SYSTEM VER 2.2.0 • DATE RECORDED: {new Date(stats.lastUpdated || Date.now()).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
