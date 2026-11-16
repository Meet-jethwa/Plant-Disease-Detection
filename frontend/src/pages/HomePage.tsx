// HomePage.tsx — FloraAI calm, trustworthy agri-tech homepage
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Camera, CheckCircle2, ChevronDown,
  Eye, Scan, ShieldCheck,
  Activity, BookOpen, MessageSquare,
  Leaf, Microscope, Languages,
  Zap, Globe, Sparkles,
} from 'lucide-react'
import { useLang } from '../contexts/LanguageContext'

interface HomePageProps {
  onSelectSamplePreset?: (crop: string, sampleKey: string) => void
}

export function HomePage({ onSelectSamplePreset: _onSelectSamplePreset }: HomePageProps = {}) {
  const { t } = useLang()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Real data stats — no invented figures
  const quickStats = [
    { label: t('home.statsCrops'),     value: '4',  icon: Leaf },
    { label: t('home.statsDiseases'),  value: '34', icon: Microscope },
    { label: t('home.statsLanguages'), value: '8',  icon: Languages },
    { label: t('home.statsGuides'),    value: '10', icon: BookOpen },
  ]

  const steps = [
    { n: '1', icon: Camera,      title: t('home.step1Title'), desc: t('home.step1Desc') },
    { n: '2', icon: Activity,    title: t('home.step2Title'), desc: t('home.step2Desc') },
    { n: '3', icon: ShieldCheck, title: t('home.step3Title'), desc: t('home.step3Desc') },
  ]

  // 6 feature cards in a 3x2 grid (1 col mobile, 2 col tablet, 3 col desktop)
  const features = [
    {
      icon: Eye,
      title: t('home.featHeatmapTitle'),
      desc: t('home.featHeatmapDesc'),
      link: '/scan',
      linkLabel: t('home.featHeatmapAction'),
    },
    {
      icon: MessageSquare,
      title: t('home.featChatTitle'),
      desc: t('home.featChatDesc'),
      link: '/assistant',
      linkLabel: t('home.featChatAction'),
    },
    {
      icon: Leaf,
      title: t('home.featTrackingTitle'),
      desc: t('home.featTrackingDesc'),
      link: '/plants',
      linkLabel: t('home.featTrackingAction'),
    },
    {
      icon: Globe,
      title: t('home.featWeatherTitle'),
      desc: t('home.featWeatherDesc'),
      link: '/scan',
      linkLabel: t('home.featWeatherAction'),
    },
    {
      icon: BookOpen,
      title: t('home.featLibraryTitle'),
      desc: t('home.featLibraryDesc'),
      link: '/library',
      linkLabel: t('home.featLibraryAction'),
    },
    {
      icon: Zap,
      title: t('home.featInstantTitle'),
      desc: t('home.featInstantDesc'),
      link: '/scan',
      linkLabel: t('home.featInstantAction'),
    },
  ]

  const faqs = [
    { q: t('home.faq1Q'), a: t('home.faq1A') },
    { q: t('home.faq2Q'), a: t('home.faq2A') },
    { q: t('home.faq3Q'), a: t('home.faq3A') },
    { q: t('home.faq4Q'), a: t('home.faq4A') },
    { q: t('home.faq5Q'), a: t('home.faq5A') },
  ]

  return (
    <div className="flex flex-col gap-16 lg:gap-20 pb-12">

      {/* ── Hero Section ── */}
      <section className="relative rounded-2xl overflow-hidden border border-[#E4E7E2] bg-white shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col items-center text-center gap-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2F4F0] border border-[#E4E7E2] text-[var(--color-green-700)]">
              <span className="w-2 h-2 rounded-full bg-[var(--color-green-700)] shrink-0" />
              <span className="text-sm font-medium">
                {t('home.heroPill')}
              </span>
            </div>

            {/* Sentence-case Heading (Weight 700, 36-52px, no neon glow, no shadow) */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-ink)] leading-tight text-center">
                <span>{t('home.heroTitle1')} </span>
                <span className="text-[var(--color-green-700)]">{t('home.heroTitle2')} </span>
                <span>{t('home.heroTitle3')}</span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed max-w-xl text-center">
              {t('home.heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-3.5 flex-wrap pt-2">
              <Link
                to="/scan"
                className="btn btn-primary btn-lg inline-flex items-center gap-2 px-6"
              >
                <Scan className="w-5 h-5 shrink-0" />
                <span>{t('home.scanNowFree')}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                to="/library"
                className="btn btn-secondary btn-lg inline-flex items-center gap-2 px-6"
              >
                <BookOpen className="w-4 h-4 shrink-0 text-[var(--color-green-700)]" />
                <span>{t('nav.encyclopedia')}</span>
              </Link>
            </div>

            {/* Trust Points */}
            <div className="flex items-center justify-center gap-6 flex-wrap pt-2 border-t border-[#E4E7E2] w-full">
              {[
                { icon: CheckCircle2, text: t('home.badgeAnyDevice') },
                { icon: CheckCircle2, text: t('home.badgeSpeed') },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-[var(--color-green-700)] shrink-0" />
                  <span className="text-sm text-[var(--color-ink-2)] font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Natural Field Imagery */}
          <div className="lg:col-span-5 h-64 sm:h-80 lg:h-full min-h-[300px] relative overflow-hidden bg-[#F2F4F0] border-t lg:border-t-0 lg:border-l border-[#E4E7E2]">
            <img
              src="/bg_plant.png"
              alt="Crops in field"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Soft tint gradient scrim for high readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/30 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Verified Stats Bar ── */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map(stat => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-[#E4E7E2] p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-2.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] flex items-center justify-center shrink-0 text-[var(--color-green-700)]">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[var(--color-ink)] leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--color-ink-2)] mt-1.5 font-medium">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('home.threeSteps')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(step => {
            const Icon = step.icon
            return (
              <div
                key={step.n}
                className="bg-white rounded-2xl border border-[#E4E7E2] p-6 flex flex-col items-center text-center gap-3.5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] text-[var(--color-green-700)] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[var(--color-ink-2)] px-2.5 py-1 rounded-full bg-[#F2F4F0] border border-[#E4E7E2]">
                  Step {step.n}
                </span>
                <h3 className="text-lg font-bold text-[var(--color-ink)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Features Grid (3x2 grid, neutral 40px icon tiles) ── */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('home.labTools')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(feat => {
            const Icon = feat.icon
            return (
              <div
                key={feat.title}
                className="bg-white rounded-2xl border border-[#E4E7E2] p-6 flex flex-col items-center text-center justify-between shadow-sm hover:border-[var(--color-green-700)] transition-colors"
              >
                <div className="space-y-3.5 mb-6 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] flex items-center justify-center text-[var(--color-green-700)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-ink)]">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-2)] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <Link
                  to={feat.link}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-green-700)] hover:text-[var(--color-green-800)] transition-colors no-underline min-h-[44px]"
                >
                  <span>{feat.linkLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Field Usability Banner ── */}
      <section className="rounded-2xl border border-[#E4E7E2] bg-white p-6 sm:p-10 shadow-sm text-center">
        <div className="max-w-2xl mx-auto space-y-4 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('home.edgeTitle')}
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-ink-2)] leading-relaxed">
            {t('home.edgeDesc')}
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {[
              t('home.deviceMobile'),
              t('home.deviceDesktop'),
              t('home.deviceLab'),
              t('home.deviceField'),
              t('home.deviceDashboard'),
            ].map(d => (
              <span key={d} className="chip text-xs bg-[#F2F4F0] text-[var(--color-ink)] border border-[#E4E7E2]">
                {d}
              </span>
            ))}
          </div>

          <div className="flex justify-center gap-3 flex-wrap pt-4">
            <Link to="/scan" className="btn btn-primary inline-flex items-center gap-2">
              <Scan className="w-4 h-4" />
              <span>{t('home.startScanning')}</span>
            </Link>
            <Link to="/assistant" className="btn btn-secondary inline-flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>{t('home.askChat')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="space-y-6 max-w-3xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)]">
            {t('home.faqTitle')}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-[#E4E7E2] px-6 w-full shadow-sm divide-y divide-[#E4E7E2]">
          {faqs.map((faq, i) => (
            <div key={i} className="py-2">
              <button
                type="button"
                className="w-full flex items-center justify-between py-4 text-left cursor-pointer bg-transparent border-none min-h-[44px]"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                id={`faq-btn-${i}`}
              >
                <span className="text-sm sm:text-base font-semibold text-[var(--color-ink)] pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-green-700)] shrink-0 transition-transform ${
                    openFaq === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="pb-4 pt-1 animate-fade-in text-sm text-[var(--color-ink-2)] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final Calm CTA ── */}
      <section className="text-center max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-[#E4E7E2] p-8 sm:p-12 w-full flex flex-col items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#F2F4F0] border border-[#E4E7E2] text-[var(--color-green-700)] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-ink)]">
            {t('home.ctaReady')}
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] max-w-md">
            {t('home.ctaDesc')}
          </p>
          <Link to="/scan" className="btn btn-primary btn-lg inline-flex items-center gap-2 px-8 mt-2">
            <Scan className="w-5 h-5" />
            <span>{t('home.ctaLaunch')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
