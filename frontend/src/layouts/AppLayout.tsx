// AppLayout.tsx — FloraAI clean layout inspired by app/static/styles.css
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const isAssistantPage = location.pathname === '/assistant'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-page-bg)', position: 'relative' }}>
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
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 16px',
        paddingTop: isAssistantPage ? '16px' : '24px',
        paddingBottom: isAssistantPage ? '16px' : '88px',
        position: 'relative',
      }} className={`sm:px-6 lg:px-8 xl:px-10 ${isAssistantPage ? 'lg:pb-4' : 'lg:pb-16'}`}>
        {children}
      </main>

      {/* Desktop footer (hidden on /assistant page) */}
      {!isAssistantPage && (
        <div className="hidden lg:block">
          <Footer />
        </div>
      )}

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
