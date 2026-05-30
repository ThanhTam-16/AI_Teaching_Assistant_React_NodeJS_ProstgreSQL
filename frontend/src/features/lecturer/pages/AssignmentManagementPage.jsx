import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Search, ClipboardList, Pencil, Trash2, MoreHorizontal, Eye } from 'lucide-react'
import {
  getAssignments, createAssignment, updateAssignment,
  deleteAssignment, updateAssignmentStatus,
} from '../../../services/assignment.api'
import { getLecturerSubjects } from '../../../services/subject.api'
import { getCLOs } from '../../../services/clo.api'
import { getLecturerClasses } from '../../../services/class.api'
import { getLessons } from '../../../services/lesson.api'
import { formatDate } from '../../../utils/formatDate'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, TableShell, Tr, Td,
  Badge, Sk, EmptyState, ErrorBanner, Pagination, inputCls, labelCls,
} from '../components/LecturerUI'
import PortalDropdown from '../../../components/common/PortalDropdown'

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']
const DIFF_LABELS   = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }
const DIFF_COLORS   = { EASY: 'text-emerald-500', MEDIUM: 'text-amber-500', HARD: 'text-rose-500' }
const SUB_TYPES     = ['TEXT', 'FILE', 'GITHUB', 'CODE']
const STATUSES      = ['OPEN', 'CLOSED', 'DRAFT']
const STATUS_LABELS = { OPEN: 'Đang mở', CLOSED: 'Đã đóng', DRAFT: 'Nháp' }

const EMPTY = {
  title: '', description: '', content: '',
  subjectId: '', classId: '', lessonId: '', cloIds: [],
  dueDate: '', totalScore: 100, difficulty: 'MEDIUM',
  submissionType: 'TEXT', status: 'OPEN',
}

function AssignmentModal({ mode, initial, subjects, classes, lessons, onClose, onSave, saving, error }) {
  const [clos, setClos] = useState([])
  const [form, setForm] = useState(initial ? {
    title: initial.title ?? '', description: initial.description ?? '',
    content: initial.content ?? '', subjectId: initial.subjectId ?? '',
    classId: initial.classId ?? '', lessonId: initial.lessonId ?? '',
    cloIds: initial.cloIds ?? [], dueDate: initial.dueDate?.slice(0, 16) ?? '',
    totalScore: initial.totalScore ?? 100, difficulty: initial.difficulty ?? 'MEDIUM',
    submissionType: initial.submissionType ?? 'TEXT', status: initial.status ?? 'OPEN',
  } : EMPTY)

  useEffect(() => {
    if (!form.subjectId) {
      setClos([])
      return
    }
    getCLOs({ subjectId: form.subjectId })
      .then(r => setClos(r.data.data ?? []))
      .catch(() => setClos([]))
  }, [form.subjectId])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleCLO = id => setForm(f => ({
    ...f, cloIds: f.cloIds.includes(id) ? f.cloIds.filter(c => c !== id) : [...f.cloIds, id],
  }))

  const filteredClos = clos

  return (
    <Modal onClose={onClose} size="lg">
      <ModalHeader title={mode === 'create' ? 'Tạo bài tập' : 'Chỉnh sửa bài tập'} onClose={onClose} />
      <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
        <ErrorBanner message={error} />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Tiêu đề bài tập *</label>
            <input className={inputCls} placeholder="Lab 3: Xây dựng REST API" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className={labelCls}>Môn học</label>
            <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Chọn môn học</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Lớp học</label>
            <select className={inputCls} value={form.classId} onChange={set('classId')}>
              <option value="">Chọn lớp</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Bài học liên kết</label>
            <select className={inputCls} value={form.lessonId} onChange={set('lessonId')}>
              <option value="">Không liên kết</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Hạn nộp</label>
            <input className={inputCls} type="datetime-local" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div>
            <label className={labelCls}>Điểm tối đa</label>
            <input className={inputCls} type="number" min="0" max="1000" value={form.totalScore} onChange={set('totalScore')} />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          {/* Difficulty pills */}
          <div className="col-span-2">
            <label className={labelCls}>Độ khó</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.difficulty === d
                      ? d === 'EASY' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-300 dark:border-emerald-500/30'
                        : d === 'MEDIUM' ? 'bg-amber-500/10 text-amber-500 border-amber-300 dark:border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-500 border-rose-300 dark:border-rose-500/30'
                      : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                  }`}>
                  {DIFF_LABELS[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Submission type */}
          <div className="col-span-2">
            <label className={labelCls}>Hình thức nộp</label>
            <div className="grid grid-cols-4 gap-2">
              {SUB_TYPES.map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, submissionType: t }))}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    form.submissionType === t
                      ? 'bg-blue-500/10 text-blue-500 border-blue-300 dark:border-blue-500/30'
                      : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <label className={labelCls}>Mô tả</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Nội dung chi tiết</label>
            <textarea className={inputCls + ' resize-none'} rows={4}
              placeholder="Yêu cầu cụ thể, hướng dẫn, tiêu chí chấm..." value={form.content} onChange={set('content')} />
          </div>

          {filteredClos.length > 0 && (
            <div className="col-span-2">
              <label className={labelCls}>Gắn CLO</label>
              <div className="flex flex-wrap gap-1.5">
                {filteredClos.map(c => (
                  <button key={c.id} onClick={() => toggleCLO(c.id)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                      form.cloIds.includes(c.id)
                        ? 'bg-blue-500/10 text-blue-500 border-blue-300 dark:border-blue-500/30'
                        : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200'
                    }`}>
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => onSave(form)} saving={saving}
        saveLabel={mode === 'create' ? 'Tạo bài tập' : 'Lưu'} />
    </Modal>
  )
}

