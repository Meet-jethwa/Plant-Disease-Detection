// HomePage.tsx — BioScan Lab Hero + Features
import { Link } from 'react-router-dom'
import {
  ArrowRight, Camera, CheckCircle2, ChevronDown,
  Eye, Scan, ShieldCheck,
  HeartPulse, Activity, BookOpen, MessageSquare,
  Leaf, Microscope, TrendingUp, Zap, Globe, FlaskConical,
} from 'lucide-react'
import { useState } from 'react'

interface HomePageProps {
  onSelectSamplePreset?: (crop: string, sampleKey: string) => void
}

export function HomePage({ onSelectSamplePreset: _onSelectSamplePreset }: HomePageProps = {}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const quickStats = [
    { label: 'Diseases Detected', value: '127+', color: '#0B8F68', accent: '#F0FAF4', border: 'rgba(11,143,104,0.2)', icon: Microscope },
    { label: 'Scans Analyzed',    value: '2.4M+', color: '#0EA5E9', accent: '#F0F9FF', border: 'rgba(14,165,233,0.2)', icon: Scan },
    { label: 'Crops Supported',   value: '18+',   color: '#D97706', accent: '#FFFBEB', border: 'rgba(217,119,6,0.2)', icon: Leaf },
    { label: 'AI Accuracy',       value: '97.3%', color: '#0B8F68', accent: '#F0FAF4', border: 'rgba(11,143,104,0.2)', icon: TrendingUp },
  ]

  const steps = [
    { n: '01', icon: Camera,     title: 'Capture', desc: 'Upload or capture a clear photo of the affected leaf or plant tissue.', color: 'var(--neon-green)' },
    { n: '02', icon: Activity,   title: 'Analyze',  desc: 'AI model runs multi-class detection and Grad-CAM heatmap generation.', color: 'var(--neon-cyan)' },
    { n: '03', icon: ShieldCheck, title: 'Respond', desc: 'Receive diagnosis, risk score, treatment protocols and prevention tips.', color: 'var(--neon-amber)' },
  ]

  const features = [
    {
      icon: Eye, color: '#D97706',
      accent: '#FFFBEB', border: 'rgba(217,119,6,0.2)',
      title: 'Visual AI Heatmaps', badge: 'GRAD-CAM',
      desc: 'Proprietary Grad-CAM visualization shows precisely where infection is located on the leaf — down to the cellular level.',
      link: '/scan', linkLabel: 'Run Scanner',
    },
    {
      icon: MessageSquare, color: '#0B8F68',
      accent: '#F0FAF4', border: 'rgba(11,143,104,0.2)',
      title: 'AI Expert Chat', badge: 'GEMINI',
      desc: 'Powered by Gemini AI, get instant expert-level answers on disease management, fertilizers, and crop care protocols.',
      link: '/assistant', linkLabel: 'Open Chat',
    },
    {
      icon: TrendingUp, color: '#0EA5E9',
      accent: '#F0F9FF', border: 'rgba(14,165,233,0.2)',
      title: 'Health Tracking', badge: 'LIVE',
      desc: 'Monitor recovery curves and plant health scores over time with auto-generated progress analytics.',
      link: '/plants', linkLabel: 'My Plants',
    },
    {
      icon: Globe, color: '#0B8F68',
      accent: '#F0FAF4', border: 'rgba(11,143,104,0.2)',
      title: 'Weather Risk Intel', badge: 'LIVE',
      desc: 'Correlates local weather conditions with disease spread probability, giving you a real-time infection risk score.',
      link: '/scan', linkLabel: 'Check Risk',
    },
    {
      icon: FlaskConical, color: '#8B5CF6',
      accent: '#F5F3FF', border: 'rgba(139,92,246,0.2)',
      title: 'Disease Encyclopedia', badge: '127 DISEASES',
      desc: 'Comprehensive reference library of plant diseases with symptoms, lifecycle, and treatment databases.',
      link: '/library', linkLabel: 'Explore',
    },
    {
      icon: Zap, color: '#D97706',
      accent: '#FFFBEB', border: 'rgba(217,119,6,0.2)',
      title: 'Instant Diagnosis', badge: '<3 SEC',
      desc: 'Diagnosis results in under 3 seconds. Upload from any device — optimized for field use on mobile and tablet.',
      link: '/scan', linkLabel: 'Try Now',
    },
  ]

  const faqs = [
    { q: 'Which crops are currently supported?', a: 'BioScan currently supports Rice, Wheat, Sugarcane, and Cotton, with more crops being added regularly. Our AI model is trained on 127+ disease classes across these crops.' },
    { q: 'How accurate is the disease detection?', a: 'Our AI model achieves 97.3% accuracy on our validation dataset. Accuracy can vary based on image quality, lighting, and disease stage. We recommend capturing clear, well-lit photos of the affected area.' },
    { q: 'Is my data private?', a: 'Yes. Your uploaded images are processed locally on our secure servers and are never shared with third parties. Scan data is stored only in your local browser session.' },
    { q: 'Can I use BioScan offline?', a: 'Currently BioScan requires an internet connection for AI analysis. We are working on a lightweight offline model for field use.' },
    { q: 'What image format and size works best?', a: 'JPG, PNG, or WebP images up to 10MB. For best results, capture the leaf against a plain background in natural light at 2-4 megapixel resolution.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

      {/* ── Hero Section — full bleed with bg_plant.png background ── */}
      <section style={{ position: 'relative', margin: '0 -16px' }} className="sm:-mx-6 lg:-mx-8 xl:-mx-10">
        {/* Background image container */}
        <div style={{
          position: 'relative',
          minHeight: 'clamp(600px, 80vh, 800px)',
          borderRadius: '0 0 36px 36px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* The plant background image */}
          <img
            src="/bg_plant.png"
            alt="Agricultural Plant Background"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 35%',
            }}
          />

          {/* Transparent contrast overlay — clear background image visibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              linear-gradient(
                180deg,
                rgba(4, 47, 35, 0.55) 0%,
                rgba(11, 143, 104, 0.25) 50%,
                rgba(250, 253, 250, 0.96) 100%
              )
            `,
          }} />

          {/* Content — No white box, pure text over background image */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 24,
            padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 64px)',
            width: '100%', maxWidth: 900, margin: '0 auto',
          }}>
            {/* Eyebrow pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', borderRadius: 999,
              background: 'rgba(6, 78, 59, 0.85)',
              border: '1px solid rgba(61, 255, 143, 0.4)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
            }}>
              <span className="status-dot status-dot-green" style={{ width: 8, height: 8 }} />
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#3DFF8F',
                fontFamily: 'var(--font-mono)',
              }}>
                FLORA AI — PLANT DISEASE INTELLIGENCE
              </span>
            </div>

            {/* Main headline — WHITE + ELECTRIC MINT */}
            <div style={{ maxWidth: 840 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 8.5vw, 5.8rem)',
                fontWeight: 900, lineHeight: 1.0,
                letterSpacing: '-0.02em', marginBottom: 10,
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}>
                <span style={{ display: 'block' }}>
                  DIAGNOSE
                </span>
                <span style={{ display: 'block', color: '#3DFF8F', textShadow: '0 0 24px rgba(61,255,143,0.5)' }}>
                  PLANT DISEASE
                </span>
              </h1>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.8rem, 8.5vw, 5.8rem)',
                fontWeight: 900, lineHeight: 1.0,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}>
                IN SECONDS
              </h2>
            </div>

            {/* Sub-description */}
            <p style={{
              maxWidth: 600, fontSize: '1.1rem', lineHeight: 1.8,
              color: '#FFFFFF', fontWeight: 600,
              textShadow: '0 2px 10px rgba(0,0,0,0.8)',
            }}>
              Upload a leaf photo and get an instant AI-powered diagnosis with Grad-CAM heatmaps,
              disease risk scores, and step-by-step treatment protocols.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link
                to="/scan"
                className="btn btn-primary btn-lg"
                style={{ paddingLeft: 32, paddingRight: 32, fontSize: '0.95rem' }}
              >
                <Scan style={{ width: 18, height: 18 }} />
                <span>SCAN NOW — FREE</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
              <Link
                to="/library"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 24px', borderRadius: 10,
                  background: '#FFFFFF',
                  border: '1px solid rgba(11,143,104,0.3)',
                  color: '#0B8F68', fontSize: '0.9375rem', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.18s ease',
                  boxShadow: '0 2px 10px rgba(11,143,104,0.06)',
                }}
              >
                <BookOpen style={{ width: 16, height: 16 }} />
                Browse Library
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
              {[
                { icon: CheckCircle2, text: 'No signup required' },
                { icon: CheckCircle2, text: 'Works on any device' },
                { icon: CheckCircle2, text: 'Results in < 3 seconds' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <item.icon style={{ width: 14, height: 14, color: '#0B8F68' }} />
                  <span style={{ fontSize: '0.82rem', color: '#4B5563', fontWeight: 500 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {quickStats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bio-card" style={{
                padding: '20px 22px',
                background: stat.accent,
                border: `1px solid ${stat.border}`,
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#FFFFFF',
                  border: `1px solid ${stat.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}>
                  <Icon style={{ width: 18, height: 18, color: stat.color }} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.04em' }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>HOW IT WORKS</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            THREE STEPS TO DIAGNOSIS
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, position: 'relative' }}>
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.n} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div className="step-connector" style={{ display: 'none' }} />
                )}
                <div className="bio-card" style={{ padding: '28px 24px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700,
                      color: step.color, letterSpacing: '0.1em', opacity: 0.7,
                    }}>{step.n}</span>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${step.color}15`,
                      border: `1px solid ${step.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 18, height: 18, color: step.color }} />
                    </div>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700,
                    color: step.color, marginBottom: 10, letterSpacing: '0.05em',
                  }}>{step.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>CAPABILITIES</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            LAB-GRADE TOOLS
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {features.map(feat => {
            const Icon = feat.icon
            return (
              <div key={feat.title} className="bio-card" style={{ padding: '24px', background: feat.accent, border: `1px solid ${feat.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: '#FFFFFF', border: `1px solid ${feat.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}>
                    <Icon style={{ width: 20, height: 20, color: feat.color }} />
                  </div>
                  <span className="badge" style={{
                    background: '#FFFFFF', color: feat.color,
                    border: `1px solid ${feat.border}`, fontSize: '0.6rem',
                  }}>{feat.badge}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '0.02em' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 16 }}>{feat.desc}</p>
                <Link to={feat.link} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: '0.8rem', fontWeight: 600, color: feat.color,
                  textDecoration: 'none', letterSpacing: '0.04em',
                  transition: 'gap 0.15s ease',
                }}>
                  <span>{feat.linkLabel}</span>
                  <ArrowRight style={{ width: 13, height: 13 }} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Capabilities Showcase (full-width banner) ── */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,212,255,0.05) 100%)',
        border: '1px solid rgba(0,255,136,0.12)',
        borderRadius: 20, padding: 'clamp(32px, 5vw, 60px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
          }} />
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
          <p className="eyebrow">BIOSCAN EDGE</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            BUILT FOR FARMS,<br />
            <span style={{ color: 'var(--neon-green)', textShadow: '0 0 20px rgba(0,255,136,0.3)' }}>LABS AND FIELDS</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 520 }}>
            BioScan works on any device — whether you're in a greenhouse, in a lab, or in the middle of a field with just your phone.
            Designed to be fast, accurate, and accessible to both expert agronomists and everyday growers.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['📱 Mobile', '💻 Desktop', '🔬 Lab Screen', '🌾 Field Tablet', '🖥 Dashboard'].map(d => (
              <span key={d} className="chip" style={{ fontSize: '0.8rem' }}>{d}</span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/scan" className="btn btn-primary">
              <Scan style={{ width: 16, height: 16 }} />
              Start Scanning
            </Link>
            <Link to="/assistant" className="btn btn-outline">
              <MessageSquare style={{ width: 16, height: 16 }} />
              Ask AI Chat
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────── */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p className="eyebrow" style={{ marginBottom: 8 }}>FAQ</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            COMMON QUESTIONS
          </h2>
        </div>

        <div className="bio-card" style={{ padding: '0 24px', maxWidth: 720, margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <button
                type="button"
                className="accordion-trigger"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                id={`faq-btn-${i}`}
              >
                <span style={{ fontSize: '0.9375rem', fontWeight: 500, paddingRight: 16 }}>{faq.q}</span>
                <ChevronDown style={{
                  width: 18, height: 18, color: 'var(--neon-green)', flexShrink: 0,
                  transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }} />
              </button>
              {openFaq === i && (
                <div className="animate-fade-in" style={{ paddingBottom: 16 }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section style={{ textAlign: 'center', paddingBottom: 20 }}>
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          padding: 'clamp(32px, 4vw, 56px) clamp(24px, 4vw, 80px)',
          background: 'linear-gradient(135deg, rgba(0,255,136,0.06), rgba(0,212,255,0.04))',
          border: '1px solid rgba(0,255,136,0.15)', borderRadius: 20,
        }}>
          <div className="animate-neon-pulse" style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0,255,136,0.2)',
          }}>
            <HeartPulse style={{ width: 28, height: 28, color: 'var(--neon-green)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            READY TO SCAN YOUR PLANTS?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 420 }}>
            Upload a photo right now — no signup needed. Get AI diagnosis in seconds.
          </p>
          <Link to="/scan" className="btn btn-primary btn-lg" style={{ paddingLeft: 36, paddingRight: 36 }}>
            <Scan style={{ width: 18, height: 18 }} />
            Launch BioScanner
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

    </div>
  )
}
