// LoginPage.tsx — Authentication Gateway
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Microscope, Mail, Lock, ArrowRight, Scan } from 'lucide-react'

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

    if (!email.trim()) { setError('Please enter your researcher email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      navigate('/')
    }, 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Brand */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#159A70', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Microscope style={{ width: '24px', height: '24px', color: '#ffffff' }} />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pathology Diagnostic System</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>Sign in to access model inferencing & audit logs</p>
        </div>

        {/* Card */}
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ padding: '10px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '12px' }}>
                {error}
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ width: '15px', height: '15px', color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="researcher@lab.ac.in"
                  style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ width: '15px', height: '15px', color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '9px 34px 9px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  {showPassword ? <EyeOff style={{ width: '15px', height: '15px' }} /> : <Eye style={{ width: '15px', height: '15px' }} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#159A70',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Terminal'}
              {!isLoading && <ArrowRight style={{ width: '14px', height: '14px' }} />}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/scan')}
            style={{ width: '100%', marginTop: '14px', padding: '10px', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Scan style={{ width: '13px', height: '13px' }} />
            Bypass & Launch Scanner Directly
          </button>
        </div>

      </div>
    </div>
  )
}