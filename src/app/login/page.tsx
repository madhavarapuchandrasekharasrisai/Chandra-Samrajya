"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

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
        toast.success("System access granted. Initializing workspace...")
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden select-none">
      {/* System ambient background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Login Panel — System Access Window */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md system-panel p-8 sm:p-10 relative z-10 overflow-hidden"
      >
        {/* System scanline effect */}
        <div className="system-scanline" />
        
        {/* Top edge glow */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        {/* Brand Identity */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-5 border border-primary/20 relative">
            <ShieldCheck className="w-8 h-8 text-primary stroke-[1.5]" />
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40 rounded-tl" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40 rounded-br" />
          </div>
          <h1 className="gold-text text-2xl sm:text-3xl font-display font-bold tracking-[0.2em] uppercase mb-2">
            GOD SYSTEM
          </h1>
          <p className="text-muted-foreground text-[10px] sm:text-xs font-mono tracking-[0.15em] uppercase">
            Sovereign OS — Access Terminal
          </p>
        </motion.div>

        {/* Credentials Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.2em] block pl-1 font-mono">
              System ID
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@godsystem.co"
                className="w-full pl-11 pr-5 py-3.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all duration-300 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-primary/80 uppercase tracking-[0.2em] block pl-1 font-mono">
              Access Key
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-5 py-3.5 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-all duration-300 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground font-display font-bold text-xs uppercase tracking-[0.2em] rounded-lg transition-all duration-300 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:pointer-events-none mt-2 relative overflow-hidden"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Establishing Session...
              </span>
            ) : (
              "Initialize System"
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <div className="mt-10 pt-5 border-t border-border text-center">
          <p className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-[0.12em] leading-relaxed">
            Encrypted Protocol • System Active<br />
            God System v0.2.0
          </p>
        </div>
      </motion.div>
    </div>
  )
}
