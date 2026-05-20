import { create } from 'zustand'

export type PageType = 
  | 'overview'
  | 'wealth'
  | 'budget'
  | 'business'
  | 'clients'
  | 'analytics'
  | 'discipline'
  | 'warroom'
  | 'karna'
  | 'calendar'
  | 'jobs'
  | 'sololeveling'

export interface IncomeEntry {
  id: string
  amount: number
  source: string
  clientName?: string
  description?: string
  date: string
  status: string
}

export interface ExpenseEntry {
  id: string
  amount: number
  category: string
  description: string
  paymentMethod?: string
  date: string
}

export interface ClientEntry {
  id: string
  name: string
  business?: string
  email?: string
  phone?: string
  projectValue: number
  pipelineStage: string
  lastContact?: string
  urgencyLevel: string
  notes?: string
  closeProbability: number
}

export interface FollowupEntry {
  id: string
  clientId: string
  clientName?: string
  type: string
  note?: string
  dueDate: string
  status: string
}

export interface TodoEntry {
  id: string
  task: string
  completed: number
  date: string
  createdAt: string
  updatedAt: string
}

export interface OutreachRecordEntry {
  id: string
  contactName: string
  phoneNumber?: string
  platform: string
  type: string
  status: string
  notes?: string
  date: string
  reopenDate?: string
  projectValue: number
  createdAt?: string
  updatedAt?: string
}

export interface JobApplicationEntry {
  id: string
  company: string
  role: string
  appliedDate: string
  source?: string
  notes?: string
}

export interface NotificationEntry {
  id: string
  title: string
  message?: string
  dateTime: string
  read: boolean
}

