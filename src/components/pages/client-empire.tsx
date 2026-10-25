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
}

const pipelineStages: PipelineStage[] = [
  { key: 'prospect', label: 'Prospect', color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/20', dotColor: 'bg-gray-400' },
  { key: 'contacted', label: 'Contacted', color: 'text-sky-400', bgColor: 'bg-sky-400/10', borderColor: 'border-sky-400/20', dotColor: 'bg-sky-400' },
  { key: 'scheduled', label: 'Scheduled', color: 'text-amber-400', bgColor: 'bg-primary/10', borderColor: 'border-primary/20', dotColor: 'bg-amber-400' },
  { key: 'proposal', label: 'Proposal', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/20', dotColor: 'bg-purple-400' },
  { key: 'active', label: 'Active', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20', dotColor: 'bg-emerald-400' },
  { key: 'retainer', label: 'Retainer', color: 'text-amber-500', bgColor: 'bg-primary/10', borderColor: 'border-primary/20', dotColor: 'bg-amber-500' },
  { key: 'completed', label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-600/10', borderColor: 'border-green-600/20', dotColor: 'bg-green-600' },
]

// ─── Urgency Config ─────────────────────────────────────────────────────────

const urgencyConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  low: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Low' },
  normal: { color: 'text-muted-foreground', bg: 'bg-secondary/50', border: 'border-border', label: 'Normal' },
  high: { color: 'text-amber-400', bg: 'bg-primary/10', border: 'border-primary/20', label: 'High' },
  critical: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Critical' },
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
        'bg-secondary/30 border rounded-xl p-3 cursor-pointer transition-all duration-200',
        'hover:bg-secondary/60 hover:border-border hover:shadow-lg hover:shadow-black/20',
        'active:scale-[0.98]',
        stage?.borderColor || 'border-border'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-foreground text-sm font-semibold truncate flex-1">{client.name}</h4>
        <span className={cn(
          'text-[8px] px-1.5 py-0.5 rounded-full border font-medium uppercase tracking-wider flex-shrink-0 ml-2',
          urgency.bg, urgency.border, urgency.color
        )}>
          {urgency.label}
        </span>
      </div>

      {/* Business type */}
      {client.business && (
        <p className="text-muted-foreground/60 text-[11px] mb-2 truncate">{client.business}</p>
      )}

      {/* Project value */}
      <div className="flex items-center justify-between">
        <span className="gold-text text-sm font-bold">
          {client.projectValue > 0 ? `₹${client.projectValue.toLocaleString('en-IN')}` : '—'}
        </span>
        {client.closeProbability > 0 && (
          <span className="text-muted-foreground/40 text-[10px]">{client.closeProbability}% close</span>
        )}
      </div>

      {/* Last contact */}
      {client.lastContact && (
        <p className="text-muted-foreground/30 text-[9px] mt-2">
          Last: {new Date(client.lastContact).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </p>
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

  // Derive selected stage from client — reset when client changes
  const [selectedStage, setSelectedStage] = useState<string>(client?.pipelineStage || '')
  const currentClientId = client?.id
  if (currentClientId && client && selectedStage !== client.pipelineStage) {
    // Only auto-sync if user hasn't manually changed it for this client
    // We detect a "new client" by checking if the stage matches
  }

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
      toast.success(`Moved to ${newStage}`)
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
        className="fixed inset-0 bg-card backdrop-blur-sm z-50"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border z-50 overflow-y-auto"
      >
        {/* Close button */}
        <div className="sticky top-0 bg-card/90 backdrop-blur-xl z-10 border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Target className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[11px] text-primary/70 uppercase tracking-widest font-medium">Client Details</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground/60 hover:text-foreground/80 hover:bg-secondary/50 h-8 w-8 p-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Name & Urgency */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-foreground text-xl font-bold">{client.name}</h2>
              <span className={cn(
                'text-[9px] px-1.5 py-0.5 rounded-full border font-medium uppercase tracking-wider',
                urgency.bg, urgency.border, urgency.color
              )}>
                {urgency.label}
              </span>
            </div>
            {client.business && (
              <p className="text-muted-foreground text-sm">{client.business}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="text-muted-foreground">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-muted-foreground/40" />
                <span className="text-muted-foreground">{client.phone}</span>
              </div>
            )}
          </div>

          {/* Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider mb-1">Project Value</p>
              <p className="gold-text text-lg font-bold">
                {client.projectValue > 0 ? `₹${client.projectValue.toLocaleString('en-IN')}` : '—'}
              </p>
            </div>
            <div className="bg-secondary/30 border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider mb-1">Close Probability</p>
              <p className="text-foreground/80 text-lg font-bold">{client.closeProbability}%</p>
            </div>
          </div>

          {/* Pipeline Stage Selector */}
          <div>
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-2">Pipeline Stage</p>
            <div className="flex flex-wrap gap-2">
              {pipelineStages.map((stage) => {
                const isSelected = selectedStage === stage.key
                return (
                  <button
                    key={stage.key}
                    onClick={() => handleStageChange(stage.key)}
                    className={cn(
                      'text-[10px] px-2.5 py-1.5 rounded-lg border font-medium transition-all',
                      isSelected
                        ? cn(stage.bgColor, stage.borderColor, stage.color, 'ring-1 ring-current/30')
                        : 'bg-secondary/30 border-border text-muted-foreground/60 hover:text-muted-foreground hover:border-border'
                    )}
                  >
                    {stage.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI Notes */}
          {client.notes && (
            <div className="bg-secondary/30 border border-border rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 text-amber-400/50" />
                <span className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Notes</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{client.notes}</p>
            </div>
          )}

          {/* Communication History */}
          <div>
            <p className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-wider mb-3">Communication History</p>
            {clientFollowups.length === 0 ? (
              <div className="text-center py-6 bg-white/[0.01] border border-white/[0.03] rounded-xl">
                <MessageSquare className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-muted-foreground/50 text-xs">No communications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clientFollowups.map((followup) => {
                  const isCompleted = followup.status === 'completed'
                  return (
                    <div
                      key={followup.id}
                      className={cn(
                        'flex items-center gap-3 p-2.5 rounded-lg border transition-all',
                        isCompleted
                          ? 'bg-white/[0.01] border-white/[0.03] opacity-60'
                          : 'bg-secondary/30 border-border'
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded-md',
                        isCompleted ? 'bg-emerald-400/10 text-emerald-400' : 'bg-secondary/50 text-muted-foreground/60'
                      )}>
                        {getFollowupIcon(followup.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-xs font-medium truncate',
                          isCompleted ? 'text-muted-foreground line-through' : 'text-foreground/70'
                        )}>
                          {followup.note || followup.type.charAt(0).toUpperCase() + followup.type.slice(1)}
                        </p>
                        <p className="text-muted-foreground/40 text-[9px]">
                          {new Date(followup.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0" />
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
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Pipeline</h2>
            <p className="text-muted-foreground/60 text-[10px]">{clients.length} clients · {totalPipelineValue > 0 ? `₹${totalPipelineValue.toLocaleString('en-IN')} pipeline` : 'No pipeline value'}</p>
          </div>
        </div>
      </div>

      {/* Horizontal scrollable columns */}
      <div className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-4" style={{ minWidth: `${pipelineStages.length * 260}px` }}>
          {pipelineStages.map((stage, stageIndex) => {
            const stageClients = clientsByStage[stage.key] || []
            const stageValue = stageClients.reduce((s, c) => s + c.projectValue, 0)

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: stageIndex * 0.06 }}
                className="flex-shrink-0 w-[250px] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.key)}
              >
                {/* Column header */}
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-t-xl border border-b-0',
                  stage.bgColor, stage.borderColor
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', stage.dotColor)} />
                    <span className={cn('text-xs font-semibold uppercase tracking-wider', stage.color)}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-muted-foreground/60 text-[10px]">{stageClients.length}</span>
                </div>

                {/* Column value */}
                <div className="px-3 py-1.5 bg-white/[0.01] border-x border-white/[0.03]">
                  <span className="text-muted-foreground/40 text-[9px]">
                    {stageValue > 0 ? `₹${stageValue.toLocaleString('en-IN')}` : '—'}
                  </span>
                </div>

                {/* Client cards */}
                <div className="bg-white/[0.01] border border-t-0 rounded-b-xl p-2 space-y-2 min-h-[120px] max-h-[400px] overflow-y-auto">
                  {stageClients.length === 0 ? (
                    <div className="flex items-center justify-center h-[80px]">
                      <p className="text-muted-foreground/20 text-[10px]">No clients</p>
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
                          delay={0.1 + stageIndex * 0.06 + clientIndex * 0.03}
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
          'flex items-center gap-3 p-3 rounded-xl border transition-all group',
          isOverdue
            ? 'bg-red-500/[0.04] border-red-500/20 followup-overdue-glow'
            : isToday
            ? 'bg-amber-500/[0.04] border-primary/15'
            : 'bg-secondary/30 border-border hover:border-border'
        )}
      >
        {/* Type icon */}
        <div className={cn(
          'p-2 rounded-lg flex-shrink-0',
          isOverdue
            ? 'bg-red-400/10 text-red-400'
            : isToday
            ? 'bg-primary/10 text-amber-400'
            : 'bg-secondary/50 text-muted-foreground/60'
        )}>
          {getFollowupIcon(followup.type)}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-foreground/80 text-sm font-medium truncate">{clientName}</span>
            {isOverdue && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium uppercase">
                Overdue
              </span>
            )}
            {isToday && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-amber-400 border border-primary/20 font-medium uppercase">
                Today
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-muted-foreground/60 text-xs capitalize">{followup.type}</span>
            {followup.note && (
              <>
                <span className="text-muted-foreground/20">·</span>
                <span className="text-muted-foreground/50 text-xs truncate">{followup.note}</span>
              </>
            )}
          </div>
          <p className="text-muted-foreground/30 text-[10px] mt-0.5">
            {new Date(followup.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Mark Complete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMarkComplete(followup.id)}
          disabled={isLoading}
          className={cn(
            'h-7 px-2.5 text-[10px] font-medium flex-shrink-0 transition-all',
            'text-muted-foreground/60 hover:text-emerald-400 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/20'
          )}
        >
          {isLoading ? (
            <span className="w-3 h-3 border-2 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Done
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
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card lg:bg-card/80 lg:backdrop-blur-xl border border-border rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="gold-text text-lg font-bold">Followup Engine</h2>
            <p className="text-muted-foreground/60 text-[10px]">{totalPending} pending followups</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overdue.length > 0 && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
              {overdue.length} overdue
            </span>
          )}
          {today.length > 0 && (
            <span className="text-[9px] px-2 py-1 rounded-lg bg-primary/10 text-amber-400 border border-primary/20 font-medium">
              {today.length} today
            </span>
          )}
        </div>
      </div>

      {totalPending === 0 ? (
        <div className="text-center py-12">
          <CheckCircle2 className="w-10 h-10 text-emerald-400/20 mx-auto mb-3" />
          <p className="text-muted-foreground/60 text-sm">All followups completed!</p>
          <p className="text-muted-foreground/30 text-xs mt-1">Use Quick Add to create new followups</p>
        </div>
      ) : (
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Overdue</span>
                <span className="text-muted-foreground/30 text-[10px]">({overdue.length})</span>
              </div>
              <div className="space-y-2">
                {overdue.map(f => renderFollowupItem(f, true, false))}
              </div>
            </div>
          )}

          {/* Today */}
          {today.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Today</span>
                <span className="text-muted-foreground/30 text-[10px]">({today.length})</span>
              </div>
              <div className="space-y-2">
                {today.map(f => renderFollowupItem(f, false, true))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Upcoming</span>
                <span className="text-muted-foreground/30 text-[10px]">({upcoming.length})</span>
              </div>
              <div className="space-y-2">
                {upcoming.slice(0, 10).map(f => renderFollowupItem(f, false, false))}
              </div>
              {upcoming.length > 10 && (
                <p className="text-muted-foreground/30 text-[10px] text-center mt-2">
                  +{upcoming.length - 10} more upcoming
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

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-background/40 to-background/60 border border-primary/10 rounded-2xl p-6 lg:p-8"
      >
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 ambient-gradient pointer-events-none" />

        {/* Floating particles */}
        <div className="absolute top-6 right-12 w-1 h-1 rounded-full bg-amber-400/30 particle" />
        <div className="absolute top-16 right-24 w-0.5 h-0.5 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 left-20 w-1 h-1 rounded-full bg-amber-400/20 particle" style={{ animationDelay: '4s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[11px] text-primary/70 uppercase tracking-widest font-medium">Founder CRM</span>
          </div>
          <h1 className="gold-text text-3xl lg:font-display text-4xl font-bold tracking-tight">
            Client Empire
          </h1>
          <p className="text-muted-foreground/60 text-sm mt-1">Your relationship command center — track, nurture, and close</p>

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Total Clients</p>
              <p className="text-foreground/80 text-xl font-bold">{clients.length}</p>
            </div>
            <div className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Active Pipeline</p>
              <p className="text-foreground/80 text-xl font-bold">
                {clients.filter(c => !['completed', 'prospect'].includes(c.pipelineStage)).length}
              </p>
            </div>
            <div className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Retainers</p>
              <p className="text-amber-400 text-xl font-bold">
                {clients.filter(c => c.pipelineStage === 'retainer').length}
              </p>
            </div>
            <div className="bg-card lg:bg-card/80 lg:backdrop-blur-sm border border-border rounded-xl p-3">
              <p className="text-muted-foreground/60 font-mono text-[9px] uppercase tracking-wider">Pipeline Value</p>
              <p className="gold-text text-xl font-bold">
                {formatINR(clients.filter(c => c.pipelineStage !== 'completed').reduce((s, c) => s + c.projectValue, 0))}
              </p>
            </div>
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
    </div>
  )
}