function ActionMenu({ assignment, onEdit, onDelete, onClose }) {
  return (
    <PortalDropdown>
      <button onClick={() => onEdit(assignment)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50"><Pencil size={11} /> Chỉnh sửa</button>
      <button onClick={() => onClose(assignment)}
        className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:hover:bg-[#21262D] hover:bg-gray-50 ${assignment.status === 'OPEN' ? 'text-amber-400' : 'text-emerald-400'}`}>
        {assignment.status === 'OPEN' ? 'Đóng bài tập' : 'Mở lại'}
      </button>
      <div className="border-t dark:border-[#21262D] border-gray-100 my-0.5" />
      <button onClick={() => onDelete(assignment)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-400 dark:hover:bg-rose-500/5 hover:bg-rose-50"><Trash2 size={11} /> Xoá</button>
    </PortalDropdown>
  )
}

export default function AssignmentManagementPage() {
  const [assignments, setAssignments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses]   = useState([])
  const [lessons, setLessons]   = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalErr, setModalErr] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, sRes, cRes, lRes] = await Promise.all([
        getAssignments({ page, limit: 15, search, classId: classFilter, status: statusFilter }),
        getLecturerSubjects(), getLecturerClasses(), getLessons(),
      ])
      const d = aRes.data.data
      setAssignments(Array.isArray(d) ? d : d?.assignments ?? [])
      if (!Array.isArray(d)) setMeta(prev => ({ ...prev, ...d }))
      setSubjects(sRes.data.data?.subjects ?? sRes.data.data ?? [])
      setClasses(cRes.data.data?.classes ?? cRes.data.data ?? [])
      setLessons(Array.isArray(lRes.data.data) ? lRes.data.data : lRes.data.data?.lessons ?? [])
    } catch { setAssignments([]) }
    finally { setLoading(false) }
  }, [page, search, classFilter, statusFilter])

  useEffect(() => { fetchAll() }, [fetchAll])
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type === 'create') { await createAssignment(form); toast.success('Tạo bài tập thành công!') }
      else { await updateAssignment(modal.data.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetchAll()
    } catch (e) { setModalErr(e.response?.data?.message ?? 'Đã có lỗi xảy ra.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteAssignment(modal.data.id); toast.success('Đã xoá bài tập.'); setModal(null); fetchAll() }
    catch (e) { toast.error(e.response?.data?.message ?? 'Xoá thất bại.') }
    finally { setSaving(false) }
  }

  const handleClose = async (a) => {
    const next = a.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    try {
      await updateAssignmentStatus(a.id, next)
      toast.success(next === 'CLOSED' ? 'Đã đóng bài tập.' : 'Đã mở lại bài tập.')
      fetchAll()
    } catch { toast.error('Không thể thay đổi trạng thái.') }
  }

  const selectCls = 'dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Bài tập"
        description="Quản lý bài tập giao cho sinh viên"
        stats={[{ label: 'Tổng', value: meta.total || assignments.length }]}
        actions={
          <button onClick={() => { setModal({ type: 'create' }); setModalErr('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm">
            <Plus size={13} /> Tạo bài tập
          </button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm bài tập..."
            className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
        </div>
        <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả lớp</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <TableShell headers={['Tiêu đề', 'Lớp', 'Hạn nộp', 'Điểm', 'Độ khó', 'Loại', 'Trạng thái', '']}>
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Tr key={i}>{[200,80,80,40,60,50,60,24].map((_, j) => <Td key={j}><Sk className="h-2.5 w-full" /></Td>)}</Tr>
        )) : assignments.length === 0 ? (
          <tr><td colSpan={8}><EmptyState icon={ClipboardList} title="Chưa có bài tập" sub="Tạo bài tập mới cho sinh viên"
            action={<button onClick={() => setModal({ type: 'create' })} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600">Tạo bài tập</button>} /></td></tr>
        ) : assignments.map(a => (
          <Tr key={a.id}>
            <Td>
              <div>
                <div
                  onClick={() => { setModal({ type: 'edit', data: a }); setModalErr('') }}
                  className="text-xs font-medium dark:text-gray-200 text-gray-700 hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer truncate max-w-48 transition-colors"
                  title="Bấm để chỉnh sửa"
                >
                  {a.title}
                </div>
                {a.subject?.name && <div className="text-[10px] dark:text-gray-500 text-gray-400">{a.subject.name}</div>}
              </div>
            </Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.class?.name ?? '—'}</span></Td>
            <Td>
              {a.dueDate ? (
                <span className={`text-[10px] font-medium ${new Date(a.dueDate) < new Date() ? 'text-rose-400' : 'dark:text-gray-400 text-gray-500'}`}>
                  {formatDate(a.dueDate)}
                </span>
              ) : <span className="text-[10px] dark:text-gray-600 text-gray-300">—</span>}
            </Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.totalScore ?? 100}</span></Td>
            <Td>
              <span className={`text-[10px] font-bold ${DIFF_COLORS[a.difficulty] ?? 'text-gray-400'}`}>
                {DIFF_LABELS[a.difficulty] ?? a.difficulty ?? '—'}
              </span>
            </Td>
            <Td>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded dark:bg-[#21262D] bg-gray-100 dark:text-gray-400 text-gray-500">
                {a.submissionType ?? 'TEXT'}
              </span>
            </Td>
            <Td><Badge label={a.status} /></Td>
            <Td>
              <ActionMenu assignment={a}
                onEdit={a => { setModal({ type: 'edit', data: a }); setModalErr('') }}
                onDelete={a => setModal({ type: 'delete', data: a })}
                onClose={handleClose}
              />
            </Td>
          </Tr>
        ))}
      </TableShell>
      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />

      {modal?.type === 'create' && <AssignmentModal mode="create" subjects={subjects} classes={classes} lessons={lessons} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'edit' && <AssignmentModal mode="edit" initial={modal.data} subjects={subjects} classes={classes} lessons={lessons} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'delete' && (
        <Modal onClose={() => setModal(null)} size="sm">
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3"><Trash2 size={16} className="text-rose-400" /></div>
            <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1">Xoá bài tập?</h3>
            <p className="text-xs dark:text-gray-400 text-gray-500 mb-4">Xoá <span className="font-semibold">{modal.data?.title}</span>. Không thể hoàn tác.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setModal(null)} className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg">Huỷ</button>
              <button onClick={handleDelete} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60">
                {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}Xoá
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}