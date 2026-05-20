'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, type JobApplicationEntry } from '@/store/use-app-store'
import { Plus, Briefcase, Calendar, Search, Building2, ExternalLink, Trash2, Flame, TrendingUp, Target, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format, isToday, startOfDay, subDays, isSameDay } from 'date-fns'

export function JobSearch() {
  const { jobApplications, addJobApplication, removeJobApplication, setJobApplications } = useAppStore()
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !role.trim()) return

    try {
      const res = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          source: source.trim(),
          notes: notes.trim(),
          appliedDate: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        const loggedJob = await res.json()
        addJobApplication(loggedJob)
        setCompany('')
        setRole('')
        setSource('')
        setNotes('')
      }
    } catch (error) {
      console.error('Failed to log job application:', error)
    }
  }

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/job-applications?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        removeJobApplication(id)
      }
    } catch (error) {
      console.error('Failed to delete job application:', error)
    }
  }

  const jobsToday = useMemo(() => {
    return jobApplications.filter(j => isToday(new Date(j.appliedDate))).length
  }, [jobApplications])

  const targetDailyJobs = 3
  const progressPercent = Math.min((jobsToday / targetDailyJobs) * 100, 100)

  // ── Streak Calculation ──
  // Count how many consecutive days (ending today or yesterday) the user applied for at least 1 job
  const streak = useMemo(() => {
    if (jobApplications.length === 0) return 0

    // Group applications by local date string
    const countByDate: Record<string, number> = {}
    jobApplications.forEach(j => {
      const dateKey = format(new Date(j.appliedDate), 'yyyy-MM-dd')
      countByDate[dateKey] = (countByDate[dateKey] || 0) + 1
    })

    let currentStreak = 0
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd')

    // If no applications today AND no applications yesterday, streak is zero
    if ((countByDate[todayStr] || 0) === 0 && (countByDate[yesterdayStr] || 0) === 0) {
      return 0
    }

    // Start checking from today if they applied today, otherwise from yesterday
    const startCheckDate = (countByDate[todayStr] || 0) > 0 ? new Date() : subDays(new Date(), 1)

    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(startCheckDate, i)
      const key = format(checkDate, 'yyyy-MM-dd')
      if ((countByDate[key] || 0) > 0) {
        currentStreak++
      } else {
        break
      }
    }

    return currentStreak
  }, [jobApplications])

  // ── Weekly Stats ──
  const weeklyStats = useMemo(() => {
    const now = new Date()
    let total = 0
    for (let i = 0; i < 7; i++) {
      const day = subDays(now, i)
      const count = jobApplications.filter(j => isSameDay(new Date(j.appliedDate), day)).length
      total += count
    }
    return total
  }, [jobApplications])

  const filteredJobs = jobApplications.filter(j => 
    j.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/job-applications', {
        method: 'DELETE',
      })
      if (res.ok) {
        setJobApplications([])
        setShowClearConfirm(false)
      }
    } catch (error) {
      console.error('Failed to clear job applications:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Progress Card */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Daily Job Applications</h2>
              <p className="text-white/40 text-sm">Stay consistent to build your career</p>
            </div>
          </div>

          {/* Streak + Weekly Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <p className="text-white/90 text-xl font-bold">{streak}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Day Streak</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-white/90 text-xl font-bold">{weeklyStats}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">This Week</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-white/90 text-xl font-bold">{jobApplications.length}</p>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">All Time</p>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-white/60">Today's Progress</span>
              <span className="text-2xl font-bold text-white">
                {jobsToday} <span className="text-white/40 text-sm font-normal">/ {targetDailyJobs}</span>
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            {jobsToday >= targetDailyJobs && (
              <p className="text-emerald-400 text-xs mt-3 font-medium">🎯 Daily target achieved! Excellent work.</p>
            )}
            {streak >= 3 && (
              <p className="text-orange-400 text-xs mt-2 font-medium">🔥 {streak}-day streak! Keep the momentum going.</p>
            )}
          </div>
        </div>

        {/* Add Job Form */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-base font-semibold text-white mb-4">Log New Application</h3>
          <form onSubmit={handleAddJob} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 ml-1">Company</label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 ml-1">Role</label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 ml-1">Platform/Source</label>
                <Input
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. LinkedIn, Foundit"
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 ml-1">Notes (Optional)</label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra info..."
                  className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10 mt-2">
              <Plus className="w-4 h-4 mr-2" /> Log Application
            </Button>
          </form>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">Application History</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies or roles..."
                className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 h-9 w-full"
              />
            </div>
            {jobApplications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                className="text-white/30 hover:text-red-400 hover:bg-red-400/10 text-xs flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Clear Confirmation */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-red-500/[0.05] border-b border-red-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">Delete all {jobApplications.length} applications?</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowClearConfirm(false)} className="text-white/50 hover:text-white text-xs h-7">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleClearAll} className="bg-red-500 hover:bg-red-600 text-white text-xs h-7">
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-2 sm:p-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent pr-1">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredJobs.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="py-12 text-center text-white/40"
                >
                  <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No job applications logged yet.</p>
                </motion.div>
              ) : (
                filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.02] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{job.company}</h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-white/50 text-xs flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {job.role}
                          </span>
                          <span className="text-white/50 text-xs flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(job.appliedDate), 'MMM d, yyyy h:mm a')}
                          </span>
                          {job.source && (
                            <span className="text-white/50 text-xs flex items-center">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {job.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-white/20 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
