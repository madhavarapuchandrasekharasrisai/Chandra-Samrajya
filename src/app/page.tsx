'use client'

import { useAppStore } from '@/store/use-app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Navbar } from '@/components/layout/navbar'
import { QuickAddDialog } from '@/components/layout/quick-add-dialog'
import { KarnaFloatingWidget } from '@/components/layout/karna-floating-widget'
import { ExecutiveOverview } from '@/components/pages/executive-overview'
import { WealthEngine } from '@/components/pages/wealth-engine'
import { BudgetIntelligence } from '@/components/pages/budget-intelligence'
import { BusinessOperations } from '@/components/pages/business-operations'
import { ClientEmpire } from '@/components/pages/client-empire'
import { AnalyticsChamber } from '@/components/pages/analytics-chamber'
import { DisciplineSystem } from '@/components/pages/discipline-system'
import { WarRoom } from '@/components/pages/war-room'
import { KarnaAI } from '@/components/pages/karna-ai'
import { ImperialCalendar } from '@/components/pages/imperial-calendar'
import { JobSearch } from '@/components/pages/job-search'
import { SoloLeveling } from '@/components/pages/solo-leveling'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const {
    currentPage,
    sidebarCollapsed,
    isLoading,
    setIsLoading,
    setIncomes,
    setExpenses,
    setClients,
    setFollowups,
    setMonthlyIncome,
    setMonthlyTarget,
    setTargetSocialMedia,
    setTargetAIAutomation,
    setTargetRetainer,
    setTargetFreelance,
    setNameSocialMedia,
    setNameAIAutomation,
    setNameRetainer,
    setNameFreelance,
    setTodos,
    setOutreachRecords,
    setWarRoomActions,
    setWarRoomOpportunities,
    setJobApplications,
    setNotifications
  } = useAppStore()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Centralized scroll restoration
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [
          incomesRes, expensesRes, clientsRes, followupsRes,
          settingsRes, todosRes, outreachRecordsRes,
          warRoomActionsRes, warRoomOpportunitiesRes,
          jobApplicationsRes, notificationsRes
        ] = await Promise.all([
          fetch('/api/income'),
          fetch('/api/expenses'),
          fetch('/api/clients'),
          fetch('/api/followups'),
          fetch('/api/settings'),
          fetch('/api/todos'),
          fetch('/api/outreach-records'),
          fetch('/api/warroom/actions'),
          fetch('/api/warroom/opportunities'),
          fetch('/api/job-applications'),
          fetch('/api/notifications'),
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
        if (todosRes.ok) {
          const todosData = await todosRes.json()
          setTodos(todosData)
        }
        if (outreachRecordsRes.ok) {
          const outreachData = await outreachRecordsRes.json()
          setOutreachRecords(outreachData)
        }
        if (warRoomActionsRes.ok) {
          const actionsData = await warRoomActionsRes.json()
          setWarRoomActions(actionsData)
        }
        if (warRoomOpportunitiesRes.ok) {
          const oppsData = await warRoomOpportunitiesRes.json()
          setWarRoomOpportunities(oppsData)
        }
        if (jobApplicationsRes.ok) {
          const jobsData = await jobApplicationsRes.json()
          setJobApplications(jobsData)
        }
        if (notificationsRes.ok) {
          const notifsData = await notificationsRes.json()
          setNotifications(notifsData)
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          if (settingsData.monthlyTarget) {
            setMonthlyTarget(settingsData.monthlyTarget.income)
            if (settingsData.monthlyTarget.targetSocialMedia !== undefined) setTargetSocialMedia(settingsData.monthlyTarget.targetSocialMedia)
            if (settingsData.monthlyTarget.targetAIAutomation !== undefined) setTargetAIAutomation(settingsData.monthlyTarget.targetAIAutomation)
            if (settingsData.monthlyTarget.targetRetainer !== undefined) setTargetRetainer(settingsData.monthlyTarget.targetRetainer)
            if (settingsData.monthlyTarget.targetFreelance !== undefined) setTargetFreelance(settingsData.monthlyTarget.targetFreelance)
            if (settingsData.monthlyTarget.nameSocialMedia !== undefined) setNameSocialMedia(settingsData.monthlyTarget.nameSocialMedia)
            if (settingsData.monthlyTarget.nameAIAutomation !== undefined) setNameAIAutomation(settingsData.monthlyTarget.nameAIAutomation)
            if (settingsData.monthlyTarget.nameRetainer !== undefined) setNameRetainer(settingsData.monthlyTarget.nameRetainer)
            if (settingsData.monthlyTarget.nameFreelance !== undefined) setNameFreelance(settingsData.monthlyTarget.nameFreelance)
          }
        }

        // Recalculate monthly income
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
  }, [
    setIncomes,
    setExpenses,
    setClients,
    setFollowups,
    setTodos,
    setOutreachRecords,
    setWarRoomActions,
    setWarRoomOpportunities,
    setJobApplications,
    setNotifications,
    setIsLoading,
    setMonthlyIncome,
    setMonthlyTarget,
    setTargetSocialMedia,
    setTargetAIAutomation,
    setTargetRetainer,
    setTargetFreelance,
    setNameSocialMedia,
    setNameAIAutomation,
    setNameRetainer,
    setNameFreelance
  ])

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
      case 'calendar': return <ImperialCalendar />
      case 'jobs': return <JobSearch />
      case 'sololeveling': return <SoloLeveling />
      default: return <ExecutiveOverview />
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient System background effect */}
      <div className="fixed inset-0 ambient-gradient pointer-events-none" />
      
      <Sidebar />
      <div
        className="transition-all duration-300 relative z-10"
        style={{ marginLeft: isMobile ? 0 : (sidebarCollapsed ? 72 : 260) }}
      >
        <Navbar />
        <main className="p-3 pb-28 lg:p-5">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
                <p className="text-muted-foreground text-xs font-mono uppercase tracking-[0.15em]">Initializing System...</p>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
      <QuickAddDialog />
      <KarnaFloatingWidget />
    </div>
  )
}
