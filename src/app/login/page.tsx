"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both credentials.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        toast.error(error.message || "Authentication failed. Please verify your credentials.")
      } else {
        toast.success("Sovereign session established successfully.")
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
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* Ambient glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#d4a849]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#b8860b]/5 blur-[120px] pointer-events-none" />

      {/* Glass card panel */}
      <div className="w-full max-w-md glass-card p-8 sm:p-10 relative z-10 overflow-hidden shadow-2xl border border-[rgba(212,168,73,0.1)]">
        
        {/* Visual Brand Identity */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#e8c97a] via-[#d4a849] to-[#b8860b] rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 shadow-xl shadow-[#d4a849]/10">
            <ShieldCheck className="w-9 h-9 text-[#08080a] stroke-[1.8]" />
          </div>
          <h1 className="gold-text text-2xl sm:text-3xl font-extrabold tracking-wider uppercase font-serif mb-2">
            SAMRAJYA
          </h1>
          <p className="text-white/40 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
            Sovereign OS Access Key
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#e8c97a] uppercase tracking-[0.2em] block pl-1">
              Command Email
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#d4a849] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chandra@samrajya.co"
                className="w-full pl-11 pr-5 py-3.5 bg-black/40 border border-[#d4a849]/20 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4a849]/50 focus:border-[#d4a849]/60 transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#e8c97a] uppercase tracking-[0.2em] block pl-1">
              Access Secret
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-[#d4a849] transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-5 py-3.5 bg-black/40 border border-[#d4a849]/20 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#d4a849]/50 focus:border-[#d4a849]/60 transition-all duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#e8c97a] via-[#d4a849] to-[#b8860b] hover:brightness-110 active:scale-[0.99] text-[#08080a] font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-lg shadow-[#d4a849]/10 disabled:opacity-50 disabled:pointer-events-none mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#08080a]" />
                Establishing Session...
              </span>
            ) : (
              "Decrypt Workspace"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/[0.03] text-center">
          <p className="text-[9px] text-[#d4a849]/60 font-semibold uppercase tracking-[0.15em] leading-relaxed">
            Secure Handshake Protocol • Active Guard<br />
            Dhanavi Samrajya v0.2.0
          </p>
        </div>
      </div>
    </div>
  )
}
