import React, { useEffect } from 'react'
import { X, AlertCircle, Inbox } from 'lucide-react'
import { STATUS_COLORS } from './lecturerTokens'

// ── Skeleton ──────────────────────────────────────────────────────────────────
export function Sk({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded animate-pulse ${className}`} />
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, color }) {
  const cls = STATUS_COLORS[label] ?? STATUS_COLORS[color] ??
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  return (
    <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

// ── Modal backdrop + container ────────────────────────────────────────────────
export function Modal({ onClose, children, size = 'md' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
      style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.5)', margin: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${widths[size]} dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b dark:border-[#21262D] border-gray-200">
      <h3 className="text-sm font-bold dark:text-white text-gray-900">{title}</h3>
      <button onClick={onClose} className="dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-700 transition-colors">
        <X size={15} />
      </button>
    </div>
  )
}

export function ModalFooter({ onClose, onSave, saving, saveLabel = 'Lưu', cancelLabel = 'Huỷ', danger = false }) {
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t dark:border-[#21262D] border-gray-200">
      <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">
        {cancelLabel}
      </button>
      <button onClick={onSave} disabled={saving} className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-60 transition-all ${danger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
        {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {saveLabel}
      </button>
    </div>
  )
}

// ── Input / Select / Textarea helpers ────────────────────────────────────────
export const inputCls = 'w-full dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-lg px-3 py-2 text-xs dark:text-gray-200 text-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all'
export const labelCls = 'block text-[10px] font-bold uppercase tracking-wide dark:text-gray-400 text-gray-500 mb-1'

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = Inbox, title = 'Chưa có dữ liệu', sub = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/20 border-blue-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-blue-400" />
      </div>
      <div className="text-sm font-semibold dark:text-gray-400 text-gray-500 mb-1">{title}</div>
      {sub && <div className="text-xs dark:text-gray-600 text-gray-400 mb-4">{sub}</div>}
      {action}
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────
export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl px-3 py-2.5 text-xs">
      <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
      {message}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, description, stats = [], actions }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h2 className="text-sm font-bold dark:text-white text-gray-900">{title}</h2>
          {description && <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">{description}</p>}
        </div>
        {stats.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-px h-3 dark:bg-gray-800 bg-gray-200" />}
                <span className="text-[10px] dark:text-gray-500 text-gray-400">{s.label}</span>
                <span className={`text-xs font-bold ${s.color ?? 'text-blue-500 dark:text-blue-400'}`}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t dark:border-[#21262D] border-gray-200">
      <span className="text-[10px] dark:text-gray-600 text-gray-400">Trang {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        {['‹', '›'].map((arrow, idx) => (
          <button key={arrow} onClick={() => onChange(idx === 0 ? page - 1 : page + 1)}
            disabled={idx === 0 ? page <= 1 : page >= totalPages}
            className="w-6 h-6 rounded-md flex items-center justify-center text-xs dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"
          >{arrow}</button>
        ))}
      </div>
    </div>
  )
}

// ── Table shell ───────────────────────────────────────────────────────────────
export function TableShell({ headers, children }) {
  return (
    <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-gray-200/80 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-[#21262D] border-gray-200">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function Tr({ children, onClick }) {
  return (
    <tr onClick={onClick} className={`border-b dark:border-[#21262D]/60 border-gray-100 dark:hover:bg-[#21262D]/40 hover:bg-blue-50/40 transition-colors ${onClick ? 'cursor-pointer' : ''}`}>
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-2.5 ${className}`}>{children}</td>
}