'use client'

import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  X,
  MessageSquare,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowLeftRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  { icon: <Target className="w-3.5 h-3.5" />, label: 'Can I hit ₹1L this month?', prompt: 'Based on my current income and expenses, can I hit ₹1,00,000 this month? What do I need to do?' },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Where am I wasting money?', prompt: 'Analyze my spending patterns and tell me where I am wasting money or overspending.' },
  { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Outreach template', prompt: 'Write me a highly effective outreach DM message for prospects needing AI automation.' },
]

export function KarnaFloatingWidget() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [position, setPosition] = useState<'right' | 'left'>('right')

  useEffect(() => {
    const saved = localStorage.getItem('karna-widget-position') as 'right' | 'left'
    if (saved === 'left' || saved === 'right') {
      setPosition(saved)
    }
  }, [])

  const togglePosition = () => {
    const next = position === 'right' ? 'left' : 'right'
    setPosition(next)
    localStorage.setItem('karna-widget-position', next)
  }
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const now = new Date()
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, e) => s + e.amount, 0)

  // Build financial context for API
  const buildContext = () => {
    const cat = budgetAllocation
    const clientDetails = clients.map(client => {
      const clientIncomes = incomes.filter(i => 
        (i.clientName && i.clientName.toLowerCase() === client.name.toLowerCase()) || 
        (i.source && i.source.toLowerCase() === client.name.toLowerCase())
      )
      const totalEarned = clientIncomes.reduce((sum, i) => sum + i.amount, 0)
      return `- Client: ${client.name} | Business: ${client.business || 'N/A'} | Stage: ${client.pipelineStage} | Project Value: ₹${client.projectValue.toLocaleString('en-IN')} | Total Revenue Received: ₹${totalEarned.toLocaleString('en-IN')} | Close Prob: ${client.closeProbability}%`
    }).join('\n')

    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const expenseDetails = currentMonthExpenses.map(e => 
      `- ₹${e.amount.toLocaleString('en-IN')} | Category: ${e.category} | Description: ${e.description || 'N/A'} | Date: ${e.date}`
    ).join('\n')

    return `
CURRENT FINANCIAL STATUS:
- Monthly Income: ₹${monthlyIncome.toLocaleString('en-IN')}
- Monthly Target: ₹${monthlyTarget.toLocaleString('en-IN')}
- Total Expenses This Month: ₹${monthExpenses.toLocaleString('en-IN')}
- Net Balance: ₹${(monthlyIncome - monthExpenses).toLocaleString('en-IN')}

BUDGET ALLOCATION:
- Personal: Budget ₹${cat.personal.budget.toLocaleString('en-IN')} | Spent ₹${cat.personal.spent.toLocaleString('en-IN')}
- Savings: Budget ₹${cat.savings.budget.toLocaleString('en-IN')} | Spent ₹${cat.savings.spent.toLocaleString('en-IN')}
- Business: Budget ₹${cat.business.budget.toLocaleString('en-IN')} | Spent ₹${cat.business.spent.toLocaleString('en-IN')}

CLIENTS OVERVIEW:
- Total Clients: ${clients.length}
- Total Pipeline Value: ₹${clients.reduce((s, c) => s + c.projectValue, 0).toLocaleString('en-IN')}

CLIENT INDIVIDUAL DETAILS & REVENUE RECEIVED:
${clientDetails || '- No individual clients registered yet'}

EXPENSE INDIVIDUAL DETAILS:
${expenseDetails || '- No expenses recorded yet'}
`.trim()
  }

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/karna-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          context: buildContext(),
        }),
      })

      const data = await res.json()

      if (data.error) throw new Error(data.error)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, Chandra. I encountered an issue: ${error.message}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating Action Button (WhatsApp Style with AI Symbol) */}
      <div className={cn(
        "fixed bottom-6 z-50 flex items-center justify-center group",
        position === 'right' ? "right-6" : "left-6"
      )}>
        {/* Tooltip Pill / Hover Label */}
        {!isOpen && (
          <div className={cn(
            "absolute px-3 py-1.5 rounded-full bg-[#0d0d0f]/95 backdrop-blur-md border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap",
            position === 'right' ? "right-16 translate-x-2 group-hover:translate-x-0" : "left-16 -translate-x-2 group-hover:translate-x-0"
          )}>
            Karna AI
          </div>
        )}

        {/* Stable Glow Backplate (Static Premium Glow) */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-[0_0_30px_10px_rgba(212,168,73,0.15)] pointer-events-none scale-110" />
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Karna AI"
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center text-black font-semibold shadow-[0_0_24px_rgba(212,168,73,0.4)] transition-all duration-300 transform hover:scale-105 active:scale-95 z-50",
            isOpen
              ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-[0_0_24px_rgba(239,68,68,0.4)]"
              : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
          )}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white stroke-[2.5]" />
          ) : (
            <Sparkles className="w-6 h-6 text-black stroke-[2.5] fill-black/10" />
          )}
        </button>
      </div>

      {/* Floating Chat Widget window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed bottom-24 w-[380px] h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] z-50 flex flex-col bg-[#030712]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden",
              position === 'right' ? "right-6" : "left-6"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white/95 text-sm font-semibold tracking-wide">Karna AI Advisor</h3>
                  <p className="text-white/40 text-[10px]">Your strategic wealth co-pilot</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePosition}
                  title={position === 'right' ? "Move Karna to Left Side" : "Move Karna to Right Side"}
                  className="text-white/45 hover:text-amber-400 hover:bg-white/5 h-8 px-2 text-[10px] flex items-center gap-1 border border-white/5"
                >
                  <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                  <span>Swap Side</span>
                </Button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all h-8 w-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-700/10 border border-amber-500/10 flex items-center justify-center mb-4 gold-glow">
                    <Bot className="w-7 h-7 text-amber-400" />
                  </div>
                  <h4 className="text-white/70 text-xs font-semibold mb-1">Karna is listening</h4>
                  <p className="text-white/30 text-[10px] max-w-[240px] mb-4">
                    Ask me anything about your current wealth portfolio, client deals, or daily outreach focus.
                  </p>

                  {/* Suggested Quick Buttons */}
                  <div className="space-y-1.5 w-full max-w-[260px]">
                    {suggestedPrompts.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(item.prompt)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-left hover:border-amber-500/20 hover:bg-white/[0.04] transition-all group"
                      >
                        <span className="text-amber-400/40 group-hover:text-amber-400 transition-colors">{item.icon}</span>
                        <span className="text-white/45 text-[10px] group-hover:text-white/70 truncate transition-colors">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages list */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-amber-500/10 border border-amber-500/10 text-white/90'
                        : 'bg-white/[0.02] border border-white/[0.04] text-white/80'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose dark:prose-invert prose-xs max-w-none dark:[&>p]:text-white/80 [&>p]:text-zinc-800 [&>p]:mb-1 dark:[&>ul]:text-white/70 [&>ul]:text-zinc-700 dark:[&>ol]:text-white/70 [&>ol]:text-zinc-700 dark:[&>strong]:text-amber-400/90 [&>strong]:text-amber-700 dark:[&>h1]:text-amber-400 [&>h1]:text-amber-700 dark:[&>h2]:text-amber-400 [&>h2]:text-amber-700">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span className="text-white/40 text-[11px]">Karna is crafting insight...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-white/[0.06] bg-black/40">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about strategy, wealth..."
                  className="bg-white/[0.02] border-white/[0.05] text-white placeholder:text-white/20 h-9 rounded-lg text-xs focus:border-amber-500/30"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="w-9 h-9 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold rounded-lg flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
