import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Brain, Pencil, Trash2, MoreHorizontal, Eye, Sparkles } from 'lucide-react'
import {
  getQuizzes, createQuiz, updateQuiz, deleteQuiz
} from '../../../services/quiz.api'
import { getLecturerSubjects } from '../../../services/subject.api'
import { getLessons } from '../../../services/lesson.api'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, TableShell, Tr, Td,
  Badge, Sk, EmptyState, ErrorBanner, Pagination, inputCls, labelCls
} from '../components/LecturerUI'
import PortalDropdown from '../../../components/common/PortalDropdown'
import ConfirmModal from '../../../components/common/ConfirmModal'
import ImportAIModal from '../components/ImportAIModal'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
const DIFF_LABELS   = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }
const DIFF_COLORS   = { EASY: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', MEDIUM: 'text-amber-500 bg-amber-500/10 border-amber-500/20', HARD: 'text-rose-500 bg-rose-500/10 border-rose-500/20' }

const EMPTY_QUIZ = {
  title: '',
  description: '',
  difficulty: 'MEDIUM',
  subjectId: '',
  lessonId: ''
}

function QuizModal({ mode, initial, subjects, onClose, onSave, saving, error }) {
  const [lessons, setLessons] = useState([])
  const [form, setForm] = useState(initial ? {
    title: initial.title ?? '',
    description: initial.description ?? '',
    difficulty: initial.difficulty ?? 'MEDIUM',
    subjectId: initial.subjectId ?? '',
    lessonId: initial.lessonId ?? ''
  } : EMPTY_QUIZ)

  useEffect(() => {
    if (!form.subjectId) {
      setLessons([])
      return
    }
    getLessons({ subjectId: form.subjectId })
      .then(r => setLessons(Array.isArray(r.data.data) ? r.data.data : r.data.data?.lessons ?? []))
      .catch(() => setLessons([]))
  }, [form.subjectId])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader title={mode === 'create' ? 'Tạo bộ Quiz mới' : 'Chỉnh sửa bộ Quiz'} onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div>
          <label className={labelCls}>Tiêu đề Quiz *</label>
          <input className={inputCls} placeholder="Quiz 1: Kiến thức cơ bản về React" value={form.title} onChange={set('title')} />
        </div>
        <div>
          <label className={labelCls}>Mô tả</label>
          <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Kiểm tra kiến thức tổng quan..." value={form.description} onChange={set('description')} />
        </div>
        <div>
          <label className={labelCls}>Môn học *</label>
          {mode === 'edit' ? (
            <input className={inputCls} disabled value={initial.subject?.name || ''} />
          ) : (
            <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Chọn môn học</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          )}
        </div>
        <div>
          <label className={labelCls}>Bài học liên kết</label>
          <select className={inputCls} value={form.lessonId} onChange={set('lessonId')}>
            <option value="">Không liên kết</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Độ khó</label>
          <div className="flex gap-2">
            {DIFFICULTIES.map(d => (
              <button key={d} type="button" onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  form.difficulty === d
                    ? d === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-300 dark:border-emerald-500/30'
                      : d === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-300 dark:border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-500 border-rose-300 dark:border-rose-500/30'
                    : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200 dark:hover:bg-gray-800 hover:bg-gray-50'
                }`}>
                {DIFF_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => onSave(form)} saving={saving} saveLabel={mode === 'create' ? 'Tạo mới' : 'Cập nhật'} />
    </Modal>
  )
}

function ActionMenu({ quiz, onEdit, onDelete, onView }) {
  return (
    <PortalDropdown
      trigger={
        <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      }
    >
      <div className="py-1 min-w-[140px] dark:bg-[#161B22] bg-white border dark:border-[#30363D] border-gray-200 rounded-lg shadow-xl">
        <button
          onClick={(e) => { e.stopPropagation(); onView(quiz) }}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
        >
          <Eye size={12} />
          Chi tiết câu hỏi
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(quiz) }}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] dark:text-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
        >
          <Pencil size={12} />
          Chỉnh sửa Quiz
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(quiz) }}
          className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 transition-colors text-left font-semibold"
        >
          <Trash2 size={12} />
          Xóa Quiz
        </button>
      </div>
    </PortalDropdown>
  )
}

export default function QuizManagementPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [quizzes, setQuizzes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [subjects, setSubjects] = useState([])
  const [lessons, setLessons] = useState([])

  // Modal control
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', initial: null|quiz }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
  const [showImportAIModal, setShowImportAIModal] = useState(false)

  // Filter & Search states
  const [subjectId, setSubjectId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  // Fetch subjects
  useEffect(() => {
    getLecturerSubjects()
      .then(r => setSubjects(r.data.data?.subjects ?? r.data.data ?? []))
      .catch(() => {})
  }, [])

  // Fetch lessons when subject filter changes
  useEffect(() => {
    if (!subjectId) {
      setLessons([])
      setLessonId('')
      return
    }
    getLessons({ subjectId })
      .then(r => setLessons(Array.isArray(r.data.data) ? r.data.data : r.data.data?.lessons ?? []))
      .catch(() => setLessons([]))
  }, [subjectId])

  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getQuizzes({
        page,
        limit,
        subjectId: subjectId || undefined,
        lessonId: lessonId || undefined,
        search: search || undefined
      })
      const items = res.data?.data?.quizzes ?? res.data?.data ?? []
      const meta = res.data?.data?.meta ?? {}
      setQuizzes(items)
      setTotal(meta.total ?? items.length)
    } catch {
      toast.error('Không thể tải danh sách bộ câu hỏi.')
    } finally {
      setLoading(false)
    }
  }, [page, subjectId, lessonId, search])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  const handleCreate = () => {
    setError('')
    setModal({ mode: 'create', initial: null })
  }

  const handleEdit = (quiz) => {
    setError('')
    setModal({ mode: 'edit', initial: quiz })
  }

  const handleDelete = (quiz) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa bộ Quiz',
      message: `Bạn có chắc chắn muốn xóa bộ Quiz "${quiz.title}"?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await deleteQuiz(quiz.id)
          toast.success('Xóa bộ Quiz thành công!')
          fetchQuizzes()
        } catch (err) {
          toast.error(err.response?.data?.message ?? 'Xóa bộ Quiz thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const handleSave = async (formData) => {
    setSaving(true)
    setError('')
    const payload = {
      ...formData,
      lessonId: formData.lessonId || null
    }
    try {
      if (modal.mode === 'create') {
        await createQuiz(payload)
        toast.success('Tạo bộ Quiz thành công!')
      } else {
        await updateQuiz(modal.initial.id, payload)
        toast.success('Cập nhật bộ Quiz thành công!')
      }
      setModal(null)
      fetchQuizzes()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Thực hiện thất bại.')
    } finally {
      setSaving(false)
    }
  }

  const handleView = (quiz) => {
    navigate(`/lecturer/quizzes/${quiz.id}`, { state: { from: location.pathname } })
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Quản lý Quiz"
        description="Quản lý các bộ câu hỏi trắc nghiệm của giảng viên theo môn học và bài giảng."
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowImportAIModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm">
              <Sparkles size={13} /> Import từ AI History
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
            >
              <Plus size={13} />
              Tạo bộ Quiz mới
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-gray-200/80 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 flex-wrap flex-1 max-w-3xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bộ Quiz..."
              className={inputCls + ' pl-8'}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className={inputCls + ' max-w-[200px]'} value={subjectId} onChange={e => { setSubjectId(e.target.value); setPage(1) }}>
            <option value="">Tất cả môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
          </select>
          <select className={inputCls + ' max-w-[200px]'} value={lessonId} onChange={e => { setLessonId(e.target.value); setPage(1) }} disabled={!subjectId}>
            <option value="">Tất cả bài học</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>

      {/* Table list */}
      {loading ? (
        <div className="space-y-3">
          <Sk className="h-[40px] w-full" />
          <Sk className="h-[120px] w-full" />
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Không tìm thấy bộ Quiz nào"
          sub="Bạn chưa tạo bộ câu hỏi trắc nghiệm nào, hoặc các bộ Quiz không khớp bộ lọc."
          action={
            <button onClick={handleCreate} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-all">
              Tạo bộ Quiz mới
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          <TableShell headers={['Tên bộ Quiz', 'Môn học', 'Bài giảng', 'Độ khó', 'Số câu hỏi', 'Ngày tạo', 'Thao tác']}>
            {quizzes.map((q) => (
              <Tr key={q.id} onClick={() => handleView(q)}>
                <Td className="font-semibold text-xs dark:text-gray-200 text-gray-800 max-w-xs truncate">{q.title}</Td>
                <Td className="text-xs dark:text-gray-400 text-gray-600 font-mono">{q.subject?.code}</Td>
                <Td className="text-xs dark:text-gray-400 text-gray-600 max-w-[200px] truncate">{q.lesson?.title || '—'}</Td>
                <Td>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_COLORS[q.difficulty]}`}>
                    {DIFF_LABELS[q.difficulty]}
                  </span>
                </Td>
                <Td className="text-xs dark:text-gray-300 text-gray-700 font-bold">{q.questionCount ?? 0}</Td>
                <Td className="text-[11px] dark:text-gray-500 text-gray-400">{new Date(q.createdAt).toLocaleDateString('vi-VN')}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    quiz={q}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </Td>
              </Tr>
            ))}
          </TableShell>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* Modal create/edit */}
      {modal && (
        <QuizModal
          mode={modal.mode}
          initial={modal.initial}
          subjects={subjects}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
          error={error}
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

      <ImportAIModal
        isOpen={showImportAIModal}
        onClose={() => setShowImportAIModal(false)}
        type="QUIZ"
        onImportSuccess={fetchQuizzes}
      />
    </div>
  )
}
