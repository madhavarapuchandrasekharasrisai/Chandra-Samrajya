'use client'

import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react'
import { useAppStore, type ClientEntry, type FollowupEntry } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Phone,
  MessageSquare,
  Mail,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Crown,
  CircleDot,
  Plus,
  TrendingUp,
  Briefcase,
  DollarSign,
  X,
  Building2,
  ArrowUpRight,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN')
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ─── Pipeline Config ────────────────────────────────────────────────────────

interface PipelineStage {
  key: string
  label: string
  color: string
  bgColor: string
  borderColor: string
  dotColor: string
  barColor: string
}

const pipelineStages: PipelineStage[] = [
  { key: 'prospect', label: 'Prospect', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-100/90 dark:bg-slate-800/60', borderColor: 'border-slate-300 dark:border-slate-700', dotColor: 'bg-slate-500', barColor: 'border-l-slate-400 dark:border-l-slate-500' },
  { key: 'contacted', label: 'Contacted', color: 'text-sky-700 dark:text-sky-300', bgColor: 'bg-sky-50 dark:bg-sky-950/40', borderColor: 'border-sky-300 dark:border-sky-800', dotColor: 'bg-sky-500', barColor: 'border-l-sky-500' },
  { key: 'scheduled', label: 'Scheduled', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950/40', borderColor: 'border-amber-300 dark:border-amber-800', dotColor: 'bg-amber-500', barColor: 'border-l-amber-500' },
  { key: 'proposal', label: 'Proposal', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950/40', borderColor: 'border-purple-300 dark:border-purple-800', dotColor: 'bg-purple-500', barColor: 'border-l-purple-500' },
  { key: 'active', label: 'Active', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', borderColor: 'border-emerald-300 dark:border-emerald-800', dotColor: 'bg-emerald-500', barColor: 'border-l-emerald-500' },
  { key: 'retainer', label: 'Retainer', color: 'text-amber-800 dark:text-amber-200', bgColor: 'bg-amber-100/80 dark:bg-amber-900/40', borderColor: 'border-amber-400 dark:border-amber-700', dotColor: 'bg-amber-500', barColor: 'border-l-amber-500' },
  { key: 'completed', label: 'Completed', color: 'text-teal-700 dark:text-teal-300', bgColor: 'bg-teal-50 dark:bg-teal-950/40', borderColor: 'border-teal-300 dark:border-teal-800', dotColor: 'bg-teal-500', barColor: 'border-l-teal-500' },
]

// ─── Urgency Config ─────────────────────────────────────────────────────────

const urgencyConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  low: { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-300 dark:border-blue-800', label: 'Low' },
  normal: { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800/60', border: 'border-slate-300 dark:border-slate-700', label: 'Normal' },
  high: { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800', label: 'High' },
  critical: { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/60', border: 'border-red-300 dark:border-red-800', label: 'Critical' },
}

// ─── Followup Type Icons ────────────────────────────────────────────────────

function getFollowupIcon(type: string) {
  switch (type) {
    case 'call': return <Phone className="w-3.5 h-3.5" />
    case 'email': return <Mail className="w-3.5 h-3.5" />
    case 'dm': return <MessageSquare className="w-3.5 h-3.5" />
    case 'meeting': return <Users className="w-3.5 h-3.5" />
    default: return <CircleDot className="w-3.5 h-3.5" />
  }
}

// ─── Client Card ────────────────────────────────────────────────────────────

function ClientCard({
  client,
  onClick,
  delay = 0,
}: {
  client: ClientEntry
  onClick: () => void
  delay?: number
}) {
  const urgency = urgencyConfig[client.urgencyLevel] || urgencyConfig.normal
  const stage = pipelineStages.find(s => s.key === client.pipelineStage)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onClick={onClick}
      className={cn(
        'bg-white dark:bg-card border rounded-xl p-3.5 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5',
        'active:scale-[0.98]',
        'border-l-[3.5px]',
        stage?.barColor || 'border-l-primary',
        'border-slate-200/90 dark:border-border/80 hover:border-primary/50'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-foreground text-sm font-bold truncate flex-1 leading-snug">{client.name}</h4>
        <span className={cn(
          'text-[8px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider flex-shrink-0',
          urgency.bg, urgency.border, urgency.color
        )}>
          {urgency.label}
        </span>
      </div>

      {/* Business type */}
      {client.business && (
        <p className="text-muted-foreground text-[11px] mb-2 truncate font-medium">{client.business}</p>
      )}

      {/* Project value & Close Probability */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-emerald-700 dark:text-emerald-400 font-mono text-sm font-extrabold">
          {client.projectValue > 0 ? formatINR(client.projectValue) : '—'}
        </span>
        {client.closeProbability > 0 && (
          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
            {client.closeProbability}% close
          </span>
        )}
      </div>

      {/* Probability Progress Bar */}
      {client.closeProbability > 0 && (
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
            style={{ width: `${client.closeProbability}%` }}
          />
        </div>
      )}

      {/* Last contact */}
      {client.lastContact && (
        <div className="flex items-center justify-between text-muted-foreground/80 text-[9px] font-mono pt-1.5 border-t border-border/40">
          <span>Last contact:</span>
          <span className="text-foreground font-semibold">
            {new Date(client.lastContact).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ─── Client Detail Drawer ───────────────────────────────────────────────────

function ClientDetailDrawer({
  client,
  onClose,
}: {
  client: ClientEntry | null
  onClose: () => void
}) {
  const { updateClient, followups } = useAppStore()

  // Derive selected stage from client
  const [selectedStage, setSelectedStage] = useState<string>(client?.pipelineStage || '')

  useEffect(() => {
    if (client) {
      setSelectedStage(client.pipelineStage)
    }
  }, [client])

  const clientFollowups = useMemo(() => {
    if (!client) return []
    return followups
      .filter(f => f.clientId === client.id)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  }, [client, followups])

  const handleStageChange = useCallback(async (newStage: string) => {
    if (!client) return
    setSelectedStage(newStage)
    updateClient(client.id, { pipelineStage: newStage })
    try {
      await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, pipelineStage: newStage }),
      })
      toast.success(`Moved to ${pipelineStages.find(s => s.key === newStage)?.label}`)
    } catch {
      toast.error('Failed to update pipeline stage')
    }
  }, [client, updateClient])

  if (!client) return null

  const urgency = urgencyConfig[client.urgencyLevel] || urgencyConfig.normal

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        {/* Close button */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl z-10 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[11px] text-primary uppercase tracking-widest font-bold">Client Intelligence</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-8 w-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Name & Urgency */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-foreground text-xl font-extrabold">{client.name}</h2>
              <span className={cn(
                'text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider',
                urgency.bg, urgency.border, urgency.color
              )}>
                {urgency.label} Priority
              </span>
            </div>
            {client.business && (
              <p className="text-muted-foreground text-sm font-medium">{client.business}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 space-y-2.5">
            {client.email && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{client.phone}</span>
              </div>
            )}
            {!client.email && !client.phone && (
              <p className="text-muted-foreground text-xs italic">No direct contact details provided</p>
            )}
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-card border border-border rounded-xl p-3.5 shadow-2xs">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold mb-1">Project Value</p>
              <p className="text-emerald-700 dark:text-emerald-400 font-mono text-xl font-extrabold">
                {client.projectValue > 0 ? formatINR(client.projectValue) : '—'}
              </p>
            </div>
            <div className="bg-white dark:bg-card border border-border rounded-xl p-3.5 shadow-2xs">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold mb-1">Close Probability</p>
              <p className="text-foreground text-xl font-extrabold font-mono">{client.closeProbability}%</p>
            </div>
          </div>

          {/* Pipeline Stage Selector */}
          <div>
            <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-bold mb-2.5">Pipeline Stage</p>
            <div className="flex flex-wrap gap-2">
              {pipelineStages.map((stage) => {
                const isSelected = selectedStage === stage.key
                return (
                  <button
                    key={stage.key}
                    onClick={() => handleStageChange(stage.key)}
                    className={cn(
                      'text-[10px] px-3 py-1.5 rounded-lg border font-bold transition-all',
                      isSelected
                        ? cn(stage.bgColor, stage.borderColor, stage.color, 'ring-2 ring-primary/40 shadow-xs')
                        : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-slate-300 dark:hover:border-slate-700'
                    )}
                  >
                    {stage.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="bg-white dark:bg-card border border-border rounded-xl p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground font-mono text-[10px] uppercase tracking-wider font-bold">Deal Notes</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{client.notes}</p>
            </div>
          )}

          {/* Communication History */}
          <div>
            <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider font-bold mb-3">Communication History</p>
            {clientFollowups.length === 0 ? (
              <div className="text-center py-6 bg-secondary/20 border border-border/40 rounded-xl">
                <MessageSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-xs font-medium">No communications recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientFollowups.map((followup) => {
                  const isCompleted = followup.status === 'completed'
                  return (
                    <div
                      key={followup.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border transition-all',
                        isCompleted
                          ? 'bg-secondary/30 border-border/50 opacity-70'
                          : 'bg-white dark:bg-card border-border shadow-2xs'
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded-md',
                        isCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary'
                      )}>
                        {getFollowupIcon(followup.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-bold truncate',
                          isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                        )}>
                          {followup.note || followup.type.charAt(0).toUpperCase() + followup.type.slice(1)}
                        </p>
                        <p className="text-muted-foreground text-[9px] font-mono">
                          {new Date(followup.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ─── Add Client Modal ───────────────────────────────────────────────────────

function AddClientModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { addClient } = useAppStore()
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [projectValue, setProjectValue] = useState('')
  const [pipelineStage, setPipelineStage] = useState('prospect')
  const [urgencyLevel, setUrgencyLevel] = useState('normal')
  const [closeProbability, setCloseProbability] = useState('50')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Client name is required')
      return
    }

    setIsSubmitting(true)
    const newClient: ClientEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      business: business.trim() || undefined,
      projectValue: projectValue ? parseFloat(projectValue) || 0 : 0,
      pipelineStage,
      urgencyLevel,
      closeProbability: parseInt(closeProbability) || 50,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      lastContact: getTodayStr(),
    }

    addClient(newClient)

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      })
      toast.success(`Client "${newClient.name}" added to pipeline!`)
      onClose()
      // Reset form
      setName('')
      setBusiness('')
      setProjectValue('')
      setNotes('')
      setEmail('')
      setPhone('')
    } catch {
      toast.error('Created locally; network sync failed')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Add New Client Deal</h3>
                <p className="text-xs text-muted-foreground">Log a high-value prospect into your Sovereign Pipeline</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Client / Company Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Global Corp"
                className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Business / Industry</label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="e.g. AI SaaS, FinTech"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Deal Value (₹ INR)</label>
                <input
                  type="number"
                  value={projectValue}
                  onChange={(e) => setProjectValue(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Pipeline Stage</label>
                <select
                  value={pipelineStage}
                  onChange={(e) => setPipelineStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {pipelineStages.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Urgency</label>
                <select
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@apex.com"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-foreground">Close Probability</label>
                <span className="text-xs font-mono font-bold text-primary">{closeProbability}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={closeProbability}
                onChange={(e) => setCloseProbability(e.target.value)}
                className="w-full accent-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Deal Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key requirements, client expectations, timeline..."
                className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110">
                {isSubmitting ? 'Adding...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}

// ─── Section 1: Kanban Pipeline ─────────────────────────────────────────────

function KanbanPipeline({
  onSelectClient,
}: {
  onSelectClient: (client: ClientEntry) => void
}) {
  const { clients, updateClient } = useAppStore()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    const clientId = e.dataTransfer.getData('clientId')
    if (!clientId) return
    
    const client = clients.find(c => c.id === clientId)
    if (client && client.pipelineStage !== targetStage) {
      updateClient(clientId, { pipelineStage: targetStage })
      try {
        await fetch('/api/clients', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: clientId, pipelineStage: targetStage }),
        })
        toast.success(`Moved to ${pipelineStages.find(s => s.key === targetStage)?.label}`)
      } catch {
        toast.error('Failed to move client')
      }
    }
  }

  // Group clients by pipeline stage
  const clientsByStage = useMemo(() => {
    const grouped: Record<string, ClientEntry[]> = {}
    pipelineStages.forEach(stage => {
      grouped[stage.key] = clients.filter(c => c.pipelineStage === stage.key)
    })
    // Also handle clients with unknown stages
    const knownStages = new Set(pipelineStages.map(s => s.key))
    const ungrouped = clients.filter(c => !knownStages.has(c.pipelineStage))
    if (ungrouped.length > 0) {
      grouped['prospect'] = [...(grouped['prospect'] || []), ...ungrouped]
    }
    return grouped
  }, [clients])

  const totalPipelineValue = useMemo(() => {
    return clients
      .filter(c => c.pipelineStage !== 'completed')
      .reduce((s, c) => s + c.projectValue, 0)
  }, [clients])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-extrabold tracking-tight">Active Pipeline Velocity</h2>
            <p className="text-muted-foreground text-xs font-medium">
              {clients.length} active relationships · <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{totalPipelineValue > 0 ? formatINR(totalPipelineValue) : 'No pipeline value'}</span> in movement
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable columns */}
      <div className="overflow-x-auto pb-3 no-scrollbar">
        <div className="flex gap-4" style={{ minWidth: `${pipelineStages.length * 270}px` }}>
          {pipelineStages.map((stage, stageIndex) => {
            const stageClients = clientsByStage[stage.key] || []
            const stageValue = stageClients.reduce((s, c) => s + c.projectValue, 0)

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: stageIndex * 0.05 }}
                className="flex-shrink-0 w-[260px] flex flex-col rounded-xl overflow-hidden border border-slate-200/90 dark:border-border shadow-2xs"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className={cn(
                  'flex items-center justify-between p-3 border-b',
                  stage.bgColor, stage.borderColor
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2.5 h-2.5 rounded-full ring-2 ring-white/40', stage.dotColor)} />
                    <span className={cn('text-xs font-extrabold uppercase tracking-wider', stage.color)}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-white/70 dark:bg-black/30 border border-black/5 px-2 py-0.5 rounded-full text-foreground">
                    {stageClients.length}
                  </span>
                </div>

                {/* Column value */}
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-card/90 border-b border-border/60 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">Total Stage Value</span>
                  <span className="text-[11px] font-mono font-bold text-foreground">
                    {stageValue > 0 ? formatINR(stageValue) : '₹0'}
                  </span>
                </div>

                {/* Client cards */}
                <div className="bg-slate-100/60 dark:bg-card/40 p-2.5 space-y-2.5 min-h-[160px] max-h-[460px] overflow-y-auto">
                  {stageClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[130px] border border-dashed border-slate-300 dark:border-border/60 rounded-xl text-center p-3">
                      <p className="text-muted-foreground text-xs font-semibold">No clients in stage</p>
                      <p className="text-muted-foreground/60 text-[10px] mt-0.5">Drag cards here</p>
                    </div>
                  ) : (
                    stageClients.map((client, clientIndex) => (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('clientId', client.id)
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <ClientCard
                          client={client}
                          onClick={() => onSelectClient(client)}
                          delay={0.05 + clientIndex * 0.02}
                        />
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Section 3: Followup Engine ─────────────────────────────────────────────

function FollowupEngine() {
  const { followups, setFollowups, clients } = useAppStore()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const todayStr = useMemo(() => getTodayStr(), [])

  // Categorize followups
  const { overdue, today, upcoming } = useMemo(() => {
    const pending = followups
      .filter(f => f.status !== 'completed')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

    const overdueArr: FollowupEntry[] = []
    const todayArr: FollowupEntry[] = []
    const upcomingArr: FollowupEntry[] = []

    pending.forEach(f => {
      if (f.dueDate < todayStr) {
        overdueArr.push(f)
      } else if (f.dueDate === todayStr) {
        todayArr.push(f)
      } else {
        upcomingArr.push(f)
      }
    })

    return { overdue: overdueArr, today: todayArr, upcoming: upcomingArr }
  }, [followups, todayStr])

  const handleMarkComplete = useCallback(async (followupId: string) => {
    setLoadingId(followupId)
    try {
      await fetch('/api/followups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: followupId, status: 'completed' }),
      })

      setFollowups(
        followups.map(f => f.id === followupId ? { ...f, status: 'completed' } : f)
      )
      toast.success('Followup completed!')
    } catch {
      toast.error('Failed to mark as complete')
    } finally {
      setLoadingId(null)
    }
  }, [followups, setFollowups])

  const renderFollowupItem = (followup: FollowupEntry, isOverdue: boolean, isToday: boolean) => {
    const isLoading = loadingId === followup.id
    const clientName = followup.clientName || clients.find(c => c.id === followup.clientId)?.name || 'Unknown'

    return (
      <motion.div
        key={followup.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center gap-3 p-3.5 rounded-xl border transition-all shadow-2xs',
          isOverdue
            ? 'bg-red-500/[0.04] dark:bg-red-500/[0.08] border-red-300 dark:border-red-900/50'
            : isToday
            ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.08] border-amber-300 dark:border-amber-900/50'
            : 'bg-white dark:bg-card border-slate-200/90 dark:border-border hover:border-primary/40'
        )}
      >
        {/* Type icon */}
        <div className={cn(
          'p-2.5 rounded-xl flex-shrink-0',
          isOverdue
            ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
            : isToday
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            : 'bg-primary/10 text-primary border border-primary/20'
        )}>
          {getFollowupIcon(followup.type)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-bold truncate">{clientName}</span>
            {isOverdue && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-extrabold uppercase">
                Overdue
              </span>
            )}
            {isToday && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-extrabold uppercase">
                Due Today
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-foreground/80 text-xs font-semibold capitalize">{followup.type}</span>
            {followup.note && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground text-xs truncate font-medium">{followup.note}</span>
              </>
            )}
          </div>
          <p className="text-muted-foreground text-[10px] font-mono mt-0.5 font-medium">
            Due: {new Date(followup.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Mark Complete Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleMarkComplete(followup.id)}
          disabled={isLoading}
          className={cn(
            'h-8 px-3 text-xs font-bold flex-shrink-0 transition-all rounded-xl',
            'border-slate-300 dark:border-border hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
          )}
        >
          {isLoading ? (
            <span className="w-3.5 h-3.5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
              Complete
            </>
          )}
        </Button>
      </motion.div>
    )
  }

  const totalPending = overdue.length + today.length + upcoming.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-card border border-border rounded-2xl p-5 shadow-xs"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-extrabold tracking-tight">Followup Execution Engine</h2>
            <p className="text-muted-foreground text-xs font-medium">{totalPending} pending communication touchpoints</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overdue.length > 0 && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-bold font-mono">
              {overdue.length} Overdue
            </span>
          )}
          {today.length > 0 && (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold font-mono">
              {today.length} Today
            </span>
          )}
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="text-center py-12 bg-secondary/15 rounded-xl border border-dashed border-border">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
          <p className="text-foreground text-sm font-bold">All client touchpoints cleared!</p>
          <p className="text-muted-foreground text-xs mt-1 font-medium">Your relationships are currently at 100% sync</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-red-600 dark:text-red-400 text-xs font-extrabold uppercase tracking-wider">Overdue Actions</span>
                <span className="text-muted-foreground text-[10px] font-mono font-bold">({overdue.length})</span>
              </div>
              <div className="space-y-2.5">
                {overdue.map(f => renderFollowupItem(f, true, false))}
              </div>
            </div>
          )}

          {/* Today */}
          {today.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 text-xs font-extrabold uppercase tracking-wider">Scheduled Today</span>
                <span className="text-muted-foreground text-[10px] font-mono font-bold">({today.length})</span>
              </div>
              <div className="space-y-2.5">
                {today.map(f => renderFollowupItem(f, false, true))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="text-sky-600 dark:text-sky-400 text-xs font-extrabold uppercase tracking-wider">Upcoming Touchpoints</span>
                <span className="text-muted-foreground text-[10px] font-mono font-bold">({upcoming.length})</span>
              </div>
              <div className="space-y-2.5">
                {upcoming.slice(0, 10).map(f => renderFollowupItem(f, false, false))}
              </div>
              {upcoming.length > 10 && (
                <p className="text-muted-foreground text-xs text-center mt-3 font-medium">
                  +{upcoming.length - 10} more upcoming scheduled
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function ClientEmpire() {
  const { clients } = useAppStore()
  const [selectedClient, setSelectedClient] = useState<ClientEntry | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const totalPipelineVal = useMemo(() => {
    return clients.filter(c => c.pipelineStage !== 'completed').reduce((s, c) => s + c.projectValue, 0)
  }, [clients])

  const activePipelineCount = useMemo(() => {
    return clients.filter(c => !['completed', 'prospect'].includes(c.pipelineStage)).length
  }, [clients])

  const retainerCount = useMemo(() => {
    return clients.filter(c => c.pipelineStage === 'retainer').length
  }, [clients])

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/30 border border-border rounded-2xl p-6 lg:p-8 shadow-xs"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <Crown className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-primary uppercase tracking-widest font-extrabold">Executive Founder CRM</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Client Empire
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-medium">
              Your relationship command center — track pipelines, nurture leads, and scale enterprise retainers
            </p>
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:brightness-110 flex items-center gap-2 px-5 py-2.5 h-auto self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5 relative z-10">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">Total Clients</p>
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-foreground text-2xl font-black font-mono">{clients.length}</p>
            <p className="text-muted-foreground text-[10px] mt-1 font-medium">All recorded leads</p>
          </div>

          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">Active Pipeline</p>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-foreground text-2xl font-black font-mono">{activePipelineCount}</p>
            <p className="text-muted-foreground text-[10px] mt-1 font-medium">In proposal / active</p>
          </div>

          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">Retainers</p>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-amber-600 dark:text-amber-400 text-2xl font-black font-mono">{retainerCount}</p>
            <p className="text-muted-foreground text-[10px] mt-1 font-medium">Recurring revenue</p>
          </div>

          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground font-mono text-[9px] uppercase tracking-wider font-bold">Pipeline Value</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 text-2xl font-black font-mono">{formatINR(totalPipelineVal)}</p>
            <p className="text-muted-foreground text-[10px] mt-1 font-medium">Weighted potential</p>
          </div>
        </div>
      </motion.div>

      {/* Kanban Pipeline */}
      <KanbanPipeline onSelectClient={setSelectedClient} />

      {/* Followup Engine */}
      <FollowupEngine />

      {/* Client Detail Drawer */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailDrawer
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </AnimatePresence>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddClientModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
