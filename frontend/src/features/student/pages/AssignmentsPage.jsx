import React, { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ClipboardList, Clock, CheckCircle2, AlertCircle,
  Star, ArrowRight, Calendar,
} from 'lucide-react'
import { getStudentAssignments } from '../../../services/assignment.api'
import { getStudentSubmissions } from '../../../services/submission.api'
import { formatDate } from '../../../utils/formatDate'
import {
  SkeletonGrid, EmptyLearningState, ErrorState,
  SectionHeader, SearchInput, FilterSelect, StatusBadge,
} from '../components/StudentUI'
import {
  CARD_BASE, CARD_HOVER, SUBMISSION_STATUS, DIFFICULTY_BADGE, DIFFICULTY_LABEL,
} from '../studentTokens'

// Derive submission status from assignment + submissions map
function deriveStatus(assignment, submissionsMap) {
  const sub = submissionsMap[assignment.id]
  if (!sub) {
    const now = new Date()
    const due = assignment.dueDate ? new Date(assignment.dueDate) : null
    if (due && due < now) return 'LATE'
    return 'NOT_SUBMITTED'
  }
  if (sub.grade) return 'GRADED'
  return 'SUBMITTED'
}

function AssignmentCard({ assignment, submission }) {
  const now  = new Date()
  const due  = assignment.dueDate ? new Date(assignment.dueDate) : null
  const diff = due ? due - now : null
  const days = diff !== null ? Math.ceil(diff / 86400000) : null

  // Status
  let statusKey = 'NOT_SUBMITTED'
  if (submission?.grade) statusKey = 'GRADED'
  else if (submission) statusKey = 'SUBMITTED'
  else if (due && due < now) statusKey = 'LATE'

  const status = SUBMISSION_STATUS[statusKey]
  const diffBadge = DIFFICULTY_BADGE[assignment.difficulty] ?? DIFFICULTY_BADGE.MEDIUM
  const diffLabel = DIFFICULTY_LABEL[assignment.difficulty] ?? assignment.difficulty ?? ''
  const isUrgent  = days !== null && days <= 2 && days >= 0 && statusKey === 'NOT_SUBMITTED'

  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-4 flex flex-col gap-3 group
      ${isUrgent ? 'ring-1 ring-amber-300 dark:ring-amber-500/30' : ''}`}>
      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <StatusBadge {...status} />
        {assignment.difficulty && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffBadge}`}>
            {diffLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h3 className="text-sm font-bold dark:text-white text-gray-900
          group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors
          line-clamp-2 leading-tight">
          {assignment.title}
        </h3>
        {(assignment.subject?.name || assignment.class?.name) && (
          <span className="text-[10px] dark:text-gray-500 text-gray-400">
            {assignment.subject?.name ?? assignment.class?.name}
          </span>
        )}
      </div>

      {/* Description */}
      {assignment.description && (
        <p className="text-[11px] dark:text-gray-500 text-gray-400 line-clamp-2 leading-relaxed">
          {assignment.description}
        </p>
      )}

      {/* Deadline */}
      {due && (
        <div className={`flex items-center gap-1.5 text-[11px]
          ${isUrgent ? 'text-amber-500' : statusKey === 'LATE' ? 'text-rose-500' : 'dark:text-gray-500 text-gray-400'}`}>
          {isUrgent ? <Clock size={11} /> : statusKey === 'LATE' ? <AlertCircle size={11} /> : <Calendar size={11} />}
          <span>
            {statusKey === 'LATE' ? 'Đã trễ hạn —' : 'Hạn nộp:'}
            {' '}{formatDate(assignment.dueDate)}
            {days !== null && days >= 0 && statusKey === 'NOT_SUBMITTED' && ` (${days === 0 ? 'hôm nay' : `còn ${days} ngày`})`}
          </span>
        </div>
      )}

      {/* Grade if graded */}
      {submission?.grade && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-500">
          <Star size={11} />
          <span className="font-semibold">{submission.grade.score}/10</span>
          <span className="dark:text-gray-500 text-gray-400">điểm</span>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-2 border-t dark:border-[#21262D] border-gray-100">
        {statusKey === 'GRADED' ? (
          <Link to={`/student/feedback?assignmentId=${assignment.id}`}
            className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
            Xem phản hồi <ArrowRight size={10} />
          </Link>
        ) : (
          <Link to={`/student/assignments/${assignment.id}/submit`}
            className="flex items-center gap-1 text-[10px] font-medium text-orange-500 hover:text-orange-600 transition-colors">
            {statusKey === 'SUBMITTED' ? 'Xem bài đã nộp' : 'Nộp bài'} <ArrowRight size={10} />
          </Link>
        )}
      </div>
    </div>
  )
}

export default function AssignmentsPage() {
  const [searchParams] = useSearchParams()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const subjectId = searchParams.get('subjectId')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [aRes, sRes] = await Promise.all([
        getStudentAssignments(subjectId ? { subjectId } : {}),
        getStudentSubmissions(),
      ])
      const aRaw = aRes.data?.data
      const sRaw = sRes.data?.data
      setAssignments(Array.isArray(aRaw) ? aRaw : aRaw?.assignments ?? [])
      setSubmissions(Array.isArray(sRaw) ? sRaw : sRaw?.submissions ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải bài tập')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [subjectId])

  // Map assignmentId -> submission
  const submissionsMap = useMemo(() => {
    return submissions.reduce((acc, s) => {
      if (s.assignmentId) acc[s.assignmentId] = s
      return acc
    }, {})
  }, [submissions])

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const matchSearch = !search ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false
      if (statusFilter === 'ALL') return true

      const sub = submissionsMap[a.id]
      const now = new Date()
      const due = a.dueDate ? new Date(a.dueDate) : null

      if (statusFilter === 'NOT_SUBMITTED') return !sub && (!due || due >= now)
      if (statusFilter === 'SUBMITTED')     return sub && !sub.grade
      if (statusFilter === 'GRADED')        return sub?.grade
      if (statusFilter === 'LATE')          return !sub && due && due < now
      return true
    })
  }, [assignments, submissionsMap, search, statusFilter])

  const counts = useMemo(() => {
    const now = new Date()
    return assignments.reduce((acc, a) => {
      const sub = submissionsMap[a.id]
      const due = a.dueDate ? new Date(a.dueDate) : null
      if (sub?.grade)             acc.GRADED++
      else if (sub)               acc.SUBMITTED++
      else if (due && due < now)  acc.LATE++
      else                        acc.NOT_SUBMITTED++
      return acc
    }, { NOT_SUBMITTED: 0, SUBMITTED: 0, GRADED: 0, LATE: 0 })
  }, [assignments, submissionsMap])

  const filterOptions = [
    { value: 'ALL',           label: `Tất cả (${assignments.length})` },
    { value: 'NOT_SUBMITTED', label: `Chưa nộp (${counts.NOT_SUBMITTED})` },
    { value: 'SUBMITTED',     label: `Đã nộp (${counts.SUBMITTED})` },
    { value: 'GRADED',        label: `Đã chấm (${counts.GRADED})` },
    { value: 'LATE',          label: `Trễ hạn (${counts.LATE})` },
  ]

  return (
    <div className="pb-6">
      <SectionHeader
        title="Bài tập"
        desc={`${assignments.length} bài tập`}
        icon={ClipboardList}
        actions={
          <div className="flex items-center gap-2">
            <FilterSelect value={statusFilter} onChange={setStatusFilter} options={filterOptions} />
            <div className="w-44">
              <SearchInput value={search} onChange={setSearch} placeholder="Tìm bài tập..." />
            </div>
          </div>
        }
      />

      {/* Summary chips */}
      {!loading && !error && (
        <div className="flex gap-2 flex-wrap mb-4">
          {counts.LATE > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
              <AlertCircle size={12} /> {counts.LATE} bài trễ hạn
            </div>
          )}
          {counts.NOT_SUBMITTED > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <Clock size={12} /> {counts.NOT_SUBMITTED} bài chưa nộp
            </div>
          )}
          {counts.GRADED > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
              bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 size={12} /> {counts.GRADED} bài đã chấm
            </div>
          )}
        </div>
      )}

      {loading ? <SkeletonGrid count={6} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyLearningState
          icon={ClipboardList}
          title="Không có bài tập"
          desc={statusFilter === 'ALL' ? 'Chưa có bài tập nào được giao.' : 'Không có bài tập nào khớp với bộ lọc.'}
        />
      ) : null}

      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <AssignmentCard key={a.id} assignment={a} submission={submissionsMap[a.id]} />
          ))}
        </div>
      ) : null}
    </div>
  )
}