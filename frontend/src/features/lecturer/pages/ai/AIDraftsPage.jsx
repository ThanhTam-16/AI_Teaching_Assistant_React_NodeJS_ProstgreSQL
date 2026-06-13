import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Sparkles, Search, History, Brain, Target, BookOpen, FileText, ChevronRight, FileSliders } from 'lucide-react'
import { getAIHistory } from '../../../../services/ai.api'
import { formatDateTime } from '../../../../utils/formatDate'
import { PageHeader, Sk, EmptyState, Badge, Pagination } from '../../components/LecturerUI'

export default function AIDraftsPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getAIHistory({ page, limit: 15, type: typeFilter || undefined })
      const d = r.data.data
      setHistory(Array.isArray(d) ? d : d?.generations ?? d?.history ?? [])
      if (!Array.isArray(d)) {
        setMeta({
          total: d?.total ?? 0,
          page: d?.page ?? 1,
          totalPages: d?.totalPages ?? 1
        })
      }
    } catch {
      setHistory([])
      toast.error('Không thể tải lịch sử AI.')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const TYPES = [
    { key: 'EXERCISE', label: 'Bài tập', icon: Sparkles, color: 'text-blue-400 bg-blue-500/10 border-blue-400/20' },
    { key: 'QUIZ', label: 'Quiz', icon: Brain, color: 'text-violet-400 bg-violet-500/10 border-violet-400/20' },
    { key: 'FEEDBACK', label: 'Feedback', icon: Target, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20' },
    { key: 'LESSON_OUTLINE', label: 'Giáo án', icon: BookOpen, color: 'text-sky-400 bg-sky-500/10 border-sky-400/20' },
    { key: 'SLIDE_OUTLINE', label: 'Slide', icon: FileSliders, color: 'text-orange-400 bg-orange-500/10 border-orange-400/20' },
  ]

  const getTypeMeta = (type) => {
    return TYPES.find(t => t.key === type) ?? { label: type, icon: History, color: 'text-gray-400 bg-gray-500/10 border-gray-400/20' }
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Lịch sử AI"
        description="Xem lại các nội dung bài giảng, bài tập, câu hỏi, và feedback đã sinh bằng AI"
        stats={[{ label: 'Tổng số lần sinh', value: meta.total || history.length }]}
      />

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all"
        >
          <option value="">Tất cả loại công cụ AI</option>
          {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {/* Grid of history cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 space-y-3">
              <div className="flex justify-between"><Sk className="h-6 w-16" /><Sk className="h-4 w-12" /></div>
              <Sk className="h-10 w-full" />
              <Sk className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="Chưa có lịch sử sinh AI"
          sub="Các nội dung bạn tạo ra từ các công cụ AI trợ lý học tập sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {history.map(item => {
            const metaInfo = getTypeMeta(item.type)
            const Icon = metaInfo.icon
            return (
              <div
                key={item.id}
                onClick={() => navigate(`/lecturer/ai/history/${item.id}`)}
                className="group dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between h-36"
              >
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold ${metaInfo.color}`}>
                      <Icon size={10} />
                      {metaInfo.label}
                    </div>
                    <ChevronRight size={13} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <div className="text-xs font-semibold dark:text-gray-200 text-gray-800 line-clamp-2 leading-relaxed">
                    {item.prompt || 'Không có tiêu đề prompt'}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t dark:border-gray-800 border-gray-100 pt-2 text-[10px] dark:text-gray-500 text-gray-400">
                  <span>{formatDateTime(item.createdAt)}</span>
                  <Badge label={item.status} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
    </div>
  )
}
