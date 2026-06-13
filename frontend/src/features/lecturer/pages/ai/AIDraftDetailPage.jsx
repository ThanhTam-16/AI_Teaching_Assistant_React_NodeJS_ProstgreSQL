import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronLeft, History, Copy, CheckCircle2, Sparkles, Brain,
  Target, BookOpen, FileSliders, Save, Pencil, Eye, Plus, Trash2, Check
} from 'lucide-react'
import {
  getAIHistoryById, saveAIExerciseAsAssignment, saveAIQuiz, saveAILessonOutline, deleteAIHistory
} from '../../../../services/ai.api'
import { getLecturerSubjects } from '../../../../services/subject.api'
import { getCLOs } from '../../../../services/clo.api'
import { getLecturerClasses } from '../../../../services/class.api'
import { getLessons } from '../../../../services/lesson.api'
import { formatDateTime } from '../../../../utils/formatDate'
import {
  PageHeader, Sk, EmptyState, Badge, Modal, ModalHeader, ModalFooter,
  ErrorBanner, inputCls, labelCls
} from '../../components/LecturerUI'
import ConfirmModal from '../../../../components/common/ConfirmModal'
import { formatLessonOutline } from '../../../../utils/formatAIContent'

// ── Save Exercise Modal ────────────────────────────────────────────────────────
function SaveExerciseModal({ onClose, aiGenerationId, exercise, subjects }) {
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [clos, setClos] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    lessonId: '',
    cloId: '',
    dueDate: '',
    totalScore: 10
  })

  useEffect(() => {
    getLecturerClasses().then(r => setClasses(r.data.data?.classes ?? r.data.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.subjectId) {
      setLessons([])
      setClos([])
      return
    }
    getLessons({ subjectId: form.subjectId }).then(r => setLessons(Array.isArray(r.data.data) ? r.data.data : r.data.data?.lessons ?? [])).catch(() => {})
    getCLOs({ subjectId: form.subjectId }).then(r => setClos(r.data.data ?? [])).catch(() => {})
  }, [form.subjectId])

  const handleSave = async () => {
    if (!form.classId) { toast.error('Vui lòng chọn lớp học.'); return }
    if (!form.subjectId) { toast.error('Vui lòng chọn môn học.'); return }
    setSaving(true); setError('')
    try {
      await saveAIExerciseAsAssignment({
        aiGenerationId,
        exercise,
        ...form
      })
      toast.success('Đã lưu bài tập vào danh sách Bài tập!')
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader title="Lưu bài tập vào hệ thống" onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div>
          <label className={labelCls}>Môn học *</label>
          <select className={inputCls} value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, lessonId: '', cloId: '' }))}>
            <option value="">Chọn môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Lớp học *</label>
          <select className={inputCls} value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}>
            <option value="">Chọn lớp học</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Bài học liên kết</label>
            <select className={inputCls} value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}>
              <option value="">Không liên kết</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>CLO liên quan</label>
            <select className={inputCls} value={form.cloId} onChange={e => setForm(f => ({ ...f, cloId: e.target.value }))}>
              <option value="">Không liên kết</option>
              {clos.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Hạn nộp</label>
            <input className={inputCls} type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>Điểm tối đa</label>
            <input className={inputCls} type="number" min="0" value={form.totalScore} onChange={e => setForm(f => ({ ...f, totalScore: e.target.value }))} />
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Xác nhận lưu" />
    </Modal>
  )
}

