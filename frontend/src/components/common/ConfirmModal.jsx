import React, { useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận hành động',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Huỷ',
  variant = 'default', // 'default' | 'danger'
  loading = false,
  onConfirm,
  onClose
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, loading])

  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)', margin: 0 }}
      onClick={() => { if (!loading) onClose() }}
    >
      <div
        className="w-full max-w-md dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-[#21262D] border-gray-200">
          <div className="flex items-center gap-2">
            {isDanger && <AlertTriangle className="text-rose-500 w-4 h-4" />}
            <h3 className="text-sm font-bold dark:text-white text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-700 transition-colors disabled:opacity-30"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-xs dark:text-gray-300 text-gray-650 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t dark:border-[#21262D] border-gray-200 dark:bg-[#0D1117]/30 bg-gray-50/50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-60 transition-all ${
              isDanger
                ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/30'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/30'
            }`}
          >
            {loading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
