import React from 'react'

const ACCENT = {
  orange:  { bg: 'dark:bg-orange-500/10  bg-orange-50',  border: 'dark:border-orange-500/20  border-orange-200', text: 'text-orange-500',  val: 'dark:text-orange-400 text-orange-600',  glow: 'dark:shadow-orange-500/10' },
  blue:    { bg: 'dark:bg-blue-500/10    bg-blue-50',    border: 'dark:border-blue-500/20    border-blue-200',   text: 'text-blue-500',    val: 'dark:text-blue-400   text-blue-600',    glow: 'dark:shadow-blue-500/10'   },
  emerald: { bg: 'dark:bg-emerald-500/10 bg-emerald-50', border: 'dark:border-emerald-500/20 border-emerald-200',text: 'text-emerald-500', val: 'dark:text-emerald-400 text-emerald-600', glow: 'dark:shadow-emerald-500/10'},
  violet:  { bg: 'dark:bg-violet-500/10  bg-violet-50',  border: 'dark:border-violet-500/20  border-violet-200', text: 'text-violet-500',  val: 'dark:text-violet-400 text-violet-600',  glow: 'dark:shadow-violet-500/10' },
  rose:    { bg: 'dark:bg-rose-500/10    bg-rose-50',    border: 'dark:border-rose-500/20    border-rose-200',   text: 'text-rose-500',    val: 'dark:text-rose-400   text-rose-600',    glow: 'dark:shadow-rose-500/10'   },
}

function Skeleton() {
  return <div className="h-7 w-14 dark:bg-gray-800 bg-gray-200 rounded animate-pulse" />
}

export default function StatCard({ icon: Icon, label, value, sub, accent = 'orange', loading = false }) {
  const a = ACCENT[accent] ?? ACCENT.orange
  return (
    <div className={`
      rounded-xl border p-4 group transition-all duration-200 hover:shadow-lg
      dark:bg-gray-900/60 bg-white
      ${a.border}
    `}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest dark:text-gray-500 text-gray-400">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${a.bg} border ${a.border}`}>
          {Icon && <Icon size={13} className={a.text} />}
        </div>
      </div>
      {loading ? <Skeleton /> : (
        <p className={`text-2xl font-bold tabular-nums ${a.val}`}>{value ?? '—'}</p>
      )}
      {sub && <p className="text-[10px] dark:text-gray-600 text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}