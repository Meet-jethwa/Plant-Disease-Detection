// AppLayout.tsx — Wraps all pages with proper large-scale website layout
import type { ReactNode } from 'react'
import { Navbar } from '../components/Navbar'
import { MobileHeader } from '../components/MobileHeader'
import { BottomNav } from '../components/BottomNav'
import { Footer } from '../components/Footer'

interface AppLayoutProps {
  children: ReactNode
  locationData: {
    location?: { city: string; state: string }
    weather?: { temperature_c: number; condition: string }
    risk_level?: string
  } | null
  isLocating: boolean
  onFetchLocation: () => void
  backendHealthy: boolean
}

export function AppLayout({ children, locationData, isLocating, onFetchLocation, backendHealthy }: AppLayoutProps) {
  return (
    <div className="min-h-screen min-h-dvh flex flex-col bg-[#F7F8F3]">
      {/* Desktop nav (lg+) */}
      <Navbar
        locationData={locationData}
        isLocating={isLocating}
        onFetchLocation={onFetchLocation}
        backendHealthy={backendHealthy}
      />

      {/* Mobile/tablet header (< lg) */}
      <MobileHeader />

      {/* Main content — allow full-bleed hero sections while keeping app spacing consistent */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-20 lg:pb-16">
        {children}
      </main>

      {/* Desktop footer */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
