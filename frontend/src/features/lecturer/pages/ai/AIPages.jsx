import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Sparkles, Copy, RefreshCw, CheckCircle2, BookOpen,
  Zap, Brain, FileSliders, ChevronDown, ChevronUp, Save, ExternalLink, Pencil, Trash2, Plus, ChevronLeft
} from 'lucide-react'
import {
  generateExercises, generateQuiz,
  generateFeedback, generateSlideOutline, generateLessonOutline,
  saveAIExerciseAsAssignment, saveAIQuiz, saveAILessonOutline
} from '../../../../services/ai.api'
import { getLecturerSubjects } from '../../../../services/subject.api'
import { getCLOs } from '../../../../services/clo.api'
import { getLecturerClasses } from '../../../../services/class.api'
import { getLessons } from '../../../../services/lesson.api'
import { getSubmissionById } from '../../../../services/submission.api'
import { createFeedback } from '../../../../services/feedback.api'
import { PageHeader, Modal, ModalHeader, ModalFooter, ErrorBanner, inputCls, labelCls } from '../../components/LecturerUI'
import ConfirmModal from '../../../../components/common/ConfirmModal'

// ── Shared helpers ─────────────────────────────────────────────────────────────
function AICard({ children }) {
  return (
    <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-5 shadow-sm">
      {children}
    </div>
  )
}

