import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Search, Inbox, Eye, Star, ChevronLeft, FileText,
  Code2, Link2, CheckCircle2, AlertCircle, Send,
} from 'lucide-react'
import { getSubmissions, getSubmissionById } from '../../../services/submission.api'
import { gradeSubmission } from '../../../services/grade.api'
import { getSubmissionFeedbacks, createFeedback } from '../../../services/feedback.api'
import { getLecturerClasses } from '../../../services/class.api'
import { getAssignments } from '../../../services/assignment.api'
import { formatDate, formatDateTime } from '../../../utils/formatDate'
import {
  PageHeader, TableShell, Tr, Td, Badge, Sk, EmptyState, Pagination,
} from '../components/LecturerUI'

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function SubmissionManagementPage() {
  const navigate = useNavigate()
  const [submissions, setSubmissions] = useState([])
  const [classes, setClasses] = useState([])
  const [assignments, setAssignments] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [assignmentFilter, setAssignmentFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, cRes, aRes] = await Promise.all([
        getSubmissions({ page, limit: 15, search, classId: classFilter, status: statusFilter, assignmentId: assignmentFilter }),
        getLecturerClasses(),
        getAssignments(),
      ])
      const d = sRes.data.data
      setSubmissions(Array.isArray(d) ? d : d?.submissions ?? [])
      if (!Array.isArray(d)) setMeta(prev => ({ ...prev, ...d }))
      setClasses(cRes.data.data?.classes ?? cRes.data.data ?? [])
      setAssignments(Array.isArray(aRes.data.data) ? aRes.data.data : aRes.data.data?.assignments ?? [])
    } catch { setSubmissions([]) }
    finally { setLoading(false) }
  }, [page, search, classFilter, statusFilter, assignmentFilter])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const selectCls = 'dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Bài nộp"
        description="Xem và chấm điểm bài nộp của sinh viên"
        stats={[
          { label: 'Tổng', value: meta.total || submissions.length },
          { label: 'Chờ chấm', value: submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'PENDING').length, color: 'text-amber-500' },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm theo tên sinh viên..."
            className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
        </div>
        <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả lớp</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={assignmentFilter} onChange={e => { setAssignmentFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả bài tập</option>
          {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả trạng thái</option>
          {['SUBMITTED','GRADED','LATE','PENDING'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <TableShell headers={['Sinh viên', 'Bài tập', 'Lớp', 'Loại nộp', 'Thời gian', 'Điểm', 'Trạng thái', '']}>
        {loading ? Array.from({ length: 8 }).map((_, i) => (
          <Tr key={i}>{[1,2,3,4,5,6,7,8].map(j => <Td key={j}><Sk className="h-2.5 w-full" /></Td>)}</Tr>
        )) : submissions.length === 0 ? (
          <tr><td colSpan={8}><EmptyState icon={Inbox} title="Chưa có bài nộp" sub="Bài nộp sẽ xuất hiện khi sinh viên nộp bài" /></td></tr>
        ) : submissions.map(s => (
          <Tr key={s.id}>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-blue-400">{s.student?.name?.[0]?.toUpperCase() ?? 'S'}</span>
                </div>
                <div>
                  <div className="text-xs font-medium dark:text-gray-200 text-gray-700">{s.student?.name ?? '—'}</div>
                  <div className="text-[10px] dark:text-gray-500 text-gray-400">{s.student?.email}</div>
                </div>
              </div>
            </Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500 truncate max-w-32 block">{s.assignment?.title ?? '—'}</span></Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{s.assignment?.class?.name ?? '—'}</span></Td>
            <Td>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded dark:bg-[#21262D] bg-gray-100 dark:text-gray-400 text-gray-500">
                {s.type ?? s.submissionType ?? 'TEXT'}
              </span>
            </Td>
            <Td><span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDateTime(s.submittedAt ?? s.createdAt)}</span></Td>
            <Td>
              {s.grade ? (
                <span className="text-xs font-bold text-emerald-400">{s.grade.score}<span className="text-[10px] dark:text-gray-500 text-gray-400">/{s.assignment?.totalScore ?? 100}</span></span>
              ) : <span className="text-[10px] dark:text-gray-600 text-gray-300">—</span>}
            </Td>
            <Td><Badge label={s.status} /></Td>
            <Td>
              <button onClick={() => navigate(`/lecturer/grading/${s.id}`)}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition-all">
                <Star size={10} />{s.status === 'GRADED' ? 'Xem' : 'Chấm'}
              </button>
            </Td>
          </Tr>
        ))}
      </TableShell>
      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GRADING PAGE
// ─────────────────────────────────────────────────────────────────────────────
export function GradingPage() {
  const { submissionId } = useParams()
  const navigate = useNavigate()
  const [submission, setSubmission] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState('')
  const [note, setNote] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingFeedback, setSendingFeedback] = useState(false)

  useEffect(() => {
    Promise.all([
      getSubmissionById(submissionId),
      getSubmissionFeedbacks(submissionId),
    ]).then(([sRes, fRes]) => {
      const s = sRes.data.data
      setSubmission(s)
      setFeedbacks(fRes.data.data ?? [])
      if (s?.grade?.score !== undefined) {
        setScore(String(s.grade.score))
        setNote(s.grade.note ?? '')
      }
    }).catch(() => {})
    .finally(() => setLoading(false))
  }, [submissionId])

  const handleGrade = async () => {
    const totalScore = submission?.assignment?.totalScore ?? 100
    const parsed = parseFloat(score)
    if (isNaN(parsed) || parsed < 0 || parsed > totalScore) {
      toast.error(`Điểm phải từ 0 đến ${totalScore}.`); return
    }
    setSaving(true)
    try {
      await gradeSubmission(submissionId, { score: parsed, note })
      toast.success('Chấm điểm thành công!')
      const r = await getSubmissionById(submissionId)
      setSubmission(r.data.data)
    } catch (e) { toast.error(e.response?.data?.message ?? 'Chấm điểm thất bại.') }
    finally { setSaving(false) }
  }

  const handleFeedback = async () => {
    if (!feedbackText.trim()) return
    setSendingFeedback(true)
    try {
      await createFeedback(submissionId, { content: feedbackText })
      toast.success('Đã gửi phản hồi!')
      setFeedbackText('')
      const r = await getSubmissionFeedbacks(submissionId)
      setFeedbacks(r.data.data ?? [])
    } catch { toast.error('Gửi phản hồi thất bại.') }
    finally { setSendingFeedback(false) }
  }

  if (loading) return (
    <div className="space-y-4 max-w-3xl">
      {[1,2,3].map(i => <div key={i} className="dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200 rounded-xl p-4 space-y-3">
        {[1,2].map(j => <Sk key={j} className="h-4 w-full" />)}
      </div>)}
    </div>
  )

  if (!submission) return (
    <div className="text-center py-20 dark:text-gray-500 text-gray-400 text-sm">
      Không tìm thấy bài nộp.
    </div>
  )

  const s = submission
  const totalScore = s.assignment?.totalScore ?? 100
  const inputCls = 'w-full dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-lg px-3 py-2 text-xs dark:text-gray-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all'

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title="Chấm điểm bài nộp"
        description={s.assignment?.title ?? ''}
        actions={
          <button onClick={() => navigate('/lecturer/submissions')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs dark:text-gray-400 text-gray-500 border dark:border-[#21262D] border-gray-200 rounded-lg dark:hover:bg-[#21262D] hover:bg-gray-50 transition-all">
            <ChevronLeft size={13} /> Quay lại
          </button>
        }
      />

      {/* Student info */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4">
        <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-3">Thông tin sinh viên</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-400">{s.student?.name?.[0]?.toUpperCase() ?? 'S'}</span>
          </div>
          <div>
            <div className="text-sm font-bold dark:text-gray-200 text-gray-800">{s.student?.name ?? '—'}</div>
            <div className="text-xs dark:text-gray-500 text-gray-400">{s.student?.email}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge label={s.status} />
            <span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDateTime(s.submittedAt ?? s.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Submission content */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4">
        <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-3">Nội dung bài nộp</h3>

        {s.content && (
          <div className="dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-100 rounded-lg p-3 mb-3">
            <p className="text-xs dark:text-gray-300 text-gray-700 leading-relaxed whitespace-pre-wrap">{s.content}</p>
          </div>
        )}

        {s.fileUrl && (
          <a href={s.fileUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 dark:bg-blue-500/10 bg-blue-50 border dark:border-blue-500/20 border-blue-200 rounded-lg text-xs text-blue-400 hover:text-blue-300 transition-colors mb-2">
            <FileText size={13} /> Xem file đính kèm
          </a>
        )}

        {s.githubUrl && (
          <a href={s.githubUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 dark:bg-gray-800 bg-gray-100 border dark:border-gray-700 border-gray-200 rounded-lg text-xs dark:text-gray-300 text-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-colors mb-2">
            <Code2 size={13} /> {s.githubUrl}
          </a>
        )}

        {s.code && (
          <div className="dark:bg-[#0D1117] bg-gray-900 border dark:border-[#21262D] border-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Code2 size={11} className="text-blue-400" />
              <span className="text-[10px] font-semibold text-blue-400">Source Code</span>
            </div>
            <pre className="text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap">{s.code}</pre>
          </div>
        )}

        {!s.content && !s.fileUrl && !s.githubUrl && !s.code && (
          <p className="text-xs dark:text-gray-600 text-gray-400 text-center py-4">Không có nội dung bài nộp.</p>
        )}
      </div>

      {/* Grading form */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4">
        <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-3 flex items-center gap-2">
          <Star size={13} className="text-amber-400" /> Chấm điểm
          {s.grade && <span className="text-[10px] font-normal dark:text-gray-500 text-gray-400">(đã chấm)</span>}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide dark:text-gray-400 text-gray-500 mb-1">
              Điểm * (tối đa {totalScore})
            </label>
            <input
              className={inputCls}
              type="number" min="0" max={totalScore} step="0.5"
              placeholder={`0 - ${totalScore}`}
              value={score}
              onChange={e => setScore(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide dark:text-gray-400 text-gray-500 mb-1">Ghi chú</label>
            <input className={inputCls} placeholder="Nhận xét ngắn..." value={note} onChange={e => setNote(e.target.value)} />
          </div>
        </div>

        <button onClick={handleGrade} disabled={saving || !score}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-all">
          {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={13} />}
          {s.grade ? 'Cập nhật điểm' : 'Xác nhận điểm'}
        </button>
      </div>

      {/* Feedback */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4">
        <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-3">Phản hồi & Nhận xét</h3>

        {/* Existing feedbacks */}
        {feedbacks.length > 0 && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {feedbacks.map((f, i) => (
              <div key={f.id ?? i} className="px-3 py-2.5 dark:bg-[#0D1117] bg-blue-50/60 border dark:border-[#21262D] border-blue-100 rounded-xl">
                <p className="text-xs dark:text-gray-200 text-gray-700 leading-relaxed">{f.content}</p>
                <span className="text-[10px] dark:text-gray-600 text-gray-400 mt-1 block">{formatDateTime(f.createdAt)}</span>
              </div>
            ))}
          </div>
        )}

        {/* New feedback */}
        <div className="flex gap-2">
          <textarea
            className="flex-1 dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-xl px-3 py-2 text-xs dark:text-gray-200 text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all"
            rows={3}
            placeholder="Nhập phản hồi cho sinh viên..."
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
          />
          <button onClick={handleFeedback} disabled={sendingFeedback || !feedbackText.trim()}
            className="self-end flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white text-xs font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-all">
            {sendingFeedback ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={12} />}
            Gửi
          </button>
        </div>
      </div>
    </div>
  )
}