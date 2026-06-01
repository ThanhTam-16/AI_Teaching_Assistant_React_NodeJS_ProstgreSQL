import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, BookOpen, ClipboardList, CheckCircle2,
  Clock, MessageSquare, TrendingUp, AlertCircle, Sparkles,
  ArrowRight, Calendar, Star,
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { getStudentDashboard } from '../../../services/dashboard.api'
import { formatDate, formatRelative } from '../../../utils/formatDate'
import {
  StudentStatCard, SkeletonGrid, ErrorState,
  ProgressRing, SectionHeader, StatusBadge,
} from '../components/StudentUI'
import { CARD_BASE, CARD_HOVER, SUBMISSION_STATUS } from '../studentTokens'

// ── Greeting ──────────────────────────────────────────────────────────────────
function HeroGreeting({ user, stats }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'
  const completion = stats?.completionRate ?? 0

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 mb-5
      bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500
      shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20
        bg-white translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 right-20 w-24 h-24 rounded-full opacity-10
        bg-white translate-y-10" />
      <div className="absolute top-4 right-12 opacity-20">
        <Sparkles size={32} className="text-white" />
      </div>

      <div className="relative flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-orange-100 text-xs font-medium mb-0.5">{greeting} 👋</p>
          <h2 className="text-white text-lg font-bold leading-tight">
            {user?.name ?? 'Sinh viên'}!
          </h2>
          <p className="text-orange-100 text-xs mt-1 max-w-xs">
            {stats?.pendingAssignments > 0
              ? `Bạn có ${stats.pendingAssignments} bài tập cần nộp.`
              : 'Bạn đã hoàn thành tất cả bài tập! 🎉'}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Link to="/student/assignments"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all backdrop-blur-sm">
              <ClipboardList size={12} />
              Xem bài tập
            </Link>
            <Link to="/student/lessons"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                bg-white text-orange-600 hover:bg-orange-50 transition-all shadow-sm">
              <BookOpen size={12} />
              Học ngay
            </Link>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <ProgressRing percent={completion} size={72} stroke={6} color="rgba(255,255,255,0.9)" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-sm font-bold leading-none">{completion}%</div>
                <div className="text-white/70 text-[8px]">Hoàn thành</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Upcoming deadlines ────────────────────────────────────────────────────────
function DeadlineCard({ assignment }) {
  const deadline = new Date(assignment.dueDate)
  const now = new Date()
  const diff = deadline - now
  const days = Math.ceil(diff / 86400000)
  const isUrgent = days <= 2 && days >= 0
  const isOverdue = diff < 0

  return (
    <Link to={`/student/assignments`}
      className={`${CARD_BASE} ${CARD_HOVER} p-3 flex items-center gap-3 group`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
        ${isOverdue ? 'bg-rose-50 dark:bg-rose-500/10' : isUrgent ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-orange-50 dark:bg-orange-500/10'}`}>
        {isOverdue ? <AlertCircle size={16} className="text-rose-500" />
          : isUrgent ? <Clock size={16} className="text-amber-500" />
          : <ClipboardList size={16} className="text-orange-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold dark:text-gray-200 text-gray-700 truncate
          group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {assignment.title}
        </div>
        <div className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">
          {assignment.subject?.name ?? assignment.class?.name ?? ''}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-[10px] font-bold
          ${isOverdue ? 'text-rose-500' : isUrgent ? 'text-amber-500' : 'text-orange-400'}`}>
          {isOverdue ? 'Trễ hạn' : days === 0 ? 'Hôm nay' : `${days} ngày`}
        </div>
        <div className="text-[10px] dark:text-gray-600 text-gray-400">{formatDate(assignment.dueDate)}</div>
      </div>
    </Link>
  )
}

// ── Recent feedback ───────────────────────────────────────────────────────────
function FeedbackItem({ feedback }) {
  return (
    <div className={`${CARD_BASE} p-3 flex items-start gap-3`}>
      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200
        dark:border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <MessageSquare size={12} className="text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-[11px] font-semibold dark:text-gray-200 text-gray-700 truncate">
            {feedback.assignment?.title ?? 'Bài tập'}
          </span>
          {feedback.grade?.score !== undefined && (
            <span className="text-[11px] font-bold text-emerald-500 flex-shrink-0">
              {feedback.grade.score}/10
            </span>
          )}
        </div>
        <p className="text-[10px] dark:text-gray-500 text-gray-400 line-clamp-2">
          {feedback.content ?? 'Không có nội dung phản hồi'}
        </p>
        <div className="text-[10px] dark:text-gray-600 text-gray-400 mt-1">
          {formatRelative(feedback.createdAt)}
          {feedback.isAI && (
            <span className="ml-1.5 inline-flex items-center gap-0.5 text-violet-400">
              <Sparkles size={9} /> AI
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentOverviewPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentDashboard()
      setData(res.data?.data ?? {})
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="space-y-5">
      <div className="h-36 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-900/30 dark:to-amber-900/20 animate-pulse" />
      <SkeletonGrid count={4} cols="grid-cols-2 lg:grid-cols-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonGrid count={3} cols="grid-cols-1" />
        <SkeletonGrid count={3} cols="grid-cols-1" />
      </div>
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={load} />

  const stats = {
    totalClasses:        data?.totalClasses ?? 0,
    totalSubjects:       data?.totalSubjects ?? 0,
    totalAssignments:    data?.totalAssignments ?? 0,
    submittedCount:      data?.submittedCount ?? 0,
    pendingAssignments:  data?.pendingAssignments ?? 0,
    averageScore:        data?.averageScore ?? null,
    completionRate:      data?.completionRate ?? 0,
  }

  const upcomingAssignments = data?.upcomingAssignments ?? []
  const recentFeedbacks     = data?.recentFeedbacks ?? []

  return (
    <div className="space-y-5 pb-6">
      {/* Hero */}
      <HeroGreeting user={user} stats={stats} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StudentStatCard
          icon={GraduationCap} label="Lớp đang học" value={stats.totalClasses}
          colorClass="text-orange-500 dark:text-orange-400"
          bgClass="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20"
        />
        <StudentStatCard
          icon={BookOpen} label="Môn học" value={stats.totalSubjects}
          colorClass="text-sky-500 dark:text-sky-400"
          bgClass="bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20"
        />
        <StudentStatCard
          icon={CheckCircle2} label="Đã nộp" value={stats.submittedCount}
          sub={`/ ${stats.totalAssignments} bài tập`}
          colorClass="text-emerald-500 dark:text-emerald-400"
          bgClass="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20"
        />
        <StudentStatCard
          icon={Star} label="Điểm TB"
          value={stats.averageScore !== null ? `${Number(stats.averageScore).toFixed(1)}` : '—'}
          colorClass="text-amber-500 dark:text-amber-400"
          bgClass="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20"
        />
      </div>

      {/* Two-column: deadlines + feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div>
          <SectionHeader
            title="Bài tập sắp đến hạn"
            icon={Calendar}
            actions={
              <Link to="/student/assignments"
                className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-600 transition-colors">
                Xem tất cả <ArrowRight size={11} />
              </Link>
            }
          />
          {upcomingAssignments.length === 0 ? (
            <div className={`${CARD_BASE} flex flex-col items-center justify-center py-8`}>
              <CheckCircle2 size={28} className="text-emerald-400 mb-2" />
              <p className="text-xs dark:text-gray-500 text-gray-400">Không có bài tập sắp đến hạn 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingAssignments.slice(0, 4).map(a => (
                <DeadlineCard key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </div>

        {/* Recent feedback */}
        <div>
          <SectionHeader
            title="Phản hồi gần đây"
            icon={MessageSquare}
            actions={
              <Link to="/student/feedback"
                className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-orange-600 transition-colors">
                Xem tất cả <ArrowRight size={11} />
              </Link>
            }
          />
          {recentFeedbacks.length === 0 ? (
            <div className={`${CARD_BASE} flex flex-col items-center justify-center py-8`}>
              <MessageSquare size={28} className="text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs dark:text-gray-500 text-gray-400">Chưa có phản hồi nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentFeedbacks.slice(0, 4).map(f => (
                <FeedbackItem key={f.id} feedback={f} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <SectionHeader title="Truy cập nhanh" icon={TrendingUp} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Lớp của tôi',  href: '/student/classes',     icon: GraduationCap, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
            { label: 'Bài học',      href: '/student/lessons',     icon: BookOpen,      color: 'text-sky-500',    bg: 'bg-sky-50 dark:bg-sky-500/10' },
            { label: 'Nộp bài',      href: '/student/assignments', icon: ClipboardList, color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Tiến độ',      href: '/student/progress',    icon: TrendingUp,    color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
          ].map(q => (
            <Link key={q.href} to={q.href}
              className={`${CARD_BASE} ${CARD_HOVER} p-4 flex flex-col items-center gap-2 text-center group`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${q.bg}
                border border-transparent group-hover:scale-110 transition-transform duration-200`}>
                <q.icon size={18} className={q.color} />
              </div>
              <span className="text-xs font-medium dark:text-gray-300 text-gray-600">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}