// LibraryPage.tsx — Plant Disease Encyclopedia with Real Photos & Affected Plant Part Info (Rice, Wheat, Cotton, Sugarcane)
import { useState } from 'react'
import { BookOpen, Search, Leaf } from 'lucide-react'
import { REAL_PLANT_PHOTOS, getDiseaseImage } from '../data/plantImages'
import { DISEASES_DATA } from '../data/diseases'

export function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')

  const cropCategories = [
    {
      crop: 'Rice',
      sciName: 'Oryza sativa',
      icon: '🌾',
      count: 3,
      image: REAL_PLANT_PHOTOS.rice,
      description: 'Major staple crop susceptible to fungal blasts, leaf spots, and beetle damage.',
      primaryParts: 'Leaf Blade, Sheath, Neck Node & Grain',
    },
    {
      crop: 'Wheat',
      sciName: 'Triticum aestivum',
      icon: '🌾',
      count: 3,
      image: REAL_PLANT_PHOTOS.wheat,
      description: 'Cereal crop vulnerable to rust fungi species and septoria blotch infections.',
      primaryParts: 'Flag Leaf, Upper Canopy & Spike Ears',
    },
    {
      crop: 'Sugarcane',
      sciName: 'Saccharum officinarum',
      icon: '🎋',
      count: 2,
      image: REAL_PLANT_PHOTOS.sugarcane,
      description: 'High-yield cash crop prone to red rot fungal stem decay and mosaic virus.',
      primaryParts: 'Internal Stalk, Stem Internodes & Whorl Leaves',
    },
    {
      crop: 'Cotton',
      sciName: 'Gossypium hirsutum',
      icon: '🌿',
      count: 2,
      image: REAL_PLANT_PHOTOS.cotton,
      description: 'Fiber crop affected by bacterial blights and whitefly-vectored leaf curl virus.',
      primaryParts: 'Angular Leaf Veins, Main Stem & Bolls',
    },
  ]

  const diseases = DISEASES_DATA

  const filtered = diseases.filter((item) => {
    const matchesCrop = selectedCrop === 'all' || item.crop.toLowerCase() === selectedCrop.toLowerCase()
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.affectedParts.some(part => part.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.whatToLookFor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.crop.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCrop && matchesSearch
  })

  const cropFilterTabs = ['all', 'rice', 'wheat', 'sugarcane', 'cotton']

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-[#E0EBE4] pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Plant Pathology Encyclopedia</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#111827]">
              Plant Disease & Affected Part Guide
            </h1>
            <p className="text-[#4B5563] text-base mt-2 max-w-2xl">
              Explore diseases by crop, affected plant part, symptoms, and treatment guidance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F0FAF4] border border-[#B9E8D1] rounded-2xl px-5 py-3 shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5 text-[#0B8F68]" />
            <div>
              <p className="text-sm font-bold text-[#0B8F68]">{diseases.length} Disease Profiles · 4 Crops</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Supported Crops Cards Banner ───────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">SELECT CROP CATEGORY (4 PRIMARY CROPS)</p>
          <span className="text-xs text-[#6B7280]">Click crop card to filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cropCategories.map((c) => {
            const isSelected = selectedCrop.toLowerCase() === c.crop.toLowerCase()
            return (
              <div
                key={c.crop}
                onClick={() => setSelectedCrop(isSelected ? 'all' : c.crop.toLowerCase())}
                className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 ${
                  isSelected
                    ? 'border-[#0B8F68] ring-2 ring-[#0B8F68]/30 shadow-lg -translate-y-1 bg-[#F0FAF4]'
                    : 'border-[#E0EBE4] bg-white hover:border-[#0B8F68]/50 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                <div className="relative h-40 overflow-hidden bg-emerald-950">
                  <img
                    src={c.image}
                    alt={c.crop}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    onError={(e) => {
                      // Fallback image handler if external CDN encounters issue
                      e.currentTarget.src = REAL_PLANT_PHOTOS.rice
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#0B8F68] shadow-sm">
                    {c.count} Diseases
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.icon}</span>
                      <h3 className="text-lg font-bold text-white leading-tight">{c.crop}</h3>
                    </div>
                    <p className="text-[11px] text-emerald-200 italic font-mono">{c.sciName}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">{c.description}</p>
                  <div className="pt-2 border-t border-[#E0EBE4]">
                    <p className="text-[10px] font-bold text-[#0B8F68] uppercase tracking-wider">Target Organs</p>
                    <p className="text-xs text-[#111827] font-semibold">{c.primaryParts}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Search & Filter Controls ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E0EBE4] shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diseases, crops, or affected parts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAFDFA] border border-[#E0EBE4] text-[#111827] placeholder-[#6B7280] text-sm focus:outline-none focus:border-[#0B8F68] focus:ring-2 focus:ring-[#0B8F68]/20 transition-all"
          />
        </div>

        {/* Crop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {cropFilterTabs.map((c) => {
            const active = selectedCrop === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCrop(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#0B8F68] text-white shadow-md shadow-[#0B8F68]/20'
                    : 'bg-[#F0FAF4] text-[#374151] border border-[#D4E8DC] hover:bg-[#E2F4E9] hover:text-[#0B8F68]'
                }`}
              >
                {c === 'all' ? '🌱 All 4 Crops' : c === 'rice' ? '🌾 Rice' : c === 'wheat' ? '🌾 Wheat' : c === 'sugarcane' ? '🎋 Sugarcane' : '🌿 Cotton'}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Diseases Cards Grid (Real Photos & Affected Parts) ─────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0EBE4] p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#F0FAF4] border border-[#B9E8D1] flex items-center justify-center text-[#0B8F68]">
            <Leaf className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#111827]">No Diseases Found</h3>
          <p className="text-sm text-[#4B5563] max-w-sm">
            No disease matched "{searchTerm}" for the selected crop filter.
          </p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedCrop('all') }}
            className="btn btn-outline btn-sm mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((d) => (
            <div
              key={d.name}
              className="bg-white rounded-2xl border border-[#E0EBE4] shadow-sm hover:shadow-xl hover:border-[#0B8F68]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Real Photograph Banner */}
                <div className="relative h-60 overflow-hidden bg-slate-900">
                  <img
                    src={d.image}
                    alt={`${d.name} real photograph`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback image handler
                      e.currentTarget.src = getDiseaseImage(d.crop, d.name)
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                  {/* Crop & Impact Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="badge bg-white/90 backdrop-blur-md text-[#0B8F68] font-bold px-3 py-1 text-xs border border-emerald-100 shadow-sm">
                      {d.crop === 'Rice' ? '🌾 Rice' : d.crop === 'Wheat' ? '🌾 Wheat' : d.crop === 'Sugarcane' ? '🎋 Sugarcane' : '🌿 Cotton'}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`badge ${
                        d.impact === 'Severe' ? 'badge-red' : 
                        d.impact === 'High' ? 'badge-orange' : 'badge-amber'
                      } text-xs px-3 py-1 shadow-md font-bold uppercase`}>
                        {d.impact} IMPACT
                      </span>
                    </div>
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-tight drop-shadow-md">
                      {d.name}
                    </h3>
                    <p className="text-xs text-emerald-200 font-mono italic mt-0.5">
                      {d.scientificName}
                    </p>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex-1 p-6 space-y-6">
                  
                  {/* Affected Parts Chips */}
                  <div>
                    <h4 className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-2">Affected parts</h4>
                    <div className="flex flex-wrap gap-2">
                      {d.affectedParts.map(part => (
                        <span key={part} className="inline-flex items-center bg-[#F0FAF4] text-[#0B8F68] border border-[#B9E8D1] px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>

                  <hr className="border-[#E0EBE4]" />

                  {/* What to look for */}
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] mb-1.5">Where to look</h4>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      {d.whatToLookFor}
                    </p>
                  </div>

                  {/* What favors it */}
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] mb-1.5">What favors it</h4>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      {d.whatFavorsIt}
                    </p>
                  </div>

                  {/* How it spreads */}
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] mb-1.5">How it spreads</h4>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      {d.howItSpreads}
                    </p>
                  </div>

                  {/* Recommended Action */}
                  <div className="bg-[#FAFDFA] border border-[#E0EBE4] p-4 rounded-xl border-l-4 border-l-[#0EA5E9]">
                    <h4 className="text-sm font-bold text-[#0EA5E9] mb-1.5">Recommended action</h4>
                    <p className="text-sm text-[#111827] font-medium leading-relaxed">
                      {d.recommendedAction}
                    </p>
                  </div>
                  
                  {/* Progressive Disclosure (Technical Details) */}
                  <details className="group cursor-pointer">
                    <summary className="text-xs font-semibold text-[#6B7280] hover:text-[#0B8F68] transition-colors outline-none select-none list-none flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform text-[10px]">▶</span>
                      Technical details
                    </summary>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700 block">Plant anatomy:</span>
                        <span className="text-gray-600">{d.technicalDetails.anatomy}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 block">Disease development:</span>
                        <span className="text-gray-600">{d.technicalDetails.pathology}</span>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
