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
  budgetAllocation: BudgetAllocation
  
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
  setBudgetAllocation: (allocation: BudgetAllocation) => void
  
  addIncome: (income: IncomeEntry) => void
  addExpense: (expense: ExpenseEntry) => void
  addClient: (client: ClientEntry) => void
  removeIncome: (id: string) => void
  removeExpense: (id: string) => void
  updateClient: (id: string, data: Partial<ClientEntry>) => void
  
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
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
  budgetAllocation: defaultBudgetAllocation,
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  quickAddOpen: false,
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  quickAddTab: 'income',
  setQuickAddTab: (tab) => set({ quickAddTab: tab }),
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
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