// ── Save Quiz Modal ───────────────────────────────────────────────────────────
function SaveQuizModal({ onClose, aiGenerationId, title, questions, subjects }) {
  const [lessons, setLessons] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    subjectId: '',
    lessonId: '',
    title: title || '',
    difficulty: 'MEDIUM'
  })

  useEffect(() => {
    if (!form.subjectId) {
      setLessons([])
      return
    }
    getLessons({ subjectId: form.subjectId }).then(r => setLessons(Array.isArray(r.data.data) ? r.data.data : r.data.data?.lessons ?? [])).catch(() => {})
  }, [form.subjectId])

  const handleSave = async () => {
    if (!form.subjectId) { toast.error('Vui lòng chọn môn học.'); return }
    if (!form.title.trim()) { toast.error('Vui lòng nhập tiêu đề Quiz.'); return }
    setSaving(true); setError('')
    try {
      await saveAIQuiz({
        aiGenerationId,
        questions,
        ...form,
        lessonId: form.lessonId || null
      })
      toast.success('Đã lưu bộ Quiz vào hệ thống!')
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader title="Lưu bộ Quiz vào hệ thống" onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div>
          <label className={labelCls}>Tiêu đề Quiz *</label>
          <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label className={labelCls}>Môn học *</label>
          <select className={inputCls} value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, lessonId: '' }))}>
            <option value="">Chọn môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Bài học liên kết</label>
            <select className={inputCls} value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}>
              <option value="">Không liên kết</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Độ khó</label>
            <select className={inputCls} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Xác nhận lưu" />
    </Modal>
  )
}