export interface WarRoomActionEntry {
  id: string
  title: string
  subtitle?: string
  actionLabel: string
  urgency: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface WarRoomOpportunityEntry {
  id: string
  name: string
  projectValue: number
  pipelineStage: string
  closeProbability: number
  notes?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface BudgetAllocation {
  personal: { percent: number; spent: number; budget: number }
  savings: { percent: number; spent: number; budget: number }
  business: { percent: number; spent: number; budget: number }
  skills: { percent: number; spent: number; budget: number }
  fun: { percent: number; spent: number; budget: number }
}

interface AppState {
  currentPage: PageType
  setCurrentPage: (page: PageType) => void
  
  incomes: IncomeEntry[]
  expenses: ExpenseEntry[]
  clients: ClientEntry[]
  followups: FollowupEntry[]
  monthlyIncome: number
  monthlyTarget: number
  targetSocialMedia: number
  targetAIAutomation: number
  targetRetainer: number
  targetFreelance: number
  nameSocialMedia: string
  nameAIAutomation: string
  nameRetainer: string
  nameFreelance: string
  budgetAllocation: BudgetAllocation
  
  // New entities
  outreachRecords: OutreachRecordEntry[]
  warRoomActions: WarRoomActionEntry[]
  warRoomOpportunities: WarRoomOpportunityEntry[]
  jobApplications: JobApplicationEntry[]
  notifications: NotificationEntry[]
  
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  quickAddOpen: boolean
  setQuickAddOpen: (open: boolean) => void
  quickAddTab: string
  setQuickAddTab: (tab: string) => void
  
  setIncomes: (incomes: IncomeEntry[]) => void
  setExpenses: (expenses: ExpenseEntry[]) => void
  setClients: (clients: ClientEntry[]) => void
  setFollowups: (followups: FollowupEntry[]) => void
  setMonthlyIncome: (income: number) => void
  setMonthlyTarget: (target: number) => void
  setTargetSocialMedia: (target: number) => void
  setTargetAIAutomation: (target: number) => void
  setTargetRetainer: (target: number) => void
  setTargetFreelance: (target: number) => void
  setNameSocialMedia: (name: string) => void
  setNameAIAutomation: (name: string) => void
  setNameRetainer: (name: string) => void
  setNameFreelance: (name: string) => void
  setBudgetAllocation: (allocation: BudgetAllocation) => void
  
  // New setters
  setOutreachRecords: (records: OutreachRecordEntry[]) => void
  addOutreachRecord: (record: OutreachRecordEntry) => void
  removeOutreachRecord: (id: string) => void
  updateOutreachRecord: (id: string, data: Partial<OutreachRecordEntry>) => void
  
  setWarRoomActions: (actions: WarRoomActionEntry[]) => void
  addWarRoomAction: (action: WarRoomActionEntry) => void
  removeWarRoomAction: (id: string) => void
  updateWarRoomAction: (id: string, data: Partial<WarRoomActionEntry>) => void
  
  setWarRoomOpportunities: (opportunities: WarRoomOpportunityEntry[]) => void
  addWarRoomOpportunity: (opportunity: WarRoomOpportunityEntry) => void
  removeWarRoomOpportunity: (id: string) => void
  updateWarRoomOpportunity: (id: string, data: Partial<WarRoomOpportunityEntry>) => void
  
  setJobApplications: (jobs: JobApplicationEntry[]) => void
  addJobApplication: (job: JobApplicationEntry) => void
  removeJobApplication: (id: string) => void
  updateJobApplication: (id: string, data: Partial<JobApplicationEntry>) => void

  setNotifications: (notifications: NotificationEntry[]) => void
  addNotification: (notification: NotificationEntry) => void
  removeNotification: (id: string) => void
  updateNotification: (id: string, data: Partial<NotificationEntry>) => void
  
  addIncome: (income: IncomeEntry) => void
  addExpense: (expense: ExpenseEntry) => void
  addClient: (client: ClientEntry) => void
  removeIncome: (id: string) => void
  removeExpense: (id: string) => void
  updateClient: (id: string, data: Partial<ClientEntry>) => void
  
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void

  todos: TodoEntry[]
  setTodos: (todos: TodoEntry[]) => void
  addTodo: (todo: TodoEntry) => void
  toggleTodo: (id: string, completed: boolean) => void
  removeTodo: (id: string) => void
}

const defaultBudgetAllocation: BudgetAllocation = {
  personal: { percent: 40, spent: 0, budget: 0 },
  savings: { percent: 25, spent: 0, budget: 0 },
  business: { percent: 15, spent: 0, budget: 0 },
  skills: { percent: 10, spent: 0, budget: 0 },
  fun: { percent: 10, spent: 0, budget: 0 },
}

function recalcBudget(monthlyIncome: number, expenses: ExpenseEntry[], currentAlloc: BudgetAllocation): BudgetAllocation {
  const now = new Date()
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const alloc = { ...currentAlloc }
  const categories = ['personal', 'savings', 'business', 'skills', 'fun'] as const
  categories.forEach(cat => {
    const label = cat.charAt(0).toUpperCase() + cat.slice(1)
    alloc[cat] = {
      ...alloc[cat],
      budget: monthlyIncome * alloc[cat].percent / 100,
      spent: monthExpenses.filter(e => e.category === label).reduce((s, e) => s + e.amount, 0)
    }
  })
  return alloc
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'overview',
  setCurrentPage: (page) => set({ currentPage: page }),
  
  incomes: [],
  expenses: [],
  clients: [],
  followups: [],
  monthlyIncome: 0,
  monthlyTarget: 100000,
  targetSocialMedia: 15000,
  targetAIAutomation: 40000,
  targetRetainer: 25000,
  targetFreelance: 20000,
  nameSocialMedia: 'Social Media Websites',
  nameAIAutomation: 'AI Automation',
  nameRetainer: 'Retainer Clients',
  nameFreelance: 'International Freelance',
  budgetAllocation: defaultBudgetAllocation,
  
  // New entities
  outreachRecords: [],
  warRoomActions: [],
  warRoomOpportunities: [],
  jobApplications: [],
  notifications: [],
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  quickAddTab: 'income',
  setQuickAddTab: (tab) => set({ quickAddTab: tab }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  toggleTodo: (id, completed) => set((state) => ({
    todos: state.todos.map(t => t.id === id ? { ...t, completed: completed ? 1 : 0 } : t)
  })),
  removeTodo: (id) => set((state) => ({ todos: state.todos.filter(t => t.id !== id) })),
  
  // Outreach Records
  setOutreachRecords: (records) => set({ outreachRecords: records }),
  addOutreachRecord: (record) => set((state) => ({ outreachRecords: [record, ...state.outreachRecords] })),
  removeOutreachRecord: (id) => set((state) => ({ outreachRecords: state.outreachRecords.filter(r => r.id !== id) })),
  updateOutreachRecord: (id, data) => set((state) => ({
    outreachRecords: state.outreachRecords.map(r => r.id === id ? { ...r, ...data } : r)
  })),
  
  // War Room Actions
  setWarRoomActions: (actions) => set({ warRoomActions: actions }),
  addWarRoomAction: (action) => set((state) => ({ warRoomActions: [action, ...state.warRoomActions] })),
  removeWarRoomAction: (id) => set((state) => ({ warRoomActions: state.warRoomActions.filter(a => a.id !== id) })),
  updateWarRoomAction: (id, data) => set((state) => ({
    warRoomActions: state.warRoomActions.map(a => a.id === id ? { ...a, ...data } : a)
  })),
  
  // War Room Opportunities
  setWarRoomOpportunities: (opportunities) => set({ warRoomOpportunities: opportunities }),
  addWarRoomOpportunity: (opportunity) => set((state) => ({ warRoomOpportunities: [opportunity, ...state.warRoomOpportunities] })),
  removeWarRoomOpportunity: (id) => set((state) => ({ warRoomOpportunities: state.warRoomOpportunities.filter(o => o.id !== id) })),
  updateWarRoomOpportunity: (id, data) => set((state) => ({
    warRoomOpportunities: state.warRoomOpportunities.map(o => o.id === id ? { ...o, ...data } : o)
  })),

  // Job Applications
  setJobApplications: (jobs) => set({ jobApplications: jobs }),
  addJobApplication: (job) => set((state) => ({ jobApplications: [job, ...state.jobApplications] })),
  removeJobApplication: (id) => set((state) => ({ jobApplications: state.jobApplications.filter(j => j.id !== id) })),
  updateJobApplication: (id, data) => set((state) => ({
    jobApplications: state.jobApplications.map(j => j.id === id ? { ...j, ...data } : j)
  })),

  // Notifications
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) => set((state) => ({ notifications: [notification, ...state.notifications] })),
  removeNotification: (id) => set((state) => ({ notifications: state.notifications.filter(n => n.id !== id) })),
  updateNotification: (id, data) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, ...data } : n)
  })),
  
  setIncomes: (incomes) => {
    const now = new Date()
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const totalMonthly = monthIncomes.reduce((s, i) => s + i.amount, 0)
    const state = get()
    set({ incomes, monthlyIncome: totalMonthly, budgetAllocation: recalcBudget(totalMonthly, state.expenses, state.budgetAllocation) })
  },
  setExpenses: (expenses) => {
    const state = get()
    set({ expenses, budgetAllocation: recalcBudget(state.monthlyIncome, expenses, state.budgetAllocation) })
  },
  setClients: (clients) => set({ clients }),
  setFollowups: (followups) => set({ followups }),
  setMonthlyIncome: (income) => {
    const state = get()
    set({ monthlyIncome: income, budgetAllocation: recalcBudget(income, state.expenses, state.budgetAllocation) })
  },
  setMonthlyTarget: (target) => set({ monthlyTarget: target }),
  setTargetSocialMedia: (target) => set({ targetSocialMedia: target }),
  setTargetAIAutomation: (target) => set({ targetAIAutomation: target }),
  setTargetRetainer: (target) => set({ targetRetainer: target }),
  setTargetFreelance: (target) => set({ targetFreelance: target }),
  setNameSocialMedia: (name) => set({ nameSocialMedia: name }),
  setNameAIAutomation: (name) => set({ nameAIAutomation: name }),
  setNameRetainer: (name) => set({ nameRetainer: name }),
  setNameFreelance: (name) => set({ nameFreelance: name }),
  setBudgetAllocation: (allocation) => set({ budgetAllocation: allocation }),
  
  addIncome: (income) => {
    const state = get()
    const incomes = [income, ...state.incomes]
    const now = new Date()
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const totalMonthly = monthIncomes.reduce((s, i) => s + i.amount, 0)
    set({ incomes, monthlyIncome: totalMonthly, budgetAllocation: recalcBudget(totalMonthly, state.expenses, state.budgetAllocation) })
  },
  addExpense: (expense) => {
    const state = get()
    const expenses = [expense, ...state.expenses]
    set({ expenses, budgetAllocation: recalcBudget(state.monthlyIncome, expenses, state.budgetAllocation) })
  },
  addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
  removeIncome: (id) => set((state) => {
    const incomes = state.incomes.filter(i => i.id !== id)
    const now = new Date()
    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const totalMonthly = monthIncomes.reduce((s, i) => s + i.amount, 0)
    return { incomes, monthlyIncome: totalMonthly }
  }),
  removeExpense: (id) => set((state) => {
    const expenses = state.expenses.filter(e => e.id !== id)
    return { expenses, budgetAllocation: recalcBudget(state.monthlyIncome, expenses, state.budgetAllocation) }
  }),
  updateClient: (id, data) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...data } : c)
  })),
}))
