'use client'

import { useAppStore, type PageType } from '@/store/use-app-store'
import { useSoloLevelingStore } from '@/store/use-solo-leveling-store'
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
import { useEffect, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

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

  // Track visited pages to keep them mounted in memory: 0ms instantaneous page transitions!
  const [visitedPages, setVisitedPages] = useState<Set<PageType>>(() => new Set(['overview', currentPage]))

  useEffect(() => {
    setVisitedPages((prev) => {
      if (prev.has(currentPage)) return prev
      const next = new Set(prev)
      next.add(currentPage)
      return next
    })
  }, [currentPage])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Centralized instant scroll restoration on page shift
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any })
  }, [currentPage])

  // Load initial data with instant cache hydration and non-blocking background sync via single /api/bootstrap
  useEffect(() => {
    // 1. Instant hydration from localStorage cache if present (0ms delay)
    try {
      const cached = localStorage.getItem('samrajya_app_cache_v2') || localStorage.getItem('god_system_app_cache_v1')
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

    // 2. High-speed single HTTP fetch to /api/bootstrap (executes all DB queries concurrently in parallel on server)
    const loadData = async () => {
      try {
        const res = await fetch('/api/bootstrap', {
          headers: {
            'x-client-date': new Date().toISOString(),
            'x-timezone-offset': String(new Date().getTimezoneOffset()),
          },
        })

        if (res.ok) {
          const data = await res.json()
          if (data.incomes) setIncomes(data.incomes)
          if (data.expenses) setExpenses(data.expenses)
          if (data.clients) setClients(data.clients)
          if (data.followups) setFollowups(data.followups)
          if (data.todos) setTodos(data.todos)
          if (data.outreachRecords) setOutreachRecords(data.outreachRecords)
          if (data.warRoomActions) setWarRoomActions(data.warRoomActions)
          if (data.warRoomOpportunities) setWarRoomOpportunities(data.warRoomOpportunities)
          if (data.jobApplications) setJobApplications(data.jobApplications)
          if (data.notifications) setNotifications(data.notifications)

          if (data.settings?.monthlyTarget) {
            const mt = data.settings.monthlyTarget
            setMonthlyTarget(mt.income)
            if (mt.targetSocialMedia !== undefined) setTargetSocialMedia(mt.targetSocialMedia)
            if (mt.targetAIAutomation !== undefined) setTargetAIAutomation(mt.targetAIAutomation)
            if (mt.targetRetainer !== undefined) setTargetRetainer(mt.targetRetainer)
            if (mt.targetFreelance !== undefined) setTargetFreelance(mt.targetFreelance)
            if (mt.nameSocialMedia !== undefined) setNameSocialMedia(mt.nameSocialMedia)
            if (mt.nameAIAutomation !== undefined) setNameAIAutomation(mt.nameAIAutomation)
            if (mt.nameRetainer !== undefined) setNameRetainer(mt.nameRetainer)
            if (mt.nameFreelance !== undefined) setNameFreelance(mt.nameFreelance)
          }

          // Hydrate Solo Leveling store with zero extra network round-trips!
          if (data.soloLeveling) {
            useSoloLevelingStore.getState().setBootstrapData(data.soloLeveling)
          }

          // Recalculate monthly income
          const now = new Date()
          const monthIncomes = (data.incomes || []).filter((i: any) => {
            const d = new Date(i.date)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          })
          const totalMonthly = monthIncomes.reduce((s: number, i: any) => s + i.amount, 0)
          setMonthlyIncome(totalMonthly)

          // Save fresh compressed bundle to local cache
          try {
            localStorage.setItem('samrajya_app_cache_v2', JSON.stringify({
              ...data,
              monthlyIncome: totalMonthly,
            }))
          } catch {
            // Ignore quota errors
          }
        }
      } catch (error) {
        console.error('Failed to bootstrap app data:', error)
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

  // Component lookup map for clean rendering
  const pageComponents: Record<PageType, React.ReactNode> = useMemo(() => ({
    overview: <ExecutiveOverview />,
    sololeveling: <SoloLeveling />,
    wealth: <WealthEngine />,
    budget: <BudgetIntelligence />,
    business: <BusinessOperations />,
    clients: <ClientEmpire />,
    analytics: <AnalyticsChamber />,
    discipline: <DisciplineSystem />,
    warroom: <WarRoom />,
    karna: <KarnaAI />,
    calendar: <ImperialCalendar />,
    jobs: <JobSearch />,
  }), [])

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
        <main className="p-3 pb-28 lg:p-5 relative">
          {isLoading && (
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-primary to-purple-500 z-50 animate-pulse pointer-events-none" />
          )}

          {/* Kept-Alive Views: 0ms Instant Page Shifting without Unmounting or Stutter */}
          {Array.from(visitedPages).map((pageId) => {
            const isCurrent = currentPage === pageId
            return (
              <div
                key={pageId}
                className={cn(
                  "w-full",
                  isCurrent ? "block" : "hidden"
                )}
                style={{ display: isCurrent ? 'block' : 'none' }}
              >
                {pageComponents[pageId]}
              </div>
            )
          })}
        </main>
      </div>
      <QuickAddDialog />
      <KarnaFloatingWidget />
    </div>
  )
}