// ── Save Lesson Outline Modal ─────────────────────────────────────────────────
function SaveLessonOutlineModal({ onClose, aiGenerationId, title, content, subjects }) {
  const [clos, setClos] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    subjectId: '',
    cloId: '',
    chapter: '1'
  })

  useEffect(() => {
    if (!form.subjectId) {
      setClos([])
      return
    }
    getCLOs({ subjectId: form.subjectId }).then(r => setClos(r.data.data ?? [])).catch(() => {})
  }, [form.subjectId])

  const handleSave = async () => {
    if (!form.subjectId) { toast.error('Vui lòng chọn môn học.'); return }
    setSaving(true); setError('')
    try {
      await saveAILessonOutline({
        aiGenerationId,
        title,
        content,
        ...form
      })
      toast.success('Đã lưu Giáo án thành Bài học!')
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader title="Lưu Giáo án thành bài học" onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div>
          <label className={labelCls}>Tiêu đề bài học</label>
          <input className={inputCls} disabled value={title || ''} />
        </div>
        <div>
          <label className={labelCls}>Môn học *</label>
          <select className={inputCls} value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, cloId: '' }))}>
            <option value="">Chọn môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>CLO liên quan</label>
            <select className={inputCls} value={form.cloId} onChange={e => setForm(f => ({ ...f, cloId: e.target.value }))}>
              <option value="">Không liên kết</option>
              {clos.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Chương / Tuần</label>
            <input className={inputCls} type="number" min="1" value={form.chapter} onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))} />
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Xác nhận lưu" />
    </Modal>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIDraftDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [saveModal, setSaveModal] = useState(null) // { type, ... }
  const [deleting, setDeleting] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/ai/history')
    }
  }

  const handleDeleteDraft = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa bản nháp AI',
      message: 'Bạn có chắc chắn muốn xóa bản nháp AI này?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        setDeleting(true)
        try {
          await deleteAIHistory(id)
          toast.success('Xóa bản nháp thành công!')
          navigate('/lecturer/ai/history')
        } catch {
          toast.error('Xóa bản nháp thất bại.')
        } finally {
          setDeleting(false)
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const fetchDetail = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getAIHistoryById(id)
      const data = r.data.data
      setDraft(data)
      
      let parsed = data.result
      if (typeof data.result === 'string') {
        try {
          parsed = JSON.parse(data.result)
        } catch {
          parsed = data.result
        }
      }
      setResultData(parsed)

      // Fetch subjects for save dropdowns
      const sRes = await getLecturerSubjects()
      setSubjects(sRes.data.data?.subjects ?? sRes.data.data ?? [])
    } catch {
      toast.error('Không thể tải chi tiết lịch sử AI.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleCopy = async () => {
    if (!resultData) return
    const content = typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Đã sao chép!')
  }

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

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <Sk className="h-24 w-full rounded-xl mb-4" />
        <Sk className="h-[40vh] w-full rounded-xl" />
      </div>
    )
  }

  if (!draft) {
    return (
      <EmptyState
        icon={History}
        title="Không tìm thấy bản ghi"
        sub="Bản ghi lịch sử AI này không tồn tại hoặc đã bị xoá."
        action={
          <button onClick={handleBack} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại lịch sử
          </button>
        }
      />
    )
  }

  const metaInfo = getTypeMeta(draft.type)
  const Icon = metaInfo.icon

  // Update handlers
  const updateExercise = (index, field, value) => {
    setResultData(prev => {
      const exercises = [...prev.exercises]
      exercises[index] = { ...exercises[index], [field]: value }
      return { ...prev, exercises }
    })
  }

  const deleteExercise = (index) => {
    setResultData(prev => {
      const exercises = prev.exercises.filter((_, i) => i !== index)
      return { ...prev, exercises }
    })
  }

  const addExercise = () => {
    setResultData(prev => {
      const exercises = [...(prev.exercises || []), { title: 'Bài tập mới', difficulty: 'MEDIUM', description: 'Mô tả bài tập...', requirements: [], rubric: [] }]
      return { ...prev, exercises }
    })
  }

  const updateQuestion = (index, field, value) => {
    setResultData(prev => {
      const questions = [...prev.questions]
      questions[index] = { ...questions[index], [field]: value }
      return { ...prev, questions }
    })
  }

  const deleteQuestion = (index) => {
    setResultData(prev => {
      const questions = prev.questions.filter((_, i) => i !== index)
      return { ...prev, questions }
    })
  }

  const addQuestion = () => {
    setResultData(prev => {
      const questions = [...(prev.questions || []), { questionText: 'Câu hỏi mới', questionType: 'MULTIPLE_CHOICE', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' }]
      return { ...prev, questions }
    })
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại
      </button>

      <PageHeader
        title={`Chi tiết Lịch sử AI`}
        description={`Mã bản ghi: ${draft.id}`}
        actions={
          <button
            onClick={handleDeleteDraft}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg disabled:opacity-60 transition-all shadow-sm"
          >
            {deleting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={13} />}
            Xóa bản nháp
          </button>
        }
      />

      {/* Info Card */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b dark:border-gray-800 border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${metaInfo.color}`}>
              <Icon size={11} />
              {metaInfo.label}
            </div>
            <span className="text-[11px] dark:text-gray-500 text-gray-400">{formatDateTime(draft.createdAt)}</span>
          </div>
          <Badge label={draft.status} />
        </div>

        {draft.prompt && (
          <div>
            <strong className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wider mb-1.5">Prompt đầu vào:</strong>
            <div className="text-xs dark:text-gray-300 text-gray-750 dark:bg-[#0D1117]/80 bg-gray-50 p-3.5 rounded-xl border dark:border-[#21262D] border-gray-150 leading-relaxed font-mono whitespace-pre-wrap">
              {draft.prompt}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Editor / Previewer */}
      {resultData && (
        <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-3">
            <span className="text-xs font-bold dark:text-gray-200 text-gray-850">Nội dung & Tái sử dụng</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border dark:bg-[#21262D] bg-gray-100 dark:text-gray-300 text-gray-600 border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                {isEditMode ? <Eye size={11} /> : <Pencil size={11} />}
                {isEditMode ? 'Chế độ xem' : 'Chỉnh sửa'}
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border transition-all
                  ${copied
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
                    : 'dark:bg-[#21262D] bg-gray-100 dark:text-gray-300 text-gray-600 border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                {copied ? 'Đã sao chép' : 'Sao chép JSON'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* EXERCISE RENDERER */}
            {draft.type === 'EXERCISE' && resultData.exercises && (
              <div className="space-y-4">
                {resultData.exercises.map((ex, idx) => (
                  <div key={idx} className="border dark:border-gray-800 border-gray-150 rounded-xl p-4 space-y-3 dark:bg-[#0D1117]/30 bg-gray-50/20">
                    <div className="flex items-start justify-between gap-3 border-b dark:border-gray-800 border-gray-100 pb-2">
                      <div className="flex-1 min-w-0">
                        {isEditMode ? (
                          <input
                            className={inputCls}
                            value={ex.title || ''}
                            onChange={e => updateExercise(idx, 'title', e.target.value)}
                            placeholder="Tiêu đề bài tập"
                          />
                        ) : (
                          <h4 className="text-xs font-bold dark:text-gray-250 text-gray-800">{ex.title}</h4>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isEditMode ? (
                          <select
                            className={inputCls}
                            value={ex.difficulty || 'MEDIUM'}
                            onChange={e => updateExercise(idx, 'difficulty', e.target.value)}
                          >
                            <option value="EASY">Dễ</option>
                            <option value="MEDIUM">Trung bình</option>
                            <option value="HARD">Khó</option>
                          </select>
                        ) : (
                          <Badge label={ex.difficulty} />
                        )}
                        <button
                          onClick={() => setSaveModal({ type: 'EXERCISE', data: ex })}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-[10px] font-bold shadow-sm transition-all"
                        >
                          <Save size={10} /> Tạo thực tế
                        </button>
                        {isEditMode && (
                          <button
                            onClick={() => deleteExercise(idx)}
                            className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-500/5 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide mb-1">Mô tả chi tiết:</span>
                      {isEditMode ? (
                        <textarea
                          className={inputCls}
                          rows={3}
                          value={ex.description || ''}
                          onChange={e => updateExercise(idx, 'description', e.target.value)}
                        />
                      ) : (
                        <p className="text-xs dark:text-gray-300 text-gray-650 leading-relaxed whitespace-pre-wrap">{ex.description}</p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div>
                      <span className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide mb-1">Yêu cầu cần đạt:</span>
                      {isEditMode ? (
                        <textarea
                          className={inputCls}
                          rows={2}
                          value={Array.isArray(ex.requirements) ? ex.requirements.join('\n') : ex.requirements || ''}
                          onChange={e => updateExercise(idx, 'requirements', e.target.value.split('\n'))}
                          placeholder="Mỗi dòng là một yêu cầu"
                        />
                      ) : (
                        <ul className="list-disc pl-4 space-y-1 text-xs dark:text-gray-400 text-gray-550">
                          {Array.isArray(ex.requirements) ? ex.requirements.map((r, ri) => <li key={ri}>{r}</li>) : <li>{ex.requirements || '—'}</li>}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
                {isEditMode && (
                  <button
                    onClick={addExercise}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed dark:border-gray-800 border-gray-200 dark:hover:border-blue-500/40 hover:border-blue-400 rounded-xl text-xs font-bold dark:text-gray-400 text-gray-500 hover:text-blue-500 transition-all"
                  >
                    <Plus size={13} /> Thêm bài tập mới
                  </button>
                )}
              </div>
            )}

            {/* QUIZ RENDERER */}
            {draft.type === 'QUIZ' && resultData.questions && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800 border-gray-100">
                  <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">{resultData.quizTitle || 'Bộ câu hỏi trắc nghiệm'}</h4>
                  <button
                    onClick={() => setSaveModal({ type: 'QUIZ', data: resultData.questions })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-[10px] font-bold shadow-sm transition-all"
                  >
                    <Save size={10} /> Lưu thành Quiz thực tế
                  </button>
                </div>
                {resultData.questions.map((q, idx) => (
                  <div key={idx} className="border dark:border-gray-800 border-gray-150 rounded-xl p-4 space-y-3 dark:bg-[#0D1117]/30 bg-gray-50/20">
                    <div className="flex items-start justify-between gap-3 border-b dark:border-gray-800 border-gray-100 pb-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">Câu hỏi {idx + 1}:</span>
                        {isEditMode ? (
                          <input
                            className={inputCls}
                            value={q.questionText || ''}
                            onChange={e => updateQuestion(idx, 'questionText', e.target.value)}
                          />
                        ) : (
                          <h5 className="text-xs font-semibold dark:text-gray-250 text-gray-850 mt-1">{q.questionText}</h5>
                        )}
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => deleteQuestion(idx)}
                          className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-500/5 flex items-center justify-center transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-2">
                      {q.options && q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400">{String.fromCharCode(65 + oIdx)}.</span>
                          {isEditMode ? (
                            <input
                              className={inputCls}
                              value={opt || ''}
                              onChange={e => {
                                const options = [...q.options]
                                options[oIdx] = e.target.value
                                updateQuestion(idx, 'options', options)
                              }}
                            />
                          ) : (
                            <span className="text-xs dark:text-gray-300 text-gray-700">{opt}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Correct Answer & Explanation */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t dark:border-gray-800 border-gray-100 text-[11px]">
                      <div>
                        <span className="font-bold text-emerald-400">Đáp án đúng:</span>
                        {isEditMode ? (
                          <input
                            className={inputCls + ' mt-1'}
                            value={q.correctAnswer || ''}
                            onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                          />
                        ) : (
                          <span className="ml-1.5 font-bold dark:text-gray-250 text-gray-800">{q.correctAnswer}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-blue-400">Giải thích:</span>
                        {isEditMode ? (
                          <input
                            className={inputCls + ' mt-1'}
                            value={q.explanation || ''}
                            onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
                          />
                        ) : (
                          <span className="ml-1.5 dark:text-gray-400 text-gray-600">{q.explanation || '—'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isEditMode && (
                  <button
                    onClick={addQuestion}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed dark:border-gray-800 border-gray-200 dark:hover:border-blue-500/40 hover:border-blue-400 rounded-xl text-xs font-bold dark:text-gray-400 text-gray-500 hover:text-blue-500 transition-all"
                  >
                    <Plus size={13} /> Thêm câu hỏi mới
                  </button>
                )}
              </div>
            )}

            {/* FEEDBACK RENDERER */}
            {draft.type === 'FEEDBACK' && (
              <div className="space-y-3">
                <span className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide">Nội dung phản hồi AI:</span>
                {isEditMode ? (
                  <textarea
                    className={inputCls}
                    rows={8}
                    value={resultData.feedback ?? (typeof resultData === 'string' ? resultData : '')}
                    onChange={e => setResultData(prev => typeof prev === 'string' ? e.target.value : { ...prev, feedback: e.target.value })}
                  />
                ) : (
                  <div className="dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-xl p-4 text-xs dark:text-gray-200 text-gray-850 leading-relaxed whitespace-pre-wrap">
                    {resultData.feedback ?? (typeof resultData === 'string' ? resultData : 'Chưa có nội dung')}
                  </div>
                )}
                <div className="text-[10px] dark:text-gray-500 text-gray-400 border-t dark:border-gray-800 border-gray-100 pt-2 flex items-center gap-1">
                  <Target size={11} />
                  <span>Hãy copy nội dung này và paste vào trang chấm điểm bài nộp của sinh viên.</span>
                </div>
              </div>
            )}

            {/* LESSON OUTLINE RENDERER */}
            {draft.type === 'LESSON_OUTLINE' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b dark:border-gray-800 border-gray-100">
                  {isEditMode ? (
                    <input
                      className={inputCls + ' max-w-md'}
                      value={resultData.title || ''}
                      onChange={e => setResultData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Tiêu đề giáo án"
                    />
                  ) : (
                    <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">{resultData.title || 'Đại cương Bài giảng'}</h4>
                  )}
                  <button
                    onClick={() => setSaveModal({ type: 'LESSON_OUTLINE', data: resultData })}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-[10px] font-bold shadow-sm transition-all"
                  >
                    <Save size={10} /> Lưu thành Bài học thực tế
                  </button>
                </div>

                {/* Sections */}
                {resultData.sections && resultData.sections.map((sec, idx) => (
                  <div key={idx} className="border dark:border-gray-800 border-gray-150 rounded-xl p-4 space-y-2.5 dark:bg-[#0D1117]/30 bg-gray-50/20">
                    <div className="flex justify-between items-start gap-2 border-b dark:border-gray-800 border-gray-100 pb-1.5">
                      <div className="flex-1">
                        <span className="text-[9px] font-bold text-sky-400">Phần {idx + 1}:</span>
                        {isEditMode ? (
                          <input
                            className={inputCls + ' mt-1'}
                            value={sec.heading || ''}
                            onChange={e => {
                              const sections = [...resultData.sections]
                              sections[idx] = { ...sections[idx], heading: e.target.value }
                              setResultData(prev => ({ ...prev, sections }))
                            }}
                          />
                        ) : (
                          <h5 className="text-xs font-semibold dark:text-gray-250 text-gray-800 mt-0.5">{sec.heading}</h5>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide">Tóm tắt:</span>
                      {isEditMode ? (
                        <textarea
                          className={inputCls}
                          rows={2}
                          value={sec.summary || ''}
                          onChange={e => {
                            const sections = [...resultData.sections]
                            sections[idx] = { ...sections[idx], summary: e.target.value }
                            setResultData(prev => ({ ...prev, sections }))
                          }}
                        />
                      ) : (
                        <p className="text-xs dark:text-gray-300 text-gray-650 leading-relaxed">{sec.summary}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SLIDE OUTLINE RENDERER */}
            {draft.type === 'SLIDE_OUTLINE' && resultData.slides && (
              <div className="space-y-4">
                <span className="block text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide">Bản phác thảo slides bài giảng:</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {resultData.slides.map((slide, idx) => (
                    <div key={idx} className="border dark:border-gray-800 border-gray-200 rounded-xl p-4 dark:bg-[#0D1117] bg-gray-50 space-y-2">
                      <div className="flex justify-between items-center border-b dark:border-gray-800 border-gray-100 pb-1.5">
                        <span className="text-[10px] font-bold text-orange-400">Slide {slide.slideNumber ?? idx + 1}</span>
                      </div>
                      {isEditMode ? (
                        <input
                          className={inputCls}
                          value={slide.title || ''}
                          onChange={e => {
                            const slides = [...resultData.slides]
                            slides[idx] = { ...slides[idx], title: e.target.value }
                            setResultData(prev => ({ ...prev, slides }))
                          }}
                        />
                      ) : (
                        <h5 className="text-xs font-semibold dark:text-gray-200 text-gray-800 truncate">{slide.title}</h5>
                      )}
                      <div>
                        <span className="text-[9px] font-bold dark:text-gray-500 text-gray-400 block mb-1">Nội dung (Bullets):</span>
                        {isEditMode ? (
                          <textarea
                            className={inputCls}
                            rows={3}
                            value={Array.isArray(slide.bulletPoints) ? slide.bulletPoints.join('\n') : slide.bulletPoints || ''}
                            onChange={e => {
                              const slides = [...resultData.slides]
                              slides[idx] = { ...slides[idx], bulletPoints: e.target.value.split('\n') }
                              setResultData(prev => ({ ...prev, slides }))
                            }}
                          />
                        ) : (
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] dark:text-gray-400 text-gray-600">
                            {Array.isArray(slide.bulletPoints) ? slide.bulletPoints.map((bp, bpi) => <li key={bpi}>{bp}</li>) : <li>{slide.bulletPoints}</li>}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Modals */}
      {saveModal?.type === 'EXERCISE' && (
        <SaveExerciseModal
          aiGenerationId={draft.id}
          exercise={saveModal.data}
          subjects={subjects}
          onClose={() => setSaveModal(null)}
        />
      )}
      {saveModal?.type === 'QUIZ' && (
        <SaveQuizModal
          aiGenerationId={draft.id}
          title={draft.prompt?.slice(0,40)}
          questions={saveModal.data}
          subjects={subjects}
          onClose={() => setSaveModal(null)}
        />
      )}
      {saveModal?.type === 'LESSON_OUTLINE' && (
        <SaveLessonOutlineModal
          aiGenerationId={draft.id}
          title={saveModal.data.title || draft.prompt?.slice(0, 40)}
          content={formatLessonOutline(saveModal.data)}
          subjects={subjects}
          onClose={() => setSaveModal(null)}
        />
      )}

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
