import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, ClipboardList, Clock, Star, Inbox, Eye } from 'lucide-react'
import { getAssignmentById, getAssignmentSubmissions } from '../../../services/assignment.api'
import { formatDate, formatDateTime } from '../../../utils/formatDate'
import {
  PageHeader, Badge, Sk, EmptyState, TableShell, Tr, Td
} from '../components/LecturerUI'

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/assignments')
    }
  }
  
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Submissions state
  const [submissions, setSubmissions] = useState([])
  const [subsLoading, setSubsLoading] = useState(true)

  const fetchAssignmentInfo = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getAssignmentById(assignmentId)
      setAssignment(r.data.data)
    } catch {
      toast.error('Không thể tải thông tin bài tập.')
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  const fetchSubmissions = useCallback(async () => {
    setSubsLoading(true)
    try {
      const r = await getAssignmentSubmissions(assignmentId, { limit: 100 }) // fetch all
      setSubmissions(r.data.data?.submissions ?? r.data.data ?? [])
    } catch {
      setSubmissions([])
    } finally {
      setSubsLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    fetchAssignmentInfo()
    fetchSubmissions()
  }, [fetchAssignmentInfo, fetchSubmissions])

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-4">
            <Sk className="h-[40vh] rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <Sk className="h-[40vh] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Không tìm thấy bài tập"
        sub="Bài tập không tồn tại hoặc bạn không có quyền truy cập."
        action={
          <button onClick={() => navigate('/lecturer/assignments')} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại danh sách
          </button>
        }
      />
    )
  }

  const DIFF_COLORS = { EASY: 'text-emerald-500', MEDIUM: 'text-amber-500', HARD: 'text-rose-500' }
  const DIFF_LABELS = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại
      </button>

      <PageHeader
        title={assignment.title}
        description={`Lớp học: ${assignment.class?.name ?? '—'} | Môn học: ${assignment.subject?.name ?? '—'}`}
      />

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Assignment details */}
        <div className="lg:col-span-5 space-y-3">
          <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-3">
              <span className="text-xs font-bold dark:text-gray-200 text-gray-800">Thông tin bài tập</span>
              <Badge label={assignment.status} />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { label: 'Hạn nộp', value: assignment.dueDate ? formatDateTime(assignment.dueDate) : 'Không có hạn', icon: Clock },
                { label: 'Điểm tối đa', value: `${assignment.totalScore ?? 100} điểm`, icon: Star },
                { label: 'Độ khó', value: <span className={`font-bold ${DIFF_COLORS[assignment.difficulty]}`}>{DIFF_LABELS[assignment.difficulty] ?? assignment.difficulty}</span> },
                { label: 'Hình thức nộp', value: <span className="font-mono">{assignment.submissionType ?? 'TEXT'}</span> },
              ].map((item, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-xl border dark:border-gray-800 border-gray-100">
                  <div className="text-[9px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300 mb-1 flex items-center gap-1">
                    {item.icon && <item.icon size={10} />}
                    {item.label}
                  </div>
                  <div className="text-[11px] font-bold dark:text-gray-200 text-gray-800">{item.value}</div>
                </div>
              ))}
            </div>

            {assignment.description && (
              <div className="text-xs dark:text-gray-300 text-gray-600 italic">
                {assignment.description}
              </div>
            )}

            {assignment.content && (
              <div className="border-t dark:border-gray-800 border-gray-100 pt-3">
                <span className="block text-[10px] font-bold dark:text-gray-505 text-gray-400 uppercase tracking-wide mb-1.5">Yêu cầu chi tiết:</span>
                <div className="text-xs dark:text-gray-350 text-gray-700 leading-relaxed whitespace-pre-wrap dark:bg-[#0D1117] bg-gray-50 p-3.5 rounded-xl border dark:border-[#21262D] border-gray-200/60 font-mono">
                  {assignment.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submissions list */}
        <div className="lg:col-span-7 space-y-3">
          <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-3">
              <span className="text-xs font-bold dark:text-gray-200 text-gray-800">Danh sách bài nộp của sinh viên</span>
              <span className="text-[10px] dark:text-gray-500 text-gray-400 font-bold">{submissions.length} bài nộp</span>
            </div>

            {subsLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
              </div>
            ) : submissions.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Chưa có bài nộp"
                sub="Sinh viên chưa nộp bài tập này."
              />
            ) : (
              <TableShell headers={['Sinh viên', 'Hình thức', 'Thời gian nộp', 'Điểm', 'Trạng thái', '']}>
                {submissions.map(s => (
                  <Tr key={s.id} onClick={() => navigate(`/lecturer/grading/${s.id}`, { state: { from: location.pathname } })}>
                    <Td>
                      <div>
                        <div className="text-xs font-semibold dark:text-gray-250 text-gray-800">{s.student?.fullName ?? '—'}</div>
                        <div className="text-[10px] dark:text-gray-500 text-gray-400">{s.student?.email}</div>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded dark:bg-gray-800 bg-gray-100 dark:text-gray-400 text-gray-500">
                        {s.type ?? s.submissionType ?? 'TEXT'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDateTime(s.submittedAt ?? s.createdAt)}</span>
                    </Td>
                    <Td>
                      {s.grade ? (
                        <span className="text-xs font-bold text-emerald-450">{s.grade.score}<span className="text-[9px] dark:text-gray-500 text-gray-400">/{assignment.totalScore ?? 100}</span></span>
                      ) : <span className="text-xs dark:text-gray-600 text-gray-300">—</span>}
                    </Td>
                    <Td><Badge label={s.status} /></Td>
                    <Td onClick={e => e.stopPropagation()}>
                      <button onClick={() => navigate(`/lecturer/grading/${s.id}`, { state: { from: location.pathname } })}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition-all">
                        <Star size={10} /> {s.status === 'GRADED' ? 'Xem' : 'Chấm'}
                      </button>
                    </Td>
                  </Tr>
                ))}
              </TableShell>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
