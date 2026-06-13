import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronLeft, Users, UserPlus, UserMinus, BarChart3, GraduationCap,
  CheckCircle2, Plus, Copy, BookOpen, Trash2, Eye, ShieldAlert, Award,
  Brain
} from 'lucide-react'
import {
  getLecturerClassById, getStudentsInClass, addStudentToClass,
  removeStudentFromClass, getClassProgress
} from '../../../services/class.api'
import {
  getLessons, createLesson, updateLessonStatus
} from '../../../services/lesson.api'
import {
  getAssignments, createAssignment, updateAssignmentStatus, deleteAssignment
} from '../../../services/assignment.api'
import { getCLOs } from '../../../services/clo.api'
import { getQuizzes, updateQuiz, deleteQuiz } from '../../../services/quiz.api'
import { formatDate } from '../../../utils/formatDate'
import {
  PageHeader, TableShell, Tr, Td, Badge, Sk, EmptyState,
  inputCls, labelCls, ErrorBanner, Modal, ModalHeader, ModalFooter
} from '../components/LecturerUI'
import ConfirmModal from '../../../components/common/ConfirmModal'

export default function ClassDetailPage() {
  const { classId, subjectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/classes')
    }
  }
  
  const [classDetail, setClassDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('students')
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || '')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
  
  // Student state
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [studentEmail, setStudentEmail] = useState('')
  const [addingStudent, setAddingStudent] = useState(false)
  const [studentError, setStudentError] = useState('')

  // Progress state
  const [progressData, setProgressData] = useState(null)
  const [progressLoading, setProgressLoading] = useState(true)

  // Subject Content state (Lessons & Assignments)
  const [lessons, setLessons] = useState([])
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [subjectAssignments, setSubjectAssignments] = useState([])
  const [subjectAssignmentsLoading, setSubjectAssignmentsLoading] = useState(false)

  // Class Assignments state
  const [classAssignments, setClassAssignments] = useState([])
  const [classAssignmentsLoading, setClassAssignmentsLoading] = useState(false)

  // Quizzes state
  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(false)

  // Modals state
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false)
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false)
  const [showCloneAssignmentModal, setShowCloneAssignmentModal] = useState(false)

  const [savingLesson, setSavingLesson] = useState(false)
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [lessonModalError, setLessonModalError] = useState('')
  const [assignmentModalError, setAssignmentModalError] = useState('')

  const [lessonForm, setLessonForm] = useState({
    title: '', chapter: '', description: '', content: '', status: 'DRAFT', cloIds: []
  })

  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', content: '', dueDate: '', totalScore: 100,
    difficulty: 'MEDIUM', submissionType: 'TEXT', status: 'ASSIGNED',
    lessonId: '', cloIds: []
  })

  const [allLecturerAssignments, setAllLecturerAssignments] = useState([])
  const [allLecturerAssignmentsLoading, setAllLecturerAssignmentsLoading] = useState(false)
  const [selectedCloneAssignment, setSelectedCloneAssignment] = useState(null)
  const [clos, setClos] = useState([])

  const fetchClassInfo = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLecturerClassById(classId)
      setClassDetail(r.data.data)
      if (subjectId) {
        setSelectedSubjectId(subjectId)
      } else if (r.data.data?.subjects?.length > 0) {
        setSelectedSubjectId(r.data.data.subjects[0].id)
      }
    } catch (e) {
      toast.error('Không thể tải thông tin lớp học.')
    } finally {
      setLoading(false)
    }
  }, [classId, subjectId])

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true)
    try {
      const r = await getStudentsInClass(classId)
      setStudents(r.data.data ?? [])
    } catch {
      setStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }, [classId])

  const fetchProgress = useCallback(async () => {
    setProgressLoading(true)
    try {
      const r = await getClassProgress(classId, selectedSubjectId)
      setProgressData(r.data.data)
    } catch {
      setProgressData(null)
    } finally {
      setProgressLoading(false)
    }
  }, [classId, selectedSubjectId])

  const handleSubjectChange = (subId) => {
    setSelectedSubjectId(subId)
    if (subjectId) {
      navigate(`/lecturer/classes/${classId}/subjects/${subId}`, { replace: true })
    }
  }

  const normalizeArray = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (resData && typeof resData === 'object') {
      if (Array.isArray(resData.lessons)) return resData.lessons;
      if (Array.isArray(resData.assignments)) return resData.assignments;
      if (Array.isArray(resData.items)) return resData.items;
    }
    return [];
  };

  const fetchSubjectLessons = useCallback(async (subId) => {
    if (!subId) return
    setLessonsLoading(true)
    try {
      const r = await getLessons({ subjectId: subId })
      setLessons(normalizeArray(r.data.data))
    } catch {
      setLessons([])
    } finally {
      setLessonsLoading(false)
    }
  }, [])

  const fetchSubjectAssignments = useCallback(async (subId) => {
    if (!subId) return
    setSubjectAssignmentsLoading(true)
    try {
      const r = await getAssignments({ classId, subjectId: subId })
      setSubjectAssignments(normalizeArray(r.data.data))
    } catch {
      setSubjectAssignments([])
    } finally {
      setSubjectAssignmentsLoading(false)
    }
  }, [classId])

  const fetchClassAssignments = useCallback(async () => {
    if (!selectedSubjectId) return
    setClassAssignmentsLoading(true)
    try {
      const r = await getAssignments({ classId, subjectId: selectedSubjectId })
      setClassAssignments(normalizeArray(r.data.data))
    } catch {
      setClassAssignments([])
    } finally {
      setClassAssignmentsLoading(false)
    }
  }, [classId, selectedSubjectId])

  const fetchQuizzesList = useCallback(async (subId) => {
    if (!subId) return
    setQuizzesLoading(true)
    try {
      const r = await getQuizzes({ subjectId: subId, classId })
      setQuizzes(normalizeArray(r.data.data))
    } catch {
      setQuizzes([])
    } finally {
      setQuizzesLoading(false)
    }
  }, [classId])

  useEffect(() => {
    fetchClassInfo()
  }, [fetchClassInfo])

  useEffect(() => {
    if (subjectId) {
      setSelectedSubjectId(subjectId)
    }
  }, [subjectId])

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents()
    } else if (activeTab === 'progress') {
      fetchProgress()
    } else if (activeTab === 'content' && selectedSubjectId) {
      fetchSubjectLessons(selectedSubjectId)
    } else if (activeTab === 'assignments') {
      fetchClassAssignments()
    } else if (activeTab === 'quizzes' && selectedSubjectId) {
      fetchQuizzesList(selectedSubjectId)
    }
  }, [activeTab, selectedSubjectId, fetchStudents, fetchProgress, fetchSubjectLessons, fetchClassAssignments, fetchQuizzesList])

  // Fetch CLOs when selectedSubjectId changes
  useEffect(() => {
    if (selectedSubjectId) {
      getCLOs({ subjectId: selectedSubjectId })
        .then(r => setClos(r.data.data ?? []))
        .catch(() => setClos([]))
    } else {
      setClos([])
    }
  }, [selectedSubjectId])

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) return
    setAddingStudent(true)
    setStudentError('')
    try {
      await addStudentToClass(classId, { email: studentEmail })
      toast.success('Đã thêm sinh viên vào lớp!')
      setStudentEmail('')
      fetchStudents()
    } catch (e) {
      setStudentError(e.response?.data?.message ?? 'Không thể thêm sinh viên.')
    } finally {
      setAddingStudent(false)
    }
  }

  const handleRemoveStudent = (studentId, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xoá sinh viên khỏi lớp',
      message: `Bạn có chắc chắn muốn xoá sinh viên ${name} khỏi lớp học này?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await removeStudentFromClass(classId, studentId)
          toast.success(`Đã xoá sinh viên ${name} khỏi lớp.`)
          fetchStudents()
        } catch {
          toast.error('Xoá sinh viên thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const handlePublishLesson = async (lessonId) => {
    try {
      await updateLessonStatus(lessonId, 'PUBLISHED')
      toast.success('Đã giao bài học lên lớp!')
      fetchSubjectLessons(selectedSubjectId)
    } catch {
      toast.error('Giao bài học thất bại.')
    }
  }

  const handleUnpublishLesson = async (lessonId) => {
    try {
      await updateLessonStatus(lessonId, 'DRAFT')
      toast.success('Đã gỡ bài học khỏi lớp!')
      fetchSubjectLessons(selectedSubjectId)
    } catch {
      toast.error('Gỡ bài học thất bại.')
    }
  }

  const handlePublishAssignment = async (assignmentId) => {
    try {
      await updateAssignmentStatus(assignmentId, 'ASSIGNED')
      toast.success('Đã giao bài tập lên lớp!')
      fetchClassAssignments()
    } catch {
      toast.error('Giao bài tập thất bại.')
    }
  }

  const handleUnpublishAssignment = async (assignmentId) => {
    try {
      await updateAssignmentStatus(assignmentId, 'DRAFT')
      toast.success('Đã gỡ bài tập khỏi lớp!')
      fetchClassAssignments()
    } catch {
      toast.error('Gỡ bài tập thất bại.')
    }
  }

  const handleRemoveAssignmentFromClass = (assignmentId, title) => {
    setConfirmModal({
      isOpen: true,
      title: 'Gỡ bài tập khỏi lớp',
      message: `Bạn có chắc chắn muốn xóa bài tập "${title}"?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await deleteAssignment(assignmentId)
          toast.success(`Đã xóa bài tập "${title}".`)
          fetchClassAssignments()
        } catch (e) {
          toast.error(e.response?.data?.message ?? 'Xóa bài tập thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const handlePublishQuiz = async (quizId) => {
    try {
      await updateQuiz(quizId, { status: 'PUBLISHED', classId })
      toast.success('Đã giao Quiz lên lớp!')
      fetchQuizzesList(selectedSubjectId)
    } catch {
      toast.error('Giao Quiz thất bại.')
    }
  }

  const handleUnpublishQuiz = async (quizId) => {
    try {
      await updateQuiz(quizId, { status: 'DRAFT', classId: 'null' })
      toast.success('Đã gỡ Quiz khỏi lớp!')
      fetchQuizzesList(selectedSubjectId)
    } catch {
      toast.error('Gỡ Quiz thất bại.')
    }
  }

  const handleRemoveQuizFromClass = (quizId, title) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa Quiz',
      message: `Bạn có chắc chắn muốn xóa Quiz "${title}"?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await deleteQuiz(quizId)
          toast.success(`Đã xóa Quiz "${title}".`)
          fetchQuizzesList(selectedSubjectId)
        } catch (e) {
          toast.error(e.response?.data?.message ?? 'Xóa Quiz thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const handleCreateLesson = async () => {
    if (!lessonForm.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài học.'); return }
    setSavingLesson(true)
    setLessonModalError('')
    try {
      await createLesson({
        ...lessonForm,
        subjectId: selectedSubjectId
      })
      toast.success('Tạo bài học thành công!')
      setShowCreateLessonModal(false)
      setLessonForm({ title: '', chapter: '', description: '', content: '', status: 'DRAFT', cloIds: [] })
      fetchSubjectLessons(selectedSubjectId)
    } catch (e) {
      setLessonModalError(e.response?.data?.message ?? 'Tạo bài học thất bại.')
    } finally {
      setSavingLesson(false)
    }
  }

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title.trim()) { toast.error('Vui lòng nhập tiêu đề bài tập.'); return }
    setSavingAssignment(true)
    setAssignmentModalError('')
    try {
      await createAssignment({
        ...assignmentForm,
        subjectId: selectedSubjectId,
        classId: classId,
        lessonId: assignmentForm.lessonId || undefined
      })
      toast.success('Tạo bài tập thành công!')
      setShowCreateAssignmentModal(false)
      setAssignmentForm({
        title: '', description: '', content: '', dueDate: '', totalScore: 100,
        difficulty: 'MEDIUM', submissionType: 'TEXT', status: 'ASSIGNED',
        lessonId: '', cloIds: []
      })
      fetchSubjectAssignments(selectedSubjectId)
    } catch (e) {
      setAssignmentModalError(e.response?.data?.message ?? 'Tạo bài tập thất bại.')
    } finally {
      setSavingAssignment(false)
    }
  }

  const handleOpenCloneModal = async () => {
    setShowCloneAssignmentModal(true)
    setAllLecturerAssignmentsLoading(true)
    try {
      const r = await getAssignments({ limit: 100 })
      setAllLecturerAssignments(r.data.data?.assignments ?? r.data.data ?? [])
    } catch {
      setAllLecturerAssignments([])
    } finally {
      setAllLecturerAssignmentsLoading(false)
    }
  }

  const handleCloneAssignment = async () => {
    if (!selectedCloneAssignment) { toast.error('Vui lòng chọn một bài tập để sao chép.'); return }
    setSavingAssignment(true)
    setAssignmentModalError('')
    try {
      await createAssignment({
        title: selectedCloneAssignment.title,
        description: selectedCloneAssignment.description,
        content: selectedCloneAssignment.content,
        dueDate: selectedCloneAssignment.dueDate,
        totalScore: selectedCloneAssignment.totalScore,
        difficulty: selectedCloneAssignment.difficulty,
        submissionType: selectedCloneAssignment.submissionType,
        subjectId: selectedSubjectId,
        classId: classId,
        lessonId: undefined, // Clear lesson linking when cloning
        cloIds: selectedCloneAssignment.clos?.map(c => c.id) ?? [],
        status: 'DRAFT', // status: 'DRAFT' as requested in plan
      })
      toast.success('Sao chép bài tập thành công ở trạng thái Nháp!')
      setShowCloneAssignmentModal(false)
      setSelectedCloneAssignment(null)
      fetchSubjectAssignments(selectedSubjectId)
    } catch (e) {
      setAssignmentModalError(e.response?.data?.message ?? 'Sao chép bài tập thất bại.')
    } finally {
      setSavingAssignment(false)
    }
  }

  const toggleLessonCLO = id => setLessonForm(f => ({
    ...f, cloIds: f.cloIds.includes(id) ? f.cloIds.filter(c => c !== id) : [...f.cloIds, id]
  }))

  const toggleAssignmentCLO = id => setAssignmentForm(f => ({
    ...f, cloIds: f.cloIds.includes(id) ? f.cloIds.filter(c => c !== id) : [...f.cloIds, id]
  }))

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map(i => <Sk key={i} className="h-20 rounded-xl" />)}
        </div>
        <Sk className="h-[40vh] rounded-xl" />
      </div>
    )
  }

  if (!classDetail) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Không tìm thấy lớp học"
        sub="Lớp học không tồn tại hoặc bạn không có quyền truy cập."
        action={
          <button onClick={() => navigate('/lecturer/classes')} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại danh sách
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại
      </button>

      <PageHeader
        title={`Lớp: ${classDetail.name}`}
        description={`Môn hiện tại: ${classDetail.subjects?.find(s => s.id === selectedSubjectId)?.name || '—'} | Mã môn: ${classDetail.subjects?.find(s => s.id === selectedSubjectId)?.code || '—'} | Sĩ số: ${classDetail.studentCount ?? 0} | Trạng thái: ${classDetail.status}`}
      />

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Sĩ số', value: `${classDetail.studentCount ?? 0} sinh viên` },
          { label: 'Trạng thái', value: <Badge label={classDetail.status} /> },
          { label: 'Môn học hiện tại', value: classDetail.subjects?.find(s => s.id === selectedSubjectId) ? `${classDetail.subjects.find(s => s.id === selectedSubjectId).name} (${classDetail.subjects.find(s => s.id === selectedSubjectId).code})` : 'Chưa chọn' },
          { label: 'Mã đăng ký', value: classDetail.code },
        ].map((item, idx) => (
          <div key={idx} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300 mb-1">{item.label}</div>
            <div className="text-xs font-bold dark:text-gray-200 text-gray-800 truncate" title={typeof item.value === 'string' ? item.value : ''}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs list */}
      <div className="flex gap-2 border-b dark:border-[#21262D] border-gray-200 pb-px">
        {[
          { id: 'students', label: 'Sinh viên', icon: <Users size={13} /> },
          { id: 'progress', label: 'Tiến độ', icon: <BarChart3 size={13} /> },
          { id: 'content', label: 'Nội dung môn học', icon: <GraduationCap size={13} /> },
          { id: 'assignments', label: 'Bài tập của lớp', icon: <CheckCircle2 size={13} /> },
          { id: 'quizzes', label: 'Quiz môn học', icon: <Brain size={13} /> },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-blue-500 text-blue-500 dark:text-blue-400'
                : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-4">
        {activeTab === 'students' && (
          <div className="grid lg:grid-cols-12 gap-4 items-start">
            {/* Add student form */}
            <div className="lg:col-span-4 dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b dark:border-[#21262D] border-gray-100 pb-2">
                <UserPlus size={14} className="text-blue-400" />
                <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">Thêm sinh viên vào lớp</h4>
              </div>
              <ErrorBanner message={studentError} />
              <div>
                <label className={labelCls}>Email sinh viên *</label>
                <input
                  className={inputCls}
                  placeholder="VD: student@fpt.edu.vn"
                  value={studentEmail}
                  onChange={e => setStudentEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
                />
              </div>
              <button
                onClick={handleAddStudent}
                disabled={addingStudent || !studentEmail.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-all shadow-sm"
              >
                {addingStudent ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={13} />}
                {addingStudent ? 'Đang thêm...' : 'Thêm sinh viên'}
              </button>
            </div>

            {/* Students list */}
            <div className="lg:col-span-8 space-y-2">
              {studentsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
                </div>
              ) : students.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Chưa có sinh viên"
                  sub="Lớp học này chưa có sinh viên đăng ký học."
                />
              ) : (
                <TableShell headers={['Sinh viên', 'Email', 'Số điện thoại', 'Trạng thái', '']}>
                  {students.map(s => (
                    <Tr key={s.id}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-blue-400">{s.fullName?.[0]?.toUpperCase() ?? 'S'}</span>
                          </div>
                          <span className="text-xs font-medium dark:text-gray-200 text-gray-700">{s.fullName ?? '—'}</span>
                        </div>
                      </Td>
                      <Td><span className="text-xs dark:text-gray-400 text-gray-500">{s.email}</span></Td>
                      <Td><span className="text-xs dark:text-gray-400 text-gray-500">{s.phone ?? '—'}</span></Td>
                      <Td><Badge label={s.status} /></Td>
                      <Td>
                        <button
                          onClick={() => handleRemoveStudent(s.id, s.fullName)}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all"
                          title="Xoá sinh viên khỏi lớp"
                        >
                          <UserMinus size={12} />
                        </button>
                      </Td>
                    </Tr>
                  ))}
                </TableShell>
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {progressLoading ? (
              <div className="space-y-2">
                <Sk className="h-8 w-full rounded-lg" />
                <Sk className="h-[30vh] w-full rounded-lg" />
              </div>
            ) : !progressData || progressData.studentProgress?.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="Không có dữ liệu tiến độ"
                sub="Hãy gán bài tập cho lớp và đảm bảo có sinh viên trong lớp để theo dõi tiến độ."
              />
            ) : (
              <div className="overflow-x-auto dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b dark:border-[#21262D] border-gray-200">
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400">Sinh viên</th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400 text-center">Đã nộp</th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400 text-center">Đã chấm</th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400 text-center">Điểm TB</th>
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.studentProgress.map(student => (
                      <tr key={student.studentId} className="border-b dark:border-[#21262D]/60 border-gray-100 dark:hover:bg-[#21262D]/20 hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-xs font-semibold dark:text-gray-200 text-gray-800">{student.fullName}</div>
                            <div className="text-[10px] dark:text-gray-500 text-gray-400">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-xs dark:text-gray-450 text-gray-600">
                          {student.submittedCount}/{student.totalAssignments}
                        </td>
                        <td className="px-4 py-3 text-center text-xs dark:text-gray-450 text-gray-600">
                          {student.gradedCount}/{student.totalAssignments}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-blue-400">{student.averageScore}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => navigate(`/lecturer/classes/${classId}/subjects/${selectedSubjectId}/students/${student.studentId}`, { state: { from: location.pathname } })}
                            className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/20 text-[9px] font-bold rounded hover:bg-blue-500/20 transition-all"
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {selectedSubjectId ? (
              <div className="space-y-6">
                {/* Subject Info header card */}
                {classDetail.subjects?.filter(s => s.id === selectedSubjectId).map(s => (
                  <div key={s.id} className="dark:bg-[#161B22]/40 bg-white border dark:border-[#21262D] border-blue-50/50 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold dark:text-blue-400 text-blue-500 bg-blue-500/10 dark:bg-blue-400/10 px-2 py-0.5 rounded">{s.code}</span>
                        <h3 className="text-sm font-bold dark:text-white text-gray-800">{s.name}</h3>
                      </div>
                      <p className="text-[11px] dark:text-gray-400 text-gray-500 mt-1 max-w-2xl">{s.description || 'Chưa có mô tả cho môn học này.'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-semibold dark:text-gray-500 text-gray-400 block">Số tín chỉ</span>
                      <span className="text-xs font-bold dark:text-gray-300 text-gray-700">{s.credits ?? 3} tín chỉ</span>
                    </div>
                  </div>
                ))}

                {/* Lessons list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-400" />
                      <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">Bài học môn học</h4>
                    </div>
                    <button
                      onClick={() => navigate('/lecturer/lessons', { state: { from: location.pathname } })}
                      className="text-blue-500 hover:underline text-[10px] font-bold"
                    >
                      Quản lý bài học &rarr;
                    </button>
                  </div>

                  {lessonsLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
                    </div>
                  ) : lessons.length === 0 ? (
                    <p className="text-xs dark:text-gray-500 text-gray-400 text-center py-6 border border-dashed dark:border-gray-800 border-gray-200 rounded-xl">Chưa có bài học nào cho môn này.</p>
                  ) : (
                    <TableShell headers={['Bài học', 'Chương/Tuần', 'Trạng thái', 'Ngày tạo', 'Thao tác']}>
                      {(Array.isArray(lessons) ? lessons : []).map(l => (
                        <Tr key={l.id}>
                          <Td>
                            <span
                              onClick={() => navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } })}
                              className="text-xs font-medium dark:text-gray-250 text-gray-700 hover:text-blue-500 dark:hover:text-blue-450 hover:underline cursor-pointer"
                            >
                              {l.title}
                            </span>
                          </Td>
                          <Td><span className="text-xs dark:text-gray-400 text-gray-500">{l.chapter ?? '—'}</span></Td>
                          <Td><Badge label={l.status} /></Td>
                          <Td><span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDate(l.createdAt)}</span></Td>
                          <Td>
                            <div className="flex gap-2 justify-end">
                              {l.status === 'DRAFT' ? (
                                <button
                                  onClick={() => handlePublishLesson(l.id)}
                                  className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-450/20 text-[9px] font-bold rounded hover:bg-emerald-500/20 transition-all"
                                >
                                  Giao bài học
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUnpublishLesson(l.id)}
                                  className="px-2 py-0.5 bg-amber-500/10 text-amber-450 border border-amber-450/20 text-[9px] font-bold rounded hover:bg-amber-500/20 transition-all"
                                >
                                  Gỡ bài học
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } })}
                                className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/20 text-[9px] font-bold rounded hover:bg-blue-500/20 transition-all"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </Td>
                        </Tr>
                      ))}
                    </TableShell>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs dark:text-gray-500 text-gray-455 italic text-center py-8">Vui lòng chọn hoặc liên kết môn học để cấu hình nội dung.</p>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-amber-400" />
                <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800 font-sans">Bài tập của môn trong lớp</h4>
              </div>
              <button
                onClick={() => navigate('/lecturer/assignments', { state: { from: location.pathname } })}
                className="text-blue-500 hover:underline text-[10px] font-bold"
              >
                Quản lý bài tập &rarr;
              </button>
            </div>

            {classAssignmentsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
              </div>
            ) : classAssignments.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Chưa có bài tập"
                sub="Môn học này trong lớp chưa có bài tập nào. Hãy tạo bài tập ở trang Bài tập tổng ở trạng thái nháp rồi giao cho lớp."
              />
            ) : (
              <TableShell headers={['Tiêu đề', 'Môn học', 'Hạn nộp', 'Điểm tối đa', 'Hình thức', 'Trạng thái', 'Thao tác']}>
                {(Array.isArray(classAssignments) ? classAssignments : []).map(a => (
                  <Tr key={a.id}>
                    <Td>
                      <span
                        onClick={() => navigate(`/lecturer/assignments/${a.id}`, { state: { from: location.pathname } })}
                        className="text-xs font-medium dark:text-gray-250 text-gray-700 hover:text-blue-500 dark:hover:text-blue-450 hover:underline cursor-pointer"
                      >
                        {a.title}
                      </span>
                    </Td>
                    <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.subject?.name ?? '—'}</span></Td>
                    <Td>
                      <span className="text-[10px] dark:text-gray-400 text-gray-500">
                        {a.dueDate ? formatDate(a.dueDate) : '—'}
                      </span>
                    </Td>
                    <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.totalScore}</span></Td>
                    <Td><span className="text-[9px] font-bold px-1 py-0.5 rounded dark:bg-gray-800 bg-gray-100 dark:text-gray-400 text-gray-600">{a.submissionType}</span></Td>
                    <Td><Badge label={a.status} /></Td>
                    <Td>
                      <div className="flex gap-2 justify-end">
                        {a.status === 'DRAFT' ? (
                          <button
                            onClick={() => handlePublishAssignment(a.id)}
                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-450/20 text-[9px] font-bold rounded hover:bg-emerald-500/20 transition-all"
                          >
                            Giao bài tập
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublishAssignment(a.id)}
                            className="px-2 py-0.5 bg-amber-500/10 text-amber-450 border border-amber-450/20 text-[9px] font-bold rounded hover:bg-amber-500/20 transition-all"
                          >
                            Gỡ bài tập
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/lecturer/assignments/${a.id}`, { state: { from: location.pathname } })}
                          className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-400/20 text-[9px] font-bold rounded hover:bg-blue-500/20 transition-all"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleRemoveAssignmentFromClass(a.id, a.title)}
                          className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-400/20 text-[9px] font-bold rounded hover:bg-rose-500/20 transition-all"
                        >
                          Gỡ khỏi lớp
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TableShell>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={14} className="text-purple-400" />
                <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">Danh sách bộ câu hỏi (Quiz)</h4>
              </div>
              <button
                onClick={() => navigate('/lecturer/quizzes', { state: { from: location.pathname } })}
                className="text-blue-500 hover:underline text-[10px] font-bold"
              >
                Quản lý Quiz &rarr;
              </button>
            </div>

            {quizzesLoading ? (
              <div className="space-y-3">
                <Sk className="h-[40px] w-full" />
                <Sk className="h-[120px] w-full" />
              </div>
            ) : quizzes.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="Chưa có bộ Quiz nào"
                sub="Môn học này hiện chưa có bộ Quiz trắc nghiệm nào."
              />
            ) : (
              <TableShell headers={['Tên bộ Quiz', 'Bài giảng liên kết', 'Độ khó', 'Số câu hỏi', 'Ngày tạo', 'Trạng thái', 'Thao tác']}>
                {quizzes.map((q) => (
                  <Tr key={q.id}>
                    <Td className="font-semibold text-xs dark:text-gray-200 text-gray-800 max-w-xs truncate">{q.title}</Td>
                    <Td className="text-xs dark:text-gray-400 text-gray-600 max-w-[200px] truncate">{q.lesson?.title || '—'}</Td>
                    <Td>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        q.difficulty === 'EASY' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                        q.difficulty === 'MEDIUM' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                        'text-rose-500 bg-rose-500/10 border-rose-500/20'
                      }`}>
                        {q.difficulty === 'EASY' ? 'Dễ' : q.difficulty === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                      </span>
                    </Td>
                    <Td className="text-xs dark:text-gray-300 text-gray-700 font-bold">{q.questionCount ?? 0}</Td>
                    <Td className="text-[11px] dark:text-gray-500 text-gray-400">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</Td>
                    <Td><Badge label={q.status} /></Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {q.status === 'DRAFT' ? (
                          <button
                            onClick={() => handlePublishQuiz(q.id)}
                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-450/20 text-[9px] font-bold rounded hover:bg-emerald-500/20 transition-all"
                          >
                            Giao quiz
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublishQuiz(q.id)}
                            className="px-2 py-0.5 bg-amber-500/10 text-amber-450 border border-amber-450/20 text-[9px] font-bold rounded hover:bg-amber-500/20 transition-all"
                          >
                            Gỡ quiz
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/lecturer/quizzes/${q.id}`, { state: { from: location.pathname } })}
                          className="p-1 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                          title="Xem chi tiết câu hỏi"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleRemoveQuizFromClass(q.id, q.title)}
                          className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-400/20 text-[9px] font-bold rounded hover:bg-rose-500/20 transition-all"
                        >
                          Gỡ khỏi lớp
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TableShell>
            )}
          </div>
        )}
      </div>



      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })}
      />
    </div>
  )
}
