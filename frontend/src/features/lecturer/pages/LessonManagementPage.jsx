import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, FileText, Pencil, Trash2, Archive, Eye, MoreHorizontal, Sparkles } from 'lucide-react'
import {
  getLessons, createLesson, updateLesson, deleteLesson, updateLessonStatus,
} from '../../../services/lesson.api'
import { getLecturerSubjects } from '../../../services/subject.api'
import { getCLOs } from '../../../services/clo.api'
import { formatDate } from '../../../utils/formatDate'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, TableShell, Tr, Td,
  Badge, Sk, EmptyState, ErrorBanner, Pagination, inputCls, labelCls,
} from '../components/LecturerUI'
import PortalDropdown from '../../../components/common/PortalDropdown'
import ImportAIModal from '../components/ImportAIModal'

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED']
const STATUS_LABELS = { DRAFT: 'Nháp', PUBLISHED: 'Đã đăng', ARCHIVED: 'Lưu trữ' }
const EMPTY_LESSON = { title: '', chapter: '', description: '', content: '', subjectId: '', cloIds: [], status: 'DRAFT' }

function LessonModal({ mode, initial, subjects, onClose, onSave, saving, error }) {
  const [clos, setClos] = useState([])
  const [form, setForm] = useState(initial ? {
    title: initial.title ?? '', chapter: initial.chapter ?? '',
    description: initial.description ?? '', content: initial.content ?? '',
    subjectId: initial.subjectId ?? '', cloIds: initial.cloIds ?? [],
    status: initial.status ?? 'DRAFT',
  } : EMPTY_LESSON)

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
    ...f, cloIds: f.cloIds.includes(id) ? f.cloIds.filter(c => c !== id) : [...f.cloIds, id]
  }))

  const filteredClos = clos

  return (
    <Modal onClose={onClose} size="lg">
      <ModalHeader title={mode === 'create' ? 'Tạo bài học' : 'Chỉnh sửa bài học'} onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Tiêu đề bài học *</label>
            <input className={inputCls} placeholder="Giới thiệu về React Hooks" value={form.title} onChange={set('title')} />
          </div>
          <div>
            <label className={labelCls}>Chương / Tuần</label>
            <input className={inputCls} placeholder="3" type="number" min="1" value={form.chapter} onChange={set('chapter')} />
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select className={inputCls} value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Môn học</label>
            <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Chọn môn học</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Mô tả ngắn</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Nội dung bài học</label>
            <textarea className={inputCls + ' resize-none font-mono text-[11px]'} rows={5}
              placeholder="Nội dung chi tiết bài học..." value={form.content} onChange={set('content')} />
          </div>

          {/* CLO selection */}
          {filteredClos.length > 0 && (
            <div className="col-span-2">
              <label className={labelCls}>Gắn CLO</label>
              <div className="flex flex-wrap gap-1.5">
                {filteredClos.map(c => (
                  <button key={c.id} onClick={() => toggleCLO(c.id)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${
                      form.cloIds.includes(c.id)
                        ? 'bg-blue-500/10 text-blue-500 border-blue-300 dark:border-blue-500/30'
                        : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200 dark:hover:border-gray-600 hover:border-gray-300'
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
        saveLabel={mode === 'create' ? 'Tạo bài học' : 'Lưu'} />
    </Modal>
  )
}

function ActionMenu({ lesson, onEdit, onDelete, onStatus, onViewDetail }) {
  const nextStatus = lesson.status === 'PUBLISHED' ? 'ARCHIVED' : lesson.status === 'DRAFT' ? 'PUBLISHED' : 'DRAFT'
  const nextLabel  = lesson.status === 'PUBLISHED' ? 'Lưu trữ' : lesson.status === 'DRAFT' ? 'Đăng bài' : 'Khôi phục'

  return (
    <PortalDropdown>
      <button onClick={() => onViewDetail(lesson)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50"><Eye size={11} /> Chi tiết</button>
      <button onClick={() => onEdit(lesson)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50"><Pencil size={11} /> Chỉnh sửa</button>
      <button onClick={() => onStatus(lesson, nextStatus)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50"><Archive size={11} /> {nextLabel}</button>
      <div className="border-t dark:border-[#21262D] border-gray-100 my-0.5" />
      <button onClick={() => onDelete(lesson)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-400 dark:hover:bg-rose-500/5 hover:bg-rose-50"><Trash2 size={11} /> Xoá</button>
    </PortalDropdown>
  )
}

export default function LessonManagementPage() {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [subjects, setSubjects] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalErr, setModalErr] = useState('')
  const [showImportAIModal, setShowImportAIModal] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const [lRes, sRes] = await Promise.all([
        getLessons({ page, limit: 15, search, subjectId: subjectFilter, status: statusFilter }),
        getLecturerSubjects(),
      ])
      const d = lRes.data.data
      setLessons(Array.isArray(d) ? d : d?.lessons ?? [])
      if (!Array.isArray(d)) setMeta(prev => ({ ...prev, ...d }))
      setSubjects(sRes.data.data?.subjects ?? sRes.data.data ?? [])
    } catch { setLessons([]) }
    finally { setLoading(false) }
  }, [page, search, subjectFilter, statusFilter])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type === 'create') { await createLesson(form); toast.success('Tạo bài học thành công!') }
      else { await updateLesson(modal.data.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetch()
    } catch (e) { setModalErr(e.response?.data?.message ?? 'Đã có lỗi xảy ra.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteLesson(modal.data.id); toast.success('Đã xoá bài học.'); setModal(null); fetch() }
    catch (e) { toast.error(e.response?.data?.message ?? 'Xoá thất bại.') }
    finally { setSaving(false) }
  }

  const handleStatus = async (lesson, status) => {
    try {
      await updateLessonStatus(lesson.id, status)
      toast.success(`Đã chuyển sang: ${STATUS_LABELS[status]}`)
      fetch()
    } catch { toast.error('Không thể cập nhật trạng thái.') }
  }

  const selectCls = 'dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Bài học"
        description="Quản lý nội dung bài giảng"
        stats={[{ label: 'Tổng', value: meta.total || lessons.length }]}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowImportAIModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm">
              <Sparkles size={13} /> Import từ AI History
            </button>
            <button onClick={() => { setModal({ type: 'create' }); setModalErr('') }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm">
              <Plus size={13} /> Tạo bài học
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm bài học..."
            className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
        </div>
        <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả môn học</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <TableShell headers={['Tiêu đề', 'Môn học', 'Chương', 'Trạng thái', 'Ngày tạo', '']}>
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Tr key={i}>
            {[180, 100, 40, 60, 70, 24].map((w, j) => <Td key={j}><Sk className={`h-2.5 w-${w === 24 ? '6' : 'full'} max-w-[${w}px]`} /></Td>)}
          </Tr>
        )) : lessons.length === 0 ? (
          <tr><td colSpan={6}><EmptyState icon={FileText} title="Chưa có bài học" sub="Tạo bài học đầu tiên của bạn"
            action={<button onClick={() => setModal({ type: 'create' })} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600">Tạo bài học</button>} /></td></tr>
        ) : lessons.map(l => (
          <Tr key={l.id}>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={12} className="text-blue-400" />
                </div>
                <div>
                  <div
                    onClick={() => navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } })}
                    className="text-xs font-medium dark:text-gray-200 text-gray-700 hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer truncate max-w-48 transition-colors"
                    title="Xem chi tiết bài học"
                  >
                    {l.title}
                  </div>
                  {l.description && <div className="text-[10px] dark:text-gray-500 text-gray-400 truncate max-w-48">{l.description}</div>}
                </div>
              </div>
            </Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{l.subject?.name ?? '—'}</span></Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500 text-center">{l.chapter ?? '—'}</span></Td>
            <Td><Badge label={l.status} /></Td>
            <Td><span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDate(l.createdAt)}</span></Td>
            <Td>
              <ActionMenu lesson={l}
                onViewDetail={l => navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } })}
                onEdit={l => { setModal({ type: 'edit', data: l }); setModalErr('') }}
                onDelete={l => setModal({ type: 'delete', data: l })}
                onStatus={handleStatus}
              />
            </Td>
          </Tr>
        ))}
      </TableShell>
      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />

      {modal?.type === 'create' && <LessonModal mode="create" subjects={subjects} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'edit' && <LessonModal mode="edit" initial={modal.data} subjects={subjects} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'delete' && (
        <Modal onClose={() => setModal(null)} size="sm">
          <div className="p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3"><Trash2 size={16} className="text-rose-400" /></div>
            <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1">Xoá bài học?</h3>
            <p className="text-xs dark:text-gray-400 text-gray-500 mb-4">Xoá <span className="font-semibold">{modal.data?.title}</span>. Không thể hoàn tác.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setModal(null)} className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg transition-all">Huỷ</button>
              <button onClick={handleDelete} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-all">
                {saving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}Xoá
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ImportAIModal
        isOpen={showImportAIModal}
        onClose={() => setShowImportAIModal(false)}
        type="LESSON"
        onImportSuccess={fetch}
      />
    </div>
  )
}