import React from 'react'
import { BookOpen, Sparkles } from 'lucide-react'
import { CARD_BASE, CARD_HOVER } from '../studentTokens'

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`${CARD_BASE} p-4 animate-pulse ${className}`}>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 mb-3" />
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full w-full mb-2" />
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full w-4/5" />
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-32" />
      ))}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyLearningState({
  icon: Icon = BookOpen,
  title = 'Chưa có dữ liệu',
  desc = 'Chưa có nội dung nào ở đây.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4
        bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
        <Icon size={28} className="text-orange-400" />
      </div>
      <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">{title}</h3>
      <p className="text-xs dark:text-gray-500 text-gray-400 max-w-xs">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────
export function ErrorState({ message = 'Đã xảy ra lỗi. Vui lòng thử lại.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4
        bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-sm font-semibold dark:text-gray-300 text-gray-700 mb-1">Lỗi tải dữ liệu</h3>
      <p className="text-xs dark:text-gray-500 text-gray-400 mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-4 py-2 rounded-xl text-xs font-medium
            bg-orange-500 hover:bg-orange-600 text-white transition-colors">
          Thử lại
        </button>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function StudentStatCard({ icon: Icon, label, value, sub, colorClass = '', bgClass = '' }) {
  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon size={18} className={colorClass} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-bold dark:text-white text-gray-900 leading-none">{value ?? '—'}</div>
        <div className="text-xs dark:text-gray-400 text-gray-500 truncate mt-0.5">{label}</div>
        {sub && <div className="text-[10px] dark:text-gray-600 text-gray-400 truncate">{sub}</div>}
      </div>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
export function StatusBadge({ cls, dot, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ title, desc, actions, icon: Icon }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center
            bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
            <Icon size={15} className="text-orange-500 dark:text-orange-400" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold dark:text-white text-gray-900">{title}</h2>
          {desc && <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">{desc}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── Progress ring ─────────────────────────────────────────────────────────────
export function ProgressRing({ percent = 0, size = 56, stroke = 5, color = '#f97316' }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="currentColor" strokeWidth={stroke} className="text-gray-100 dark:text-gray-800" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
    </svg>
  )
}

// ── Search input ──────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs
          dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200
          dark:text-gray-200 text-gray-700 dark:placeholder-gray-600 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all"
      />
    </div>
  )
}

// ── Filter select ─────────────────────────────────────────────────────────────
export function FilterSelect({ value, onChange, options = [] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-xl text-xs
        dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200
        dark:text-gray-300 text-gray-700
        focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}