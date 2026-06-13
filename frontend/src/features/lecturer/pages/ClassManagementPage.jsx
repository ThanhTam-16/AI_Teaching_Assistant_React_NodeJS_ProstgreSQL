import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Search, Users, Eye, Pencil, MoreHorizontal, UserPlus, UserMinus, X, Check, GraduationCap } from 'lucide-react'
import {
  getLecturerClasses, getLecturerClassById, createClass, updateClass,
  updateClassStatus, getStudentsInClass, addStudentToClass, removeStudentFromClass,
} from '../../../services/class.api'
import { formatDate } from '../../../utils/formatDate'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, TableShell, Tr, Td,
  Badge, Sk, EmptyState, ErrorBanner, Pagination, inputCls, labelCls,
} from '../components/LecturerUI'
import PortalDropdown from '../../../components/common/PortalDropdown'

// ── Class form ────────────────────────────────────────────────────────────────
const EMPTY_CLASS = { name: '', subjectId: '', academicYear: '', semester: '', maxStudents: '', description: '' }

function ClassModal({ mode, initial, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name ?? '', subjectId: initial.subjectId ?? '',
    academicYear: initial.academicYear ?? '', semester: initial.semester ?? '',
    maxStudents: initial.maxStudents ?? '', description: initial.description ?? '',
  } : EMPTY_CLASS)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={mode === 'create' ? 'Tạo lớp học' : 'Chỉnh sửa lớp'} onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Tên lớp *</label>
            <input className={inputCls} placeholder="SE1234 - Lập trình Web" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className={labelCls}>Năm học</label>
            <input className={inputCls} placeholder="2025-2026" value={form.academicYear} onChange={set('academicYear')} />
          </div>
          <div>
            <label className={labelCls}>Học kỳ</label>
            <select className={inputCls} value={form.semester} onChange={set('semester')}>
              <option value="">Chọn HK</option>
              {['1','2','3','Hè'].map(s => <option key={s} value={s}>HK {s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Sĩ số tối đa</label>
            <input className={inputCls} type="number" min="1" placeholder="40" value={form.maxStudents} onChange={set('maxStudents')} />
          </div>
          <div>
            <label className={labelCls}>Mã môn học (ID)</label>
            <input className={inputCls} placeholder="subject-id" value={form.subjectId} onChange={set('subjectId')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Mô tả</label>
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={set('description')} />
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => onSave(form)} saving={saving} saveLabel={mode === 'create' ? 'Tạo lớp' : 'Lưu'} />
    </Modal>
  )
}

// ── Student panel ─────────────────────────────────────────────────────────────
function StudentsModal({ cls, onClose }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentEmail, setStudentEmail] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    getStudentsInClass(cls.id)
      .then(r => setStudents(r.data.data ?? []))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false))
  }, [cls.id])

  const handleAdd = async () => {
    if (!studentEmail.trim()) return
    setAdding(true)
    try {
      await addStudentToClass(cls.id, { email: studentEmail })
      toast.success('Đã thêm sinh viên!')
      setStudentEmail('')
      const r = await getStudentsInClass(cls.id)
      setStudents(r.data.data ?? [])
    } catch (e) { toast.error(e.response?.data?.message ?? 'Thêm thất bại.') }
    finally { setAdding(false) }
  }

  const handleRemove = async (studentId, name) => {
    try {
      await removeStudentFromClass(cls.id, studentId)
      setStudents(prev => prev.filter(s => s.id !== studentId))
      toast.success(`Đã xoá ${name} khỏi lớp.`)
    } catch { toast.error('Không thể xoá sinh viên.') }
  }

  return (
    <Modal onClose={onClose} size="lg">
      <ModalHeader title={`Sinh viên — ${cls.name}`} onClose={onClose} />
      <div className="px-5 py-4 space-y-4">
        {/* Add student */}
        <div className="flex gap-2">
          <input
            className={inputCls + ' flex-1'}
            placeholder="Email sinh viên..."
            value={studentEmail}
            onChange={e => setStudentEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} disabled={adding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-all">
            {adding ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={13} />}
            Thêm
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}</div>
        ) : students.length === 0 ? (
          <p className="text-xs dark:text-gray-500 text-gray-400 text-center py-6">Lớp chưa có sinh viên.</p>
        ) : (
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-blue-400">{s.name?.[0]?.toUpperCase() ?? 'S'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium dark:text-gray-200 text-gray-700 truncate">{s.name}</div>
                  <div className="text-[10px] dark:text-gray-500 text-gray-400 truncate">{s.email}</div>
                </div>
                <button onClick={() => handleRemove(s.id, s.name)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all">
                  <UserMinus size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="text-[10px] dark:text-gray-600 text-gray-400 text-right">{students.length} sinh viên</div>
      </div>
    </Modal>
  )
}

