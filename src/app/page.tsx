'use client'

import { useAppStore } from '@/store/use-app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { QuickAddDialog } from '@/components/layout/quick-add-dialog'
import { ExecutiveOverview } from '@/components/pages/executive-overview'
import { WealthEngine } from '@/components/pages/wealth-engine'
import { BudgetIntelligence } from '@/components/pages/budget-intelligence'
import { BusinessOperations } from '@/components/pages/business-operations'
import { ClientEmpire } from '@/components/pages/client-empire'
import { AnalyticsChamber } from '@/components/pages/analytics-chamber'
import { DisciplineSystem } from '@/components/pages/discipline-system'
import { WarRoom } from '@/components/pages/war-room'
import { KarnaAI } from '@/components/pages/karna-ai'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { currentPage, sidebarCollapsed, isLoading, setIsLoading, setIncomes, setExpenses, setClients, setFollowups, setMonthlyIncome, setMonthlyTarget } = useAppStore()

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [incomesRes, expensesRes, clientsRes, followupsRes, settingsRes] = await Promise.all([
          fetch('/api/income'),
          fetch('/api/expenses'),
          fetch('/api/clients'),
          fetch('/api/followups'),
          fetch('/api/settings'),
        ])

        if (incomesRes.ok) {
          const incomesData = await incomesRes.json()
          setIncomes(incomesData)
        }
        if (expensesRes.ok) {
          const expensesData = await expensesRes.json()
          setExpenses(expensesData)
        }
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData)
        }
        if (followupsRes.ok) {
          const followupsData = await followupsRes.json()
          setFollowups(followupsData)
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData.monthlyTarget) {
            setMonthlyTarget(settingsData.monthlyTarget.income)
          }
        }

        // Recalculate monthly income from loaded incomes
        const state = useAppStore.getState()
        const now = new Date()
        const monthIncomes = state.incomes.filter((i: any) => {
          const d = new Date(i.date)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        const totalMonthly = monthIncomes.reduce((s: number, i: any) => s + i.amount, 0)
        setMonthlyIncome(totalMonthly)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [setIncomes, setExpenses, setClients, setFollowups, setIsLoading, setMonthlyIncome, setMonthlyTarget])

  const renderPage = () => {
    switch (currentPage) {
      case 'overview': return <ExecutiveOverview />
      case 'wealth': return <WealthEngine />
      case 'budget': return <BudgetIntelligence />
      case 'business': return <BusinessOperations />
      case 'clients': return <ClientEmpire />
      case 'analytics': return <AnalyticsChamber />
      case 'discipline': return <DisciplineSystem />
      case 'warroom': return <WarRoom />
      case 'karna': return <KarnaAI />
      default: return <ExecutiveOverview />
    }
  }

  return (
    <div className="min-h-screen bg-[#08080a] relative">
      {/* Ambient background gradient */}
      <div className="fixed inset-0 ambient-gradient pointer-events-none" />
      
      <Sidebar />
      <div
        className="transition-all duration-300 relative z-10"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <Navbar />
        <main className="p-4 lg:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
                <p className="text-white/30 text-sm">Loading DHANAVI SAMRAJYA...</p>
              </div>
            </div>
          ) : (
            renderPage()
          )}
        </main>
      </div>
      <QuickAddDialog />
    </div>
  )
}
