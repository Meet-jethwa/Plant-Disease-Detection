// LibraryPage.tsx — FloraAI Plant Disease Encyclopedia
import { useState } from 'react'
import { BookOpen, Search, Leaf } from 'lucide-react'

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
      sevColor: 'badge-red',
    },
    {
      crop: 'Rice',
      name: 'Brown Spot (Helminthosporium oryzae)',
      severity: 'Medium',
      symptoms: 'Small oval brown spots on leaves with yellow halo.',
      causes: 'Nutrient-deficient soil (potassium, manganese) and drought stress.',
      treatment: 'Apply Mancozeb or Edifenphos. Maintain proper soil fertility.',
      sevColor: 'badge-amber',
    },
    {
      crop: 'Rice',
      name: 'Hispa Leaf Beetle Damage',
      severity: 'Medium',
      symptoms: 'White parallel streaks along leaf veins caused by adult scraping.',
      causes: 'High pest incidence in early growth stages.',
      treatment: 'Spray Chlorpyrifos or Quinalphos at economic threshold levels.',
      sevColor: 'badge-amber',
    },
    {
      crop: 'Wheat',
      name: 'Brown Rust / Leaf Rust (Puccinia triticina)',
      severity: 'High',
      symptoms: 'Small round orange-brown pustules scattered on upper leaf surface.',
      causes: 'Moderate temperatures (15–22°C) and high moisture.',
      treatment: 'Apply Propiconazole or Tebuconazole fungicide at early detection.',
      sevColor: 'badge-orange',
    },
    {
      crop: 'Wheat',
      name: 'Yellow Rust / Stripe Rust (Puccinia striiformis)',
      severity: 'Severe',
      symptoms: 'Linear yellow pustule stripes along leaf veins.',
      causes: 'Cool weather (10–15°C) with frequent rainfall.',
      treatment: 'Spray Triadimefon or Propiconazole immediately.',
      sevColor: 'badge-red',
    },
    {
      crop: 'Wheat',
      name: 'Septoria Leaf Blotch',
      severity: 'Medium',
      symptoms: 'Irregular brown lesions containing black pycnidia specks.',
      causes: 'Rain splashes spreading spores onto lower leaves.',
      treatment: 'Apply Azoxystrobin or Chlorothalonil.',
      sevColor: 'badge-amber',
    },
    {
      crop: 'Sugarcane',
      name: 'Red Rot (Colletotrichum falcatum)',
      severity: 'Severe',
      symptoms: 'Red discoloration inside stalks with horizontal white bands and sour odor.',
      causes: 'Infected seed setts and waterlogging.',
      treatment: 'Plant resistant varieties; hot water treatment of seed setts at 52°C.',
      sevColor: 'badge-red',
    },
    {
      crop: 'Sugarcane',
      name: 'Mosaic Virus',
      severity: 'Medium',
      symptoms: 'Contrasting green and yellowish mottled streaks on young leaves.',
      causes: 'Aphid vectors spreading viral particles.',
      treatment: 'Use certified virus-free seed cane and rogue out infected clumps.',
      sevColor: 'badge-amber',
    },
    {
      crop: 'Cotton',
      name: 'Bacterial Blight (Xanthomonas citri pv. malvacearum)',
      severity: 'High',
      symptoms: 'Angular water-soaked spots bounded by leaf veins; black arm on stems.',
      causes: 'Warm rainy weather and infected seed stock.',
      treatment: 'Spray Streptocycline mixed with Copper Oxychloride.',
      sevColor: 'badge-orange',
    },
    {
      crop: 'Cotton',
      name: 'Leaf Curl Virus (CLCuV)',
      severity: 'Severe',
      symptoms: 'Upward or downward leaf curling, thickened veins, enations.',
      causes: 'Whitefly (Bemisia tabaci) vector transmission.',
      treatment: 'Control whitefly population using Imidacloprid or Thiamethoxam.',
      sevColor: 'badge-red',
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
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="pb-6">
        <p className="eyebrow mb-2">Plant Encyclopedia</p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#17211D]">Plant Disease Library</h1>
            <p className="text-[#66736C] text-base mt-1.5">
              Symptoms, causes, and treatment for all supported crops.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#66736C] bg-white border border-[#E0EBE4] rounded-xl px-4 py-2.5 shrink-0">
            <BookOpen className="w-4 h-4 text-[#8A5CF6]" />
            <span>{filtered.length} diseases</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#96A39D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diseases or symptoms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E0EBE4] text-[#17211D] placeholder-[#96A39D] text-sm focus:outline-none focus:border-[#159A70] focus:shadow-[0_0_0_3px_rgba(21,154,112,0.08)] transition-all"
          />
        </div>

        {/* Crop filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedCrop(c)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCrop === c
                  ? 'bg-[#159A70] text-white shadow-sm'
                  : 'text-[#66736C] hover:text-[#17211D] hover:bg-white border border-transparent hover:border-[#E0EBE4]'
              }`}
            >
              {c === 'all' ? 'All Crops' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Disease Cards Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <Leaf className="w-10 h-10 text-[#BDD8C7] mb-3" />
          <p className="text-[#17211D] font-medium mb-1">No diseases found</p>
          <p className="text-sm text-[#66736C]">Try adjusting your search or crop filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((d) => (
            <div key={d.name} className="card p-6 space-y-4 flex flex-col justify-between card-hover">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-green text-xs">{d.crop}</span>
                    <span className={`badge ${d.sevColor} text-xs`}>{d.severity}</span>
                  </div>
                </div>

                <h3 className="text-[1.05rem] font-semibold text-[#17211D] leading-snug">{d.name}</h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="section-label mb-1">Symptoms</p>
                    <p className="text-[#66736C] leading-relaxed">{d.symptoms}</p>
                  </div>
                  <div>
                    <p className="section-label mb-1">Causes</p>
                    <p className="text-[#66736C] leading-relaxed">{d.causes}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EEF4EE]">
                <p className="section-label mb-1.5">Recommended Treatment</p>
                <p className="text-sm text-[#17211D] leading-relaxed">{d.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
