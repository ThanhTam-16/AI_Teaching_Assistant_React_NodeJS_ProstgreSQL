import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bot, Power, PowerOff, RefreshCw, AlertCircle, Zap } from 'lucide-react'
import { getAIFeatures, toggleAIFeatureStatus } from '../../../services/admin.api'
import PageHeader from '../../../components/common/PageHeader'

function Skeleton({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

function FeatureCard({ feature, onToggle, toggling }) {
  const on = feature.isActive
  return (
    <div className={`relative rounded-xl border p-4 transition-all duration-200 overflow-hidden
      ${on
        ? 'dark:bg-gray-900/60 bg-white dark:border-orange-500/20 border-orange-200'
        : 'dark:bg-gray-900/30 bg-gray-50 dark:border-gray-800/60 border-gray-200'
      }`}
    >
      {on && <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-orange-500/5 blur-xl pointer-events-none" />}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              on ? 'dark:bg-orange-500/10 bg-orange-50 dark:border-orange-500/20 border-orange-200'
                 : 'dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-200'
            }`}>
              <Bot size={14} className={on ? 'text-orange-400' : 'dark:text-gray-600 text-gray-400'} />
            </div>
            <div>
              <div className="text-xs font-bold dark:text-gray-200 text-gray-800">{feature.name}</div>
              {feature.key && <div className="text-[9px] font-mono dark:text-gray-600 text-gray-400 mt-0.5">{feature.key}</div>}
            </div>
          </div>
          <button
            onClick={() => onToggle(feature)}
            disabled={toggling === feature.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all disabled:opacity-50
              ${on
                ? 'dark:bg-orange-500/10 bg-orange-50 dark:border-orange-500/30 border-orange-200 text-orange-400 dark:hover:bg-orange-500/20 hover:bg-orange-100'
                : 'dark:bg-gray-800 bg-gray-100 dark:border-gray-700 border-gray-200 dark:text-gray-500 text-gray-400 dark:hover:border-gray-600 hover:border-gray-300'
              }`}
          >
            {toggling === feature.id
              ? <div className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : on ? <Power size={10} /> : <PowerOff size={10} />
            }
            {on ? 'Bật' : 'Tắt'}
          </button>
        </div>
        {feature.description && (
          <p className="text-[10px] dark:text-gray-500 text-gray-400 leading-relaxed mb-2">{feature.description}</p>
        )}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${on ? 'bg-orange-500 animate-pulse' : 'dark:bg-gray-700 bg-gray-300'}`} />
          <span className="text-[10px] dark:text-gray-600 text-gray-400">
            {on ? 'Đang hoạt động' : 'Đã tắt'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function AISettingsPage() {
  const [features, setFeatures] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [toggling, setToggling] = useState(null)

  const fetch = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getAIFeatures()
      setFeatures(res.data.data ?? [])
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải AI features.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleToggle = async (f) => {
    setToggling(f.id)
    try {
      const next = !f.isActive
      await toggleAIFeatureStatus(f.id, next)
      setFeatures((prev) => prev.map((x) => x.id === f.id ? { ...x, isActive: next } : x))
      toast.success(`${next ? 'Đã bật' : 'Đã tắt'} module ${f.name}.`)
    } catch { toast.error('Không thể thay đổi trạng thái module.') }
    finally { setToggling(null) }
  }

  const activeCount = features.filter((f) => f.isActive).length

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Cài đặt AI"
        description="Bật / tắt các module AI trong hệ thống"
        stats={[
          { label: 'Đang bật', value: `${activeCount}/${features.length}`, accent: 'orange' },
        ]}
        actions={
          <button onClick={fetch} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs dark:text-gray-400 text-gray-500 border dark:border-gray-800 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all disabled:opacity-40">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        }
      />

      {error && (
        <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-3 py-2.5 text-xs">
          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="h-3 w-24" /></div><Skeleton className="h-6 w-14 rounded-full" /></div>
              <Skeleton className="h-2.5 w-full" /><Skeleton className="h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      ) : features.length === 0 ? (
        <div className="text-center py-16 dark:bg-gray-900/40 bg-white border dark:border-gray-800/60 border-gray-200 rounded-xl">
          <Bot size={28} className="dark:text-gray-700 text-gray-300 mx-auto mb-2" />
          <div className="text-xs dark:text-gray-600 text-gray-400">Chưa có AI module nào.</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => <FeatureCard key={f.id} feature={f} onToggle={handleToggle} toggling={toggling} />)}
        </div>
      )}

      <div className="flex items-start gap-2.5 dark:bg-gray-900/40 bg-gray-50 border dark:border-gray-800/40 border-gray-200 rounded-xl px-4 py-2.5">
        <AlertCircle size={12} className="dark:text-gray-600 text-gray-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] dark:text-gray-600 text-gray-400 leading-relaxed">
          Thay đổi có hiệu lực ngay lập tức. Tắt module sẽ vô hiệu hoá tính năng liên quan cho đến khi bật lại.
        </p>
      </div>
    </div>
  )
}