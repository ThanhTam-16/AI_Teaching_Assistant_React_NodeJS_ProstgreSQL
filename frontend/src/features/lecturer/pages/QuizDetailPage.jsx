import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ChevronLeft, Plus, Pencil, Trash2, HelpCircle, Check,
  BookOpen, AlertCircle, Info, Sparkles
} from 'lucide-react'
import {
  getQuizById, addQuizQuestion, updateQuizQuestion, deleteQuizQuestion
} from '../../../services/quiz.api'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, Badge, Sk, EmptyState,
  ErrorBanner, inputCls, labelCls
} from '../components/LecturerUI'
import ConfirmModal from '../../../components/common/ConfirmModal'

const TYPE_LABELS = {
  MULTIPLE_CHOICE: 'Trắc nghiệm (MCQ)',
  TRUE_FALSE: 'Đúng / Sai',
  SHORT_ANSWER: 'Trả lời ngắn'
}

const TYPE_COLORS = {
  MULTIPLE_CHOICE: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  TRUE_FALSE: 'text-sky-400 bg-sky-500/10 border-sky-400/20',
  SHORT_ANSWER: 'text-amber-400 bg-amber-500/10 border-amber-400/20'
}

function QuestionModal({ mode, initial, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initial ? {
    questionText: initial.questionText ?? '',
    questionType: initial.questionType ?? 'MULTIPLE_CHOICE',
    options: Array.isArray(initial.options) ? [...initial.options] : ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
    correctAnswer: initial.correctAnswer ?? '',
    explanation: initial.explanation ?? ''
  } : {
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  })

  // Keep track of which option index is selected as correct
  const [correctIndex, setCorrectIndex] = useState(() => {
    if (initial && Array.isArray(initial.options)) {
      const idx = initial.options.indexOf(initial.correctAnswer)
      return idx >= 0 ? idx : 0
    }
    return 0
  })

  const handleTypeChange = (newType) => {
    let opts = []
    let correctIdx = 0
    let correctVal = ''

    if (newType === 'MULTIPLE_CHOICE') {
      opts = ['', '', '', '']
      correctVal = ''
    } else if (newType === 'TRUE_FALSE') {
      opts = ['Đúng', 'Sai']
      correctVal = 'Đúng'
    } else {
      opts = []
      correctVal = ''
    }

    setCorrectIndex(correctIdx)
    setForm(f => ({
      ...f,
      questionType: newType,
      options: opts,
      correctAnswer: correctVal
    }))
  }

  const handleOptionTextChange = (idx, text) => {
    const newOptions = [...form.options]
    newOptions[idx] = text

    setForm(f => {
      const updated = { ...f, options: newOptions }
      // If this option was correct, sync the correctAnswer text
      if (idx === correctIndex) {
        updated.correctAnswer = text
      }
      return updated
    })
  }

  const handleSelectCorrect = (idx) => {
    setCorrectIndex(idx)
    setForm(f => ({
      ...f,
      correctAnswer: f.options[idx] || ''
    }))
  }

  const handleSave = () => {
    if (!form.questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi.')
      return
    }

    const submitData = { ...form }
    if (form.questionType === 'MULTIPLE_CHOICE') {
      if (form.options.some(o => !o.trim())) {
        toast.error('Vui lòng nhập đầy đủ nội dung các lựa chọn.')
        return
      }
      submitData.correctAnswer = form.options[correctIndex]
    } else if (form.questionType === 'TRUE_FALSE') {
      submitData.correctAnswer = form.options[correctIndex]
    } else {
      submitData.options = null
      if (!form.correctAnswer.trim()) {
        toast.error('Vui lòng nhập câu trả lời đúng.')
        return
      }
    }

    onSave(submitData)
  }

  return (
    <Modal onClose={onClose} size="lg">
      <ModalHeader title={mode === 'create' ? 'Thêm câu hỏi mới' : 'Chỉnh sửa câu hỏi'} onClose={onClose} />
      <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
        <ErrorBanner message={error} />

        <div>
          <label className={labelCls}>Loại câu hỏi</label>
          <select
            className={inputCls}
            value={form.questionType}
            onChange={e => handleTypeChange(e.target.value)}
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Nội dung câu hỏi *</label>
          <textarea
            className={inputCls + ' resize-none'}
            rows={3}
            placeholder="Nhập nội dung câu hỏi..."
            value={form.questionText}
            onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
          />
        </div>

        {form.questionType === 'MULTIPLE_CHOICE' && (
          <div className="space-y-2.5">
            <label className={labelCls}>Các lựa chọn & Đáp án đúng *</label>
            <span className="text-[10px] dark:text-gray-500 text-gray-400 block mb-1">
              Điền nội dung các đáp án và tích chọn hình tròn bên cạnh để đánh dấu đáp án đúng.
            </span>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold dark:text-gray-400 text-gray-500 w-5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    className={inputCls + ' flex-1'}
                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + idx)}`}
                    value={opt}
                    onChange={e => handleOptionTextChange(idx, e.target.value)}
                  />
                  <input
                    type="radio"
                    name="correct-option"
                    checked={correctIndex === idx}
                    onChange={() => handleSelectCorrect(idx)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400 dark:bg-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {form.questionType === 'TRUE_FALSE' && (
          <div>
            <label className={labelCls}>Chọn đáp án đúng *</label>
            <div className="flex gap-4 mt-2">
              {form.options.map((opt, idx) => (
                <label key={idx} className="flex items-center gap-2 cursor-pointer dark:text-gray-300 text-gray-700 text-xs font-semibold">
                  <input
                    type="radio"
                    name="tf-option"
                    checked={correctIndex === idx}
                    onChange={() => handleSelectCorrect(idx)}
                    className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400 dark:bg-gray-800"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        )}

        {form.questionType === 'SHORT_ANSWER' && (
          <div>
            <label className={labelCls}>Đáp án đúng *</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Nhập câu trả lời chính xác..."
              value={form.correctAnswer}
              onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
            />
          </div>
        )}

        <div>
          <label className={labelCls}>Giải thích đáp án</label>
          <textarea
            className={inputCls + ' resize-none'}
            rows={2}
            placeholder="Giải thích ngắn gọn tại sao đáp án này đúng..."
            value={form.explanation}
            onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
          />
        </div>
      </div>
      <ModalFooter
        onClose={onClose}
        onSave={handleSave}
        saving={saving}
        saveLabel={mode === 'create' ? 'Thêm câu hỏi' : 'Cập nhật'}
      />
    </Modal>
  )
}

export default function QuizDetailPage() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  // Question Modal Control
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', initial: null|question }
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await getQuizById(quizId)
      setQuiz(res.data.data ?? res.data)
    } catch {
      toast.error('Không thể tải chi tiết Quiz.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [quizId])

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/quizzes')
    }
  }

  const handleAddQuestion = () => {
    setError('')
    setModal({ mode: 'create', initial: null })
  }

  const handleEditQuestion = (question) => {
    setError('')
    setModal({ mode: 'edit', initial: question })
  }

  const handleDeleteQuestion = (questionId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa câu hỏi',
      message: 'Bạn có chắc chắn muốn xóa câu hỏi này?',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await deleteQuizQuestion(questionId)
          toast.success('Xóa câu hỏi thành công!')
          fetchDetail()
        } catch (err) {
          toast.error(err.response?.data?.message ?? 'Xóa câu hỏi thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const handleSaveQuestion = async (formData) => {
    setSaving(true)
    setError('')
    try {
      if (modal.mode === 'create') {
        await addQuizQuestion(quizId, formData)
        toast.success('Thêm câu hỏi thành công!')
      } else {
        await updateQuizQuestion(modal.initial.id, formData)
        toast.success('Cập nhật câu hỏi thành công!')
      }
      setModal(null)
      fetchDetail()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Lưu câu hỏi thất bại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-32 mb-2" />
        <Sk className="h-[200px] w-full rounded-xl" />
        <Sk className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <EmptyState
        icon={HelpCircle}
        title="Không tìm thấy Quiz"
        sub="Dữ liệu Quiz này không tồn tại hoặc đã bị xóa."
        action={
          <button onClick={handleBack} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-all">
            Quay lại quản lý
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

      {/* Quiz Info Header Card */}
      <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold dark:text-white text-gray-950">{quiz.title}</h2>
            <p className="text-xs dark:text-gray-450 text-gray-500 leading-relaxed max-w-3xl">
              {quiz.description || 'Chưa có mô tả cho bộ Quiz này.'}
            </p>
          </div>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs shadow-sm transition-all"
          >
            <Plus size={13} /> Thêm câu hỏi
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-xs dark:text-gray-400 text-gray-650 pt-2 border-t dark:border-gray-800 border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold dark:text-gray-500 text-gray-400">Môn học:</span>
            <span className="font-bold font-mono dark:text-gray-300 text-gray-800">{quiz.subject?.code} - {quiz.subject?.name}</span>
          </div>
          {quiz.lesson && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold dark:text-gray-500 text-gray-400">Bài học:</span>
              <span className="font-bold dark:text-gray-300 text-gray-850">{quiz.lesson.title}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold dark:text-gray-500 text-gray-400">Độ khó:</span>
            <Badge label={quiz.difficulty} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold dark:text-gray-500 text-gray-400">Tổng số câu hỏi:</span>
            <span className="font-bold dark:text-blue-400 text-blue-500">{quiz.questions?.length ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider dark:text-gray-450 text-gray-500 flex items-center gap-1.5">
          <HelpCircle size={13} />
          Danh sách câu hỏi ({quiz.questions?.length ?? 0})
        </h3>

        {(!quiz.questions || quiz.questions.length === 0) ? (
          <EmptyState
            icon={HelpCircle}
            title="Bộ Quiz chưa có câu hỏi nào"
            sub="Hãy click nút 'Thêm câu hỏi' ở trên hoặc sinh từ AI để bổ sung câu hỏi."
            action={
              <button onClick={handleAddQuestion} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-all">
                Thêm câu hỏi ngay
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="dark:bg-[#161B22]/40 bg-white border dark:border-[#21262D] border-gray-200 rounded-xl p-5 shadow-sm space-y-3 relative group transition-all">
                {/* Question Type & Actions */}
                <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-400">CÂU HỎI {idx + 1}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[q.questionType]}`}>
                      {TYPE_LABELS[q.questionType]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditQuestion(q)}
                      className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-xs font-bold dark:text-gray-200 text-gray-850 leading-relaxed whitespace-pre-wrap">
                  {q.questionText}
                </p>

                {/* Options (for MULTIPLE_CHOICE or TRUE_FALSE) */}
                {Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {q.options.map((opt, oIdx) => {
                      const prefix = String.fromCharCode(65 + oIdx)
                      const isCorrect = opt === q.correctAnswer
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs leading-normal transition-all ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500 dark:text-emerald-400 font-semibold'
                              : 'dark:bg-[#0D1117]/50 bg-gray-50 border-gray-200/80 dark:border-[#21262D] dark:text-gray-400 text-gray-650'
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${isCorrect ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            {prefix}.
                          </span>
                          <span>{opt}</span>
                          {isCorrect && <Check size={12} className="ml-auto text-emerald-500 flex-shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Answer view (for Short Answer) */}
                {q.questionType === 'SHORT_ANSWER' && (
                  <div className="flex items-center gap-2 mt-2 bg-emerald-500/10 border border-emerald-500/40 px-3 py-2 rounded-lg text-xs text-emerald-500 dark:text-emerald-400 font-semibold">
                    <span>Đáp án chính xác:</span>
                    <span>{q.correctAnswer}</span>
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="mt-2.5 flex items-start gap-1.5 text-[11px] dark:text-gray-500 text-gray-500 bg-gray-50/50 dark:bg-gray-900/10 border border-dashed dark:border-gray-800 border-gray-150 p-2.5 rounded-lg leading-relaxed">
                    <Info size={12} className="mt-0.5 text-blue-400 flex-shrink-0" />
                    <span>
                      <strong className="dark:text-gray-400 text-gray-600">Giải thích: </strong>
                      {q.explanation}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question Create/Edit Modal */}
      {modal && (
        <QuestionModal
          mode={modal.mode}
          initial={modal.initial}
          onClose={() => setModal(null)}
          onSave={handleSaveQuestion}
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
    </div>
  )
}
