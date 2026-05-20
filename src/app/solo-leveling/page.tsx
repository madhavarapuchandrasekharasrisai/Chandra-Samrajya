'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/use-app-store'

export default function SoloLevelingRedirect() {
  const router = useRouter()
  const { setCurrentPage } = useAppStore()

  useEffect(() => {
    setCurrentPage('sololeveling')
    router.replace('/')
  }, [setCurrentPage, router])

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-t-2 border-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-orange-500 font-semibold text-sm animate-pulse tracking-widest uppercase">
          ⚔️ ENTERING SOVEREIGN MODE...
        </p>
      </div>
    </div>
  )
}
