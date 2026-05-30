import React, { useEffect, useState, useCallback } from 'react'
import { BookOpen, Search, ChevronRight, FileText, ClipboardList, GraduationCap, X } from 'lucide-react'
import {
  getLecturerSubjects, getLecturerSubjectById,
  getSubjectClasses, getSubjectLessons, getSubjectAssignments,
} from '../../../services/subject.api'
import { formatDate } from '../../../utils/formatDate'
import {
  PageHeader, TableShell, Tr, Td, Badge, Sk, EmptyState, Modal, ModalHeader,
} from '../components/LecturerUI'

// ── Tab pill ──────────────────────────────────────────────────────────────────
function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5
        ${active
          ? 'bg-blue-500/10 text-blue-500 border border-blue-300 dark:border-blue-500/30 dark:text-blue-300'
          : 'dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-700 hover:bg-blue-50 dark:hover:bg-[#21262D]'
        }`}>
      {label}
      {count !== undefined && (
        <span className={`text-[9px] font-bold px-1 rounded-full ${active ? 'bg-blue-500/20 text-blue-400' : 'dark:bg-gray-800 bg-gray-200 dark:text-gray-500 text-gray-500'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Subject detail modal ──────────────────────────────────────────────────────
function SubjectDetailModal({ subjectId, onClose }) {
  const [subject, setSubject] = useState(null)
  const [tab, setTab] = useState('classes')
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)

  useEffect(() => {
    getLecturerSubjectById(subjectId)
      .then(r => setSubject(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [subjectId])

  const loadTab = useCallback(async (t) => {
    setTabLoading(true)
    try {
      if (t === 'classes')     { const r = await getSubjectClasses(subjectId);     setClasses(r.data.data ?? []) }
      if (t === 'lessons')     { const r = await getSubjectLessons(subjectId);     setLessons(r.data.data ?? []) }
      if (t === 'assignments') { const r = await getSubjectAssignments(subjectId); setAssignments(r.data.data ?? []) }
    } catch {} finally { setTabLoading(false) }
  }, [subjectId])

  useEffect(() => { loadTab(tab) }, [tab, loadTab])

  const tabData = tab === 'classes' ? classes : tab === 'lessons' ? lessons : assignments

  return (
    <Modal onClose={onClose} size="xl">
      <ModalHeader title={loading ? '...' : subject?.name ?? 'Chi tiết môn học'} onClose={onClose} />
      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Sk key={i} className="h-4 w-full" />)}</div>
        ) : subject && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: 'Mã môn', v: subject.code },
              { l: 'Số tín chỉ', v: subject.credits },
              { l: 'Trạng thái', v: subject.status },
            ].map(({ l, v }) => (
              <div key={l} className="dark:bg-[#0D1117] bg-blue-50/50 rounded-xl px-3 py-2 border dark:border-[#21262D] border-blue-100">
                <div className="text-[9px] uppercase tracking-wide dark:text-gray-600 text-blue-300 mb-0.5">{l}</div>
                <div className="text-xs font-bold dark:text-gray-200 text-gray-800">{v ?? '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap">
          <Tab label="Lớp học"  active={tab === 'classes'}     onClick={() => setTab('classes')}     count={classes.length} />
          <Tab label="Bài học"  active={tab === 'lessons'}     onClick={() => setTab('lessons')}     count={lessons.length} />
          <Tab label="Bài tập"  active={tab === 'assignments'} onClick={() => setTab('assignments')} count={assignments.length} />
        </div>

        {/* Tab content */}
        <div className="max-h-64 overflow-y-auto">
          {tabLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Sk key={i} className="h-8 w-full rounded-lg" />)}</div>
          ) : tabData.length === 0 ? (
            <p className="text-xs dark:text-gray-600 text-gray-400 text-center py-8">Chưa có dữ liệu.</p>
          ) : (
            <div className="space-y-1.5">
              {tabData.map((item, i) => (
                <div key={item.id ?? i}
                  className="flex items-center justify-between px-3 py-2 rounded-lg dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-100">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium dark:text-gray-200 text-gray-700 truncate">
                      {item.name ?? item.title ?? '—'}
                    </div>
                    {item.code && <div className="text-[10px] dark:text-gray-500 text-gray-400">{item.code}</div>}
                    {item.chapter && <div className="text-[10px] dark:text-gray-500 text-gray-400">Chương {item.chapter}</div>}
                    {item.dueDate && <div className="text-[10px] dark:text-gray-500 text-gray-400">Hạn: {formatDate(item.dueDate)}</div>}
                  </div>
                  {item.status && <Badge label={item.status} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LecturerSubjectPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLecturerSubjects({ search })
      setSubjects(r.data.data?.subjects ?? r.data.data ?? [])
    } catch { setSubjects([]) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Môn học"
        description="Các môn học được phân công"
        stats={[{ label: 'Tổng', value: subjects.length }]}
      />

      <div className="relative max-w-sm">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-gray-500 text-blue-300 pointer-events-none" />
        <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Tìm môn học..."
          className="w-full dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all" />
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 space-y-3">
              <Sk className="h-4 w-32" />
              <Sk className="h-3 w-full" />
              <div className="flex gap-2"><Sk className="h-5 w-12 rounded-full" /><Sk className="h-5 w-12 rounded-full" /></div>
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState icon={BookOpen} title="Chưa có môn học nào" sub="Liên hệ admin để được phân công môn học" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map(s => (
            <div key={s.id}
              onClick={() => setSelected(s.id)}
              className="group dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500/40 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden">

              {/* Soft glow */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blue-400/5 blur-2xl pointer-events-none group-hover:bg-blue-400/10 transition-all" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <BookOpen size={15} className="text-blue-400" />
                  </div>
                  <ChevronRight size={14} className="text-blue-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors mt-1" />
                </div>

                <div className="mb-1">
                  <span className="font-mono text-[10px] font-bold text-blue-400 dark:bg-blue-500/10 bg-blue-50 px-1.5 py-0.5 rounded border dark:border-blue-500/20 border-blue-200">
                    {s.code ?? 'N/A'}
                  </span>
                </div>
                <h3 className="text-sm font-bold dark:text-gray-200 text-gray-800 mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">{s.name}</h3>
                {s.description && (
                  <p className="text-[10px] dark:text-gray-500 text-gray-400 line-clamp-2 mb-3">{s.description}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {s.credits && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full dark:bg-violet-500/10 bg-violet-50 dark:text-violet-300 text-violet-600 dark:border-violet-500/20 border-violet-200 border">
                      {s.credits} TC
                    </span>
                  )}
                  {s.status && <Badge label={s.status} />}
                  {s._count?.classes !== undefined && (
                    <span className="text-[9px] dark:text-gray-500 text-gray-400 flex items-center gap-1">
                      <GraduationCap size={9} />{s._count.classes} lớp
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <SubjectDetailModal subjectId={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}