// ── Action menu ───────────────────────────────────────────────────────────────
function ActionMenu({ cls, onEdit, onViewStudents, onToggleStatus, onViewDetail }) {
  return (
    <PortalDropdown width="w-40">
      <button onClick={() => onViewDetail(cls)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50 transition-all"><Eye size={11} /> Chi tiết</button>
      <button onClick={() => onEdit(cls)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50 transition-all"><Pencil size={11} /> Chỉnh sửa</button>
      <button onClick={() => onViewStudents(cls)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-[#21262D] hover:bg-gray-50 transition-all"><Users size={11} /> Sinh viên</button>
      <div className="border-t dark:border-[#21262D] border-gray-100 my-0.5" />
      <button onClick={() => onToggleStatus(cls)}
        className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-all ${cls.status === 'ACTIVE' ? 'text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/5' : 'text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5'}`}>
        {cls.status === 'ACTIVE' ? 'Đóng lớp' : 'Mở lớp'}
      </button>
    </PortalDropdown>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ClassManagementPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [classes, setClasses] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // { type, data? }
  const [saving, setSaving] = useState(false)
  const [modalErr, setModalErr] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLecturerClasses({ page, limit: 15, search })
      const { classes: list, ...m } = r.data.data ?? { classes: [] }
      setClasses(list ?? r.data.data ?? [])
      setMeta(prev => ({ ...prev, ...m }))
    } catch { setClasses([]) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type === 'create') { await createClass(form); toast.success('Tạo lớp thành công!') }
      else { await updateClass(modal.data.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetch()
    } catch (e) { setModalErr(e.response?.data?.message ?? 'Đã có lỗi xảy ra.') }
    finally { setSaving(false) }
  }

  const handleToggleStatus = async (cls) => {
    const next = cls.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateClassStatus(cls.id, next)
      toast.success(next === 'ACTIVE' ? 'Đã mở lớp.' : 'Đã đóng lớp.')
      fetch()
    } catch { toast.error('Không thể thay đổi trạng thái.') }
  }

  const flatClassSubjects = []
  classes.forEach(c => {
    if (c.subjects && c.subjects.length > 0) {
      c.subjects.forEach(sub => {
        flatClassSubjects.push({
          ...c,
          subject: sub,
          uniqueKey: `${c.id}-${sub.id}`
        })
      })
    } else {
      flatClassSubjects.push({
        ...c,
        subject: null,
        uniqueKey: c.id
      })
    }
  })

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Lớp học"
        description="Quản lý các lớp bạn phụ trách"
        stats={[{ label: 'Tổng lớp/môn', value: flatClassSubjects.length }]}
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm lớp..."
          className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
      </div>

      <TableShell headers={['Tên lớp', 'Môn học', 'Năm học', 'HK', 'Sinh viên', 'Trạng thái', 'Ngày tạo', '']}>
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <Tr key={i}><Td><div className="flex items-center gap-2"><Sk className="w-7 h-7 rounded-full" /><Sk className="h-2.5 w-28" /></div></Td>
            {[1,2,3,4,5,6].map(j => <Td key={j}><Sk className="h-2.5 w-16" /></Td>)}</Tr>
        )) : flatClassSubjects.length === 0 ? (
          <tr><td colSpan={8}><EmptyState icon={GraduationCap} title="Chưa có lớp học" sub="Liên hệ quản trị viên để gán lớp" /></td></tr>
        ) : flatClassSubjects.map(c => (
          <Tr key={c.uniqueKey} onClick={() => navigate(c.subject ? `/lecturer/classes/${c.id}/subjects/${c.subject.id}` : `/lecturer/classes/${c.id}`, { state: { from: location.pathname } })}>
            <Td>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-blue-400">{c.name?.[0]?.toUpperCase()}</span>
                </div>
                <span
                  className="text-xs font-medium dark:text-gray-200 text-gray-700 hover:text-blue-500 dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors"
                  title="Xem chi tiết lớp học"
                >
                  {c.name} {c.subject ? `— ${c.subject.name}` : ''}
                </span>
              </div>
            </Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.subject ? `${c.subject.name} (${c.subject.code})` : '—'}</span></Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.academicYear ?? '—'}</span></Td>
            <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.semester ?? '—'}</span></Td>
            <Td>
              <div className="flex items-center gap-1 text-xs dark:text-gray-400 text-gray-500">
                <Users size={11} />
                {c.studentCount ?? 0}
              </div>
            </Td>
            <Td><Badge label={c.status} /></Td>
            <Td><span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDate(c.createdAt)}</span></Td>
            <Td onClick={e => e.stopPropagation()}>
              <ActionMenu cls={c}
                onViewDetail={item => navigate(item.subject ? `/lecturer/classes/${item.id}/subjects/${item.subject.id}` : `/lecturer/classes/${item.id}`, { state: { from: location.pathname } })}
                onEdit={item => { setModal({ type: 'edit', data: item }); setModalErr('') }}
                onViewStudents={item => setModal({ type: 'students', data: item })}
                onToggleStatus={handleToggleStatus}
              />
            </Td>
          </Tr>
        ))}
      </TableShell>
      <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />

      {modal?.type === 'create' && <ClassModal mode="create" onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'edit' && <ClassModal mode="edit" initial={modal.data} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'students' && <StudentsModal cls={modal.data} onClose={() => setModal(null)} />}
    </div>
  )
}