import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Target, Pencil, Trash2, Search, MoreHorizontal } from 'lucide-react'
import { getCLOs, createCLO, updateCLO, deleteCLO } from '../../../services/clo.api'
import { getLecturerSubjects } from '../../../services/subject.api'
import {
  PageHeader, Modal, ModalHeader, ModalFooter, TableShell, Tr, Td,
  Badge, Sk, EmptyState, ErrorBanner, inputCls, labelCls,
} from '../components/LecturerUI'

const EMPTY = { code: '', description: '', level: 'UNDERSTAND', subjectId: '' }
const LEVELS = ['REMEMBER','UNDERSTAND','APPLY','ANALYZE','EVALUATE','CREATE']
const LEVEL_LABELS = { REMEMBER:'Nhớ', UNDERSTAND:'Hiểu', APPLY:'Vận dụng', ANALYZE:'Phân tích', EVALUATE:'Đánh giá', CREATE:'Sáng tạo' }
const LEVEL_COLORS = { REMEMBER:'gray', UNDERSTAND:'blue', APPLY:'sky', ANALYZE:'violet', EVALUATE:'orange', CREATE:'rose' }

function CLOModal({ mode, initial, subjects, onClose, onSave, saving, error }) {
  const [form, setForm] = useState(initial ? {
    code: initial.code ?? '', description: initial.description ?? '',
    level: initial.level ?? 'UNDERSTAND', subjectId: initial.subjectId ?? '',
  } : EMPTY)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={mode === 'create' ? 'Thêm CLO' : 'Chỉnh sửa CLO'} onClose={onClose} />
      <div className="px-5 py-4 space-y-3">
        <ErrorBanner message={error} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Mã CLO *</label>
            <input className={inputCls} placeholder="CLO1" value={form.code} onChange={set('code')} />
          </div>
          <div>
            <label className={labelCls}>Môn học *</label>
            <select className={inputCls} value={form.subjectId} onChange={set('subjectId')}>
              <option value="">Chọn môn học</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Mô tả CLO *</label>
            <textarea className={inputCls + ' resize-none'} rows={3}
              placeholder="Sinh viên có thể..." value={form.description} onChange={set('description')} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Cấp độ Bloom</label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setForm(f => ({ ...f, level: l }))}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    form.level === l
                      ? 'bg-blue-500/10 text-blue-500 border-blue-300 dark:border-blue-500/30 dark:text-blue-300'
                      : 'dark:text-gray-500 text-gray-400 dark:border-[#21262D] border-gray-200 dark:hover:border-gray-600 hover:border-gray-300'
                  }`}>
                  {LEVEL_LABELS[l]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => onSave(form)} saving={saving}
        saveLabel={mode === 'create' ? 'Thêm CLO' : 'Lưu'} />
    </Modal>
  )
}

function DeleteModal({ clo, onClose, onConfirm, deleting }) {
  return (
    <Modal onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3">
          <Trash2 size={16} className="text-rose-400" />
        </div>
        <h3 className="font-bold dark:text-white text-gray-900 text-sm mb-1">Xoá CLO?</h3>
        <p className="text-xs dark:text-gray-400 text-gray-500 mb-4">Xoá <span className="font-semibold">{clo?.code}</span>. Không thể hoàn tác.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all">Huỷ</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-60 transition-all">
            {deleting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}Xoá
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default function CLOManagementPage() {
  const [clos, setClos] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectFilter, setSubjectFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [modalErr, setModalErr] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const subRes = await getLecturerSubjects()
      const subs = subRes.data.data?.subjects ?? subRes.data.data ?? []
      setSubjects(subs)

      let activeSubjectId = subjectFilter
      if (!activeSubjectId && subs.length > 0) {
        activeSubjectId = subs[0].id
        setSubjectFilter(subs[0].id)
      }

      if (activeSubjectId) {
        const cloRes = await getCLOs({ subjectId: activeSubjectId, search })
        setClos(cloRes.data.data ?? [])
      } else {
        setClos([])
      }
    } catch { 
      setClos([]) 
    } finally { 
      setLoading(false) 
    }
  }, [subjectFilter, search])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSave = async (form) => {
    setSaving(true); setModalErr('')
    try {
      if (modal.type === 'create') { await createCLO(form); toast.success('Thêm CLO thành công!') }
      else { await updateCLO(modal.data.id, form); toast.success('Cập nhật CLO thành công!') }
      setModal(null); fetch()
    } catch (e) { setModalErr(e.response?.data?.message ?? 'Đã có lỗi.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try { await deleteCLO(modal.data.id); toast.success('Đã xoá CLO.'); setModal(null); fetch() }
    catch (e) { toast.error(e.response?.data?.message ?? 'Xoá thất bại.') }
    finally { setSaving(false) }
  }

  const selectCls = 'dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-2.5 py-1.5 text-xs dark:text-gray-300 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all'

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="CLO"
        description="Chuẩn đầu ra học phần"
        stats={[{ label: 'Tổng', value: clos.length }]}
        actions={
          <button onClick={() => { setModal({ type: 'create' }); setModalErr('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-sm">
            <Plus size={13} /> Thêm CLO
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-44">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm CLO..."
            className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
        </div>
        <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} className={selectCls}>
          <option value="">Tất cả môn học</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Grid of CLO cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 space-y-2">
              <Sk className="h-3 w-12 rounded-full" />
              <Sk className="h-4 w-24" />
              <Sk className="h-3 w-full" />
              <Sk className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : clos.length === 0 ? (
        <EmptyState icon={Target} title="Chưa có CLO nào" sub="Thêm CLO để xác định chuẩn đầu ra"
          action={<button onClick={() => setModal({ type: 'create' })} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">Thêm CLO</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {clos.map(c => {
            const color = LEVEL_COLORS[c.level] ?? 'blue'
            return (
              <div key={c.id}
                className="group relative dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 hover:shadow-md transition-all duration-200 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-gradient-to-r from-blue-400/60 via-sky-300/40 to-transparent" />

                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => { setModal({ type: 'edit', data: c }); setModalErr('') }}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-400/20 hover:bg-blue-500/20 cursor-pointer transition-colors"
                      title="Bấm để chỉnh sửa"
                    >
                      {c.code}
                    </span>
                    {c.level && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border
                        ${color === 'blue' ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20' :
                          color === 'sky' ? 'bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20' :
                          color === 'violet' ? 'bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20' :
                          color === 'orange' ? 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20' :
                          color === 'rose' ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20' :
                          'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                        {LEVEL_LABELS[c.level] ?? c.level}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setModal({ type: 'edit', data: c }); setModalErr('') }}
                      className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:bg-[#21262D] hover:bg-gray-100 transition-all">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => setModal({ type: 'delete', data: c })}
                      className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-500 text-gray-400 hover:text-rose-400 dark:hover:bg-rose-500/5 hover:bg-rose-50 transition-all">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <p
                  onClick={() => { setModal({ type: 'edit', data: c }); setModalErr('') }}
                  className="text-xs dark:text-gray-300 text-gray-700 leading-relaxed line-clamp-3 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  title="Bấm để chỉnh sửa"
                >
                  {c.description}
                </p>

                {c.subject && (
                  <div className="mt-3 pt-2 border-t dark:border-[#21262D] border-gray-100">
                    <span className="text-[9px] dark:text-gray-500 text-gray-400">{c.subject.name}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal?.type === 'create' && <CLOModal mode="create" subjects={subjects} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'edit' && <CLOModal mode="edit" initial={modal.data} subjects={subjects} onClose={() => setModal(null)} onSave={handleSave} saving={saving} error={modalErr} />}
      {modal?.type === 'delete' && <DeleteModal clo={modal.data} onClose={() => setModal(null)} onConfirm={handleDelete} deleting={saving} />}
    </div>
  )
}