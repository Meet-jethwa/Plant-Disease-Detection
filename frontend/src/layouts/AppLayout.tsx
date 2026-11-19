// AppLayout.tsx — FloraAI clean layout
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { MobileHeader } from '../components/MobileHeader'
import { BottomNav } from '../components/BottomNav'
import { Footer } from '../components/Footer'

interface AppLayoutProps {
  children: ReactNode
  locationData: {
    location?: { city: string; state?: string }
    weather?: { temperature_c: number; condition: string }
    risk_level?: string
  } | null
  isLocating: boolean
  onFetchLocation: () => void
  backendHealthy: boolean
}

export function AppLayout({ children, locationData, isLocating, onFetchLocation, backendHealthy }: AppLayoutProps) {
  const location = useLocation()
  const isAssistantPage = location.pathname === '/assistant'

  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--color-page-bg)]">
      {/* Desktop nav (lg+) */}
      <Navbar
        locationData={locationData}
        isLocating={isLocating}
        onFetchLocation={onFetchLocation}
        backendHealthy={backendHealthy}
      />

      {/* Mobile/tablet frosted-glass header (<lg) */}
      <MobileHeader />

      {/* Main content */}
      <main
        className={
          isAssistantPage
            ? 'flex-1 w-full flex flex-col min-h-0 overflow-hidden h-[calc(100dvh-56px)] lg:h-[calc(100dvh-70px)]'
            : 'flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-16'
        }
      >
        {children}
      </main>

      {/* Desktop footer (hidden on /assistant page) */}
      {!isAssistantPage && (
        <div className="hidden lg:block">
          <Footer />
        </div>
      )}

      {/* Mobile bottom navigation (hidden on /assistant page) */}
      {!isAssistantPage && <BottomNav />}
    </div>
  )
}
