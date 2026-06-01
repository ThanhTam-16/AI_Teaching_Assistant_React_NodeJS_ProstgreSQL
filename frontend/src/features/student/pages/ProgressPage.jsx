import React, { useEffect, useState } from 'react'
import { TrendingUp, CheckCircle2, Clock, AlertCircle, Star, BookOpen, Target } from 'lucide-react'
import { getStudentDashboard } from '../../../services/dashboard.api'
import { getStudentSubmissions } from '../../../services/submission.api'
import { getStudentFeedbacks } from '../../../services/feedback.api'
import { SkeletonGrid, ErrorState, SectionHeader, ProgressRing } from '../components/StudentUI'
import { CARD_BASE } from '../studentTokens'

function CircleStat({ label, value, max, color, icon: Icon }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className={`${CARD_BASE} p-4 flex flex-col items-center gap-2 text-center`}>
      <div className="relative">
        <ProgressRing percent={pct} size={72} stroke={6} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-lg font-bold dark:text-white text-gray-900">{value}</div>
        <div className="text-[10px] dark:text-gray-400 text-gray-500">{label}</div>
        <div className="text-[10px] dark:text-gray-600 text-gray-400">{pct}% hoàn thành</div>
      </div>
    </div>
  )
}

function ScoreHistoryBar({ feedbacks }) {
  if (!feedbacks.length) return null
  const scored = feedbacks.filter(f => f.grade?.score !== undefined)
  if (!scored.length) return null

  const max = 10
  return (
    <div className={`${CARD_BASE} p-4`}>
      <div className="text-xs font-bold dark:text-white text-gray-900 mb-3">Lịch sử điểm số</div>
      <div className="space-y-2">
        {scored.slice(-8).map(f => {
          const pct = (f.grade.score / max) * 100
          const color = pct >= 80 ? 'bg-emerald-400 dark:bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-400'
          return (
            <div key={f.id} className="flex items-center gap-2">
              <span className="text-[10px] dark:text-gray-400 text-gray-500 w-32 truncate flex-shrink-0">
                {f.assignment?.title ?? 'Bài tập'}
              </span>
              <div className="flex-1 h-2 rounded-full dark:bg-gray-800 bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] font-bold dark:text-white text-gray-700 w-8 text-right">
                {f.grade.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SuggestionCard({ feedbacks }) {
  const lowScore = feedbacks.filter(f => f.grade?.score !== undefined && f.grade.score < 6)
  const improvements = feedbacks
    .filter(f => f.improvement || f.suggestions)
    .map(f => ({ title: f.assignment?.title, text: f.improvement ?? f.suggestions }))
    .slice(0, 3)

  if (!lowScore.length && !improvements.length) return null

  return (
    <div className={`${CARD_BASE} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-violet-500" />
        <div className="text-xs font-bold dark:text-white text-gray-900">Gợi ý ôn tập</div>
      </div>

      {lowScore.length > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
            📚 Bài tập cần ôn lại
          </div>
          <div className="space-y-1">
            {lowScore.slice(0, 3).map(f => (
              <div key={f.id} className="flex items-center justify-between text-[11px]">
                <span className="dark:text-gray-400 text-gray-500 truncate">{f.assignment?.title ?? 'Bài tập'}</span>
                <span className="font-bold text-rose-500 flex-shrink-0">{f.grade.score}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {improvements.map((imp, i) => (
        <div key={i} className="mb-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20">
          <div className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 mb-1">{imp.title}</div>
          <p className="text-[11px] text-violet-700 dark:text-violet-300 leading-relaxed line-clamp-2">{imp.text}</p>
        </div>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const [stats, setStats]         = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [dRes, sRes, fRes] = await Promise.all([
        getStudentDashboard(),
        getStudentSubmissions(),
        getStudentFeedbacks(),
      ])
      setStats(dRes.data?.data ?? {})
      const sRaw = sRes.data?.data
      const fRaw = fRes.data?.data
      setSubmissions(Array.isArray(sRaw) ? sRaw : sRaw?.submissions ?? [])
      setFeedbacks(Array.isArray(fRaw) ? fRaw : fRaw?.feedbacks ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải dữ liệu tiến độ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="space-y-4">
      <SkeletonGrid count={4} cols="grid-cols-2 lg:grid-cols-4" />
      <SkeletonGrid count={2} cols="grid-cols-1 lg:grid-cols-2" />
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={load} />

  const total    = stats?.totalAssignments ?? 0
  const submitted = stats?.submittedCount ?? submissions.length
  const graded   = feedbacks.filter(f => f.grade?.score !== undefined).length
  const late     = submissions.filter(s => s.isLate).length
  const missing  = Math.max(0, total - submitted)
  const avgScore = stats?.averageScore
    ?? (feedbacks.filter(f => f.grade?.score !== undefined).length > 0
      ? (feedbacks.filter(f => f.grade?.score !== undefined)
          .reduce((s, f) => s + f.grade.score, 0) /
          feedbacks.filter(f => f.grade?.score !== undefined).length).toFixed(1)
      : null)
  const completionRate = total > 0 ? Math.round((submitted / total) * 100) : 0

  return (
    <div className="pb-6 space-y-5">
      <SectionHeader
        title="Tiến độ học tập"
        desc="Theo dõi quá trình học tập của bạn"
        icon={TrendingUp}
      />

      {/* Overall summary */}
      <div className={`${CARD_BASE} p-5`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold dark:text-gray-300 text-gray-600 mb-1">Tổng tiến độ</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold dark:text-white text-gray-900">{completionRate}%</span>
              <span className="text-xs dark:text-gray-500 text-gray-400">hoàn thành</span>
            </div>
            {avgScore && (
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="text-amber-400" />
                <span className="text-xs dark:text-gray-400 text-gray-500">Điểm trung bình: </span>
                <span className="text-xs font-bold text-amber-500">{avgScore}/10</span>
              </div>
            )}
          </div>
          <div className="relative">
            <ProgressRing percent={completionRate} size={80} stroke={7} color="#f97316" />
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-400" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2.5 rounded-full dark:bg-gray-800 bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-1000"
              style={{ width: `${completionRate}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] dark:text-gray-500 text-gray-400">0</span>
            <span className="text-[10px] dark:text-gray-500 text-gray-400">{total} bài tập</span>
          </div>
        </div>
      </div>

      {/* Circle stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CircleStat label="Đã nộp"    value={submitted}  max={total} color="#10b981" icon={CheckCircle2} />
        <CircleStat label="Đã chấm"   value={graded}     max={submitted || 1} color="#f59e0b" icon={Star} />
        <CircleStat label="Chưa nộp"  value={missing}    max={total} color="#f97316" icon={Clock} />
        <CircleStat label="Trễ hạn"   value={late}       max={submitted || 1} color="#f43f5e" icon={AlertCircle} />
      </div>

      {/* Two col: score history + suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScoreHistoryBar feedbacks={feedbacks} />
        <SuggestionCard feedbacks={feedbacks} />
      </div>
    </div>
  )
}