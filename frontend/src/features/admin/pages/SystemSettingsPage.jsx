import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Save, RefreshCw, AlertCircle, Check, Settings } from 'lucide-react'
import { getSystemSettings, updateSystemSetting } from '../../../services/admin.api'
import PageHeader from '../../../components/common/PageHeader'

function Skeleton({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded-lg animate-pulse ${className}`} />
}

function SettingInput({ setting, value, onChange }) {
  const cls = 'dark:bg-gray-800 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all'

  const bool = value === true || value === 'true'
  if (typeof value === 'boolean' || value === 'true' || value === 'false') {
    return (
      <button
        onClick={() => onChange(String(!bool))}
        className={`relative flex items-center w-10 h-5 rounded-full border transition-all ${
          bool ? 'dark:bg-orange-500/20 bg-orange-100 dark:border-orange-500/40 border-orange-300' : 'dark:bg-gray-800 bg-gray-200 dark:border-gray-700 border-gray-300'
        }`}
      >
        <span className={`absolute w-3.5 h-3.5 rounded-full transition-all shadow-sm ${bool ? 'left-5 bg-orange-400' : 'left-0.5 dark:bg-gray-500 bg-gray-400'}`} />
      </button>
    )
  }
  if (!isNaN(Number(value)) && value !== '') {
    return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={cls + ' w-24'} />
  }
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls + ' w-48'} />
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [edits,    setEdits]    = useState({})
  const [saving,   setSaving]   = useState({})
  const [saved,    setSaved]    = useState({})

  const fetchSettings = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await getSystemSettings()
      const list = res.data.data ?? []
      setSettings(list)
      const init = {}; list.forEach((s) => { init[s.key] = s.value }); setEdits(init)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Không thể tải cài đặt.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async (key) => {
    setSaving((s) => ({ ...s, [key]: true }))
    try {
      await updateSystemSetting(key, edits[key])
      setSettings((prev) => prev.map((s) => s.key === key ? { ...s, value: edits[key] } : s))
      setSaved((s) => ({ ...s, [key]: true }))
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000)
      toast.success(`Đã lưu cài đặt "${key}".`)
    } catch { toast.error('Không thể lưu cài đặt.') }
    finally { setSaving((s) => ({ ...s, [key]: false })) }
  }

  const isDirty = (key) => String(settings.find((s) => s.key === key)?.value ?? '') !== String(edits[key] ?? '')

  const groups = settings.reduce((acc, s) => {
    const g = s.group ?? 'Chung'; if (!acc[g]) acc[g] = []; acc[g].push(s); return acc
  }, {})

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Cài đặt hệ thống"
        description="Cấu hình các thông số vận hành hệ thống"
        actions={
          <button onClick={fetchSettings} disabled={loading} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs dark:text-gray-400 text-gray-500 border dark:border-gray-800 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all disabled:opacity-40">
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
        <div className="space-y-3">
          {[1,2].map((g) => (
            <div key={g} className="dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b dark:border-gray-800 border-gray-200"><Skeleton className="h-3 w-20" /></div>
              {[1,2,3].map((i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800/40 border-gray-100 last:border-0">
                  <div className="space-y-1.5"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-2 w-44" /></div>
                  <div className="flex items-center gap-2"><Skeleton className="h-7 w-32 rounded-lg" /><Skeleton className="h-7 w-14 rounded-lg" /></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="text-center py-14 dark:bg-gray-900/40 bg-white border dark:border-gray-800 border-gray-200 rounded-xl">
          <Settings size={24} className="dark:text-gray-700 text-gray-300 mx-auto mb-2" />
          <div className="text-xs dark:text-gray-600 text-gray-400">Chưa có cài đặt nào.</div>
        </div>
      ) : (
        Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} className="dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b dark:border-gray-800 border-gray-200 dark:bg-gray-900/40 bg-gray-50">
              <h3 className="text-[9px] font-bold uppercase tracking-widest dark:text-gray-500 text-gray-400">{groupName}</h3>
            </div>
            <div className="divide-y dark:divide-gray-800/40 divide-gray-100">
              {items.map((s) => (
                <div key={s.key} className="flex flex-wrap items-center gap-3 justify-between px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium dark:text-gray-200 text-gray-700">{s.label ?? s.key}</div>
                    {s.description && <div className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">{s.description}</div>}
                    <div className="font-mono text-[9px] dark:text-gray-700 text-gray-400 mt-0.5">{s.key}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {edits[s.key] !== undefined && (
                      <SettingInput setting={s} value={edits[s.key]} onChange={(v) => setEdits((e) => ({ ...e, [s.key]: v }))} />
                    )}
                    <button
                      onClick={() => handleSave(s.key)}
                      disabled={!isDirty(s.key) || saving[s.key]}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap
                        ${saved[s.key]
                          ? 'dark:bg-emerald-500/10 bg-emerald-50 dark:border-emerald-500/20 border-emerald-200 text-emerald-400'
                          : 'dark:bg-orange-500/10 bg-orange-50 dark:border-orange-500/20 border-orange-200 text-orange-400 dark:hover:bg-orange-500/20 hover:bg-orange-100'
                        }`}
                    >
                      {saving[s.key] ? <div className="w-2.5 h-2.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        : saved[s.key] ? <Check size={10} /> : <Save size={10} />
                      }
                      {saved[s.key] ? 'Đã lưu' : 'Lưu'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}