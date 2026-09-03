// AppLayout.tsx — BioScan Lab dark wrapper
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-void)', position: 'relative' }}>
      {/* Ambient background blobs */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 15% 15%, rgba(0,255,136,0.04) 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 85% 80%, rgba(0,212,255,0.03) 0%, transparent 50%)
        `,
      }} />

      {/* Bio grid overlay */}
      <div className="bio-grid-bg" style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.7,
      }} />

      {/* Desktop nav (lg+) */}
      <Navbar
        locationData={locationData}
        isLocating={isLocating}
        onFetchLocation={onFetchLocation}
        backendHealthy={backendHealthy}
      />

      {/* Mobile/tablet header (<lg) */}
      <MobileHeader />

      {/* Main content — overflow-x hidden to contain hero negative margins */}
      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 16px',
        paddingTop: '24px',
        paddingBottom: '88px',
        position: 'relative',
        zIndex: 1,
        overflowX: 'hidden',
      }} className="sm:px-6 lg:px-8 xl:px-10 lg:pb-16">
        {children}
      </main>

      {/* Desktop footer */}
      <div className="hidden lg:block" style={{ position: 'relative', zIndex: 1 }}>
        <Footer />
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  )
}
