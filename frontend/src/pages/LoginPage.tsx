// LoginPage.tsx — Email + password login form with Google OAuth UI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf, Mail, Lock, ArrowRight, Scan } from 'lucide-react'

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
    // Simulate login — replace with real auth call
    setTimeout(() => {
      setIsLoading(false)
      navigate('/')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#F7F8F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#159A70] rounded-2xl shadow-md mb-4">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#17211D]">Welcome back</h1>
          <p className="text-sm text-[#66736C] mt-1">Sign in to FloraAI</p>
        </div>

        <div className="card-lg p-6 shadow-xl">
          {/* Google OAuth (UI only) */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-[#D4E8DC] rounded-xl py-3 px-4 mb-5 text-sm font-600 text-[#10231D] hover:bg-[#F0FBF5] transition-colors"
            id="login-google-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#D4E8DC]" />
            <span className="text-xs text-[#94A09B] font-500">or sign in with email</span>
            <div className="flex-1 h-px bg-[#D4E8DC]" />
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-600 text-[#64736C] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A09B] pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-xs font-600 text-[#64736C]">Password</label>
                <button
                  type="button"
                  className="text-xs text-[#0B8F68] font-600 hover:underline"
                  id="login-forgot-btn"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A09B] pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A09B] hover:text-[#0B8F68] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  id="login-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${remember ? 'bg-[#0B8F68] border-[#0B8F68]' : 'border-[#D4E8DC] bg-white'}`}
                onClick={() => setRemember(v => !v)}
                role="checkbox"
                aria-checked={remember}
                aria-label="Remember me"
                id="login-remember"
              >
                {remember && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-white">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-[#64736C]">Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full gap-2 mt-2"
              id="login-submit-btn"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Create account */}
          <p className="text-center text-sm text-[#64736C] mt-5">
            Don't have an account?{' '}
            <button type="button" className="text-[#0B8F68] font-600 hover:underline" id="login-create-account-btn">
              Create account
            </button>
          </p>
        </div>

        {/* Try without account */}
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-[#64736C] hover:text-[#0B8F68] transition-colors font-500"
          id="login-skip-btn"
        >
          <Scan className="w-4 h-4" />
          Try the scanner without an account
        </button>
      </div>
    </div>
  )
}
