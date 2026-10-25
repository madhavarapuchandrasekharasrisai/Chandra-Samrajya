'use client'

import { useAppStore } from '@/store/use-app-store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { formatIndianCommas } from '@/lib/utils'

export function QuickAddDialog() {
  const {
    quickAddOpen,
    setQuickAddOpen,
    quickAddTab,
    setQuickAddTab,
    addIncome,
    addExpense,
    addClient,
    addNotification,
    nameSocialMedia,
    nameAIAutomation,
    nameRetainer,
    nameFreelance
  } = useAppStore()
  
  // Income form
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: 'AI Automation',
    clientName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'received',
  })

  // Expense form
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Personal',
    description: '',
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
  })

  // Client form
  const [clientForm, setClientForm] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    projectValue: '',
    pipelineStage: 'prospect',
    urgencyLevel: 'normal',
    notes: '',
    closeProbability: '',
  })

  // Followup form
  const [followupForm, setFollowupForm] = useState({
    clientId: '',
    type: 'call',
    note: '',
    dueDate: new Date().toISOString().split('T')[0],
  })

  // Reminder form
  const [reminderForm, setReminderForm] = useState({
    title: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
  })

  const resetForms = () => {
    setIncomeForm({ amount: '', source: 'AI Automation', clientName: '', description: '', date: new Date().toISOString().split('T')[0], status: 'received' })
    setExpenseForm({ amount: '', category: 'Personal', description: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] })
    setClientForm({ name: '', business: '', email: '', phone: '', projectValue: '', pipelineStage: 'prospect', urgencyLevel: 'normal', notes: '', closeProbability: '' })
    setFollowupForm({ clientId: '', type: 'call', note: '', dueDate: new Date().toISOString().split('T')[0] })
    setReminderForm({ title: '', message: '', date: new Date().toISOString().split('T')[0], time: '09:00' })
  }

  const handleAddIncome = async () => {
    if (!incomeForm.amount) return toast.error('Please enter amount')
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incomeForm, amount: parseFloat(incomeForm.amount.replace(/,/g, '')) }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add income')
      }
      addIncome(data)
      toast.success('Income added successfully')
      resetForms()
      setQuickAddOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add income')
    }
  }

  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) return toast.error('Please fill required fields')
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseForm, amount: parseFloat(expenseForm.amount.replace(/,/g, '')) }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add expense')
      }
      addExpense(data)
      toast.success('Expense added — budget updated')
      resetForms()
      setQuickAddOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense')
    }
  }

  const handleAddClient = async () => {
    if (!clientForm.name) return toast.error('Please enter client name')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientForm,
          projectValue: parseFloat(clientForm.projectValue.replace(/,/g, '')) || 0,
          closeProbability: parseFloat(clientForm.closeProbability) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add client')
      }
      addClient(data)
      toast.success('Client added to empire')
      resetForms()
      setQuickAddOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add client')
    }
  }

  const handleAddFollowup = async () => {
    if (!followupForm.clientId) return toast.error('Please select a client')
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followupForm),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add followup')
      }
      toast.success('Followup scheduled')
      resetForms()
      setQuickAddOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add followup')
    }
  }

  const handleAddReminder = async () => {
    if (!reminderForm.title.trim()) return toast.error('Please enter a reminder title')
    const dateTime = new Date(`${reminderForm.date}T${reminderForm.time}`).toISOString()
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reminderForm.title.trim(),
          message: reminderForm.message.trim() || undefined,
          dateTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add reminder')
      }
      addNotification(data)
      toast.success('Reminder scheduled')
      resetForms()
      setQuickAddOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to add reminder')
    }
  }

  const { clients } = useAppStore()

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent className="bg-card/95 border-border text-foreground max-w-lg max-h-[85vh] overflow-y-auto no-scrollbar backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="gold-text text-lg font-bold">Quick Add</DialogTitle>
        </DialogHeader>
        <Tabs value={quickAddTab} onValueChange={setQuickAddTab}>
          <TabsList className="bg-secondary/50 border border-border w-full">
            <TabsTrigger value="income" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-amber-400">Income</TabsTrigger>
            <TabsTrigger value="expense" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-amber-400">Expense</TabsTrigger>
            <TabsTrigger value="client" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-amber-400">Client</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-amber-400">Followup</TabsTrigger>
            <TabsTrigger value="reminder" className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-amber-400">Reminder</TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Amount (₹)</Label>
              <Input
                type="text"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: formatIndianCommas(e.target.value) })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Source</Label>
              <Select value={incomeForm.source} onValueChange={(v) => setIncomeForm({ ...incomeForm, source: v })}>
                <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Social Media Websites" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">{nameSocialMedia}</SelectItem>
                  <SelectItem value="AI Automation" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">{nameAIAutomation}</SelectItem>
                  <SelectItem value="Retainer Clients" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">{nameRetainer}</SelectItem>
                  <SelectItem value="International Freelance" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">{nameFreelance}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Client Name</Label>
                <Input
                  value={incomeForm.clientName}
                  onChange={(e) => setIncomeForm({ ...incomeForm, clientName: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Status</Label>
                <Select value={incomeForm.status} onValueChange={(v) => setIncomeForm({ ...incomeForm, status: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="received" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Received</SelectItem>
                    <SelectItem value="pending" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Date</Label>
              <Input
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Description</Label>
              <Textarea
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="What was this for?"
                rows={2}
              />
            </div>
            <Button onClick={handleAddIncome} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]">
              Add Revenue
            </Button>
          </TabsContent>

          {/* Expense Tab */}
          <TabsContent value="expense" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Amount (₹)</Label>
              <Input
                type="text"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: formatIndianCommas(e.target.value) })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Category</Label>
                <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Personal" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Personal Expenses</SelectItem>
                    <SelectItem value="Savings" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Savings</SelectItem>
                    <SelectItem value="Business" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Business Expenses</SelectItem>
                    <SelectItem value="Skills" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Skills & Tools</SelectItem>
                    <SelectItem value="Fun" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Fun</SelectItem>
                    <SelectItem value="External" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Household Duties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Payment Method</Label>
                <Select value={expenseForm.paymentMethod} onValueChange={(v) => setExpenseForm({ ...expenseForm, paymentMethod: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="UPI" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">UPI</SelectItem>
                    <SelectItem value="Card" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Card</SelectItem>
                    <SelectItem value="Cash" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Cash</SelectItem>
                    <SelectItem value="Bank Transfer" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Date</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Description</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="What did you spend on?"
              />
            </div>
            <Button onClick={handleAddExpense} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]">
              Add Expense
            </Button>
          </TabsContent>

          {/* Client Tab */}
          <TabsContent value="client" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Client Name</Label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Client or business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Business</Label>
                <Input
                  value={clientForm.business}
                  onChange={(e) => setClientForm({ ...clientForm, business: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                  placeholder="Business type"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Project Value (₹)</Label>
                <Input
                  type="text"
                  value={clientForm.projectValue}
                  onChange={(e) => setClientForm({ ...clientForm, projectValue: formatIndianCommas(e.target.value) })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Email</Label>
                <Input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Phone</Label>
                <Input
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                  placeholder="+91..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Pipeline Stage</Label>
                <Select value={clientForm.pipelineStage} onValueChange={(v) => setClientForm({ ...clientForm, pipelineStage: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="prospect" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Prospect</SelectItem>
                    <SelectItem value="contacted" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Contacted</SelectItem>
                    <SelectItem value="scheduled" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Scheduled</SelectItem>
                    <SelectItem value="proposal" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Proposal</SelectItem>
                    <SelectItem value="active" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Active</SelectItem>
                    <SelectItem value="retainer" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Retainer</SelectItem>
                    <SelectItem value="completed" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Urgency</Label>
                <Select value={clientForm.urgencyLevel} onValueChange={(v) => setClientForm({ ...clientForm, urgencyLevel: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="low" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Low</SelectItem>
                    <SelectItem value="normal" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Normal</SelectItem>
                    <SelectItem value="high" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">High</SelectItem>
                    <SelectItem value="critical" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Close Probability (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={clientForm.closeProbability}
                onChange={(e) => setClientForm({ ...clientForm, closeProbability: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="e.g. 70"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Notes</Label>
              <Textarea
                value={clientForm.notes}
                onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Details, specifications, AI solutions details..."
                rows={2}
              />
            </div>
            <Button onClick={handleAddClient} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]">
              Add Client
            </Button>
          </TabsContent>

          {/* Followup Tab */}
          <TabsContent value="followup" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Client</Label>
              <Select value={followupForm.clientId} onValueChange={(v) => setFollowupForm({ ...followupForm, clientId: v })}>
                <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-foreground focus:bg-white/[0.06] focus:text-foreground">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Type</Label>
                <Select value={followupForm.type} onValueChange={(v) => setFollowupForm({ ...followupForm, type: v })}>
                  <SelectTrigger className="bg-secondary/50 border-border focus:ring-amber-500/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="call" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Call</SelectItem>
                    <SelectItem value="email" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Email</SelectItem>
                    <SelectItem value="dm" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">DM</SelectItem>
                    <SelectItem value="meeting" className="text-foreground focus:bg-white/[0.06] focus:text-foreground">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={followupForm.dueDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, dueDate: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Note</Label>
              <Textarea
                value={followupForm.note}
                onChange={(e) => setFollowupForm({ ...followupForm, note: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Followup details..."
                rows={2}
              />
            </div>
            <Button onClick={handleAddFollowup} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]">
              Schedule Followup
            </Button>
          </TabsContent>

          {/* Reminder Tab */}
          <TabsContent value="reminder" className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Reminder Title</Label>
              <Input
                value={reminderForm.title}
                onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="e.g. Submit assignment, Call recruiter"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Date</Label>
                <Input
                  type="date"
                  value={reminderForm.date}
                  onChange={(e) => setReminderForm({ ...reminderForm, date: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Time</Label>
                <Input
                  type="time"
                  value={reminderForm.time}
                  onChange={(e) => setReminderForm({ ...reminderForm, time: e.target.value })}
                  className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">Notes (Optional)</Label>
              <Textarea
                value={reminderForm.message}
                onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                className="bg-secondary/50 border-border focus-visible:ring-amber-500/30 focus-visible:border-primary/30 text-foreground placeholder:text-muted-foreground/40"
                placeholder="Additional details..."
                rows={2}
              />
            </div>
            <Button onClick={handleAddReminder} className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-black font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10 active:scale-[0.98]">
              Schedule Reminder
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
