// HomePage.tsx — Clean Engineering Dashboard
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Scan,
  Upload,
  Microscope,
  Activity,
  Database,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react'

interface HomePageProps {
  onSelectSamplePreset: (crop: string, sampleKey: string) => void
}

export function HomePage({ onSelectSamplePreset }: HomePageProps) {
  const samples = [
    {
      crop: 'Rice',
      label: 'Rice Blast',
      pathogen: 'Magnaporthe oryzae',
      severity: 'Moderate',
      badgeBg: '#FEF3C7',
      badgeColor: '#92400E',
      key: 'rice_blast',
      cropKey: 'rice',
    },
    {
      crop: 'Wheat',
      label: 'Yellow Rust',
      pathogen: 'Puccinia striiformis',
      severity: 'High',
      badgeBg: '#FEE2E2',
      badgeColor: '#991B1B',
      key: 'wheat_yellow_rust',
      cropKey: 'wheat',
    },
    {
      crop: 'Sugarcane',
      label: 'Red Rot',
      pathogen: 'Colletotrichum falcatum',
      severity: 'Severe',
      badgeBg: '#FEE2E2',
      badgeColor: '#991B1B',
      key: 'sugarcane_red_rot',
      cropKey: 'sugarcane',
    },
    {
      crop: 'Cotton',
      label: 'Bacterial Blight',
      pathogen: 'Xanthomonas citri',
      severity: 'Medium',
      badgeBg: '#FEF3C7',
      badgeColor: '#92400E',
      key: 'cotton_bacterial_blight',
      cropKey: 'cotton',
    },
  ]

  const modules = [
    {
      icon: Microscope,
      title: 'Grad-CAM Attention Saliency',
      desc: 'Visualizes gradient-weighted spatial heatmaps pinpointing lesion patterns analyzed by the convolutional layers.',
      path: '/scan',
      btnText: 'Open Scanner',
    },
    {
      icon: Activity,
      title: 'Multimodal Risk Modeling',
      desc: 'Correlates classified pathology against localized temperature and relative humidity thresholds.',
      path: '/scan',
      btnText: 'Inspect Context',
    },
    {
      icon: Database,
      title: 'Pathology Reference Base',
      desc: 'Comprehensive profiles covering symptoms, causal agents, and agronomic management for all supported crops.',
      path: '/library',
      btnText: 'Browse Catalog',
    },
  ]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      {/* ── Hero Banner ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '36px 40px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ maxWidth: '650px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '4px 12px', borderRadius: '999px', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#065F46' }}>Inference Pipeline Active</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', margin: '0 0 12px 0', lineHeight: 1.25 }}>
              Plant Disease Diagnostic & Interpretability System
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
              Deep learning-based classification framework utilizing EfficientNet-B0 with integrated Grad-CAM visual explanations and agronomic remediation analysis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignSelf: 'center' }}>
            <Link
              to="/scan"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#159A70',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '14px',
                padding: '12px 22px',
                borderRadius: '10px',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(21,154,112,0.25)',
              }}
            >
              <Scan style={{ width: '16px', height: '16px' }} />
              Open Scanner
            </Link>
            <Link
              to="/library"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F8FAFC',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontWeight: 600,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '10px',
                textDecoration: 'none',
              }}
            >
              <Database style={{ width: '16px', height: '16px', color: '#64748B' }} />
              Crop Disease DB
            </Link>
          </div>
        </div>

        {/* Technical Specs Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Model Backbone</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>EfficientNet-B0 (Transfer Learning)</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Interpretability</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Grad-CAM Saliency Maps</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Supported Crops</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Rice, Wheat, Sugarcane, Cotton</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Input Resolution</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>224 × 224 RGB Leaf ROI</p>
          </div>
        </div>
      </div>

      {/* ── Test Specimen Presets ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Diagnostic Test Benchmarks
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Load verified test specimens directly to test the classification and Grad-CAM layer.
            </p>
          </div>
          <Link
            to="/scan"
            style={{ fontSize: '13px', fontWeight: 600, color: '#159A70', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Upload Custom Image <ArrowRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {samples.map((s) => (
            <div
              key={s.key}
              onClick={() => onSelectSamplePreset(s.cropKey, s.key)}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#159A70'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px' }}>
                    {s.crop}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, background: s.badgeBg, color: s.badgeColor, padding: '3px 8px', borderRadius: '6px' }}>
                    {s.severity}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>{s.label}</h3>
                <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748B', margin: 0 }}>{s.pathogen}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectSamplePreset(s.cropKey, s.key)
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Scan style={{ width: '14px', height: '14px' }} />
                Run Benchmark
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Architecture Modules ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {modules.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.title}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon style={{ width: '20px', height: '20px', color: '#159A70' }} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>{m.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>{m.desc}</p>
              </div>

              <Link
                to={m.path}
                style={{ fontSize: '13px', fontWeight: 600, color: '#159A70', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {m.btnText} <ArrowRight style={{ width: '14px', height: '14px' }} />
              </Link>
            </div>
          )
        })}
      </div>

    </div>
  )
}