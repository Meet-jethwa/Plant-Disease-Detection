// LoginPage.tsx — BioScan Lab full-screen dark login
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout, Mail, Lock, ArrowRight, Scan, Shield } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }
    setIsLoading(true)
    setTimeout(() => { setIsLoading(false); navigate('/') }, 1200)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 60%)' }} />
      </div>
      {/* Bio grid */}
      <div className="bio-grid-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }} />

      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,212,255,0.1))',
            border: '1px solid rgba(0,255,136,0.35)',
            boxShadow: '0 0 28px rgba(0,255,136,0.2)', marginBottom: 16,
          }}>
            <Sprout style={{ width: 28, height: 28, color: 'var(--neon-green)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>FLORA</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 900, color: 'var(--neon-green)', textShadow: '0 0 16px rgba(0,255,136,0.5)' }}>AI</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
            PLANT INTELLIGENCE PLATFORM
          </p>
        </div>

        <div className="bio-card" style={{ padding: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '0.04em' }}>
            ACCESS TERMINAL
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24, fontFamily: 'var(--font-mono)' }}>
            Sign in to your BioScan account
          </p>

          {/* Google OAuth button */}
          <button
            type="button"
            id="login-google-btn"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '11px 18px', borderRadius: 8, marginBottom: 20,
              background: '#F0FAF4', border: '1px solid rgba(11,143,104,0.2)',
              color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'var(--font-body)',
            }}
          >
            <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              OR EMAIL
            </span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          <form onSubmit={handleLogin} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
                fontSize: '0.8rem', color: 'var(--neon-red)', fontFamily: 'var(--font-mono)',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-email" type="email" autoComplete="email"
                  placeholder="you@example.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input" style={{ paddingLeft: 40 }} required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <button type="button" id="login-forgot-btn" style={{ fontSize: '0.75rem', color: 'var(--neon-green)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Forgot?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="login-password" type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="input" style={{ paddingLeft: 40, paddingRight: 44 }} required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'} id="login-toggle-password"
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div
                onClick={() => setRemember(v => !v)}
                role="checkbox" aria-checked={remember} id="login-remember"
                style={{
                  width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                  background: remember ? 'var(--neon-green)' : 'transparent',
                  border: `1.5px solid ${remember ? 'var(--neon-green)' : 'rgba(11,143,104,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {remember && <svg viewBox="0 0 12 12" style={{ width: 10, height: 10 }}><path d="M2 6l3 3 5-5" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Remember me</span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }} id="login-submit-btn">
              {isLoading ? (
                <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'bio-spin 0.8s linear infinite' }} />
              ) : (
                <>ACCESS PLATFORM <ArrowRight style={{ width: 16, height: 16 }} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 18 }}>
            No account?{' '}
            <button type="button" style={{ color: 'var(--neon-green)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }} id="login-create-account-btn">
              Create one →
            </button>
          </p>
        </div>

        {/* Skip */}
        <button type="button" onClick={() => navigate('/scan')}
          style={{
            width: '100%', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', background: 'none', border: '1px solid var(--border-subtle)',
            borderRadius: 8, color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
            transition: 'all 0.15s ease', fontFamily: 'var(--font-body)',
          }}
          id="login-skip-btn"
        >
          <Scan style={{ width: 14, height: 14 }} />
          Try scanner without account
        </button>

        {/* Security note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <Shield style={{ width: 12, height: 12, color: 'var(--text-dim)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            256-bit encrypted · No data sold
          </span>
        </div>
      </div>
    </div>
  )
}
