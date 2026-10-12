// LibraryPage.tsx — Plant Disease Encyclopedia for Farmers
// React 19 + Tailwind v4 + framer-motion with FloraAI Green-and-White Design System
import { useState, useEffect, useId } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, Leaf, X, Check, ArrowLeft,
  AlertTriangle, AlertCircle, Info, Scan,
  Thermometer, Wind, ShieldCheck, ShieldAlert,
  Sprout, FlaskConical, Eye, ChevronRight
} from 'lucide-react'
import { DISEASES_DATA, type DiseaseItem } from '../data/diseases'
import { LIBRARY_IMAGE_PATHS } from '../data/plantImages'
import { cardContainerVariants, cardVariantForIndex, pressTap } from '../lib/motion'

export function LibraryPage() {
  const navigate = useNavigate()
  const { diseaseId } = useParams<{ diseaseId?: string }>()
  const searchInputId = useId()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrop, setSelectedCrop] = useState<string>('all')
  const [treatmentTab, setTreatmentTab] = useState<'organic' | 'chemical'>('organic')

  // Find active disease if route has :diseaseId
  const selectedDisease = diseaseId ? DISEASES_DATA.find(d => d.id === diseaseId) : null

  // Close detail view on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && selectedDisease) {
        navigate('/library')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDisease, navigate])

  const cropCategories = [
    {
      crop: 'Rice',
      sciName: 'Oryza sativa',
      icon: '🌾',
      count: 3,
      image: LIBRARY_IMAGE_PATHS.rice,
      description: 'Staple cereal vulnerable to blast fungi, brown spots, and leaf miner beetles.',
      primaryParts: 'Leaf Blade, Sheath, Neck Node & Grain',
    },
    {
      crop: 'Wheat',
      sciName: 'Triticum aestivum',
      icon: '🌾',
      count: 3,
      image: LIBRARY_IMAGE_PATHS.wheat,
      description: 'Cereal crop prone to stripe/brown rust fungi and septoria leaf blotch.',
      primaryParts: 'Flag Leaf, Upper Canopy & Spike Ears',
    },
    {
      crop: 'Sugarcane',
      sciName: 'Saccharum officinarum',
      icon: '🎋',
      count: 2,
      image: LIBRARY_IMAGE_PATHS.sugarcane,
      description: 'Perennial cash crop susceptible to red rot stalk decay and mosaic virus.',
      primaryParts: 'Internal Stalk, Stem Internodes & Whorl Leaves',
    },
    {
      crop: 'Cotton',
      sciName: 'Gossypium hirsutum',
      icon: '🌿',
      count: 2,
      image: LIBRARY_IMAGE_PATHS.cotton,
      description: 'Fiber crop challenged by bacterial blight lesions and whitefly curl virus.',
      primaryParts: 'Angular Leaf Veins, Main Stem & Bolls',
    },
  ]

  const filtered = DISEASES_DATA.filter((item) => {
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
    <div className="space-y-8 sm:space-y-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ── Page Header ── */}
      <div className="border-b border-emerald-100 pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plant Pathology Encyclopedia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight">
              Crop Disease Field Library
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Photographic identification, diagnosis markers, and bilingual treatment protocols for Indian agronomy.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl px-5 py-3 shrink-0 shadow-sm">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Knowledge Base</p>
              <p className="text-sm font-bold text-emerald-950">{DISEASES_DATA.length} Disease Profiles · 4 Crops</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Supported Crops Cards Banner ── */}
      <section aria-labelledby="crops-section-title">
        <div className="flex items-center justify-between mb-4">
          <h2 id="crops-section-title" className="text-xs font-bold text-emerald-900 tracking-wider uppercase">
            Browse by Primary Crop
          </h2>
          {selectedCrop !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedCrop('all')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear crop filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cropCategories.map((c) => {
            const isSelected = selectedCrop.toLowerCase() === c.crop.toLowerCase()
            return (
              <motion.div
                key={c.crop}
                whileTap={pressTap}
                onClick={() => setSelectedCrop(isSelected ? 'all' : c.crop.toLowerCase())}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedCrop(isSelected ? 'all' : c.crop.toLowerCase()) } }}
                className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-emerald-700 ring-2 ring-emerald-600/30 shadow-md bg-emerald-50'
                    : 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* 16:10 Fixed aspect ratio image with fallback */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-950">
                  <img
                    src={c.image}
                    alt={`${c.crop} foliage`}
                    width="800"
                    height="500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = LIBRARY_IMAGE_PATHS.placeholder
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-sm border border-emerald-100">
                    {c.count} Diseases
                  </div>

                  {isSelected && (
                    <div className="absolute top-3 left-3 bg-emerald-700 text-white rounded-full p-1 shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-lg mr-1.5">{c.icon}</span>
                    <span className="font-bold text-base drop-shadow-sm">{c.crop}</span>
                    <span className="block text-[11px] text-emerald-200 italic font-mono truncate">{c.sciName}</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800">Affected Organs:</span>
                    <span className="text-[11px] font-medium text-stone-700 truncate max-w-[140px] text-right">
                      {c.primaryParts}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── Sticky Toolbar (Search & Filter Chips) ── */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-200 shadow-sm p-3 sm:p-4 mb-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input — min 16px font to prevent mobile zoom */}
          <div className="relative flex-1">
            <label htmlFor={searchInputId} className="sr-only">Search plant diseases</label>
            <Search className="w-5 h-5 text-emerald-700/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id={searchInputId}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by disease name, pathogen, or symptoms..."
              className="w-full pl-11 pr-10 py-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 placeholder-stone-400 text-base focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Crop Filter Chips — min 44px height for touch targets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {cropFilterTabs.map((c) => {
              const active = selectedCrop.toLowerCase() === c.toLowerCase()
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCrop(c)}
                  className={`min-h-[44px] h-11 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                    active
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-emerald-50/70 text-stone-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-950'
                  }`}
                >
                  {c === 'all' && '🌱 All Crops'}
                  {c === 'rice' && '🌾 Rice'}
                  {c === 'wheat' && '🌾 Wheat'}
                  {c === 'sugarcane' && '🎋 Sugarcane'}
                  {c === 'cotton' && '🌿 Cotton'}
                  {active && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              )
            })}
          </div>

        </div>
      </div>

      {/* ── Disease Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Leaf className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-950">No Disease Matches Found</h3>
          <p className="text-sm text-stone-600 max-w-md">
            No diseases matched &ldquo;{searchTerm}&rdquo; for the selected filter. Try adjusting your query or resetting filters.
          </p>
          <button
            type="button"
            onClick={() => { setSearchTerm(''); setSelectedCrop('all') }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          variants={cardContainerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {filtered.map((d, index) => {
            const isSevere = d.impact === 'Severe'
            const isHigh = d.impact === 'High'

            return (
              <motion.div
                key={d.id}
                variants={cardVariantForIndex(index)}
                whileTap={pressTap}
                onClick={() => navigate(`/library/${d.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/library/${d.id}`) } }}
                className="bg-white rounded-2xl border border-emerald-200/80 shadow-sm hover:shadow-lg hover:shadow-emerald-900/5 hover:border-emerald-400 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group text-left"
              >
                <div>
                  {/* Fixed 16:10 Aspect Ratio Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-emerald-950">
                    <img
                      src={d.image}
                      alt={d.name}
                      width="800"
                      height="500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = LIBRARY_IMAGE_PATHS.placeholder
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Bottom gradient only under the badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent pointer-events-none" />

                    {/* Crop pill top-left */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-900 border border-emerald-100 shadow-sm">
                        {d.crop === 'Rice' && '🌾 Rice'}
                        {d.crop === 'Wheat' && '🌾 Wheat'}
                        {d.crop === 'Sugarcane' && '🎋 Sugarcane'}
                        {d.crop === 'Cotton' && '🌿 Cotton'}
                      </span>
                    </div>

                    {/* Severity pill top-right with icon + word */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${
                        isSevere
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : isHigh
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {isSevere && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                        {isHigh && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                        {!isSevere && !isHigh && <Info className="w-3.5 h-3.5 text-emerald-600" />}
                        {d.impact} Risk
                      </span>
                    </div>
                  </div>

                  {/* Body Content below image in green-950 */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-950 leading-tight group-hover:text-emerald-700 transition-colors">
                        {d.name}
                      </h3>
                      <p className="text-xs text-stone-500 font-mono italic mt-0.5 truncate">
                        {d.scientificName}
                      </p>
                    </div>

                    {/* Summary (capped to two short lines) */}
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {d.whatToLookFor}
                    </p>

                    {/* Affected parts as small chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {d.affectedParts.map((part) => (
                        <span
                          key={part}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                        >
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card footer CTA */}
                <div className="px-4 sm:px-5 py-3 bg-emerald-50/40 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
                  <span>View Full Protocol</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* ── Slide-Over Detail View Modal (Desktop & Mobile) ── */}
      <AnimatePresence>
        {selectedDisease && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => navigate('/library')}
              className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm cursor-pointer"
              aria-hidden="true"
            />

            {/* Slide-over Container */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
              aria-labelledby="disease-detail-title"
            >
              
              {/* Detail Header / Nav Bar */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-emerald-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-900 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/library')}
                  className="w-8 h-8 rounded-full bg-emerald-50 text-stone-500 hover:text-emerald-900 flex items-center justify-center transition-colors"
                  aria-label="Close detail panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                
                {/* Hero Image — 16:10 */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-emerald-950 shadow-sm border border-emerald-200">
                  <img
                    src={selectedDisease.image}
                    alt={selectedDisease.name}
                    width="800"
                    height="500"
                    onError={(e) => {
                      e.currentTarget.src = LIBRARY_IMAGE_PATHS.placeholder
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-900 border border-emerald-100 shadow-sm">
                      {selectedDisease.crop}
                    </span>
                  </div>
                </div>

                {/* Title & Scientific Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 id="disease-detail-title" className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                      {selectedDisease.name}
                    </h2>
                    
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedDisease.impact === 'Severe'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : selectedDisease.impact === 'High'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {selectedDisease.impact === 'Severe' && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                      {selectedDisease.impact === 'High' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                      {selectedDisease.impact !== 'Severe' && selectedDisease.impact !== 'High' && <Info className="w-3.5 h-3.5 text-emerald-600" />}
                      {selectedDisease.impact} Impact Severity
                    </span>
                  </div>

                  <p className="text-sm font-mono text-emerald-800 italic">
                    {selectedDisease.scientificName}
                  </p>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => navigate('/scan')}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Scan className="w-5 h-5" />
                  <span>Scan My Crop for This Disease</span>
                </button>

                {/* Section: What it is */}
                <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Pathology Overview</span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {selectedDisease.technicalDetails.pathology}
                  </p>
                </div>

                {/* Section: Where to look */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                    <Eye className="w-4 h-4 text-emerald-700" />
                    <span>Where to Look (Affected Parts)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedDisease.affectedParts.map((part) => (
                      <span key={part} className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {part}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 italic mt-1">
                    Anatomy focus: {selectedDisease.technicalDetails.anatomy}
                  </p>
                </div>

                {/* Section: Symptoms */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                    <AlertCircle className="w-4 h-4 text-emerald-700" />
                    <span>Key Symptoms to Observe</span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed bg-white border border-emerald-200 p-4 rounded-xl">
                    {selectedDisease.whatToLookFor}
                  </p>
                </div>

                {/* Section: What Favors It & How It Spreads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase">
                      <Thermometer className="w-4 h-4 text-emerald-700" />
                      <span>What Favors It</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {selectedDisease.whatFavorsIt}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-200 bg-white space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase">
                      <Wind className="w-4 h-4 text-emerald-700" />
                      <span>How It Spreads</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {selectedDisease.howItSpreads}
                    </p>
                  </div>
                </div>

                {/* Section: Treatment with Tabs (Organic / Chemical) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
                    <ShieldAlert className="w-4 h-4 text-emerald-700" />
                    <span>Recommended Treatment Protocol</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setTreatmentTab('organic')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        treatmentTab === 'organic'
                          ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                          : 'border-transparent text-stone-500 hover:text-emerald-800'
                      }`}
                    >
                      <Sprout className="w-4 h-4" />
                      <span>Organic / Bio-Control</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreatmentTab('chemical')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors cursor-pointer ${
                        treatmentTab === 'chemical'
                          ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50'
                          : 'border-transparent text-stone-500 hover:text-emerald-800'
                      }`}
                    >
                      <FlaskConical className="w-4 h-4" />
                      <span>Chemical / Fungicide</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-sm text-sm text-stone-700 leading-relaxed">
                    {treatmentTab === 'organic' ? (
                      <div>
                        <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Organic Management:</div>
                        <p>{selectedDisease.organicTreatment}</p>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs font-bold text-emerald-800 uppercase mb-1">Chemical Application:</div>
                        <p>{selectedDisease.chemicalTreatment}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section: Prevention */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Long-Term Prevention</span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {selectedDisease.prevention}
                  </p>
                </div>

              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
