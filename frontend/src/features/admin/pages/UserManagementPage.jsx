import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Check, AlertCircle, Users, MoreHorizontal,
} from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../../../services/user.api'
import { formatDate } from '../../../utils/formatDate'
import PageHeader from '../../../components/common/PageHeader'
import PortalDropdown from '../../../components/common/PortalDropdown'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_LABELS  = { ADMIN: 'Admin', LECTURER: 'Giảng viên', STUDENT: 'Sinh viên' }
const ROLE_STYLES  = {
  ADMIN:    'bg-orange-500/10  text-orange-400  border-orange-500/20',
  LECTURER: 'bg-blue-500/10   text-blue-400    border-blue-500/20',
  STUDENT:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}
const STATUS_STYLES = {
  ACTIVE:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INACTIVE: 'dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 bg-gray-100 text-gray-400 border-gray-200',
  BLOCKED:  'bg-rose-500/10   text-rose-400     border-rose-500/20',
}
const STATUS_LABELS = { ACTIVE: 'Hoạt động', INACTIVE: 'Chưa kích hoạt', BLOCKED: 'Đã khoá' }
const EMPTY_FORM = { name: '', email: '', password: '', role: 'STUDENT', status: 'ACTIVE' }

// ── Sub-components ─────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded animate-pulse ${className}`} />
}

