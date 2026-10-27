"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail, ShieldCheck, Zap, Sparkles, ChevronRight } from "lucide-react"
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

  const supabase = createClient()

  // Periodic subtle lightning flash simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setThunderFlash(true)
      setTimeout(() => setThunderFlash(false), 220)
    }, 6500)
    return () => clearInterval(interval)
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-hidden select-none">
      {/* ── Ambient Thunder Sky & Lightning FX ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Thunder Flash Light Pulse */}
        <AnimatePresence>
          {thunderFlash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.18 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-cyan-400 z-0 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Deep Plasma Atmospheric Glows */}
        <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[140px]" />
        <div className="absolute top-1/2 right-10 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[130px]" />

        {/* Animated Lightning Bolt Arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M 120 0 L 150 180 L 130 220 L 170 380 L 140 440 L 190 600"
            stroke="url(#lightningGrad1)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 900 0 L 860 140 L 880 200 L 840 340 L 870 420 L 830 700"
            stroke="url(#lightningGrad2)"
            strokeWidth="1.5"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 0.9, 0] }}
            transition={{ duration: 5.5, delay: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="lightningGrad1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lightningGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Electric Sparks / Embers */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_8px_#00f0ff]"
            style={{
              top: `${10 + (i * 7.5)}%`,
              left: `${5 + (i * 8)}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              x: [-10, 10, -10],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.4, 0.8],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* ── Main High-End Portal Container ── */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl relative z-10 rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-slate-900/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/20"
      >
        {/* Cybernetic Corner Brackets */}
        <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20" />

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-20" />

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* ── LEFT: Login Access Form (7 cols) ── */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between relative z-10">
            <div>
              {/* Top System Tag */}
              <div className="flex items-center gap-2 mb-6">
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

          {/* ── RIGHT: Sung Jin-Woo Night Thunder Artwork (5 cols) ── */}
          <div className="md:col-span-5 relative bg-slate-950 min-h-[260px] md:min-h-full overflow-hidden border-t md:border-t-0 md:border-l border-cyan-500/30 flex flex-col justify-end p-6">
            {/* Background Night Thunder Image */}
            <img
              src="/images/solo-leveling/jinwoo-night-thunder.jpg"
              alt="Sung Jin-Woo Night Thunder Awakening"
              className="absolute inset-0 w-full h-full object-cover object-right md:object-center filter brightness-[0.95] contrast-[1.05]"
            />

            {/* Gradient Overlays for Readability and Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Electric Plasma Aura Ring */}
            <div className="absolute top-1/4 right-1/4 w-36 h-36 rounded-full bg-cyan-400/20 filter blur-[40px] pointer-events-none animate-pulse" />

            {/* Inscription Overlay at bottom */}
            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span className="text-[9px] font-mono font-bold text-cyan-300 tracking-wider uppercase">
                  MONARCH RECOGNITION
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono leading-relaxed italic border-l-2 border-cyan-400/80 pl-3 drop-shadow">
                "I am the only one who can level up in this world. Sweat in training, reign in battle."
              </p>
              <p className="text-[10px] font-mono text-cyan-400/90 font-bold uppercase tracking-widest">
                — PLAYER: CHANDRASEKHAR
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
