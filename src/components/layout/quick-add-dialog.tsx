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

export function QuickAddDialog() {
  const { quickAddOpen, setQuickAddOpen, quickAddTab, setQuickAddTab, addIncome, addExpense, addClient } = useAppStore()
  
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
  })

  // Followup form
  const [followupForm, setFollowupForm] = useState({
    clientId: '',
    type: 'call',
    note: '',
    dueDate: new Date().toISOString().split('T')[0],
  })

  const resetForms = () => {
    setIncomeForm({ amount: '', source: 'AI Automation', clientName: '', description: '', date: new Date().toISOString().split('T')[0], status: 'received' })
    setExpenseForm({ amount: '', category: 'Personal', description: '', paymentMethod: 'UPI', date: new Date().toISOString().split('T')[0] })
    setClientForm({ name: '', business: '', email: '', phone: '', projectValue: '', pipelineStage: 'prospect', urgencyLevel: 'normal' })
    setFollowupForm({ clientId: '', type: 'call', note: '', dueDate: new Date().toISOString().split('T')[0] })
  }

  const handleAddIncome = async () => {
    if (!incomeForm.amount) return toast.error('Please enter amount')
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incomeForm, amount: parseFloat(incomeForm.amount) }),
      })
      const data = await res.json()
      addIncome(data)
      toast.success('Income added successfully')
      resetForms()
      setQuickAddOpen(false)
    } catch {
      toast.error('Failed to add income')
    }
  }

  const handleAddExpense = async () => {
    if (!expenseForm.amount || !expenseForm.description) return toast.error('Please fill required fields')
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...expenseForm, amount: parseFloat(expenseForm.amount) }),
      })
      const data = await res.json()
      addExpense(data)
      toast.success('Expense added — budget updated')
      resetForms()
      setQuickAddOpen(false)
    } catch {
      toast.error('Failed to add expense')
    }
  }

  const handleAddClient = async () => {
    if (!clientForm.name) return toast.error('Please enter client name')
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clientForm, projectValue: parseFloat(clientForm.projectValue) || 0, closeProbability: 0 }),
      })
      const data = await res.json()
      addClient(data)
      toast.success('Client added to empire')
      resetForms()
      setQuickAddOpen(false)
    } catch {
      toast.error('Failed to add client')
    }
  }

  const handleAddFollowup = async () => {
    if (!followupForm.clientId) return toast.error('Please select a client')
    try {
      await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followupForm),
      })
      toast.success('Followup scheduled')
      resetForms()
      setQuickAddOpen(false)
    } catch {
      toast.error('Failed to add followup')
    }
  }

  const { clients } = useAppStore()

  return (
    <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
      <DialogContent className="bg-[#0d0d0f] border-white/[0.06] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="gold-text text-lg">Quick Add</DialogTitle>
        </DialogHeader>
        <Tabs value={quickAddTab} onValueChange={setQuickAddTab}>
          <TabsList className="bg-white/[0.03] border border-white/[0.06] w-full">
            <TabsTrigger value="income" className="text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">Income</TabsTrigger>
            <TabsTrigger value="expense" className="text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">Expense</TabsTrigger>
            <TabsTrigger value="client" className="text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">Client</TabsTrigger>
            <TabsTrigger value="followup" className="text-xs data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">Followup</TabsTrigger>
          </TabsList>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Amount (₹)</Label>
              <Input
                type="number"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Source</Label>
              <Select value={incomeForm.source} onValueChange={(v) => setIncomeForm({ ...incomeForm, source: v })}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social Media Websites">Social Media Websites</SelectItem>
                  <SelectItem value="AI Automation">AI Automation</SelectItem>
                  <SelectItem value="Retainer Clients">Retainer Clients</SelectItem>
                  <SelectItem value="International Freelance">International Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Client Name</Label>
                <Input
                  value={incomeForm.clientName}
                  onChange={(e) => setIncomeForm({ ...incomeForm, clientName: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.06] text-white"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Status</Label>
                <Select value={incomeForm.status} onValueChange={(v) => setIncomeForm({ ...incomeForm, status: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Description</Label>
              <Textarea
                value={incomeForm.description}
                onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="What was this for?"
                rows={2}
              />
            </div>
            <Button onClick={handleAddIncome} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium">
              Add Revenue
            </Button>
          </TabsContent>

          {/* Expense Tab */}
          <TabsContent value="expense" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Amount (₹)</Label>
              <Input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="Enter amount"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Category</Label>
                <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Personal">Personal Expenses</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Business">Business Expenses</SelectItem>
                    <SelectItem value="Skills">Skills & Tools</SelectItem>
                    <SelectItem value="Fun">Fun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Payment Method</Label>
                <Select value={expenseForm.paymentMethod} onValueChange={(v) => setExpenseForm({ ...expenseForm, paymentMethod: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Description</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="What did you spend on?"
              />
            </div>
            <Button onClick={handleAddExpense} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium">
              Add Expense
            </Button>
          </TabsContent>

          {/* Client Tab */}
          <TabsContent value="client" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Client Name</Label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="Client or business name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Business</Label>
                <Input
                  value={clientForm.business}
                  onChange={(e) => setClientForm({ ...clientForm, business: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.06] text-white"
                  placeholder="Business type"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Project Value (₹)</Label>
                <Input
                  type="number"
                  value={clientForm.projectValue}
                  onChange={(e) => setClientForm({ ...clientForm, projectValue: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.06] text-white"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Pipeline Stage</Label>
                <Select value={clientForm.pipelineStage} onValueChange={(v) => setClientForm({ ...clientForm, pipelineStage: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="retainer">Retainer</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Urgency</Label>
                <Select value={clientForm.urgencyLevel} onValueChange={(v) => setClientForm({ ...clientForm, urgencyLevel: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleAddClient} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium">
              Add Client
            </Button>
          </TabsContent>

          {/* Followup Tab */}
          <TabsContent value="followup" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Client</Label>
              <Select value={followupForm.clientId} onValueChange={(v) => setFollowupForm({ ...followupForm, clientId: v })}>
                <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Type</Label>
                <Select value={followupForm.type} onValueChange={(v) => setFollowupForm({ ...followupForm, type: v })}>
                  <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="dm">DM</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Due Date</Label>
                <Input
                  type="date"
                  value={followupForm.dueDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, dueDate: e.target.value })}
                  className="bg-white/[0.03] border-white/[0.06] text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Note</Label>
              <Textarea
                value={followupForm.note}
                onChange={(e) => setFollowupForm({ ...followupForm, note: e.target.value })}
                className="bg-white/[0.03] border-white/[0.06] text-white"
                placeholder="Followup details..."
                rows={2}
              />
            </div>
            <Button onClick={handleAddFollowup} className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium">
              Schedule Followup
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
