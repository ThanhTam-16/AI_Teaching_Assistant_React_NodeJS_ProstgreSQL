import React from 'react'
import { Sk } from './LecturerUI'

const ACCENTS = {
  blue:    { bg: 'dark:bg-blue-500/10 bg-blue-50', border: 'dark:border-blue-500/20 border-blue-200', text: 'dark:text-blue-300 text-blue-600', glow: 'dark:shadow-blue-500/10' },
  sky:     { bg: 'dark:bg-sky-500/10 bg-sky-50',   border: 'dark:border-sky-500/20 border-sky-200',   text: 'dark:text-sky-300 text-sky-600',   glow: '' },
  green:   { bg: 'dark:bg-emerald-500/10 bg-emerald-50', border: 'dark:border-emerald-500/20 border-emerald-200', text: 'dark:text-emerald-300 text-emerald-600', glow: '' },
  orange:  { bg: 'dark:bg-orange-500/10 bg-orange-50', border: 'dark:border-orange-500/20 border-orange-200', text: 'dark:text-orange-300 text-orange-600', glow: '' },
  violet:  { bg: 'dark:bg-violet-500/10 bg-violet-50', border: 'dark:border-violet-500/20 border-violet-200', text: 'dark:text-violet-300 text-violet-600', glow: '' },
  rose:    { bg: 'dark:bg-rose-500/10 bg-rose-50',   border: 'dark:border-rose-500/20 border-rose-200',   text: 'dark:text-rose-300 text-rose-600',   glow: '' },
  amber:   { bg: 'dark:bg-amber-500/10 bg-amber-50', border: 'dark:border-amber-500/20 border-amber-200', text: 'dark:text-amber-300 text-amber-600', glow: '' },
}

export default function LecturerStatCard({ icon: Icon, label, value, sub, accent = 'blue', loading = false, onClick }) {
  const a = ACCENTS[accent] ?? ACCENTS.blue
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border p-4 transition-all duration-200 hover:shadow-md group
        dark:bg-[#161B22]/60 bg-white
        ${a.border}
        ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest dark:text-gray-500 text-gray-400">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.bg} border ${a.border}`}>
          {Icon && <Icon size={13} className={a.text} />}
        </div>
      </div>
      {loading ? <Sk className="h-7 w-14" /> : (
        <p className={`text-2xl font-bold tabular-nums ${a.text}`}>{value ?? '—'}</p>
      )}
      {sub && <p className="text-[10px] dark:text-gray-600 text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}