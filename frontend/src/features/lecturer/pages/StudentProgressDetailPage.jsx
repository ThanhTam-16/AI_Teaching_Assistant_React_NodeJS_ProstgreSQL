import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, GraduationCap, Award, CheckCircle2, MessageSquare, AlertCircle, FileText } from 'lucide-react'
import { getStudentProgressInClass } from '../../../services/class.api'
import { formatDate } from '../../../utils/formatDate'
import { PageHeader, Badge, Sk, EmptyState, TableShell, Tr, Td } from '../components/LecturerUI'

export default function StudentProgressDetailPage() {
  const { classId, subjectId, studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getStudentProgressInClass(classId, studentId)
      .then(r => setData(r.data.data))
      .catch(() => {
        toast.error('Không thể tải tiến độ của sinh viên.')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [classId, studentId])

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate(`/lecturer/classes/${classId}/subjects/${subjectId}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(i => <Sk key={i} className="h-20 rounded-xl" />)}
        </div>
        <Sk className="h-[40vh] rounded-xl" />
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Không tìm thấy dữ liệu"
        sub="Thông tin tiến độ sinh viên không tồn tại hoặc bạn không có quyền truy cập."
        action={
          <button onClick={handleBack} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại chi tiết lớp
          </button>
        }
      />
    )
  }

  const { student, class: classInfo, subjects } = data

  // Filter subjects to only show the selected subject
  const filteredSubjects = subjects.filter(s => s.subject.id === subjectId)

  // Overall Stats for the current subject
  const allAssignments = filteredSubjects.flatMap(s => s.assignments)
  const totalAssignmentsCount = allAssignments.length
  const submittedAssignments = allAssignments.filter(a => a.submission && a.submission.status !== 'NOT_SUBMITTED')
  const submittedCount = submittedAssignments.length
  const gradedAssignments = allAssignments.filter(a => a.submission && a.submission.grade)
  const gradedCount = gradedAssignments.length
  const completionRate = totalAssignmentsCount > 0 ? Math.round((submittedCount / totalAssignmentsCount) * 100) : 0

  const scores = gradedAssignments.map(a => a.submission.grade.score)
  const averageScore = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : '—'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại chi tiết lớp
      </button>

      <PageHeader
        title={`Chi tiết tiến độ: ${student.fullName}`}
        description={`Lớp học: ${classInfo.name} (${classInfo.code}) | Email: ${student.email}`}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-500 dark:text-blue-450">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300">Tỷ lệ hoàn thành</div>
            <div className="text-sm font-bold dark:text-gray-200 text-gray-800">{completionRate}% ({submittedCount}/{totalAssignmentsCount} bài nộp)</div>
          </div>
        </div>

        <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-450/10 flex items-center justify-center text-emerald-500 dark:text-emerald-450">
            <Award size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300">Điểm trung bình hệ 10</div>
            <div className="text-sm font-bold dark:text-gray-200 text-gray-800">{averageScore}đ (Đã chấm {gradedCount} bài)</div>
          </div>
        </div>

        <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-450/10 flex items-center justify-center text-amber-500 dark:text-amber-450">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300">Phản hồi đã nhận</div>
            <div className="text-sm font-bold dark:text-gray-200 text-gray-800">
              {allAssignments.filter(a => a.submission?.feedbacks?.length > 0).length} bài tập có nhận xét
            </div>
          </div>
        </div>
      </div>

      {/* Progress detail grouped by subject */}
      <div className="space-y-6">
        {filteredSubjects.map(subProgress => {
          const { subject, assignments: subAssignments } = subProgress
          return (
            <div key={subject.id} className="dark:bg-[#161B22]/40 bg-white border dark:border-[#21262D] border-blue-50/50 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold dark:text-white text-gray-800 uppercase tracking-wider">{subject.name}</h3>
                  <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">Mã môn học: {subject.code} | Điểm trung bình: <span className="font-semibold text-blue-400">{subProgress.averageScore}đ</span></p>
                </div>
                <Badge label={`${subProgress.submittedCount}/${subProgress.totalAssignments} Hoàn thành`} />
              </div>

              {subAssignments.length === 0 ? (
                <p className="text-xs dark:text-gray-500 text-gray-450 italic py-4 text-center">Không có bài tập nào được giao cho môn học này.</p>
              ) : (
                <div className="space-y-4">
                  <TableShell headers={['Tên bài tập', 'Hạn nộp', 'Điểm tối đa', 'Độ khó', 'Bài nộp', 'Điểm số', '']}>
                    {subAssignments.map(a => {
                      const hasSub = a.submission && a.submission.status !== 'NOT_SUBMITTED'
                      const isGraded = a.submission?.status === 'GRADED'
                      return (
                        <Tr key={a.id}>
                          <Td>
                            <div>
                              <div className="text-xs font-medium dark:text-gray-350 text-gray-700">{a.title}</div>
                              {a.lesson && <div className="text-[9px] dark:text-gray-500 text-gray-400 italic">Bài học: {a.lesson.title}</div>}
                            </div>
                          </Td>
                          <Td><span className="text-[10px] dark:text-gray-400 text-gray-500">{a.dueDate ? formatDate(a.dueDate) : '—'}</span></Td>
                          <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.totalScore}</span></Td>
                          <Td>
                            <span className={`text-[10px] font-bold ${
                              a.difficulty === 'EASY' ? 'text-emerald-500' : a.difficulty === 'HARD' ? 'text-rose-500' : 'text-amber-500'
                            }`}>{a.difficulty}</span>
                          </Td>
                          <Td>
                            {hasSub ? (
                              <Badge label={a.submission.status} />
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400">
                                <AlertCircle size={10} /> Chưa nộp
                              </span>
                            )}
                          </Td>
                          <Td>
                            {isGraded && a.submission.grade ? (
                              <span className="text-xs font-bold text-emerald-400">{a.submission.grade.score}đ</span>
                            ) : hasSub ? (
                              <span className="text-[10px] dark:text-gray-500 text-gray-400 italic">Chưa chấm</span>
                            ) : (
                              <span className="text-xs dark:text-gray-655 text-gray-300">—</span>
                            )}
                          </Td>
                          <Td>
                            {hasSub ? (
                              <button
                                onClick={() => navigate(`/lecturer/grading/${a.submission.id}`, { state: { from: location.pathname } })}
                                className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/20 text-[9px] font-bold rounded hover:bg-blue-500/20 transition-all"
                              >
                                Xem bài nộp
                              </button>
                            ) : '—'}
                          </Td>
                        </Tr>
                      )
                    })}
                  </TableShell>

                  {/* Feedback summary for subject */}
                  {subAssignments.filter(a => a.submission?.feedbacks?.length > 0).length > 0 && (
                    <div className="dark:bg-[#161B22]/50 bg-blue-50/20 border dark:border-gray-800 border-blue-100/40 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center gap-1.5 dark:text-gray-300 text-gray-700 text-xs font-bold border-b dark:border-gray-800 border-gray-100 pb-1.5">
                        <MessageSquare size={12} className="text-blue-400" />
                        Lịch sử nhận xét & Phản hồi
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {subAssignments.filter(a => a.submission?.feedbacks?.length > 0).map(a => (
                          <div key={a.id} className="text-xs space-y-1">
                            <div className="font-semibold dark:text-gray-250 text-gray-700">{a.title}:</div>
                            {a.submission.feedbacks.map((f, fIdx) => (
                              <div key={f.id ?? fIdx} className="bg-white dark:bg-[#0D1117]/80 dark:border-gray-800 border-gray-150 border rounded-lg p-2.5 ml-2">
                                <p className="dark:text-gray-350 text-gray-600 italic">"{f.content}"</p>
                                <span className="text-[9px] dark:text-gray-500 text-gray-400 block mt-1">{formatDate(f.createdAt)}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
