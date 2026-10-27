"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail, ShieldCheck, Zap, Sparkles, ChevronRight, Crown } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

function playThunderChime() {
  if (typeof window === "undefined") return
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // Ignore audio errors
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [thunderFlash, setThunderFlash] = useState(false)
  const [activeStrike, setActiveStrike] = useState(0)

  const supabase = createClient()

  // Dynamic realistic thunder & lightning storm simulator
  useEffect(() => {
    const triggerLightning = () => {
      // Pick random strike pattern
      setActiveStrike(Math.floor(Math.random() * 3))
      
      // Double strike flash (realistic lightning bolt flash-pause-flash)
      setThunderFlash(true)
      setTimeout(() => {
        setThunderFlash(false)
        setTimeout(() => {
          setThunderFlash(true)
          setTimeout(() => setThunderFlash(false), 180)
        }, 90)
      }, 120)
    }

    // Initial strike
    const initialTimer = setTimeout(triggerLightning, 2000)

    // Recurring strikes every 5 to 8 seconds
    const interval = setInterval(() => {
      triggerLightning()
    }, 6000 + Math.random() * 2500)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both credentials.")
      return
    }

    playThunderChime()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        toast.error(error.message || "Authentication failed. Please verify your credentials.")
      } else {
        toast.success("⚡ System access granted. Awakening workspace...")
        router.push("/")
        router.refresh()
      }
    } catch {
      toast.error("A network or system error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden select-none">
      {/* ═══════════════════════════════════════════════════════════════════════
          FULL-SCREEN BACKGROUND THUNDER & LIGHTNING STORM
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Thunder Flash Ambient Screen Wash */}
        <AnimatePresence>
          {thunderFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute inset-0 bg-gradient-to-b from-cyan-300/40 via-sky-400/20 to-purple-600/30 backdrop-blur-[2px] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Deep Plasma Atmospheric Glows */}
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full bg-cyan-600/15 blur-[160px]" />
        <div className="absolute -bottom-40 right-1/4 w-[700px] h-[700px] rounded-full bg-purple-600/20 blur-[160px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-blue-600/15 blur-[140px]" />

        {/* Dynamic Branching SVG Lightning Bolts across background */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="mainThunderGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="70%" stopColor="#818cf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="branchThunderGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </linearGradient>
            <filter id="lightningGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Bolt 1: Massive Left-to-Center Strike */}
          <motion.path
            d="M 220 0 L 260 140 L 230 180 L 290 320 L 250 370 L 320 540 L 270 610 L 350 850 L 310 920 L 400 1200"
            stroke="url(#mainThunderGrad)"
            strokeWidth="3.5"
            fill="none"
            filter="url(#lightningGlow)"
            animate={{
              opacity: thunderFlash && activeStrike === 0 ? [0, 1, 0.4, 1, 0] : [0.15, 0.4, 0.15],
              strokeWidth: thunderFlash && activeStrike === 0 ? [2, 5, 2] : 2,
            }}
            transition={{ duration: thunderFlash ? 0.35 : 4, repeat: thunderFlash ? 0 : Infinity }}
          />

          {/* Bolt 1 Branch */}
          <motion.path
            d="M 290 320 L 380 390 L 360 460 L 440 550"
            stroke="url(#branchThunderGrad)"
            strokeWidth="2"
            fill="none"
            filter="url(#lightningGlow)"
            animate={{
              opacity: thunderFlash && activeStrike === 0 ? [0, 0.9, 0] : [0.1, 0.3, 0.1],
            }}
            transition={{ duration: thunderFlash ? 0.3 : 4, repeat: thunderFlash ? 0 : Infinity }}
          />

          {/* Bolt 2: Massive Right-to-Center Strike */}
          <motion.path
            d="M 85% 0 L 82% 160 L 86% 220 L 79% 380 L 83% 450 L 76% 650 L 81% 740 L 74% 950 L 78% 1200"
            stroke="url(#mainThunderGrad)"
            strokeWidth="3"
            fill="none"
            filter="url(#lightningGlow)"
            animate={{
              opacity: thunderFlash && activeStrike === 1 ? [0, 1, 0.5, 1, 0] : [0.12, 0.35, 0.12],
              strokeWidth: thunderFlash && activeStrike === 1 ? [2, 4.5, 2] : 2,
            }}
            transition={{ duration: thunderFlash ? 0.35 : 5, repeat: thunderFlash ? 0 : Infinity }}
          />

          {/* Bolt 2 Branch */}
          <motion.path
            d="M 79% 380 L 68% 460 L 71% 530 L 62% 640"
            stroke="url(#branchThunderGrad)"
            strokeWidth="2"
            fill="none"
            filter="url(#lightningGlow)"
            animate={{
              opacity: thunderFlash && activeStrike === 1 ? [0, 0.85, 0] : [0.08, 0.25, 0.08],
            }}
            transition={{ duration: thunderFlash ? 0.3 : 5, repeat: thunderFlash ? 0 : Infinity }}
          />

          {/* Bolt 3: High Center Overhead Thunder Fork */}
          <motion.path
            d="M 52% 0 L 48% 110 L 53% 180 L 47% 290 L 51% 370 L 46% 490"
            stroke="url(#mainThunderGrad)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#lightningGlow)"
            animate={{
              opacity: thunderFlash && activeStrike === 2 ? [0, 1, 0.3, 1, 0] : [0.1, 0.3, 0.1],
            }}
            transition={{ duration: thunderFlash ? 0.35 : 4.5, repeat: thunderFlash ? 0 : Infinity }}
          />
        </svg>

        {/* Electric Particles / Ions floating across screen */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]"
            style={{
              top: `${8 + (i * 5.5)}%`,
              left: `${4 + (i * 6)}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-12, 12, -12],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SOVEREIGN ACCESS TERMINAL (CYBERNETIC PORTAL)
          ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl relative z-10 rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-slate-900/85 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/20"
      >
        {/* Cybernetic Corner Brackets */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20" />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20" />

        {/* Mobile Top Header: Centered Sovereign Monarch Crest */}
        <div className="md:hidden pt-7 pb-2 px-6 flex flex-col items-center text-center relative z-10">
          <div className="relative group mb-3">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] ring-2 ring-purple-500/40 bg-black">
              <img
                src="/images/solo-leveling/jinwoo-monarch-portrait.jpg"
                alt="Sung Jin-Woo Monarch Sovereign"
                className="w-full h-full object-cover object-center filter brightness-105 contrast-125"
              />
            </div>
            {/* Status Ping */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border border-slate-900" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 mb-1">
            <Crown className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
              PLAYER #0001 · CHANDRA SEKHAR
            </span>
          </div>
          <span className="text-[9px] font-mono text-purple-400 font-bold tracking-widest uppercase">
            SHADOW MONARCH · SYSTEM AWAKENED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-0 md:min-h-[560px]">
          {/* ── LEFT: Login Access Form (7 cols) ── */}
          <div className="md:col-span-7 p-5 sm:p-8 md:p-10 pt-2 sm:pt-4 md:pt-10 flex flex-col justify-between relative z-10">
            <div>
              {/* Top System Tag (Desktop) */}
              <div className="hidden md:flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/40 text-cyan-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-cyan-400 uppercase">
                  SOVEREIGN ACCESS TERMINAL
                </span>
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                </span>
              </div>

              {/* Title & Brand */}
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-black font-display tracking-[0.15em] uppercase text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  GOD SYSTEM
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1 tracking-wide">
                  Autonomous Sovereign OS — Identify to awaken your attributes.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-[0.2em] block pl-1 font-mono">
                    System Identifier (Email)
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="hunter@godsystem.co"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cyan-300 uppercase tracking-[0.2em] block pl-1 font-mono">
                    Security Passcode
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:brightness-110 active:scale-[0.99] border border-cyan-300/40 shadow-cyan-500/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Sovereign...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-cyan-200 animate-pulse" />
                      <span>Initialize System</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Terminal Status Footer */}
            <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Dungeon Protocol Secure
              </span>
              <span>God System v0.3.0</span>
            </div>
          </div>

          {/* ── RIGHT: Sung Jin-Woo Shadow Monarch Shrine (5 cols, Desktop) ── */}
          <div className="hidden md:flex md:col-span-5 relative bg-gradient-to-b from-slate-950 via-[#0a0614] to-slate-950 overflow-hidden border-l border-cyan-500/30 flex-col items-center justify-between p-6">
            {/* Cybernetic Grid & Plasma Vortex Behind Portrait */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-slate-950/80 to-slate-950 pointer-events-none" />
            <div className="absolute top-1/3 w-48 h-48 rounded-full bg-purple-500/20 blur-[50px] animate-pulse pointer-events-none" />

            {/* Top Monarch Status Pill */}
            <div className="relative z-10 w-full flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950/70 border border-purple-500/40 backdrop-blur-md">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-mono font-bold text-purple-300 tracking-wider uppercase">
                  MONARCH CLASS
                </span>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                SLOT #0001
              </span>
            </div>

            {/* Centered High-Definition Portrait */}
            <div className="relative z-10 my-auto flex flex-col items-center group">
              <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden border-2 border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.4)] ring-2 ring-cyan-400/30 bg-black">
                <img
                  src="/images/solo-leveling/jinwoo-monarch-portrait.jpg"
                  alt="Sung Jin-Woo Monarch Sovereign"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-105 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                
                {/* Floating Badge in Portrait */}
                <div className="absolute bottom-2 inset-x-2 text-center">
                  <span className="text-[9px] font-mono font-black text-cyan-300 tracking-wider bg-black/80 px-2 py-0.5 rounded border border-cyan-400/40">
                    SUNG JIN-WOO // MONARCH
                  </span>
                </div>
              </div>

              {/* Runic Corner Indicators */}
              <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-purple-400" />
              <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-purple-400" />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-purple-400" />
              <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-purple-400" />
            </div>

            {/* Inscription Quote at Bottom */}
            <div className="relative z-10 w-full space-y-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span className="text-[9px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  SOVEREIGN ASCENSION
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed italic border-l-2 border-cyan-400/80 pl-3 drop-shadow">
                &ldquo;I am the only one who can level up in this world. Sweat in training, reign in battle.&rdquo;
              </p>
              <p className="text-[10px] font-mono text-cyan-400/90 font-bold uppercase tracking-widest pl-3">
                — PLAYER: CHANDRA SEKHAR
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
