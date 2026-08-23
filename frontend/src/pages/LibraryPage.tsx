// LibraryPage.tsx — Pathology Reference Database
import { useState } from 'react'
import { BookOpen, Search, Layers } from 'lucide-react'

export function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')

  const diseases = [
    {
      crop: 'Rice',
      name: 'Rice Blast (Magnaporthe oryzae)',
      severity: 'Severe',
      symptoms: 'Spindle-shaped lesions with gray center and reddish-brown margin on leaf blades and neck nodes.',
      causes: 'High relative humidity (>90%), leaf wetness, and excessive nitrogen fertilization.',
      treatment: 'Apply Tricyclazole or Isoprothiolane. Avoid excessive nitrogen application.',
      badgeBg: '#FEF2F2',
      badgeColor: '#991B1B',
    },
    {
      crop: 'Rice',
      name: 'Brown Spot (Helminthosporium oryzae)',
      severity: 'Medium',
      symptoms: 'Small oval brown spots on leaves with yellow halo.',
      causes: 'Nutrient-deficient soil (potassium, manganese) and drought stress.',
      treatment: 'Apply Mancozeb or Edifenphos. Maintain proper soil fertility.',
      badgeBg: '#FFFBEB',
      badgeColor: '#92400E',
    },
    {
      crop: 'Rice',
      name: 'Hispa Leaf Beetle Damage',
      severity: 'Medium',
      symptoms: 'White parallel streaks along leaf veins caused by adult scraping.',
      causes: 'High pest incidence in early growth stages.',
      treatment: 'Spray Chlorpyrifos or Quinalphos at economic threshold levels.',
      badgeBg: '#FFFBEB',
      badgeColor: '#92400E',
    },
    {
      crop: 'Wheat',
      name: 'Brown Rust / Leaf Rust (Puccinia triticina)',
      severity: 'High',
      symptoms: 'Small round orange-brown pustules scattered on upper leaf surface.',
      causes: 'Moderate temperatures (15–22°C) and high moisture.',
      treatment: 'Apply Propiconazole or Tebuconazole fungicide at early detection.',
      badgeBg: '#FFF7ED',
      badgeColor: '#C2410C',
    },
    {
      crop: 'Wheat',
      name: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
      severity: 'Severe',
      symptoms: 'Linear yellow pustule stripes along leaf veins.',
      causes: 'Cool weather (10–15°C) with frequent rainfall.',
      treatment: 'Spray Triadimefon or Propiconazole immediately.',
      badgeBg: '#FEF2F2',
      badgeColor: '#991B1B',
    },
    {
      crop: 'Wheat',
      name: 'Septoria Leaf Blotch',
      severity: 'Medium',
      symptoms: 'Irregular brown lesions containing black pycnidia specks.',
      causes: 'Rain splashes spreading spores onto lower leaves.',
      treatment: 'Apply Azoxystrobin or Chlorothalonil.',
      badgeBg: '#FFFBEB',
      badgeColor: '#92400E',
    },
    {
      crop: 'Sugarcane',
      name: 'Red Rot (Colletotrichum falcatum)',
      severity: 'Severe',
      symptoms: 'Red discoloration inside stalks with horizontal white bands and sour odor.',
      causes: 'Infected seed setts and waterlogging.',
      treatment: 'Plant resistant varieties; hot water treatment of seed setts at 52°C.',
      badgeBg: '#FEF2F2',
      badgeColor: '#991B1B',
    },
    {
      crop: 'Sugarcane',
      name: 'Mosaic Virus',
      severity: 'Medium',
      symptoms: 'Contrasting green and yellowish mottled streaks on young leaves.',
      causes: 'Aphid vectors spreading viral particles.',
      treatment: 'Use certified virus-free seed cane and rogue out infected clumps.',
      badgeBg: '#FFFBEB',
      badgeColor: '#92400E',
    },
    {
      crop: 'Cotton',
      name: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)',
      severity: 'High',
      symptoms: 'Angular water-soaked spots bounded by leaf veins; black arm on stems.',
      causes: 'Warm rainy weather and infected seed stock.',
      treatment: 'Spray Streptocycline mixed with Copper Oxychloride.',
      badgeBg: '#FFF7ED',
      badgeColor: '#C2410C',
    },
    {
      crop: 'Cotton',
      name: 'Leaf Curl Virus (CLCuV)',
      severity: 'Severe',
      symptoms: 'Upward or downward leaf curling, thickened veins, enations.',
      causes: 'Whitefly (Bemisia tabaci) vector transmission.',
      treatment: 'Control whitefly population using Imidacloprid or Thiamethoxam.',
      badgeBg: '#FEF2F2',
      badgeColor: '#991B1B',
    },
  ]

  const filtered = diseases.filter((item) => {
    const matchesCrop = selectedCrop === 'all' || item.crop.toLowerCase() === selectedCrop.toLowerCase()
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symptoms.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCrop && matchesSearch
  })

  const crops = ['all', 'rice', 'wheat', 'sugarcane', 'cotton']

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* ── Top Header ── */}
      <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', padding: '20px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#159A70' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#159A70', letterSpacing: '0.05em' }}>
              Reference Catalog
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Foliar Pathology & Disease Database
          </h1>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
          <BookOpen style={{ width: '14px', height: '14px', color: '#159A70' }} />
          <span>{filtered.length} Documented Profiles</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search style={{ width: '15px', height: '15px', color: '#94A3B8', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by pathogen name, crop, or symptoms..."
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', background: '#ffffff' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: selectedCrop === c ? '#159A70' : '#ffffff',
                color: selectedCrop === c ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: selectedCrop === c ? '#159A70' : '#CBD5E1',
                cursor: 'pointer',
              }}
            >
              {c === 'all' ? 'All Crops' : c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pathology Cards Grid ── */}
      {filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '48px', textAlign: 'center', color: '#64748B' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No disease profiles match your criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((d) => (
            <div
              key={d.name}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                    {d.crop}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, background: d.badgeBg, color: d.badgeColor, padding: '2px 8px', borderRadius: '4px' }}>
                    {d.severity} Severity
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{d.name}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                  <div>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>Pathological Symptoms:</strong>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{d.symptoms}</p>
                  </div>
                  <div>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>Etiology & Conducive Conditions:</strong>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>{d.causes}</p>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '12px' }}>
                <strong style={{ color: '#159A70', display: 'block', marginBottom: '2px' }}>Agronomic Treatment:</strong>
                <p style={{ margin: 0, color: '#1E293B', lineHeight: 1.5 }}>{d.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}