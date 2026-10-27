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

  // Load initial data with instant cache hydration and non-blocking background sync
  useEffect(() => {
    // 1. Instant hydration from localStorage cache if present (0ms delay)
    try {
      const cached = localStorage.getItem('god_system_app_cache_v1')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.incomes) setIncomes(parsed.incomes)
        if (parsed.expenses) setExpenses(parsed.expenses)
        if (parsed.clients) setClients(parsed.clients)
        if (parsed.followups) setFollowups(parsed.followups)
        if (parsed.todos) setTodos(parsed.todos)
        if (parsed.outreachRecords) setOutreachRecords(parsed.outreachRecords)
        if (parsed.warRoomActions) setWarRoomActions(parsed.warRoomActions)
        if (parsed.warRoomOpportunities) setWarRoomOpportunities(parsed.warRoomOpportunities)
        if (parsed.jobApplications) setJobApplications(parsed.jobApplications)
        if (parsed.notifications) setNotifications(parsed.notifications)
        if (parsed.monthlyIncome) setMonthlyIncome(parsed.monthlyIncome)
      }
    } catch {
      // Ignore cache parse error
    }

    // 2. Non-blocking fresh data fetch from APIs
    const loadData = async () => {
      try {
        const [
          incomesRes, expensesRes, clientsRes, followupsRes,
          settingsRes, todosRes, outreachRecordsRes,
          warRoomActionsRes, warRoomOpportunitiesRes,
          jobApplicationsRes, notificationsRes
        ] = await Promise.allSettled([
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

        const freshCache: Record<string, any> = {}

        if (incomesRes.status === 'fulfilled' && incomesRes.value.ok) {
          const incomesData = await incomesRes.value.json()
          setIncomes(incomesData)
          freshCache.incomes = incomesData
        }
        if (expensesRes.status === 'fulfilled' && expensesRes.value.ok) {
          const expensesData = await expensesRes.value.json()
          setExpenses(expensesData)
          freshCache.expenses = expensesData
        }
        if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
          const clientsData = await clientsRes.value.json()
          setClients(clientsData)
          freshCache.clients = clientsData
        }
        if (followupsRes.status === 'fulfilled' && followupsRes.value.ok) {
          const followupsData = await followupsRes.value.json()
          setFollowups(followupsData)
          freshCache.followups = followupsData
        }
        if (todosRes.status === 'fulfilled' && todosRes.value.ok) {
          const todosData = await todosRes.value.json()
          setTodos(todosData)
          freshCache.todos = todosData
        }
        if (outreachRecordsRes.status === 'fulfilled' && outreachRecordsRes.value.ok) {
          const outreachData = await outreachRecordsRes.value.json()
          setOutreachRecords(outreachData)
          freshCache.outreachRecords = outreachData
        }
        if (warRoomActionsRes.status === 'fulfilled' && warRoomActionsRes.value.ok) {
          const actionsData = await warRoomActionsRes.value.json()
          setWarRoomActions(actionsData)
          freshCache.warRoomActions = actionsData
        }
        if (warRoomOpportunitiesRes.status === 'fulfilled' && warRoomOpportunitiesRes.value.ok) {
          const oppsData = await warRoomOpportunitiesRes.value.json()
          setWarRoomOpportunities(oppsData)
          freshCache.warRoomOpportunities = oppsData
        }
        if (jobApplicationsRes.status === 'fulfilled' && jobApplicationsRes.value.ok) {
          const jobsData = await jobApplicationsRes.value.json()
          setJobApplications(jobsData)
          freshCache.jobApplications = jobsData
        }
        if (notificationsRes.status === 'fulfilled' && notificationsRes.value.ok) {
          const notifsData = await notificationsRes.value.json()
          setNotifications(notifsData)
          freshCache.notifications = notifsData
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.ok) {
          const settingsData = await settingsRes.value.json()
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
        freshCache.monthlyIncome = totalMonthly

        // Save fresh cache
        try {
          localStorage.setItem('god_system_app_cache_v1', JSON.stringify(freshCache))
        } catch {
          // Ignore quota errors
        }
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
          {isLoading && (
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-primary to-purple-500 z-50 animate-pulse pointer-events-none" />
          )}
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
        </main>
      </div>
      <QuickAddDialog />
      <KarnaFloatingWidget />
    </div>
  )
}
