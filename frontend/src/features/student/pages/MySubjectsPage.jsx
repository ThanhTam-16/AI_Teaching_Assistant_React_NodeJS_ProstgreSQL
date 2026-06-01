import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, ClipboardList, Target, ArrowRight } from 'lucide-react'
import { getStudentSubjects } from '../../../services/subject.api'
import {
  SkeletonGrid, EmptyLearningState, ErrorState,
  SectionHeader, SearchInput,
} from '../components/StudentUI'
import { CARD_BASE, CARD_HOVER, getSubjectColor } from '../studentTokens'

function SubjectCard({ subject, colorIdx }) {
  const color = getSubjectColor(colorIdx)
  const lessonCount  = subject._count?.lessons ?? subject.lessons?.length ?? 0
  const assignCount  = subject._count?.assignments ?? 0
  const cloCount     = subject._count?.clos ?? 0

  return (
    <div className={`${CARD_BASE} ${CARD_HOVER} p-4 flex flex-col gap-3 group`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
          ${color.bg} border ${color.border}`}>
          <BookOpen size={18} className={color.text} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold dark:text-white text-gray-900
            group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors
            line-clamp-2 leading-tight">
            {subject.name}
          </h3>
          {subject.code && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${color.bg} ${color.text}`}>
              {subject.code}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {subject.description && (
        <p className="text-[11px] dark:text-gray-500 text-gray-400 line-clamp-2 leading-relaxed">
          {subject.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        {lessonCount > 0 && (
          <div className="flex items-center gap-1">
            <FileText size={11} className="text-sky-400" />
            <span className="text-[10px] dark:text-gray-400 text-gray-500">{lessonCount} bài học</span>
          </div>
        )}
        {assignCount > 0 && (
          <div className="flex items-center gap-1">
            <ClipboardList size={11} className="text-orange-400" />
            <span className="text-[10px] dark:text-gray-400 text-gray-500">{assignCount} bài tập</span>
          </div>
        )}
        {cloCount > 0 && (
          <div className="flex items-center gap-1">
            <Target size={11} className="text-violet-400" />
            <span className="text-[10px] dark:text-gray-400 text-gray-500">{cloCount} CLO</span>
          </div>
        )}
      </div>

      {/* CLOs preview */}
      {subject.clos?.length > 0 && (
        <div className="space-y-1 pt-2 border-t dark:border-[#21262D] border-gray-100">
          <div className="text-[9px] font-bold uppercase tracking-wide dark:text-gray-600 text-gray-400">CLO</div>
          {subject.clos.slice(0, 2).map(clo => (
            <div key={clo.id} className="flex items-start gap-1.5">
              <span className={`mt-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center
                flex-shrink-0 ${color.bg} border ${color.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
              </span>
              <span className="text-[10px] dark:text-gray-400 text-gray-500 line-clamp-1">{clo.description}</span>
            </div>
          ))}
          {subject.clos.length > 2 && (
            <div className="text-[10px] text-orange-400">+{subject.clos.length - 2} CLO khác</div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-2 border-t dark:border-[#21262D] border-gray-100 mt-auto">
        <Link to={`/student/lessons?subjectId=${subject.id}`}
          className={`flex items-center gap-1 text-[10px] font-medium ${color.text} hover:opacity-80 transition-opacity`}>
          <FileText size={10} /> Bài học <ArrowRight size={9} />
        </Link>
        <span className="w-px h-3 dark:bg-gray-700 bg-gray-200" />
        <Link to={`/student/assignments?subjectId=${subject.id}`}
          className="flex items-center gap-1 text-[10px] font-medium text-orange-500 hover:text-orange-600 transition-colors">
          <ClipboardList size={10} /> Bài tập <ArrowRight size={9} />
        </Link>
      </div>
    </div>
  )
}

export default function MySubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentSubjects()
      const raw = res.data?.data
      setSubjects(Array.isArray(raw) ? raw : raw?.subjects ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải danh sách môn học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = subjects.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pb-6">
      <SectionHeader
        title="Môn học"
        desc={`${subjects.length} môn đang học`}
        icon={BookOpen}
        actions={
          <div className="w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm môn học..." />
          </div>
        }
      />

      {loading ? <SkeletonGrid count={6} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyLearningState
          icon={BookOpen}
          title="Chưa có môn học"
          desc="Bạn chưa được gán vào môn học nào trong lớp đang học."
        />
      ) : null}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <SubjectCard key={s.id} subject={s} colorIdx={i} />
          ))}
        </div>
      ) : null}
    </div>
  )
}