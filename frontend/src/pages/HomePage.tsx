// HomePage.tsx — FloraAI Premium Home Page
import { Link } from 'react-router-dom'
import {
  ArrowRight, Camera, CheckCircle2, ChevronDown,
  Eye, Scan, ShieldCheck, Upload,
  HeartPulse, Activity, BookOpen, MessageSquare,
  Leaf, Microscope, TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { AnimatedPlant } from '../components/AnimatedPlant'

interface HomePageProps {
  onSelectSamplePreset: (crop: string, sampleKey: string) => void
}

export function HomePage({ onSelectSamplePreset }: HomePageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const quickStats = [
    { label: 'Plants Monitored', value: '8',  color: 'text-[#159A70]', accent: '#DDF3E8', border: '#B0D8C4' },
    { label: 'Total Scans',      value: '24', color: 'text-[#4677D5]', accent: '#EEF3FD', border: '#BFDBFE' },
    { label: 'Healthy',          value: '19', color: 'text-[#159A70]', accent: '#DDF3E8', border: '#B0D8C4' },
    { label: 'Need Attention',   value: '5',  color: 'text-[#E89B24]', accent: '#FEF3C7', border: '#FDE68A' },
  ]

  const samples = [
    { crop: 'rice',      label: 'Rice Blast',          severity: 'Moderate', key: 'rice_blast',             cls: 'badge-amber' },
    { crop: 'wheat',     label: 'Yellow Rust',          severity: 'High',     key: 'wheat_yellow_rust',       cls: 'badge-red'   },
    { crop: 'sugarcane', label: 'Red Rot',              severity: 'Severe',   key: 'sugarcane_red_rot',       cls: 'badge-red'   },
    { crop: 'cotton',    label: 'Bacterial Blight',     severity: 'Medium',   key: 'cotton_bacterial_blight', cls: 'badge-amber' },
  ]

  const cropIcons: Record<string, string> = {
    rice: 'R', wheat: 'W', sugarcane: 'S', cotton: 'C',
  }

  const steps = [
    {
      n: '01', icon: Camera,
      title: 'Scan',
      desc: 'Upload or capture a clear photo of the affected leaf.',
      color: '#159A70',
    },
    {
      n: '02', icon: Activity,
      title: 'Analyze',
      desc: 'AI identifies disease patterns and highlights affected regions.',
      color: '#4677D5',
    },
    {
      n: '03', icon: ShieldCheck,
      title: 'Act',
      desc: 'Receive treatment, prevention, and care recommendations.',
      color: '#E89B24',
    },
  ]

  const features = [
    {
      icon: Eye,
      accentBg: '#FEF3C7', accentBorder: '#FDE68A', iconColor: '#D97706',
      title: 'Visual AI Analysis',
      desc: 'See exactly where disease is affecting the leaf. Color-coded heatmaps reveal infection zones at a glance.',
      link: '/scan', linkLabel: 'Try Scanner',
    },
    {
      icon: MessageSquare,
      accentBg: '#DDF3E8', accentBorder: '#B0D8C4', iconColor: '#159A70',
      title: 'AI Chat',
      desc: 'Ask about disease, watering, fertilizer, and crop care. Get instant expert answers 24/7.',
      link: '/assistant', linkLabel: 'Ask AI Chat',
    },
    {
      icon: TrendingUp,
      accentBg: '#EEF3FD', accentBorder: '#BFDBFE', iconColor: '#4677D5',
      title: 'Health Tracking',
      desc: 'Monitor plant health and recovery over time with visual health score graphs.',
      link: '/plants', linkLabel: 'View My Plants',
    },
    {
      icon: BookOpen,
      accentBg: '#F3EFFE', accentBorder: '#DDD6FE', iconColor: '#8A5CF6',
      title: 'Plant Encyclopedia',
      desc: 'Browse diseases across supported crops. Full disease profiles with causes, prevention, and photo examples.',
      link: '/library', linkLabel: 'Browse Library',
    },
  ]

  const faqs = [
    {
      q: 'How does FloraAI identify plant diseases?',
      a: 'FloraAI uses a deep learning model trained on thousands of verified plant pathology images. It analyzes visible leaf patterns and highlights exact infected areas so you can see exactly why the diagnosis was made.',
    },
    {
      q: 'How accurate is the AI diagnosis?',
      a: 'Our models achieve 90–96% accuracy on supported crop diseases. Confidence scores are shown alongside every diagnosis so you can gauge reliability before acting.',
    },
    {
      q: 'Why does local weather affect diagnosis?',
      a: 'High humidity and rainfall create ideal conditions for fungal spores to spread. FloraAI uses your local weather to provide a real-time disease risk level alongside your diagnosis.',
    },
    {
      q: 'Are treatment recommendations organic?',
      a: 'We provide both organic remedies (neem oil, copper sprays, proper pruning) and conventional chemical treatments depending on your preference and the severity of infection.',
    },
    {
      q: 'Can I use FloraAI without an account?',
      a: 'Yes. You can scan your first plant without an account. An account is only required to save your plant history and track health over time.',
    },
    {
      q: 'Can I track my plant\'s health over time?',
      a: 'Yes. My Plants lets you follow a plant\'s health score across multiple scans, track treatment progress, and compare diagnoses week by week.',
    },
  ]

  const journeyDays = [
    { day: 'Day 1',  label: 'Disease detected', score: 64,  color: '#D9534F' },
    { day: 'Day 7',  label: 'Treatment applied', score: 71,  color: '#E89B24' },
    { day: 'Day 14', label: 'Health improving',  score: 82,  color: '#E89B24' },
    { day: 'Day 21', label: 'Healthy',           score: 94,  color: '#159A70' },
  ]

  return (
    <div className="space-y-24 pb-8">

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-2">

        {/* Left — Headlines */}
        <div className="space-y-8">
          {/* Eyebrow */}
          <p className="eyebrow">Smart Plant Diagnostics</p>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#17211D] leading-[1.1] tracking-tight">
              Know what's wrong<br />
              <span className="text-gradient">with your plant.</span>
            </h1>
            <p className="text-[#66736C] text-lg leading-relaxed max-w-lg">
              AI-powered disease detection with visual explanations and practical treatment guidance.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/scan" className="btn btn-primary btn-lg gap-2">
              <Scan className="w-4.5 h-4.5" />
              Scan a Plant
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/scan" className="btn btn-secondary btn-lg gap-2">
              <Upload className="w-4 h-4 text-[#66736C]" />
              Upload Leaf Photo
            </Link>
          </div>

          {/* Checkmarks */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['AI diagnosis', 'Visual heatmap', 'Treatment guidance'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#66736C]">
                <CheckCircle2 className="w-4 h-4 text-[#159A70] shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — AI Diagnosis Panel + Animated Plant */}
        <div className="relative">

          {/* Animated plant — decorative, behind the panel */}
          <div
            className="absolute -top-10 -left-6 pointer-events-none select-none z-0"
            aria-hidden="true"
          >
            <AnimatedPlant width={150} className="opacity-90 drop-shadow-sm" />
          </div>

          {/* Second plant — smaller, right side accent */}
          <div
            className="absolute -bottom-6 -right-4 pointer-events-none select-none z-0 hidden sm:block"
            aria-hidden="true"
          >
            <AnimatedPlant
              width={90}
              className="opacity-60 scale-x-[-1]"
            />
          </div>

          {/* Diagnosis panel — sits above the plants */}
          <div className="relative z-10">
            <div className="bg-white rounded-3xl border border-[#E0EBE4] shadow-lg shadow-black/5 p-5 space-y-4">
              {/* Panel header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#159A70] animate-pulse-dot" />
                  <span className="text-sm font-semibold text-[#17211D]">AI Diagnosis</span>
                </div>
                <span className="badge badge-green text-xs">94.7% confidence</span>
              </div>

              {/* Leaf visual */}
              <div className="relative rounded-2xl overflow-hidden bg-[#0B2F24] aspect-[4/3]">
                {/* Simulated leaf */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Leaf className="w-32 h-32 text-[#159A70]/40 fill-[#159A70]/20" />
                </div>
                {/* Heatmap overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#E89B24]/10 to-[#D9534F]/20" />
                {/* Disease region markers */}
                <div className="absolute top-[28%] left-[38%] w-10 h-6 rounded-full bg-[#D9534F]/50 blur-sm" />
                <div className="absolute top-[45%] left-[55%] w-7 h-5 rounded-full bg-[#E89B24]/50 blur-sm" />
                <div className="absolute top-[60%] left-[30%] w-8 h-4 rounded-full bg-[#D9534F]/40 blur-sm" />
                {/* Scan line */}
                <div className="absolute inset-x-0 h-0.5 bg-[#159A70]/50 animate-scan-line" style={{ top: '40%' }} />

                {/* Bottom overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-xs mb-0.5">Detected</p>
                      <p className="text-white font-semibold text-sm">Rice — Rice Blast</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#4ADE80] text-xl font-bold">64</p>
                      <p className="text-white/50 text-[10px]">/100 Health</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F7F8F3] border border-[#E0EBE4] p-3">
                  <p className="text-[11px] text-[#66736C] mb-1">Severity</p>
                  <p className="text-sm font-semibold text-[#E89B24]">Moderate</p>
                </div>
                <div className="rounded-xl bg-[#F7F8F3] border border-[#E0EBE4] p-3">
                  <p className="text-[11px] text-[#66736C] mb-1">Risk</p>
                  <p className="text-sm font-semibold text-[#E89B24]">Needs Attention</p>
                </div>
              </div>

              <Link
                to="/scan"
                className="flex items-center gap-2 text-sm text-[#159A70] font-semibold hover:underline"
              >
                <Eye className="w-4 h-4" />
                View Heatmap
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUICK STATS
      ══════════════════════════════════════ */}
      <section>
        <div className="mb-6">
          <p className="eyebrow mb-1">Dashboard</p>
          <h2 className="text-2xl font-bold text-[#17211D]">Your Plant Health</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="text-xs text-[#66736C] font-medium mb-3">{stat.label}</p>
              <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
              <div
                className="mt-3 h-1 rounded-full"
                style={{ background: stat.accent, border: `1px solid ${stat.border}` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <p className="eyebrow">Process</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#17211D]">How FloraAI Works</h2>
          <p className="text-[#66736C] text-lg max-w-xl mx-auto">
            From leaf photo to actionable plant care in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-0 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="relative flex flex-col items-center text-center p-8">
                {/* Connector line between steps on desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-[52px] left-[calc(50%+40px)] right-0 h-px bg-[#E0EBE4] z-0" />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-sm relative z-10"
                  style={{ background: step.color + '15', border: `1.5px solid ${step.color}25` }}
                >
                  <Icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                <span className="text-xs font-bold tracking-widest mb-2" style={{ color: step.color }}>
                  {step.n}
                </span>
                <h3 className="text-xl font-semibold text-[#17211D] mb-2">{step.title}</h3>
                <p className="text-[#66736C] text-sm leading-relaxed max-w-[220px]">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          XAI / HEATMAP SECTION
      ══════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — heatmap visual */}
        <div className="relative">
          <div className="rounded-3xl overflow-hidden bg-[#0B2F24] aspect-[4/3] shadow-2xl shadow-[#12372A]/20">
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-40 h-40 text-[#159A70]/30 fill-[#159A70]/15" />
            </div>
            {/* Simulated heatmap overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D9534F]/20 via-[#E89B24]/15 to-transparent" />
            <div className="absolute top-[25%] left-[35%] w-14 h-10 rounded-full bg-[#D9534F]/60 blur-md" />
            <div className="absolute top-[42%] left-[52%] w-10 h-8 rounded-full bg-[#E89B24]/55 blur-md" />
            <div className="absolute top-[58%] left-[28%] w-12 h-6 rounded-full bg-[#D9534F]/45 blur-md" />
            <div className="absolute top-[35%] left-[60%] w-8 h-6 rounded-full bg-[#E89B24]/40 blur-md" />

            {/* Label overlay */}
            <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
              <p className="text-white text-xs font-semibold">Grad-CAM Heatmap</p>
              <p className="text-white/60 text-[10px]">AI attention visualization</p>
            </div>
          </div>
        </div>

        {/* Right — details */}
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-3">Explainable AI</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#17211D] mb-3">
              See why AI made the diagnosis.
            </h2>
            <p className="text-[#66736C] text-lg leading-relaxed">
              FloraAI doesn't just name a disease — it visually shows you which parts of the leaf triggered the prediction.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-[#E0EBE4] bg-white">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#17211D]">Early Blight</span>
                <span className="badge badge-amber">94.7% confidence</span>
              </div>
              <div className="flex gap-4 text-sm mt-2">
                <div>
                  <p className="text-[11px] text-[#66736C]">Severity</p>
                  <p className="font-medium text-[#E89B24]">Moderate</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#E0EBE4] bg-white space-y-2">
              <p className="text-xs font-semibold text-[#66736C] uppercase tracking-wider">AI detected</p>
              {['Brown lesions on leaf surface', 'Yellowing around infected areas', 'Characteristic concentric ring pattern', 'Disease spreading from older leaves'].map(point => (
                <div key={point} className="flex items-center gap-2 text-sm text-[#17211D]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#159A70] shrink-0" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <Link to="/scan" className="btn btn-primary gap-2 inline-flex">
            <Microscope className="w-4 h-4" />
            Explore Full Analysis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES GRID
      ══════════════════════════════════════ */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <p className="eyebrow">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#17211D]">Everything your plant needs.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map(f => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card p-7 space-y-4 flex flex-col card-hover">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: f.accentBg, border: `1px solid ${f.accentBorder}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: f.iconColor }} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-lg font-semibold text-[#17211D]">{f.title}</h3>
                  <p className="text-[#66736C] text-sm leading-relaxed">{f.desc}</p>
                </div>
                <Link
                  to={f.link}
                  className="text-sm font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all"
                  style={{ color: f.iconColor }}
                >
                  {f.linkLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════
          PLANT HEALTH JOURNEY
      ══════════════════════════════════════ */}
      <section className="card p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <p className="eyebrow">Health Tracking</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D]">Your plant's recovery journey</h2>
            <p className="text-[#66736C] leading-relaxed">
              Track how your plant responds to treatment week by week. Visual health scores make recovery tangible.
            </p>
            <Link to="/plants" className="btn btn-secondary gap-2 inline-flex">
              <HeartPulse className="w-4 h-4 text-[#159A70]" />
              View My Plants
            </Link>
          </div>

          <div className="space-y-3">
            {journeyDays.map((d, idx) => (
              <div key={d.day} className="flex items-center gap-4">
                <div className="w-14 text-xs font-semibold text-[#66736C] shrink-0">{d.day}</div>
                <div className="flex-1 bg-[#F7F8F3] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.score}%`,
                      background: d.color,
                      opacity: 0.7 + idx * 0.1,
                    }}
                  />
                </div>
                <div className="w-8 text-xs font-bold shrink-0" style={{ color: d.color }}>{d.score}</div>
                <div className="text-xs text-[#66736C] hidden sm:block w-36 shrink-0">{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SAMPLE DIAGNOSES
      ══════════════════════════════════════ */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Try a Sample Diagnosis</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D]">Explore common plant diseases</h2>
          </div>
          <Link to="/scan" className="btn btn-secondary gap-2 shrink-0">
            Open Scanner
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samples.map(s => (
            <div
              key={s.key}
              className="card p-5 space-y-4 flex flex-col justify-between card-hover cursor-pointer"
              onClick={() => onSelectSamplePreset(s.crop, s.key)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FAF4] border border-[#B0D8C4] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#159A70]">{cropIcons[s.crop]}</span>
                  </div>
                  <span className={`badge ${s.cls}`}>{s.severity}</span>
                </div>
                <h4 className="text-base font-semibold text-[#17211D] mb-1">{s.label}</h4>
                <p className="text-xs text-[#66736C] capitalize">{s.crop} disease</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onSelectSamplePreset(s.crop, s.key) }}
                className="btn btn-outline btn-sm w-full gap-1.5"
              >
                <Scan className="w-3.5 h-3.5" />
                View Diagnosis
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="eyebrow">FAQ</p>
          <h2 className="text-3xl font-bold text-[#17211D]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-[#E0EBE4] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-6 font-medium text-[#17211D] cursor-pointer hover:bg-[#F7F8F3] transition-colors"
                aria-expanded={openFaq === i}
              >
                <span className="text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#66736C] transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-[#66736C] leading-relaxed border-t border-[#EEF4EE] pt-4 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════ */}
      <section>
        <div className="bg-[#12372A] rounded-3xl p-10 sm:p-16 text-center space-y-7 relative overflow-hidden">
          {/* Subtle botanical texture */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
            <Leaf className="w-full h-full text-white fill-white" />
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 opacity-5 -rotate-45">
            <Leaf className="w-full h-full text-white fill-white" />
          </div>

          <div className="relative space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Your plants can't tell you what's wrong.
            </h2>
            <p className="text-white/65 text-lg max-w-xl mx-auto">
              FloraAI can help you find out.
            </p>
          </div>

          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/scan"
              className="btn bg-white text-[#12372A] hover:bg-[#DDF3E8] font-semibold text-base px-8 py-3 rounded-xl gap-2"
            >
              <Scan className="w-4 h-4" />
              Scan Your Plant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="relative text-white/40 text-sm">Free to start · No account required</p>
        </div>
      </section>

    </div>
  )
}
