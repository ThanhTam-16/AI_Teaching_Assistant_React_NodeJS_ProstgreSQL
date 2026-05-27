import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Search, Plus, Pencil, Trash2, X, Check, AlertCircle, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../../services/api'
import { formatDate } from '../../../utils/formatDate'
import PageHeader from '../../../components/common/PageHeader'

const getSubjects   = (p) => api.get('/subjects', { params: p })
const createSubject = (d) => api.post('/subjects', d)
const updateSubject = (id,d) => api.put(`/subjects/${id}`, d)
const deleteSubject = (id) => api.delete(`/subjects/${id}`)

function Skeleton({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded animate-pulse ${className}`} />
}

function Modal({ onClose, children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.55)', margin: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const EMPTY = { code: '', name: '', credits: '', description: '' }
const inputCls = 'w-full dark:bg-gray-800 bg-gray-50 border dark:border-gray-700 border-gray-200 rounded-lg px-3 py-2 text-xs dark:text-gray-200 text-gray-800 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all'
const labelCls = 'block text-[10px] font-bold uppercase tracking-wide dark:text-gray-400 text-gray-500 mb-1'

function SubjectModal({ mode, initial, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initial ? { code: initial.code??'', name: initial.name??'', credits: initial.credits??'', description: initial.description??'' } : EMPTY)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b dark:border-gray-800 border-gray-200">
        <h3 className="text-sm font-bold dark:text-white text-gray-900">{mode==='create'?'Thêm môn học':'Chỉnh sửa môn học'}</h3>
        <button onClick={onClose} className="dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600 transition-colors"><X size={15}/></button>
      </div>
      <div className="px-5 py-4 space-y-3">
        {error && <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg px-3 py-2 text-xs"><AlertCircle size={12} className="mt-0.5 flex-shrink-0"/>{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Mã môn *</label><input className={inputCls} placeholder="SE101" value={form.code} onChange={set('code')}/></div>
          <div><label className={labelCls}>Số tín chỉ</label><input className={inputCls} type="number" min="1" max="10" placeholder="3" value={form.credits} onChange={set('credits')}/></div>
        </div>
        <div><label className={labelCls}>Tên môn học *</label><input className={inputCls} placeholder="Lập trình Web" value={form.name} onChange={set('name')}/></div>
        <div><label className={labelCls}>Mô tả</label><textarea className={inputCls+' resize-none'} rows={3} placeholder="Mô tả ngắn..." value={form.description} onChange={set('description')}/></div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t dark:border-gray-800 border-gray-200">
        <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">Huỷ</button>
        <button onClick={()=>onSave(form)} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60 transition-all">
          {saving?<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Check size={12}/>}
          {mode==='create'?'Tạo':'Lưu'}
        </button>
      </div>
    </Modal>
  )
}

function DeleteModal({ subject, onClose, onConfirm, deleting }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3"><Trash2 size={16} className="text-rose-400"/></div>
        <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1">Xoá môn học?</h3>
        <p className="text-xs dark:text-gray-400 text-gray-500 mb-4">Xoá <span className="font-semibold dark:text-gray-200 text-gray-700">{subject?.name}</span>. Không thể hoàn tác.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">Huỷ</button>
          <button onClick={onConfirm} disabled={deleting} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-all">
            {deleting&&<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}Xoá
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function SubjectManagementPage() {
  const [subjects, setSubjects] = useState([])
  const [meta, setMeta] = useState({ total:0, page:1, totalPages:1 })
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalErr, setModalErr] = useState('')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSubjects({ page, limit:20, search })
      const { subjects:list, ...m } = res.data.data
      setSubjects(list??[]); setMeta(prev=>({...prev,...m}))
    } catch { setSubjects([]) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(()=>{ fetchSubjects() }, [fetchSubjects])
  useEffect(()=>{ const t=setTimeout(()=>{setSearch(searchInput);setPage(1)},400); return()=>clearTimeout(t) }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type==='create') { await createSubject(form); toast.success('Tạo môn học thành công!') }
      else { await updateSubject(modal.subject.id, form); toast.success('Cập nhật thành công!') }
      setModal(null); fetchSubjects()
    } catch (err) { setModalErr(err.response?.data?.message ?? 'Đã có lỗi xảy ra.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteSubject(modal.subject.id); toast.success('Đã xoá môn học.'); setModal(null); fetchSubjects() }
    catch (err) { toast.error(err.response?.data?.message ?? 'Xoá thất bại.') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Môn học"
        description="Quản lý danh sách môn học trong hệ thống"
        stats={[{ label: 'Tổng', value: meta.total, accent: 'default' }]}
        actions={
          <button onClick={()=>{setModal({type:'create'});setModalErr('')}} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-all shadow-sm">
            <Plus size={13}/> Thêm môn học
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-gray-400 pointer-events-none"/>
        <input value={searchInput} onChange={(e)=>setSearchInput(e.target.value)} placeholder="Tìm tên, mã môn..."
          className="w-full dark:bg-gray-900 bg-white border dark:border-gray-800 border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all"/>
      </div>

      {/* Table */}
      <div className="dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200/60 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-800/60 border-gray-200/60">
                {['Mã môn','Tên môn học','Tín chỉ','Mô tả','Ngày tạo',''].map(h=>(
                  <th key={h} className="text-left px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:6}).map((_,i)=>(
                <tr key={i} className="border-b dark:border-gray-800/30 border-gray-100">
                  <td className="px-4 py-2.5"><Skeleton className="h-5 w-12 rounded-lg"/></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-36"/></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-6"/></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-48"/></td>
                  <td className="px-4 py-2.5"><Skeleton className="h-2.5 w-18"/></td>
                  <td className="px-4 py-2.5"><Skeleton className="w-12 h-5 rounded"/></td>
                </tr>
              )) : subjects.length===0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center">
                  <BookOpen size={24} className="dark:text-gray-700 text-gray-300 mx-auto mb-2"/>
                  <div className="text-xs dark:text-gray-600 text-gray-400">Chưa có môn học nào.</div>
                </td></tr>
              ) : subjects.map(s=>(
                <tr key={s.id} className="border-b dark:border-gray-800/30 border-gray-100 dark:hover:bg-gray-800/20 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[10px] font-bold text-orange-400 dark:bg-orange-500/10 bg-orange-50 px-2 py-0.5 rounded-md border dark:border-orange-500/20 border-orange-200">{s.code}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium dark:text-gray-200 text-gray-700">{s.name}</td>
                  <td className="px-4 py-2.5 text-xs dark:text-gray-400 text-gray-500 text-center">{s.credits??'—'}</td>
                  <td className="px-4 py-2.5 max-w-xs"><span className="text-[10px] dark:text-gray-500 text-gray-400 line-clamp-1">{s.description??'—'}</span></td>
                  <td className="px-4 py-2.5 text-[10px] dark:text-gray-500 text-gray-400">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={()=>{setModal({type:'edit',subject:s});setModalErr('')}} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 hover:bg-gray-100 transition-all"><Pencil size={11}/></button>
                      <button onClick={()=>setModal({type:'delete',subject:s})} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:text-rose-400 hover:text-rose-500 dark:hover:bg-rose-500/5 hover:bg-rose-50 transition-all"><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && meta.totalPages>1 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t dark:border-gray-800/60 border-gray-200/60">
            <span className="text-[10px] dark:text-gray-600 text-gray-400">Trang {meta.page}/{meta.totalPages}</span>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronLeft size={13}/></button>
              <button onClick={()=>setPage(p=>Math.min(meta.totalPages,p+1))} disabled={page===meta.totalPages} className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 disabled:opacity-30 transition-all"><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>

      {modal?.type==='create' && <SubjectModal mode="create" onClose={()=>setModal(null)} onSave={handleSave} saving={saving} error={modalErr}/>}
      {modal?.type==='edit'   && <SubjectModal mode="edit" initial={modal.subject} onClose={()=>setModal(null)} onSave={handleSave} saving={saving} error={modalErr}/>}
      {modal?.type==='delete' && <DeleteModal subject={modal.subject} onClose={()=>setModal(null)} onConfirm={handleDelete} deleting={saving}/>}
    </div>
  )
}