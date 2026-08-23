// AppLayout.tsx — Standardized Engineering Container
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar
        locationData={locationData}
        isLocating={isLocating}
        onFetchLocation={onFetchLocation}
        backendHealthy={backendHealthy}
      />

      <MobileHeader />

      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 48px 20px' }}>
        {children}
      </main>

      <div className="hidden lg:block">
        <Footer />
      </div>

      <BottomNav />
    </div>
  )
}