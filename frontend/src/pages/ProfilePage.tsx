// ProfilePage.tsx — User profile, stats, settings
import { useState } from 'react'
import {
  User, Camera, Bell, Globe, Moon, Ruler, Shield,
  HelpCircle, LogOut, ChevronRight, Leaf, ScanLine,
  HeartPulse, BookMarked, Check
} from 'lucide-react'

interface SettingRowProps {
  icon: React.ElementType
  label: string
  description?: string
  value?: string
  toggle?: boolean
  defaultOn?: boolean
  onClick?: () => void
}

function SettingRow({ icon: Icon, label, description, value, toggle, defaultOn = false, onClick }: SettingRowProps) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      type="button"
      onClick={toggle ? () => setOn(v => !v) : onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-[#F0FBF5] rounded-xl transition-colors text-left group"
    >
      <div className="w-9 h-9 rounded-xl bg-[#DDF7EA] flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#0B8F68]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-600 text-[#10231D]">{label}</p>
        {description && <p className="text-xs text-[#64736C] mt-0.5">{description}</p>}
      </div>
      {toggle ? (
        <div
          className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-[#0B8F68]' : 'bg-[#D4E8DC]'}`}
          aria-checked={on}
          role="switch"
          aria-label={label}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </div>
      ) : value ? (
        <span className="text-xs text-[#64736C] bg-[#EDF7F2] px-2 py-1 rounded-lg">{value}</span>
      ) : (
        <ChevronRight className="w-4 h-4 text-[#94A09B] group-hover:text-[#0B8F68] transition-colors shrink-0" />
      )}
    </button>
  )
}

export function ProfilePage() {
  const stats = [
    { label: 'Plants', value: 8,  icon: Leaf,      color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Scans',  value: 24, icon: ScanLine,  color: 'text-blue-600 bg-blue-50' },
    { label: 'Healthy',value: 19, icon: HeartPulse, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Reports', value: 6, icon: BookMarked, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      {/* Profile header */}
      <div className="card-lg p-6 mb-5">
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0B8F68] to-[#087A59] flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <button
              type="button"
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full border-2 border-[#D4E8DC] flex items-center justify-center shadow-sm hover:bg-[#F0FBF5] transition-colors"
              aria-label="Change profile photo"
              id="profile-avatar-btn"
            >
              <Camera className="w-3.5 h-3.5 text-[#0B8F68]" />
            </button>
          </div>

          {/* Name / email */}
          <div className="flex-1">
            <h1 className="text-xl font-700 text-[#10231D]">Farmer User</h1>
            <p className="text-sm text-[#64736C]">farmer@plantease.ai</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="badge badge-green">
                <Check className="w-3 h-3" />
                Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-800 text-[#10231D]">{stat.value}</p>
                <p className="text-[10px] text-[#64736C] font-500">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings sections */}
      <div className="space-y-4">
        {/* Notifications */}
        <div className="card p-2">
          <p className="section-label px-4 pt-3 pb-1">Notifications</p>
          <SettingRow icon={Bell} label="Disease Alerts" description="Get notified when risk is high" toggle defaultOn />
          <SettingRow icon={Bell} label="Weekly Reports" description="Summary of your plants' health" toggle defaultOn={false} />
        </div>

        {/* Preferences */}
        <div className="card p-2">
          <p className="section-label px-4 pt-3 pb-1">Preferences</p>
          <SettingRow icon={Globe} label="Language" value="English" />
          <SettingRow icon={Moon} label="Dark Mode" toggle defaultOn={false} />
          <SettingRow icon={Ruler} label="Units" value="Metric" />
        </div>

        {/* Privacy */}
        <div className="card p-2">
          <p className="section-label px-4 pt-3 pb-1">Privacy & Data</p>
          <SettingRow icon={Shield} label="Data Sharing" description="Help improve AI accuracy" toggle defaultOn />
          <SettingRow icon={Shield} label="Privacy Policy" />
          <SettingRow icon={Shield} label="Delete My Data" />
        </div>

        {/* Support */}
        <div className="card p-2">
          <p className="section-label px-4 pt-3 pb-1">Support</p>
          <SettingRow icon={HelpCircle} label="Help & FAQ" />
          <SettingRow icon={HelpCircle} label="Contact Support" />
        </div>

        {/* Logout */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-600 text-sm hover:bg-red-100 transition-colors"
          id="profile-logout-btn"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>

        <p className="text-center text-xs text-[#96A39D] pb-2">FloraAI v1.0.0 · Smart Plant Diagnostics</p>
      </div>
    </div>
  )
}