function FormLabel({ children }) {
  return <label className={labelCls}>{children}</label>
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Đã sao chép!')
  }
  return (
    <button onClick={handle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold rounded-lg border transition-all
        ${copied
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30'
          : 'dark:bg-[#21262D] bg-gray-100 dark:text-gray-400 text-gray-500 dark:border-[#21262D] border-gray-200 dark:hover:text-gray-200 hover:text-gray-700'
        }`}>
      {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
      {copied ? 'Đã sao chép' : 'Sao chép'}
    </button>
  )
}

function AIEmptyState({ message = "Kết quả AI sẽ hiển thị tại đây", icon: Icon = Sparkles, themeColor = "blue" }) {
  const isBlue = themeColor === "blue"
  const isViolet = themeColor === "violet"
  const isEmerald = themeColor === "emerald"
  const isOrange = themeColor === "orange"
  
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-xl border-2 border-dashed 
      ${isBlue ? 'dark:border-blue-500/20 border-blue-200 bg-gradient-to-br from-blue-500/[0.02] to-sky-500/[0.01]' : ''}
      ${isViolet ? 'dark:border-violet-500/20 border-violet-200 bg-gradient-to-br from-violet-500/[0.02] to-blue-500/[0.01]' : ''}
      ${isEmerald ? 'dark:border-emerald-500/20 border-emerald-200 bg-gradient-to-br from-emerald-500/[0.02] to-blue-500/[0.01]' : ''}
      ${isOrange ? 'dark:border-orange-500/20 border-orange-200 bg-gradient-to-br from-orange-500/[0.02] to-amber-500/[0.01]' : ''}
      min-h-[350px] h-full`
    }>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border
        ${isBlue ? 'bg-blue-500/10 border-blue-400/20 text-blue-400' : ''}
        ${isViolet ? 'bg-violet-500/10 border-violet-400/20 text-violet-400' : ''}
        ${isEmerald ? 'bg-emerald-500/10 border-emerald-400/20 text-emerald-400' : ''}
        ${isOrange ? 'bg-orange-500/10 border-orange-400/20 text-orange-400' : ''}
      `}>
        <Icon size={20} className="animate-pulse" />
      </div>
      <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800 mb-1">{message}</h4>
      <p className="text-[10px] dark:text-gray-500 text-gray-400 max-w-[260px] leading-relaxed">
        Điền đầy đủ thông tin bên trái và bấm nút để bắt đầu tạo nội dung bằng Trí tuệ Nhân tạo.
      </p>
    </div>
  )
}

function ResultBox({ title, content, loading, icon: Icon = Sparkles }) {
  if (loading) return (
    <AICard>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        <span className="text-xs dark:text-blue-300 text-blue-500 font-medium">AI đang tạo nội dung...</span>
      </div>
      <div className="space-y-2">
        {[100, 85, 92, 70, 88].map((w, i) => (
          <div key={i} className="h-3 dark:bg-gray-800 bg-gray-200 rounded animate-pulse" style={{ width: `${w}%` }} />
        ))}
      </div>
    </AICard>
  )

  if (!content) return null
  return (
    <AICard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
            <Icon size={13} className="text-blue-400" />
          </div>
          <span className="text-xs font-bold dark:text-gray-200 text-gray-800">{title}</span>
        </div>
        <CopyBtn text={typeof content === 'string' ? content : JSON.stringify(content, null, 2)} />
      </div>
      <div className="dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
        {typeof content === 'string' ? (
          <pre className="text-xs dark:text-gray-300 text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</pre>
        ) : (
          <pre className="text-xs dark:text-gray-300 text-gray-700 whitespace-pre-wrap font-mono">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    </AICard>
  )
}

function GenerateBtn({ loading, onClick, label = 'Tạo với AI' }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-sky-500 text-white text-xs font-bold rounded-xl hover:from-blue-600 hover:to-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20">
      {loading
        ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <Sparkles size={13} />
      }
      {loading ? 'Đang tạo...' : label}
    </button>
  )
}

// ── Save Modals ────────────────────────────────────────────────────────────────
function SaveExerciseModal({ onClose, aiGenerationId, exerciseIndex, subjects }) {
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
        exerciseIndex,
        ...form
      })
      toast.success('Đã lưu bài tập vào danh sách Bài tập nháp!')
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

function SaveQuizModal({ onClose, aiGenerationId, quizTitle, subjects }) {
  const [lessons, setLessons] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    subjectId: '',
    lessonId: '',
    title: quizTitle || ''
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
        <div>
          <label className={labelCls}>Bài học liên kết</label>
          <select className={inputCls} value={form.lessonId} onChange={e => setForm(f => ({ ...f, lessonId: e.target.value }))}>
            <option value="">Không liên kết</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={handleSave} saving={saving} saveLabel="Xác nhận lưu" />
    </Modal>
  )
}

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
      toast.success('Đã lưu Giáo án thành Bài học nháp!')
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose} size="md">
      <ModalHeader title="Lưu Giáo án thành bài giảng" onClose={onClose} />
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

// ─────────────────────────────────────────────────────────────────────────────
// AI EXERCISE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function AIExerciseGeneratorPage() {
  const [subjects, setSubjects] = useState([])
  const [clos, setClos] = useState([])
  const [form, setForm] = useState({
    subjectId: '', topic: '', cloId: '', difficulty: 'MEDIUM',
    numberOfExercises: 3, exerciseType: 'CODING',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveModal, setSaveModal] = useState(null)

  useEffect(() => {
    getLecturerSubjects()
      .then(s => setSubjects(s.data.data?.subjects ?? s.data.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.subjectId) {
      setClos([])
      return
    }
    getCLOs({ subjectId: form.subjectId })
      .then(c => setClos(c.data.data ?? []))
      .catch(() => setClos([]))
  }, [form.subjectId])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const filteredClos = form.subjectId ? clos.filter(c => c.subjectId === form.subjectId) : clos

  const handle = async () => {
    if (loading) return
    if (!form.topic.trim()) { toast.error('Vui lòng nhập chủ đề bài tập.'); return }
    setLoading(true); setResult(null)
    try {
      const r = await generateExercises(form)
      setResult(r.data.data ?? r.data)
      toast.success('Tạo bài tập thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Tạo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const TYPES = ['CODING', 'ESSAY', 'SHORT_ANSWER', 'PRACTICAL']
  const DIFFS = ['EASY', 'MEDIUM', 'HARD']
  const DIFF_LABELS = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader title="AI Bài tập" description="Tạo bài tập thực hành bằng AI" />

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-4">
          <AICard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/20 to-sky-400/10 border border-blue-400/20 flex items-center justify-center">
                <Zap size={15} className="text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold dark:text-white text-gray-900">Tạo bài tập AI</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400">Nhập thông tin để AI sinh bài tập phù hợp</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Môn học</FormLabel>
                  <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
                    <option value="">Chọn môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>CLO liên quan</FormLabel>
                  <select className={inputCls} value={form.cloId} onChange={set('cloId')}>
                    <option value="">Không chọn</option>
                    {filteredClos.map(c => <option key={c.id} value={c.id}>{c.code} – {c.description?.slice(0,40)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <FormLabel>Chủ đề / Nội dung *</FormLabel>
                <input className={inputCls} placeholder="VD: RESTful API với Node.js, Hooks trong React..." value={form.topic} onChange={set('topic')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Số lượng bài tập</FormLabel>
                  <input className={inputCls} type="number" min="1" max="10" value={form.numberOfExercises} onChange={set('numberOfExercises')} />
                </div>
                <div>
                  <FormLabel>Loại bài tập</FormLabel>
                  <select className={inputCls} value={form.exerciseType} onChange={set('exerciseType')}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <FormLabel>Độ khó</FormLabel>
                <div className="flex gap-2">
                  {DIFFS.map(d => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        form.difficulty === d
                          ? d === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-400/30'
                            : d === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-400/30'
                            : 'bg-rose-500/10 text-rose-500 border-rose-400/30'
                          : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                      }`}>
                      {DIFF_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <GenerateBtn loading={loading} onClick={handle} />
            </div>
          </AICard>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <AICard>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-xs dark:text-blue-300 text-blue-500 font-medium">AI đang thiết kế bài tập...</span>
              </div>
              <div className="space-y-2">
                {[100, 85, 92, 70, 88].map((w, i) => (
                  <div key={i} className="h-3 dark:bg-gray-800 bg-gray-200 rounded animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            </AICard>
          )}

          {!loading && result?.exercises && (
            <div className="space-y-4">
              {result.exercises.map((ex, idx) => (
                <div key={idx} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold dark:text-gray-200 text-gray-900">{ex.title}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border mt-1 inline-block ${
                        ex.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-400/30' :
                        ex.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-400/30' :
                        'bg-rose-500/10 text-rose-500 border-rose-400/30'
                      }`}>{DIFF_LABELS[ex.difficulty] || ex.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CopyBtn text={JSON.stringify(ex, null, 2)} />
                      <button onClick={() => setSaveModal({ id: result.generationId, index: idx })}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                        <Save size={11} /> Lưu nháp
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs dark:text-gray-300 text-gray-700 leading-relaxed whitespace-pre-wrap">{ex.description}</div>
                  
                  {ex.requirements && Array.isArray(ex.requirements) && (
                    <div>
                      <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Yêu cầu cần đạt:</span>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-xs dark:text-gray-400 text-gray-600">
                        {ex.requirements.map((req, rIdx) => <li key={rIdx}>{req}</li>)}
                      </ul>
                    </div>
                  )}

                  {ex.rubric && Array.isArray(ex.rubric) && (
                    <div className="border-t dark:border-gray-800 border-gray-100 pt-3">
                      <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Tiêu chí đánh giá (Rubric):</span>
                      <div className="grid grid-cols-12 gap-2 mt-1 bg-gray-50 dark:bg-gray-900/40 p-2 rounded-lg text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        {ex.rubric.map((rub, rubIdx) => (
                          <React.Fragment key={rubIdx}>
                            <div className="col-span-10 text-xs dark:text-gray-300 text-gray-700">- {rub.criteria}</div>
                            <div className="col-span-2 text-right font-bold text-blue-400">{rub.points}đ</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !result && <AIEmptyState themeColor="blue" icon={Zap} />}
        </div>
      </div>

      {saveModal && (
        <SaveExerciseModal
          aiGenerationId={saveModal.id}
          exerciseIndex={saveModal.index}
          subjects={subjects}
          onClose={() => setSaveModal(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI QUIZ GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function AIQuizGeneratorPage() {
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ topic: '', numberOfQuestions: 5, difficulty: 'MEDIUM', questionType: 'MULTIPLE_CHOICE' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})
  const [saveModal, setSaveModal] = useState(null)
  const [editableQuestions, setEditableQuestions] = useState([])
  const [editModeIndex, setEditModeIndex] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  useEffect(() => {
    getLecturerSubjects()
      .then(s => setSubjects(s.data.data?.subjects ?? s.data.data ?? []))
      .catch(() => {})
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const QTYPES = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']
  const DIFFS  = ['EASY', 'MEDIUM', 'HARD']
  const DIFF_LABELS = { EASY: 'Dễ', MEDIUM: 'Vừa', HARD: 'Khó' }

  const handle = async () => {
    if (loading) return
    if (!form.topic.trim()) { toast.error('Vui lòng nhập chủ đề.'); return }
    setLoading(true); setResult(null); setExpanded({}); setEditModeIndex(null)
    try {
      const r = await generateQuiz(form)
      setResult(r.data.data ?? r.data)
      toast.success('Tạo quiz thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Tạo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const questionsList = Array.isArray(result) ? result
      : result?.questions ? result.questions
      : []
    setEditableQuestions(questionsList)
  }, [result])

  const updateQuestion = (index, field, value) => {
    setEditableQuestions(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const deleteQuestion = (index) => {
    setEditableQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const addQuestion = () => {
    setEditableQuestions(prev => [
      ...prev,
      {
        questionText: 'Câu hỏi mới',
        questionType: form.questionType || 'MULTIPLE_CHOICE',
        options: ['Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D'],
        correctAnswer: 'Lựa chọn A',
        explanation: 'Giải thích...'
      }
    ])
  }

  const questions = editableQuestions

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader title="AI Quiz" description="Tạo câu hỏi trắc nghiệm bằng AI" />

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-4">
          <AICard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400/20 to-blue-400/10 border border-violet-400/20 flex items-center justify-center">
                <Brain size={15} className="text-violet-400" />
              </div>
              <div>
                <div className="text-xs font-bold dark:text-white text-gray-900">Tạo Quiz AI</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400">AI sẽ tạo câu hỏi kèm đáp án và giải thích</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <FormLabel>Chủ đề / Nội dung *</FormLabel>
                <input className={inputCls} placeholder="VD: OOP trong Java, SQL Joins..." value={form.topic} onChange={set('topic')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Số câu hỏi</FormLabel>
                  <input className={inputCls} type="number" min="1" max="20" value={form.numberOfQuestions} onChange={set('numberOfQuestions')} />
                </div>
                <div>
                  <FormLabel>Loại câu hỏi</FormLabel>
                  <select className={inputCls} value={form.questionType} onChange={set('questionType')}>
                    {QTYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <FormLabel>Độ khó</FormLabel>
                <div className="flex gap-2">
                  {DIFFS.map(d => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        form.difficulty === d
                          ? 'bg-violet-500/10 text-violet-500 border-violet-400/30'
                          : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                      }`}>
                      {DIFF_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <GenerateBtn loading={loading} onClick={handle} label="Tạo Quiz" />
            </div>
          </AICard>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <AICard>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                <span className="text-xs dark:text-violet-300 text-violet-500 font-medium">AI đang tạo câu hỏi...</span>
              </div>
              <div className="space-y-2">{[90,70,85,60].map((w,i) => <div key={i} className="h-3 dark:bg-gray-800 bg-gray-200 rounded animate-pulse" style={{width:`${w}%`}} />)}</div>
            </AICard>
          )}

          {!loading && questions && questions.length > 0 && (
            <AICard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
                    <Brain size={13} className="text-violet-400" />
                  </div>
                  <span className="text-xs font-bold dark:text-gray-200 text-gray-800">{questions.length} câu hỏi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CopyBtn text={JSON.stringify(questions, null, 2)} />
                  <button onClick={() => setSaveModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                    <Save size={11} /> Lưu thành Quiz
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const isEditingCard = editModeIndex === i
                  return (
                    <div key={i} className="border dark:border-[#21262D] border-gray-200 rounded-xl overflow-hidden">
                      <div className="w-full flex items-center justify-between px-4 py-2.5 dark:bg-[#161B22]/30 bg-gray-50/50">
                        <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                          className="flex-1 text-left text-xs font-medium dark:text-gray-200 text-gray-700 pr-4">
                          <span className="text-violet-400 font-bold mr-2">Q{i + 1}.</span>
                          {q.questionText || q.question}
                        </button>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => {
                              setExpanded(e => ({ ...e, [i]: true }))
                              setEditModeIndex(isEditingCard ? null : i)
                            }}
                            className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            title="Sửa câu hỏi"
                          >
                            {isEditingCard ? <CheckCircle2 size={13} className="text-emerald-555" /> : <Pencil size={13} />}
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Xóa câu hỏi',
                                message: 'Bạn có chắc chắn muốn xóa câu hỏi này khỏi danh sách?',
                                onConfirm: () => {
                                  deleteQuestion(i)
                                  setConfirmModal(prev => ({ ...prev, isOpen: false }))
                                }
                              })
                            }}
                            className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 size={13} />
                          </button>
                          <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                            className="p-1 rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                            {expanded[i] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>
                      {expanded[i] && (
                        <div className="px-4 pb-3 dark:bg-[#0D1117]/50 bg-gray-50/50 border-t dark:border-[#21262D] border-gray-100">
                          <div className="space-y-3 pt-3">
                            {isEditingCard ? (
                              <div className="space-y-3">
                                <div>
                                  <FormLabel>Nội dung câu hỏi</FormLabel>
                                  <textarea
                                    className={inputCls}
                                    rows={2}
                                    value={q.questionText || q.question || ''}
                                    onChange={e => updateQuestion(i, 'questionText', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <FormLabel>Loại câu hỏi</FormLabel>
                                  <select
                                    className={inputCls}
                                    value={q.questionType || 'MULTIPLE_CHOICE'}
                                    onChange={e => updateQuestion(i, 'questionType', e.target.value)}
                                  >
                                    <option value="MULTIPLE_CHOICE">Trắc nghiệm nhiều lựa chọn</option>
                                    <option value="TRUE_FALSE">Đúng / Sai</option>
                                    <option value="SHORT_ANSWER">Trả lời ngắn</option>
                                  </select>
                                </div>

                                {q.questionType !== 'SHORT_ANSWER' && (
                                  <div>
                                    <FormLabel>Các lựa chọn (Options)</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                      {(q.options || ['A', 'B', 'C', 'D']).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex items-center gap-1.5">
                                          <span className="text-[10px] font-bold text-gray-400">{String.fromCharCode(65 + oIdx)}.</span>
                                          <input
                                            className={inputCls}
                                            value={opt || ''}
                                            onChange={e => {
                                              const newOpts = [...(q.options || [])]
                                              newOpts[oIdx] = e.target.value
                                              updateQuestion(i, 'options', newOpts)
                                            }}
                                            placeholder={`Lựa chọn ${String.fromCharCode(65 + oIdx)}`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <FormLabel>Đáp án đúng</FormLabel>
                                  <input
                                    className={inputCls}
                                    value={q.correctAnswer || ''}
                                    onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}
                                    placeholder="VD: Option A, True, False,..."
                                  />
                                </div>
                                <div>
                                  <FormLabel>Giải thích đáp án</FormLabel>
                                  <textarea
                                    className={inputCls}
                                    rows={2}
                                    value={q.explanation || ''}
                                    onChange={e => updateQuestion(i, 'explanation', e.target.value)}
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {q.options && Array.isArray(q.options) && (
                                  <div className="space-y-1">
                                    {q.options.map((opt, j) => (
                                      <div key={j} className={`text-xs px-2 py-1 rounded-lg ${opt === q.correctAnswer ? 'dark:bg-emerald-500/10 bg-emerald-50 text-emerald-500 dark:border-emerald-500/20 border-emerald-200 border' : 'dark:text-gray-400 text-gray-500'}`}>
                                        {String.fromCharCode(65+j)}. {opt}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {!q.options && q.correctAnswer && (
                                  <div className="text-xs px-2 py-1 rounded-lg dark:bg-emerald-500/10 bg-emerald-50 text-emerald-500 dark:border-emerald-500/20 border-emerald-200 border inline-block">
                                    Đáp án đúng: {q.correctAnswer}
                                  </div>
                                )}
                                {q.explanation && (
                                  <div className="text-[10px] dark:text-blue-300 text-blue-600 dark:bg-blue-500/5 bg-blue-50 px-2 py-1.5 rounded-lg border dark:border-blue-500/10 border-blue-100">
                                    💡 {q.explanation}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}

                <button
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border-2 border-dashed dark:border-gray-800 border-gray-200 dark:hover:border-violet-500/40 hover:border-violet-400 rounded-xl text-xs font-bold dark:text-gray-400 text-gray-500 hover:text-violet-500 transition-all"
                >
                  <Plus size={13} /> Thêm câu hỏi mới
                </button>
              </div>
            </AICard>
          )}

          {!loading && result && (!questions || questions.length === 0) && (
            <ResultBox title="Kết quả Quiz" content={result} loading={false} icon={Brain} />
          )}

          {!loading && !result && <AIEmptyState themeColor="violet" icon={Brain} />}
        </div>
      </div>

      {saveModal && (
        <SaveQuizModal
          aiGenerationId={result.generationId}
          quizTitle={result.quizTitle}
          questions={questions}
          subjects={subjects}
          onClose={() => setSaveModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI FEEDBACK GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function AIFeedbackGeneratorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const submissionId = queryParams.get('submissionId')

  const [form, setForm] = useState({ submissionContent: '', assignmentContext: '', studentLevel: 'AVERAGE' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [edited, setEdited] = useState('')
  const [submission, setSubmission] = useState(null)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [savingFeedback, setSavingFeedback] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const LEVELS = ['WEAK', 'AVERAGE', 'GOOD', 'EXCELLENT']
  const LEVEL_LABELS = { WEAK: 'Yếu', AVERAGE: 'Trung bình', GOOD: 'Khá', EXCELLENT: 'Giỏi' }

  useEffect(() => {
    if (!submissionId) return
    setSubmissionLoading(true)
    getSubmissionById(submissionId)
      .then(r => {
        const sub = r.data?.data
        if (sub) {
          setSubmission(sub)
          const contextStr = `Bài tập: ${sub.assignment?.title || ''}\nMô tả: ${sub.assignment?.description || ''}\nYêu cầu: ${sub.assignment?.requirements || ''}`
          let contentStr = ''
          if (sub.content) contentStr += `Nội dung bài nộp: ${sub.content}\n`
          if (sub.codeText) contentStr += `Source Code:\n${sub.codeText}\n`
          if (sub.githubUrl) contentStr += `GitHub URL: ${sub.githubUrl}\n`
          if (sub.fileUrl) contentStr += `File URL: ${sub.fileUrl}\n`

          setForm(f => ({
            ...f,
            assignmentContext: contextStr,
            submissionContent: contentStr
          }))
        }
      })
      .catch(() => {
        toast.error('Không thể tải thông tin bài nộp.')
      })
      .finally(() => {
        setSubmissionLoading(false)
      })
  }, [submissionId])

  const handle = async () => {
    if (loading) return
    if (!form.submissionContent.trim()) { toast.error('Vui lòng nhập nội dung bài nộp.'); return }
    setLoading(true); setResult(null); setEdited('')
    try {
      const r = await generateFeedback(form)
      const data = r.data.data ?? r.data
      setResult(data)
      setEdited(data.feedback || JSON.stringify(data, null, 2))
      toast.success('Tạo phản hồi thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Tạo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!submissionId) return
    setSavingFeedback(true)
    try {
      await createFeedback(submissionId, { content: edited })
      toast.success('Đã lưu feedback vào bài nộp thành công!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Lưu feedback thất bại.')
    } finally {
      setSavingFeedback(false)
    }
  }

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else if (submissionId) {
      navigate(`/lecturer/grading/${submissionId}`)
    } else {
      navigate('/lecturer/submissions')
    }
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại chấm điểm
      </button>

      <PageHeader title="AI Feedback" description="Gợi ý phản hồi cho bài nộp của sinh viên" />

      {submissionLoading && (
        <AICard>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            <span className="text-xs dark:text-gray-400 text-gray-500">Đang tải thông tin bài làm sinh viên...</span>
          </div>
        </AICard>
      )}

      {submission && !submissionLoading && (
        <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 space-y-3 shadow-sm">
          <div className="flex flex-wrap justify-between items-center border-b dark:border-[#21262D] border-gray-150 pb-2 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold dark:text-blue-400 text-blue-500 bg-blue-500/10 dark:bg-blue-400/10 px-2.5 py-0.5 rounded">Bài tập</span>
              <h3 className="text-xs font-bold dark:text-white text-gray-800">{submission.assignment?.title}</h3>
            </div>
            <span className="text-[10px] dark:text-gray-400 text-gray-500">
              Sinh viên: <span className="font-semibold">{submission.student?.fullName}</span> ({submission.student?.email})
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div>
                <span className="text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wider block">Mô tả bài tập</span>
                <p className="dark:text-gray-300 text-gray-650 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">{submission.assignment?.description || 'Chưa có mô tả.'}</p>
              </div>
              {submission.assignment?.requirements && (
                <div>
                  <span className="text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wider block">Yêu cầu</span>
                  <p className="dark:text-gray-300 text-gray-650 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">{submission.assignment.requirements}</p>
                </div>
              )}
              <div className="flex gap-4 text-[10px] dark:text-gray-505 text-gray-400 pt-1">
                <span>Hạn nộp: {submission.assignment?.dueDate ? new Date(submission.assignment.dueDate).toLocaleString('vi-VN') : '—'}</span>
                <span>Điểm tối đa: {submission.assignment?.totalScore ?? 10}đ</span>
              </div>
            </div>
            <div className="space-y-1.5 border-t md:border-t-0 md:border-l dark:border-[#21262D] border-gray-150 md:pl-4 pt-3 md:pt-0">
              <span className="text-[10px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wider block">Bài nộp của sinh viên</span>
              <div className="text-[10px] dark:text-gray-500 text-gray-400 mb-1">
                Thời gian nộp: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('vi-VN') : new Date(submission.createdAt).toLocaleString('vi-VN')}
              </div>
              {submission.content && (
                <div className="dark:bg-[#0D1117]/60 bg-gray-50 p-2.5 rounded-lg border dark:border-[#21262D] border-gray-100 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed dark:text-gray-300 text-gray-650">
                  {submission.content}
                </div>
              )}
              <div className="flex flex-col gap-1.5 pt-1">
                {submission.githubUrl && (
                  <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                    <ExternalLink size={10} /> Github link: {submission.githubUrl}
                  </a>
                )}
                {submission.fileUrl && (
                  <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline">
                    <ExternalLink size={10} /> File đính kèm: {submission.fileUrl}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-4">
          <AICard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400/20 to-blue-400/10 border border-emerald-400/20 flex items-center justify-center">
                <BookOpen size={15} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold dark:text-white text-gray-900">Gợi ý Feedback AI</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400">Nhập bài nộp để AI gợi ý phản hồi phù hợp</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <FormLabel>Ngữ cảnh bài tập</FormLabel>
                <input className={inputCls} placeholder="VD: Bài tập xây dựng REST API với Node.js" value={form.assignmentContext} onChange={set('assignmentContext')} />
              </div>
              <div>
                <FormLabel>Nội dung bài nộp *</FormLabel>
                <textarea className={inputCls + ' resize-none'} rows={6}
                  placeholder="Dán code hoặc nội dung bài nộp của sinh viên vào đây..."
                  value={form.submissionContent} onChange={set('submissionContent')} />
              </div>
              <div>
                <FormLabel>Trình độ sinh viên</FormLabel>
                <div className="flex gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, studentLevel: l }))}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        form.studentLevel === l
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-400/30'
                          : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                      }`}>
                      {LEVEL_LABELS[l]}
                    </button>
                  ))}
                </div>
              </div>
              <GenerateBtn loading={loading} onClick={handle} label="Gợi ý Feedback" />
            </div>
          </AICard>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <AICard>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                <span className="text-xs dark:text-emerald-300 text-emerald-500 font-medium">AI đang phân tích bài nộp...</span>
              </div>
              <div className="space-y-2">{[100,80,90,65,75].map((w,i) => <div key={i} className="h-3 dark:bg-gray-800 bg-gray-255 rounded animate-pulse" style={{width:`${w}%`}} />)}</div>
            </AICard>
          )}

          {!loading && result && (
            <div className="space-y-4">
              {result.summary && (
                <AICard>
                  <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Tóm tắt phân tích bài làm:</span>
                  <p className="text-xs dark:text-gray-300 text-gray-700 leading-relaxed mt-1">{result.summary}</p>

                  <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t dark:border-gray-800 border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Điểm mạnh:</span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-xs dark:text-gray-400 text-gray-650">
                        {result.strengths?.map((st, sIdx) => <li key={sIdx}>{st}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Cần cải thiện:</span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-xs dark:text-gray-400 text-gray-655">
                        {result.improvementAreas?.map((im, iIdx) => <li key={iIdx}>{im}</li>)}
                      </ul>
                    </div>
                  </div>

                  {result.recommendedReview && result.recommendedReview.length > 0 && (
                    <div className="mt-3 pt-3 border-t dark:border-gray-800 border-gray-100">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Khuyến nghị ôn tập:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {result.recommendedReview.map((rev, rIdx) => (
                          <span key={rIdx} className="text-[10px] dark:bg-blue-500/10 bg-blue-50 text-blue-400 px-2 py-0.5 rounded-lg border dark:border-blue-400/20 border-blue-100">{rev}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </AICard>
              )}

              <AICard>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                      <BookOpen size={13} className="text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold dark:text-gray-200 text-gray-800">Thư phản hồi gửi cho sinh viên (Chỉnh sửa trước khi copy)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {submissionId && (
                      <button onClick={handleSaveFeedback} disabled={savingFeedback}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-60">
                        {savingFeedback ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={11} />}
                        Lưu feedback vào bài nộp
                      </button>
                    )}
                    <CopyBtn text={edited} />
                  </div>
                </div>
                <textarea
                  className="w-full dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-xl p-3 text-xs dark:text-gray-200 text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all leading-relaxed"
                  rows={10}
                  value={edited}
                  onChange={e => setEdited(e.target.value)}
                />
              </AICard>
            </div>
          )}

          {!loading && !result && <AIEmptyState themeColor="emerald" icon={BookOpen} />}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SLIDE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function AISlideGeneratorPage() {
  const [subjects, setSubjects] = useState([])
  const [form, setForm] = useState({ subjectId: '', topic: '', chapter: '', targetAudience: 'university', numberOfSlides: 10 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getLecturerSubjects().then(r => setSubjects(r.data.data?.subjects ?? r.data.data ?? [])).catch(() => {})
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async () => {
    if (loading) return
    if (!form.topic.trim()) { toast.error('Vui lòng nhập chủ đề.'); return }
    setLoading(true); setResult(null)
    try {
      const r = await generateSlideOutline(form)
      setResult(r.data.data ?? r.data)
      toast.success('Tạo outline slide thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Tạo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const slides = Array.isArray(result) ? result
    : result?.slides ? result.slides
    : result?.outline ? result.outline
    : null

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader title="AI Slide" description="Tạo outline bài giảng bằng AI" />

      {/* Development notice */}
      <div className="flex items-start gap-2.5 dark:bg-amber-500/5 bg-amber-50 border dark:border-amber-500/20 border-amber-200 rounded-xl px-4 py-3">
        <FileSliders size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-xs font-semibold text-amber-500 mb-0.5">Tính năng đang phát triển</p>
          <p className="text-[10px] dark:text-amber-400/70 text-amber-600">AI hiện hỗ trợ tạo <strong>outline cấu trúc slide</strong>. Tính năng xuất file PowerPoint trực tiếp sẽ được cập nhật trong phiên bản sau.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-4">
          <AICard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-400/10 border border-orange-400/20 flex items-center justify-center">
                <FileSliders size={15} className="text-orange-400" />
              </div>
              <div>
                <div className="text-xs font-bold dark:text-white text-gray-900">Tạo Slide Outline AI</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400">AI tạo cấu trúc slide theo chủ đề và môn học</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Môn học</FormLabel>
                  <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
                    <option value="">Chọn môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>Chương / Tuần</FormLabel>
                  <input className={inputCls} placeholder="3" value={form.chapter} onChange={set('chapter')} />
                </div>
              </div>
              <div>
                <FormLabel>Chủ đề bài giảng *</FormLabel>
                <input className={inputCls} placeholder="VD: Introduction to React Hooks" value={form.topic} onChange={set('topic')} />
              </div>
              <div>
                <FormLabel>Số slide dự kiến</FormLabel>
                <input className={inputCls} type="number" min="5" max="30" value={form.numberOfSlides} onChange={set('numberOfSlides')} />
              </div>
              <GenerateBtn loading={loading} onClick={handle} label="Tạo Slide Outline" />
            </div>
          </AICard>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <AICard>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                <span className="text-xs dark:text-orange-300 text-orange-500 font-medium">AI đang thiết kế cấu trúc slide...</span>
              </div>
              <div className="space-y-2">{[100,75,88,60,70].map((w,i) => <div key={i} className="h-3 dark:bg-gray-800 bg-gray-200 rounded animate-pulse" style={{width:`${w}%`}} />)}</div>
            </AICard>
          )}

          {!loading && slides && (
            <AICard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-400/20 flex items-center justify-center">
                    <FileSliders size={13} className="text-orange-400" />
                  </div>
                  <span className="text-xs font-bold dark:text-gray-200 text-gray-800">{slides.length} slides được tạo</span>
                </div>
                <CopyBtn text={JSON.stringify(slides, null, 2)} />
              </div>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {slides.map((slide, i) => (
                  <div key={i} className="flex gap-4 p-4 dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-orange-400 border border-orange-400/20">
                      {slide.slideNumber || (i + 1)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="text-xs font-bold dark:text-gray-200 text-gray-850 border-b dark:border-gray-800 border-gray-200 pb-1.5">{slide.title ?? slide}</div>
                      
                      {slide.bulletPoints && (
                        <ul className="mt-1 space-y-1">
                          {slide.bulletPoints.map((p, j) => (
                            <li key={j} className="text-[11px] dark:text-gray-400 text-gray-500 flex items-start gap-1.5">
                              <span className="text-orange-400 mt-1">•</span>{p}
                            </li>
                          ))}
                        </ul>
                      )}

                      {slide.speakerNotes && (
                        <div className="text-[10px] dark:text-amber-300 text-amber-600 bg-amber-500/5 dark:bg-amber-500/[0.02] border dark:border-amber-500/10 border-amber-100 p-2.5 rounded-lg">
                          💬 <strong>Presenter Note:</strong> {slide.speakerNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AICard>
          )}

          {!loading && result && !slides && (
            <ResultBox title="Slide Outline" content={result} loading={false} icon={FileSliders} />
          )}

          {!loading && !result && <AIEmptyState themeColor="orange" icon={FileSliders} />}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI LESSON OUTLINE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function AILessonOutlineGeneratorPage() {
  const [subjects, setSubjects] = useState([])
  const [clos, setClos] = useState([])
  const [form, setForm] = useState({ subjectId: '', topic: '', cloId: '', level: 'university', numberOfSections: 3 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saveModal, setSaveModal] = useState(null)
  const [editableOutline, setEditableOutline] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)

  useEffect(() => {
    getLecturerSubjects().then(r => setSubjects(r.data.data?.subjects ?? r.data.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.subjectId) {
      setClos([])
      return
    }
    getCLOs({ subjectId: form.subjectId }).then(r => setClos(r.data.data ?? [])).catch(() => {})
  }, [form.subjectId])

  useEffect(() => {
    setEditableOutline(result)
    setIsEditMode(false)
  }, [result])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const updateOutlineField = (field, value) => {
    setEditableOutline(prev => ({ ...prev, [field]: value }))
  }

  const updateSection = (idx, field, value) => {
    setEditableOutline(prev => {
      const sections = [...prev.sections]
      sections[idx] = { ...sections[idx], [field]: value }
      return { ...prev, sections }
    })
  }

  const deleteSection = (idx) => {
    setEditableOutline(prev => {
      const sections = prev.sections.filter((_, i) => i !== idx)
      return { ...prev, sections }
    })
  }

  const addSection = () => {
    setEditableOutline(prev => {
      const sections = [
        ...(prev.sections || []),
        { heading: 'Phần mới', summary: 'Tóm tắt nội dung...', keyPoints: ['Ý chính 1'] }
      ]
      return { ...prev, sections }
    })
  }

  const handle = async () => {
    if (loading) return
    if (!form.topic.trim()) { toast.error('Vui lòng nhập chủ đề bài giảng.'); return }
    setLoading(true); setResult(null)
    try {
      const r = await generateLessonOutline(form)
      setResult(r.data.data ?? r.data)
      toast.success('Tạo giáo án AI thành công!')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Tạo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader title="AI Giáo án" description="Tạo giáo án và nội dung chi tiết bài học bằng AI" />

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5 space-y-4">
          <AICard>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400/20 to-sky-400/10 border border-blue-400/20 flex items-center justify-center">
                <BookOpen size={15} className="text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold dark:text-white text-gray-900">Tạo Giáo án AI</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400">Nhập thông tin đề bài giáo án chuẩn</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Môn học</FormLabel>
                  <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
                    <option value="">Chọn môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <FormLabel>CLO liên quan</FormLabel>
                  <select className={inputCls} value={form.cloId} onChange={set('cloId')}>
                    <option value="">Không chọn</option>
                    {clos.map(c => <option key={c.id} value={c.id}>{c.code} – {c.description?.slice(0,40)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <FormLabel>Chủ đề bài giảng *</FormLabel>
                <input className={inputCls} placeholder="VD: Khái niệm OOP và 4 tính chất trong C#" value={form.topic} onChange={set('topic')} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormLabel>Số lượng phần học</FormLabel>
                  <input className={inputCls} type="number" min="3" max="10" value={form.numberOfSections} onChange={set('numberOfSections')} />
                </div>
                <div>
                  <FormLabel>Cấp độ bài giảng</FormLabel>
                  <select className={inputCls} value={form.level} onChange={set('level')}>
                    <option value="university">Đại học / University</option>
                    <option value="highschool">Phổ thông / High school</option>
                    <option value="beginner">Nhập môn / Beginner</option>
                  </select>
                </div>
              </div>

              <GenerateBtn loading={loading} onClick={handle} label="Tạo Giáo án" />
            </div>
          </AICard>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {loading && (
            <AICard>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-xs dark:text-blue-300 text-blue-500 font-medium">AI đang thiết lập giáo án học tập...</span>
              </div>
              <div className="space-y-2">{[100,75,90,60,85].map((w,i) => <div key={i} className="h-3 dark:bg-gray-800 bg-gray-255 rounded animate-pulse" style={{width:`${w}%`}} />)}</div>
            </AICard>
          )}

          {!loading && editableOutline && (
            <div className="space-y-4">
              <AICard>
                <div className="flex items-start justify-between border-b dark:border-gray-800 border-gray-100 pb-3 gap-3">
                  <div className="flex-1">
                    {isEditMode ? (
                      <input
                        className={inputCls}
                        value={editableOutline.title || ''}
                        onChange={e => updateOutlineField('title', e.target.value)}
                        placeholder="Tiêu đề giáo án"
                      />
                    ) : (
                      <h3 className="text-sm font-bold dark:text-white text-gray-955">{editableOutline.title}</h3>
                    )}
                    <span className="text-[10px] dark:text-gray-500 text-gray-400 mt-1 block">Đề cương chi tiết tạo từ AI</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold rounded-lg border dark:bg-[#21262D] bg-gray-100 dark:text-gray-300 text-gray-600 border-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    >
                      {isEditMode ? <CheckCircle2 size={11} /> : <Pencil size={11} />}
                      {isEditMode ? 'Xong' : 'Chỉnh sửa'}
                    </button>
                    <CopyBtn text={JSON.stringify(editableOutline, null, 2)} />
                    <button onClick={() => setSaveModal(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                      <Save size={11} /> Lưu nháp bài học
                    </button>
                  </div>
                </div>

                <div className="py-3">
                  <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Mục tiêu bài giảng (Objectives):</span>
                  {isEditMode ? (
                    <textarea
                      className={inputCls + ' mt-1'}
                      rows={3}
                      value={editableOutline.objectives ? editableOutline.objectives.join('\n') : ''}
                      onChange={e => updateOutlineField('objectives', e.target.value.split('\n'))}
                      placeholder="Mỗi dòng là một mục tiêu"
                    />
                  ) : (
                    <ul className="list-disc pl-4 space-y-0.5 mt-1 text-xs dark:text-gray-300 text-gray-700">
                      {editableOutline.objectives?.map((obj, oIdx) => <li key={oIdx}>{obj}</li>)}
                    </ul>
                  )}
                </div>

                {editableOutline.sections && (
                  <div className="border-t dark:border-gray-800 border-gray-100 py-3 space-y-3">
                    <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Các chương / phần giảng dạy chính:</span>
                    {editableOutline.sections.map((sec, sIdx) => (
                      <div key={sIdx} className="bg-gray-50 dark:bg-gray-900/40 p-3.5 rounded-xl border dark:border-gray-800/40 border-gray-200/60 space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            {isEditMode ? (
                              <>
                                <div>
                                  <label className={labelCls}>Tên phần học</label>
                                  <input
                                    className={inputCls}
                                    value={sec.heading || ''}
                                    onChange={e => updateSection(sIdx, 'heading', e.target.value)}
                                    placeholder="Tên phần học"
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>Tóm tắt</label>
                                  <textarea
                                    className={inputCls}
                                    rows={2}
                                    value={sec.summary || ''}
                                    onChange={e => updateSection(sIdx, 'summary', e.target.value)}
                                    placeholder="Tóm tắt nội dung..."
                                  />
                                </div>
                                <div>
                                  <label className={labelCls}>Ý chính (mỗi dòng một ý)</label>
                                  <textarea
                                    className={inputCls}
                                    rows={2}
                                    value={sec.keyPoints ? sec.keyPoints.join('\n') : ''}
                                    onChange={e => updateSection(sIdx, 'keyPoints', e.target.value.split('\n'))}
                                    placeholder="Ý chính..."
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <h5 className="text-xs font-bold dark:text-gray-200 text-gray-800">{sec.heading}</h5>
                                <p className="text-[11px] dark:text-gray-400 text-gray-600 mt-1 leading-relaxed">{sec.summary}</p>
                                {sec.keyPoints && (
                                  <div className="mt-2 pl-2 border-l border-blue-500/40 space-y-0.5">
                                    {sec.keyPoints.map((kp, kIdx) => <div key={kIdx} className="text-[10px] dark:text-gray-500 text-gray-500">• {kp}</div>)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                          {isEditMode && (
                            <button
                              onClick={() => deleteSection(sIdx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/5 transition-colors flex-shrink-0"
                              title="Xóa phần này"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {isEditMode && (
                      <button
                        onClick={addSection}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed dark:border-gray-800 border-gray-200 dark:hover:border-blue-500/40 hover:border-blue-400 rounded-lg text-[11px] dark:text-gray-400 text-gray-500 hover:text-blue-500 transition-all"
                      >
                        <Plus size={11} /> Thêm phần mới
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t dark:border-gray-800 border-gray-100 pt-3">
                  {isEditMode ? (
                    <div>
                      <label className={labelCls}>Khái niệm cốt lõi (mỗi dòng một khái niệm)</label>
                      <textarea
                        className={inputCls}
                        rows={3}
                        value={editableOutline.keyConcepts ? editableOutline.keyConcepts.join('\n') : ''}
                        onChange={e => updateOutlineField('keyConcepts', e.target.value.split('\n'))}
                        placeholder="Khái niệm..."
                      />
                    </div>
                  ) : editableOutline.keyConcepts && (
                    <div>
                      <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Khái niệm cốt lõi:</span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] dark:text-gray-400 text-gray-600">
                        {editableOutline.keyConcepts.map((kc, kcIdx) => <li key={kcIdx}>{kc}</li>)}
                      </ul>
                    </div>
                  )}

                  {isEditMode ? (
                    <div>
                      <label className={labelCls}>Hoạt động lớp học (mỗi dòng một hoạt động)</label>
                      <textarea
                        className={inputCls}
                        rows={3}
                        value={editableOutline.activities ? editableOutline.activities.join('\n') : ''}
                        onChange={e => updateOutlineField('activities', e.target.value.split('\n'))}
                        placeholder="Hoạt động..."
                      />
                    </div>
                  ) : editableOutline.activities && (
                    <div>
                      <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Hoạt động lớp học:</span>
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] dark:text-gray-400 text-gray-600">
                        {editableOutline.activities.map((act, actIdx) => <li key={actIdx}>{act}</li>)}
                      </ul>
                    </div>
                  )}
                </div>

                {isEditMode ? (
                  <div className="border-t dark:border-gray-800 border-gray-100 pt-3 mt-3">
                    <label className={labelCls}>Đề xuất bài đánh giá cuối buổi</label>
                    <textarea
                      className={inputCls}
                      rows={3}
                      value={editableOutline.assessmentSuggestion || ''}
                      onChange={e => updateOutlineField('assessmentSuggestion', e.target.value)}
                      placeholder="Bài tập đánh giá..."
                    />
                  </div>
                ) : editableOutline.assessmentSuggestion && (
                  <div className="border-t dark:border-gray-800 border-gray-100 pt-3 mt-3">
                    <span className="text-[10px] font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Đề xuất bài đánh giá cuối buổi:</span>
                    <p className="text-xs dark:text-gray-300 text-gray-700 leading-relaxed mt-1">{editableOutline.assessmentSuggestion}</p>
                  </div>
                )}
              </AICard>
            </div>
          )}

          {!loading && !result && <AIEmptyState themeColor="blue" icon={BookOpen} />}
        </div>
      </div>

      {saveModal && (
        <SaveLessonOutlineModal
          aiGenerationId={result.generationId}
          title={editableOutline.title || result.title}
          content={JSON.stringify(editableOutline, null, 2)}
          subjects={subjects}
          onClose={() => setSaveModal(false)}
        />
      )}
    </div>
  )
}