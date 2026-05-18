'use client'

import { useAppStore } from '@/store/use-app-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Send, Bot, User, Loader2, MessageSquare, TrendingUp, IndianRupee, Target, Lightbulb } from 'lucide-react'
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
  { icon: <Target className="w-4 h-4" />, label: 'Can I hit ₹1L this month?', prompt: 'Based on my current income and expenses, can I hit ₹1,00,000 this month? What do I need to do?' },
  { icon: <TrendingUp className="w-4 h-4" />, label: 'Where am I wasting money?', prompt: 'Analyze my spending patterns and tell me where I am wasting money or overspending.' },
  { icon: <MessageSquare className="w-4 h-4" />, label: 'Write outreach for Instagram businesses', prompt: 'Write me 3 outreach DM messages for Instagram businesses who might need AI automation services.' },
  { icon: <Lightbulb className="w-4 h-4" />, label: 'What should I prioritize this week?', prompt: 'What should I prioritize this week to maximize my revenue and business growth?' },
  { icon: <IndianRupee className="w-4 h-4" />, label: 'How to optimize my budget?', prompt: 'How can I optimize my monthly budget allocation to save more while still investing in growth?' },
  { icon: <Sparkles className="w-4 h-4" />, label: 'Analyze my income streams', prompt: 'Analyze my income streams and tell me which ones to focus on and which to improve.' },
]

export function KarnaAI() {
  const { incomes, expenses, monthlyIncome, monthlyTarget, budgetAllocation, clients, followups } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const now = new Date()
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).reduce((s, e) => s + e.amount, 0)

  // Build context for Karna AI
  const buildContext = () => {
    const cat = budgetAllocation
    return `
CURRENT FINANCIAL STATUS:
- Monthly Income: ₹${monthlyIncome.toLocaleString('en-IN')}
- Monthly Target: ₹${monthlyTarget.toLocaleString('en-IN')}
- Total Expenses This Month: ₹${monthExpenses.toLocaleString('en-IN')}
- Net Balance: ₹${(monthlyIncome - monthExpenses).toLocaleString('en-IN')}

BUDGET ALLOCATION:
- Personal: Budget ₹${cat.personal.budget.toLocaleString('en-IN')} | Spent ₹${cat.personal.spent.toLocaleString('en-IN')} | ${cat.personal.budget > 0 ? Math.round(cat.personal.spent / cat.personal.budget * 100) : 0}% used
- Savings: Budget ₹${cat.savings.budget.toLocaleString('en-IN')} | Spent ₹${cat.savings.spent.toLocaleString('en-IN')} | ${cat.savings.budget > 0 ? Math.round(cat.savings.spent / cat.savings.budget * 100) : 0}% used
- Business: Budget ₹${cat.business.budget.toLocaleString('en-IN')} | Spent ₹${cat.business.spent.toLocaleString('en-IN')} | ${cat.business.budget > 0 ? Math.round(cat.business.spent / cat.business.budget * 100) : 0}% used
- Skills: Budget ₹${cat.skills.budget.toLocaleString('en-IN')} | Spent ₹${cat.skills.spent.toLocaleString('en-IN')} | ${cat.skills.budget > 0 ? Math.round(cat.skills.spent / cat.skills.budget * 100) : 0}% used
- Fun: Budget ₹${cat.fun.budget.toLocaleString('en-IN')} | Spent ₹${cat.fun.spent.toLocaleString('en-IN')} | ${cat.fun.budget > 0 ? Math.round(cat.fun.spent / cat.fun.budget * 100) : 0}% used

INCOME STREAMS:
${incomes.length > 0 
  ? Object.entries(incomes.reduce((acc, i) => { acc[i.source] = (acc[i.source] || 0) + i.amount; return acc; }, {} as Record<string, number>))
      .map(([source, amount]) => `- ${source}: ₹${amount.toLocaleString('en-IN')}`).join('\n')
  : '- No income recorded yet'}

CLIENTS:
- Total Clients: ${clients.length}
- Pipeline: ${Object.entries(clients.reduce((acc, c) => { acc[c.pipelineStage] = (acc[c.pipelineStage] || 0) + 1; return acc; }, {} as Record<string, number>))
    .map(([stage, count]) => `${stage}: ${count}`).join(', ')}
- Total Pipeline Value: ₹${clients.reduce((s, c) => s + c.projectValue, 0).toLocaleString('en-IN')}

FOLLOWUPS:
- Pending: ${followups.filter(f => f.status === 'pending').length}
- Overdue: ${followups.filter(f => f.status === 'pending' && new Date(f.dueDate) < new Date()).length}
- Completed: ${followups.filter(f => f.status === 'completed').length}
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

      if (data.error) {
        throw new Error(data.error)
      }

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
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="gold-text text-2xl font-bold tracking-tight">Karna AI</h1>
            <p className="text-white/30 text-sm">Your strategic advisor for financial sovereignty</p>
          </div>
        </div>

        {/* Context Summary */}
        <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
          <span>Revenue: <span className="text-amber-400/70">₹{monthlyIncome.toLocaleString('en-IN')}</span></span>
          <span>|</span>
          <span>Target: <span className="text-white/50">₹{monthlyTarget.toLocaleString('en-IN')}</span></span>
          <span>|</span>
          <span>Spent: <span className="text-red-400/70">₹{monthExpenses.toLocaleString('en-IN')}</span></span>
          <span>|</span>
          <span>Clients: <span className="text-white/50">{clients.length}</span></span>
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 glass-card p-0 overflow-hidden flex flex-col">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-12"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-700/10 border border-amber-500/10 flex items-center justify-center mb-6 gold-glow">
                <Bot className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-white/60 text-lg font-medium mb-2">Karna is ready</h3>
              <p className="text-white/30 text-sm max-w-md mb-8">
                I have full access to your financial data, client pipeline, and spending patterns. Ask me anything about your wealth strategy.
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl w-full">
                {suggestedPrompts.map((item, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => sendMessage(item.prompt)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-left hover:border-amber-500/20 hover:bg-white/[0.05] transition-all group"
                  >
                    <span className="text-amber-400/50 group-hover:text-amber-400 transition-colors">{item.icon}</span>
                    <span className="text-white/50 text-xs group-hover:text-white/70 transition-colors">{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'chat-bubble flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-amber-500/10 border border-amber-500/10 text-white/90'
                      : 'bg-white/[0.03] border border-white/[0.06] text-white/80'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert prose-sm max-w-none [&>p]:text-white/80 [&>p]:mb-2 [&>ul]:text-white/70 [&>ol]:text-white/70 [&>strong]:text-amber-400/90 [&>h1]:text-amber-400 [&>h2]:text-amber-400 [&>h3]:text-amber-400/80">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <span className="text-[10px] text-white/20 mt-2 block">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-white/40 text-sm">Karna is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Karna anything about your wealth, strategy, or business..."
                className="bg-white/[0.03] border-white/[0.06] text-white placeholder:text-white/20 pr-12 h-11 rounded-xl focus:border-amber-500/30"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-medium h-11 px-4 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-white/15 mt-2 text-center">
            Karna AI has access to your financial data, budgets, clients, and spending patterns
          </p>
        </div>
      </div>
    </div>
  )
}
