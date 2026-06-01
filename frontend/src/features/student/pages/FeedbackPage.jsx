import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MessageSquare, Star, Sparkles, ChevronDown, User, TrendingUp } from 'lucide-react'
import { getStudentFeedbacks } from '../../../services/feedback.api'
import { formatRelative, formatDate } from '../../../utils/formatDate'
import {
  SkeletonList, EmptyLearningState, ErrorState,
  SectionHeader, SearchInput,
} from '../components/StudentUI'
import { CARD_BASE, CARD_HOVER } from '../studentTokens'

function ScoreBar({ score, max = 10 }) {
  const pct = Math.min(100, (score / max) * 100)
  const color = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full dark:bg-gray-800 bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold dark:text-white text-gray-900 w-10 text-right">
        {score}/{max}
      </span>
    </div>
  )
}

function FeedbackCard({ feedback }) {
  const [expanded, setExpanded] = useState(false)
  const score = feedback.grade?.score ?? null
  const isAI  = feedback.isAI ?? feedback.type === 'AI'
  const hasImprovement = feedback.improvement || feedback.suggestions

  return (
    <div className={`${CARD_BASE} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-orange-50/30 dark:hover:bg-white/5 transition-colors"
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
          ${isAI ? 'bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20'
                 : 'bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20'}`}>
          {isAI
            ? <Sparkles size={13} className="text-violet-500" />
            : <User size={13} className="text-orange-500" />}
        </div>

        <div className="flex-1 min-w-0 text-left">
          {/* Top row */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold dark:text-white text-gray-900">
                {feedback.assignment?.title ?? 'Bài tập'}
              </span>
              {isAI && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full
                  bg-violet-50 dark:bg-violet-500/10 text-violet-500 border border-violet-200 dark:border-violet-500/20">
                  AI
                </span>
              )}
            </div>
            {score !== null && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star size={11} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-500">{score}/10</span>
              </div>
            )}
          </div>

          {/* Score bar */}
          {score !== null && <ScoreBar score={score} />}

          {/* Content preview */}
          <p className={`text-[11px] dark:text-gray-400 text-gray-500 leading-relaxed mt-1
            ${expanded ? '' : 'line-clamp-2'}`}>
            {feedback.content ?? 'Không có nội dung phản hồi'}
          </p>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] dark:text-gray-600 text-gray-400">
              {feedback.lecturer?.name && !isAI ? `${feedback.lecturer.name} · ` : ''}
              {formatRelative(feedback.createdAt)}
            </span>
          </div>
        </div>

        <ChevronDown size={13} className={`flex-shrink-0 dark:text-gray-500 text-gray-400
          transition-transform duration-200 mt-1 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t dark:border-[#21262D] border-gray-100">
          {/* Full content */}
          <div className="pt-3">
            <div className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5 flex items-center gap-1">
              <MessageSquare size={10} /> Nhận xét
            </div>
            <p className="text-xs dark:text-gray-300 text-gray-600 leading-relaxed whitespace-pre-line">
              {feedback.content ?? 'Không có nhận xét'}
            </p>
          </div>

          {/* Improvement suggestions */}
          {(feedback.improvement || feedback.suggestions) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10
              border border-amber-200 dark:border-amber-500/20">
              <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1">
                <TrendingUp size={10} /> Cần cải thiện
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {feedback.improvement ?? feedback.suggestions}
              </p>
            </div>
          )}

          {/* Submission info */}
          {feedback.submission && (
            <div className="text-[10px] dark:text-gray-600 text-gray-400">
              Nộp lúc: {formatDate(feedback.submission.submittedAt ?? feedback.submission.createdAt)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeedbackPage() {
  const [params] = useSearchParams()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')

  const assignmentId = params.get('assignmentId')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentFeedbacks(assignmentId ? { assignmentId } : {})
      const raw = res.data?.data
      setFeedbacks(Array.isArray(raw) ? raw : raw?.feedbacks ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải phản hồi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [assignmentId])

  const filtered = feedbacks.filter(f =>
    !search ||
    f.assignment?.title?.toLowerCase().includes(search.toLowerCase()) ||
    f.content?.toLowerCase().includes(search.toLowerCase())
  )

  // Avg score
  const scored = feedbacks.filter(f => f.grade?.score !== undefined)
  const avgScore = scored.length
    ? (scored.reduce((s, f) => s + f.grade.score, 0) / scored.length).toFixed(1)
    : null

  return (
    <div className="pb-6">
      <SectionHeader
        title="Phản hồi"
        desc={avgScore ? `${feedbacks.length} phản hồi · Điểm TB: ${avgScore}/10` : `${feedbacks.length} phản hồi`}
        icon={MessageSquare}
        actions={
          <div className="w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm phản hồi..." />
          </div>
        }
      />

      {loading ? <SkeletonList count={4} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyLearningState
          icon={MessageSquare}
          title="Chưa có phản hồi"
          desc="Sau khi bài tập được chấm, phản hồi của giảng viên sẽ hiển thị tại đây."
        />
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(f => <FeedbackCard key={f.id} feedback={f} />)}
        </div>
      ) : null}
    </div>
  )
}