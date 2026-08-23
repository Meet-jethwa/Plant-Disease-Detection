import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CloudRain,
  Droplets,
  RefreshCcw,
  Sun,
  Thermometer,
  Wind,
  Wrench,
} from 'lucide-react'

interface ToolsPageProps {
  locationData: any
  onFetchLocation: () => void
  isLocating: boolean
}

export function ToolsPage({ locationData, onFetchLocation, isLocating }: ToolsPageProps) {
  // Light Meter Simulator State
  const [luxValue, setLuxValue] = useState<number>(1800)
  const [careTasks, setCareTasks] = useState([
    { id: 1, task: 'Inspect Rice Leaves for Spot Lesions', crop: 'Rice', status: 'Pending', priority: 'High' },
    { id: 2, task: 'Apply Organic Neem Oil Spray', crop: 'Wheat', status: 'Pending', priority: 'Medium' },
    { id: 3, task: 'Check Soil Moisture & Drainage', crop: 'Sugarcane', status: 'Completed', priority: 'Low' },
    { id: 4, task: 'Prune Bacterial Blight Infected Leaves', crop: 'Cotton', status: 'Pending', priority: 'High' },
  ])

  function getLightRating(lux: number) {
    if (lux < 800) return { label: 'Shade / Low Sunlight', color: 'text-amber-800', badge: 'badge-amber', advice: 'Move plant closer to a sunlit window or outdoor area.' }
    if (lux < 2500) return { label: 'Indirect Bright Sunlight', color: 'text-emerald-800', badge: 'badge-emerald', advice: 'Ideal recovery sunlight for plants healing from leaf spot diseases.' }
    return { label: 'Full Direct Sun', color: 'text-cyan-800', badge: 'badge-cyan', advice: 'Great for field crops; ensure adequate watering to prevent leaf heat scorch.' }
  }

  const lightRating = getLightRating(luxValue)

  function toggleTask(id: number) {
    setCareTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t))
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold mb-2">
          <Wrench className="w-3.5 h-3.5 text-amber-700" />
          <span>Plant Care & Light Tools</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Plant Care Tools</h1>
        <p className="text-slate-600 text-xs mt-1 font-medium">
          Measure sunlight lux levels, check weather disease risks for your area, and manage your daily plant care tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Light Meter & Care Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Light Meter Tool */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sunlight Light Meter Tool</h3>
                  <p className="text-slate-500 text-xs font-medium">Adjust slider to test sunlight lux exposure for your plant</p>
                </div>
              </div>
              <span className={lightRating.badge}>{lightRating.label}</span>
            </div>

            {/* Lux Dial Gauge */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4 shadow-inner">
              <div className="text-4xl font-extrabold text-slate-900 font-[#Plus_Jakarta_Sans]">
                {luxValue.toLocaleString()} <span className="text-xs text-amber-700 font-bold">Lux</span>
              </div>

              {/* Slider */}
              <div className="space-y-2 max-w-md mx-auto">
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="50"
                  value={luxValue}
                  onChange={(e) => setLuxValue(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-200 accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>Low Shade (200 Lux)</span>
                  <span>Indirect (1,500 Lux)</span>
                  <span>Full Sun (5,000 Lux)</span>
                </div>
              </div>

              <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 text-left leading-relaxed font-medium shadow-2xs">
                <span className="font-bold text-amber-800 block mb-1">Sunlight Advice:</span>
                <span>{lightRating.advice}</span>
              </div>
            </div>
          </div>

          {/* Plant Care Schedule Checklist */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Daily Plant Care Checklist</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {careTasks.filter((t) => t.status === 'Completed').length} / {careTasks.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {careTasks.map((item) => {
                const isDone = item.status === 'Completed'
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTask(item.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-slate-500'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                          isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isDone && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.task}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">Crop: {item.crop}</div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.priority === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weather Risk Radar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">Weather Disease Risk</h3>
              </div>
              <button
                type="button"
                onClick={onFetchLocation}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>Update GPS</span>
              </button>
            </div>

            {locationData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-900">
                    {locationData.location.city}, {locationData.location.state}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-600" /> Temp
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">{locationData.weather.temperature_c}°C</div>
                  </div>

                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-cyan-600" /> Humidity
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">{locationData.weather.humidity_percent}%</div>
                  </div>

                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <CloudRain className="w-3 h-3 text-blue-600" /> Rainfall
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">{locationData.weather.rainfall_mm} mm</div>
                  </div>

                  <div className="glass-card p-3 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Wind className="w-3 h-3 text-slate-500" /> Wind
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">{locationData.weather.wind_kmh} km/h</div>
                  </div>
                </div>

                {/* Risk Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Disease Risk Level:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                        locationData.risk_level === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : locationData.risk_level === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {locationData.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{locationData.risk_reason}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Click "Update GPS" to fetch live weather & disease risk info.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
