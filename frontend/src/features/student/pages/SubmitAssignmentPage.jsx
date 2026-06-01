import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ClipboardList, FileText, Link as LinkIcon, Code2, GitFork,
  CheckCircle2, AlertCircle, Clock, ArrowLeft, Send, Star,
  MessageSquare, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getStudentAssignmentById } from '../../../services/assignment.api'
import {
  getStudentSubmissions,
  submitAssignment,
  updateSubmission,
} from '../../../services/submission.api'
import { formatDate } from '../../../utils/formatDate'
import { CARD_BASE, SUBMISSION_STATUS } from '../studentTokens'
import { StatusBadge, ErrorState } from '../components/StudentUI'

const SUBMIT_TYPES = [
  { value: 'TEXT',   label: 'Văn bản',     icon: FileText  },
  { value: 'URL',    label: 'File URL',    icon: LinkIcon  },
  { value: 'GITHUB', label: 'GitHub Link', icon: GitFork   },
  { value: 'CODE',   label: 'Code',        icon: Code2     },
]

function AssignmentInfoPanel({ assignment, submission }) {
  const now = new Date()
  const due = assignment?.dueDate ? new Date(assignment.dueDate) : null
  const isLate = due && due < now && !submission
  const isGraded = !!submission?.grade

  return (
    <div className="space-y-3">
      {/* Assignment info card */}
      <div className={`${CARD_BASE} p-4`}>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20">
            <ClipboardList size={18} className="text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold dark:text-white text-gray-900 leading-tight">
              {assignment?.title ?? '...'}
            </h3>
            {assignment?.subject?.name && (
              <span className="text-[10px] text-orange-400">{assignment.subject.name}</span>
            )}
          </div>
        </div>

        {assignment?.description && (
          <p className="text-xs dark:text-gray-400 text-gray-500 leading-relaxed mb-3 p-3 rounded-xl
            dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-100">
            {assignment.description}
          </p>
        )}

        <div className="space-y-2">
          {due && (
            <div className={`flex items-center gap-1.5 text-xs ${isLate ? 'text-rose-500' : 'dark:text-gray-400 text-gray-500'}`}>
              {isLate ? <AlertCircle size={12} /> : <Clock size={12} />}
              <span>Hạn nộp: {formatDate(assignment.dueDate)}</span>
              {isLate && <span className="text-rose-400">(Đã trễ hạn)</span>}
            </div>
          )}
          {assignment?.difficulty && (
            <div className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500">
              <Star size={12} className="text-amber-400" />
              <span>Độ khó: {
                assignment.difficulty === 'EASY' ? 'Dễ'
                : assignment.difficulty === 'MEDIUM' ? 'Trung bình'
                : 'Khó'
              }</span>
            </div>
          )}
        </div>
      </div>

      {/* Current submission status */}
      {submission && (
        <div className={`${CARD_BASE} p-4`}>
          <div className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-2">
            Bài nộp hiện tại
          </div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-medium dark:text-gray-300 text-gray-600">
              Đã nộp lúc {formatDate(submission.submittedAt ?? submission.createdAt)}
            </span>
          </div>

          {submission.grade && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10
              border border-emerald-200 dark:border-emerald-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Star size={13} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {submission.grade.score}/10 điểm
                </span>
              </div>
              {submission.grade.comment && (
                <p className="text-[11px] dark:text-gray-400 text-gray-500">
                  {submission.grade.comment}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SubmitAssignmentPage() {
  const { id: assignmentId } = useParams()
  const navigate = useNavigate()

  const [assignment, setAssignment]   = useState(null)
  const [submission, setSubmission]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [submitting, setSubmitting]   = useState(false)

  // Form state
  const [submitType, setSubmitType]   = useState('TEXT')
  const [content, setContent]         = useState('')
  const [fileUrl, setFileUrl]         = useState('')

  const isGraded = !!submission?.grade
  const now = new Date()
  const due = assignment?.dueDate ? new Date(assignment.dueDate) : null
  const isLate = due && due < now

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const [aRes, sRes] = await Promise.all([
        getStudentAssignmentById(assignmentId),
        getStudentSubmissions({ assignmentId }),
      ])
      const a = aRes.data?.data
      const sRaw = sRes.data?.data
      const subs = Array.isArray(sRaw) ? sRaw : sRaw?.submissions ?? []
      const sub = subs.find(s => s.assignmentId === assignmentId) ?? subs[0] ?? null

      setAssignment(a)
      setSubmission(sub)

      // Prefill form if already submitted
      if (sub) {
        setContent(sub.content ?? '')
        setFileUrl(sub.fileUrl ?? '')
        setSubmitType(sub.submissionType ?? 'TEXT')
      }
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải bài tập')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [assignmentId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !fileUrl.trim()) {
      toast.error('Vui lòng nhập nội dung bài nộp')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        submissionType: submitType,
        content: ['TEXT', 'CODE'].includes(submitType) ? content : undefined,
        fileUrl: ['URL', 'GITHUB'].includes(submitType) ? fileUrl : undefined,
      }
      if (submission && !isGraded) {
        await updateSubmission(submission.id, payload)
        toast.success('Cập nhật bài nộp thành công!')
      } else {
        await submitAssignment(assignmentId, payload)
        toast.success('Nộp bài thành công!')
      }
      await load()
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Không thể nộp bài')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-2 space-y-3">
        <div className={`${CARD_BASE} h-40 animate-pulse`} />
      </div>
      <div className="lg:col-span-3">
        <div className={`${CARD_BASE} h-80 animate-pulse`} />
      </div>
    </div>
  )

  if (error) return (
    <div>
      <Link to="/student/assignments" className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 mb-4">
        <ArrowLeft size={13} /> Quay lại bài tập
      </Link>
      <ErrorState message={error} onRetry={load} />
    </div>
  )

  return (
    <div className="pb-6">
      {/* Breadcrumb */}
      <Link to="/student/assignments"
        className="inline-flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 mb-4 transition-colors">
        <ArrowLeft size={13} /> Quay lại bài tập
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: assignment info */}
        <div className="lg:col-span-2">
          <AssignmentInfoPanel assignment={assignment} submission={submission} />
        </div>

        {/* Right: submission form */}
        <div className="lg:col-span-3">
          <div className={`${CARD_BASE} p-5`}>
            {isGraded ? (
              /* Already graded — read only */
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <h3 className="text-sm font-bold dark:text-white text-gray-900">Bài đã được chấm điểm</h3>
                </div>
                <div className="p-3 rounded-xl dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-2">
                    Nội dung đã nộp
                  </div>
                  {submission.content && (
                    <pre className="text-xs dark:text-gray-300 text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                      {submission.content}
                    </pre>
                  )}
                  {submission.fileUrl && (
                    <a href={submission.fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-orange-500 hover:underline">
                      <LinkIcon size={12} /> {submission.fileUrl}
                    </a>
                  )}
                </div>
                <div className="mt-3">
                  <Link to={`/student/feedback?assignmentId=${assignmentId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                      bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                    <MessageSquare size={13} /> Xem phản hồi
                  </Link>
                </div>
              </div>
            ) : (
              /* Submission form */
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-2 mb-4">
                  <Send size={15} className="text-orange-500" />
                  <h3 className="text-sm font-bold dark:text-white text-gray-900">
                    {submission ? 'Cập nhật bài nộp' : 'Nộp bài'}
                  </h3>
                  {isLate && !submission && (
                    <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded-full
                      bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                      Trễ hạn
                    </span>
                  )}
                </div>

                {/* Type selector */}
                <div className="mb-4">
                  <label className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5 block">
                    Loại bài nộp
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUBMIT_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSubmitType(value)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium
                          transition-all duration-150
                          ${submitType === value
                            ? 'bg-orange-50 border-orange-300 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/40 dark:text-orange-400'
                            : 'dark:bg-[#0D1117] bg-gray-50 border-gray-200 dark:border-[#21262D] dark:text-gray-400 text-gray-500 hover:border-orange-200 dark:hover:border-orange-500/20'
                          }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input field */}
                {['TEXT', 'CODE'].includes(submitType) ? (
                  <div className="mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5 block">
                      {submitType === 'CODE' ? 'Code' : 'Nội dung bài nộp'}
                    </label>
                    <textarea
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      rows={submitType === 'CODE' ? 12 : 6}
                      placeholder={submitType === 'CODE'
                        ? '// Dán code của bạn vào đây...'
                        : 'Nhập nội dung bài nộp của bạn...'}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs leading-relaxed resize-none
                        dark:bg-[#0D1117] bg-gray-50 dark:border-[#21262D] border-gray-200
                        dark:text-gray-200 text-gray-700
                        focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all
                        ${submitType === 'CODE' ? 'font-mono' : ''}`}
                    />
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5 block">
                      {submitType === 'GITHUB' ? 'GitHub Repository URL' : 'File URL'}
                    </label>
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={e => setFileUrl(e.target.value)}
                      placeholder={submitType === 'GITHUB'
                        ? 'https://github.com/username/repo'
                        : 'https://drive.google.com/...'}
                      className="w-full px-3 py-2.5 rounded-xl border text-xs
                        dark:bg-[#0D1117] bg-gray-50 dark:border-[#21262D] border-gray-200
                        dark:text-gray-200 text-gray-700
                        focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold
                    bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600
                    text-white shadow-sm shadow-orange-200 dark:shadow-orange-900/30
                    disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {submitting
                    ? <><Loader2 size={13} className="animate-spin" /> Đang nộp...</>
                    : <><Send size={13} /> {submission ? 'Cập nhật bài nộp' : 'Nộp bài'}</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}