function Badge({ style, label }) {
  return (
    <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${style}`}>
      {label}
    </span>
  )
}

function ActionMenu({ user, onEdit, onDelete, onToggleStatus }) {
  return (
    <PortalDropdown width="w-38">
      <button onClick={() => onEdit(user)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">
        <Pencil size={11} /> Chỉnh sửa
      </button>
      <button onClick={() => onToggleStatus(user)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs dark:text-gray-300 text-gray-600 dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">
        {user.status === 'ACTIVE' ? <><ToggleLeft size={11} /> Khoá</> : <><ToggleRight size={11} /> Mở khoá</>}
      </button>
      <div className="dark:border-gray-800 border-gray-100 border-t my-0.5" />
      <button onClick={() => onDelete(user)} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-400 dark:hover:bg-rose-500/5 hover:bg-rose-50 transition-all">
        <Trash2 size={11} /> Xoá
      </button>
    </PortalDropdown>
  )
}

// ── Modal ─────────────────────────────────────────────────────
function Modal({ onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    // backdrop: fixed, covers viewport, blur+dim
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)', margin: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* modal box — no further darkening */}
      <div
        className="w-full max-w-md dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function UserModal({ mode, initial, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initial ? {
    name: initial.name ?? '', email: initial.email ?? '',
    password: '', role: initial.role ?? 'STUDENT', status: initial.status ?? 'ACTIVE',
  } : EMPTY_FORM)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const inputCls = 'w-full dark:bg-gray-800 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-lg px-3 py-2 text-xs dark:text-gray-200 text-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all'
  const labelCls = 'block text-[10px] font-semibold dark:text-gray-400 text-gray-500 mb-1 uppercase tracking-wide'

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b dark:border-gray-800 border-gray-200">
        <h3 className="text-sm font-bold dark:text-white text-gray-900">
          {mode === 'create' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'}
        </h3>
        <button onClick={onClose} className="dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600 transition-colors"><X size={15} /></button>
      </div>
      <div className="px-5 py-4 space-y-3.5">
        {error && (
          <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg px-3 py-2 text-xs">
            <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{error}
          </div>
        )}
        <div><label className={labelCls}>Họ và tên *</label><input className={inputCls} placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} /></div>
        <div><label className={labelCls}>Email *</label><input className={inputCls} type="email" placeholder="example@fpt.edu.vn" value={form.email} onChange={set('email')} /></div>
        {mode === 'create' && (
          <div><label className={labelCls}>Mật khẩu *</label><input className={inputCls} type="password" placeholder="Tối thiểu 8 ký tự" value={form.password} onChange={set('password')} /></div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Vai trò</label>
            <select className={inputCls} value={form.role} onChange={set('role')}>
              <option value="STUDENT">Sinh viên</option>
              <option value="LECTURER">Giảng viên</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Trạng thái</label>
            <select className={inputCls} value={form.status} onChange={set('status')}>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Chưa kích hoạt</option>
              <option value="BLOCKED">Khoá</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t dark:border-gray-800 border-gray-200">
        <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">Huỷ</button>
        <button onClick={() => onSave(form)} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-all">
          {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={12} />}
          {mode === 'create' ? 'Tạo' : 'Lưu'}
        </button>
      </div>
    </Modal>
  )
}

function DeleteConfirmModal({ user, onClose, onConfirm, deleting }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
          <Trash2 size={16} className="text-rose-400" />
        </div>
        <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1">Xác nhận xoá?</h3>
        <p className="text-xs dark:text-gray-400 text-gray-500 mb-4">
          Xoá tài khoản <span className="font-semibold dark:text-gray-200 text-gray-700">{user?.name}</span>. Không thể hoàn tác.
        </p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">Huỷ</button>
          <button onClick={onConfirm} disabled={deleting} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-all">
            {deleting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Xoá
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UserManagementPage({ fixedRole, pageTitle = 'Tất cả người dùng' }) {
  const [users,    setUsers]    = useState([])
  const [meta,     setMeta]     = useState({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const [loading,  setLoading]  = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState(fixedRole ?? '')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(1)
  const [modal, setModal]       = useState(null)
  const [saving, setSaving]     = useState(false)
  const [modalErr, setModalErr] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers({ page, limit: 20, search, role: roleFilter, status: statusFilter })
      const { users: list, ...metaData } = res.data.data
      setUsers(list ?? [])
      setMeta((m) => ({ ...m, ...metaData }))
    } catch { setUsers([]) }
    finally  { setLoading(false) }
  }, [page, search, roleFilter, statusFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type === 'create') { await createUser(form); toast.success('Tạo người dùng thành công!') }
      else { await updateUser(modal.user.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetchUsers()
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Đã có lỗi xảy ra.'
      setModalErr(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteUser(modal.user.id); toast.success('Đã xoá người dùng.'); setModal(null); fetchUsers() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Xoá thất bại.') }
    finally { setSaving(false) }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE'
    try {
      await toggleUserStatus(user.id, newStatus)
      toast.success(newStatus === 'ACTIVE' ? 'Đã mở khoá tài khoản.' : 'Đã khoá tài khoản.')
      fetchUsers()
    } catch { toast.error('Không thể thay đổi trạng thái.') }
  }

  const selectCls = 'dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title={pageTitle}
        description="Quản lý tài khoản người dùng trong hệ thống"
        stats={[
          { label: 'Tổng', value: meta.total, accent: 'default' },
          { label: 'Trang', value: `${page}/${meta.totalPages}`, accent: 'default' },
        ]}
        actions={
          <button
            onClick={() => { setModal({ type: 'create' }); setModalErr('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-sm"
          >
            <Plus size={13} /> Thêm người dùng
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên, email..."
            className="w-full dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>
        {!fixedRole && (
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className={selectCls}>
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Admin</option>
            <option value="LECTURER">Giảng viên</option>
            <option value="STUDENT">Sinh viên</option>
          </select>
        )}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Chưa kích hoạt</option>
          <option value="BLOCKED">Đã khoá</option>
        </select>
      </div>

      {/* Table */}
      <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800/60 border-gray-200/60">
                {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b dark:border-gray-800/30 border-gray-100">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Skeleton className="w-7 h-7 rounded-full" /><Skeleton className="h-2.5 w-24" /></div></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-32" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-14 rounded-full" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-18 rounded-full" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-18" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="w-6 h-6 rounded-md" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center">
                  <Users size={28} className="dark:text-gray-700 text-gray-300 mx-auto mb-2" />
                  <div className="text-xs dark:text-gray-600 text-gray-400">Không tìm thấy người dùng nào.</div>
                </td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b dark:border-gray-800/30 border-gray-100 dark:hover:bg-gray-800/20 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full dark:bg-gray-800 bg-gray-100 flex items-center justify-center flex-shrink-0 border dark:border-gray-700 border-gray-200">
                          <span className="text-[10px] font-bold dark:text-gray-300 text-gray-500">{u.name?.[0]?.toUpperCase() ?? '?'}</span>
                        </div>
                        <span
                          onClick={() => { setModal({ type:'edit', user:u }); setModalErr('') }}
                          className="text-xs font-medium dark:text-gray-200 text-gray-700 hover:text-orange-500 dark:hover:text-orange-400 hover:underline cursor-pointer transition-colors"
                          title="Bấm để chỉnh sửa"
                        >
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5"><span className="text-xs dark:text-gray-400 text-gray-500">{u.email}</span></td>
                    <td className="px-4 py-2.5"><Badge style={ROLE_STYLES[u.role]} label={ROLE_LABELS[u.role] ?? u.role} /></td>
                    <td className="px-4 py-2.5"><Badge style={STATUS_STYLES[u.status]} label={STATUS_LABELS[u.status] ?? u.status} /></td>
                    <td className="px-4 py-2.5"><span className="text-[10px] dark:text-gray-500 text-gray-400">{formatDate(u.createdAt)}</span></td>
                    <td className="px-4 py-2.5">
                      <ActionMenu user={u} onEdit={(u) => { setModal({ type:'edit', user:u }); setModalErr('') }} onDelete={(u) => setModal({ type:'delete', user:u })} onToggleStatus={handleToggleStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t dark:border-gray-800/60 border-gray-200/60">
            <span className="text-[10px] dark:text-gray-600 text-gray-400">Trang {meta.page} / {meta.totalPages} · {meta.total} người dùng</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all">
                <ChevronLeft size={13} />
              </button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_,i) => i+1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-6 h-6 rounded-md text-[10px] font-medium transition-all ${page===p ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'dark:text-gray-500 text-gray-400 dark:hover:bg-gray-800 hover:bg-gray-100'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(meta.totalPages,p+1))} disabled={page===meta.totalPages} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal?.type==='create' && <UserModal mode="create" onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type==='edit'   && <UserModal mode="edit" initial={modal.user} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type==='delete' && <DeleteConfirmModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDelete} deleting={saving} />}
    </div>
  )
}