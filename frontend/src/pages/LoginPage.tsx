// LoginPage.tsx — Clean, calm login screen for FloraAI
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout, Mail, Lock, ArrowRight, Scan, Shield, AlertTriangle } from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) { setError(t('auth.errorEmail')); return }
    if (!password.trim()) { setError(t('auth.errorPassword')); return }
    setIsLoading(true)
    setTimeout(() => { setIsLoading(false); navigate('/') }, 1200)
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-2xs">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
              Flora<span className="text-[var(--color-brand)]">AI</span>
            </h1>
            <p className="text-sm text-[var(--color-ink-2)] mt-1">
              {t('auth.subtitle')}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E4E7E2] bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-ink)]">
              {t('auth.title')}
            </h2>
          </div>

          {/* Google OAuth button */}
          <button
            type="button"
            id="login-google-btn"
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{t('auth.continueGoogle')}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-medium text-stone-500">
              {t('auth.orEmail')}
            </span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-stone-700 mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[44px]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-semibold text-stone-700">
                  {t('auth.password')}
                </label>
                <button
                  type="button"
                  id="login-forgot-btn"
                  className="text-sm font-medium text-emerald-700 hover:text-emerald-900 cursor-pointer"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 min-h-[44px]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  id="login-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer min-h-[32px]">
              <input
                type="checkbox"
                id="login-remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
              />
              <span className="text-sm text-stone-600 font-medium">
                {t('auth.rememberMe')}
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full min-h-[48px] flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
              id="login-submit-btn"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.submit')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-stone-500 pt-2">
            {t('auth.noAccount')}{' '}
            <button
              type="button"
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
              id="login-create-account-btn"
            >
              {t('auth.createOne')}
            </button>
          </p>
        </div>

        {/* Skip button */}
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
          id="login-skip-btn"
        >
          <Scan className="w-4 h-4 text-emerald-700" />
          <span>{t('auth.tryWithoutAccount')}</span>
        </button>

        {/* Advisory / Security note */}
        <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs">
          <Shield className="w-3.5 h-3.5" />
          <span>{t('auth.securityNote')}</span>
        </div>

      </div>
    </div>
  )
}
