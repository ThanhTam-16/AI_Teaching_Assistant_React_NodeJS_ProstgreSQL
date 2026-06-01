import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileText, ChevronDown, ChevronRight, ExternalLink,
  Link as LinkIcon, BookOpen, Paperclip, ClipboardList,
} from 'lucide-react'
import { getStudentLessons, getStudentLessonById, getStudentLessonMaterials } from '../../../services/lesson.api'
import { formatDate } from '../../../utils/formatDate'
import {
  SkeletonList, EmptyLearningState, ErrorState,
  SectionHeader, SearchInput,
} from '../components/StudentUI'
import { CARD_BASE, CARD_HOVER, getSubjectColor } from '../studentTokens'

// ── Material item ──────────────────────────────────────────────────────────────
function MaterialItem({ material }) {
  const isLink = material.type === 'LINK' || material.url?.startsWith('http')
  return (
    <a
      href={material.url ?? '#'}
      target={isLink ? '_blank' : undefined}
      rel="noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs
        dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-100
        dark:text-gray-300 text-gray-600 hover:text-orange-600 dark:hover:text-orange-400
        hover:border-orange-200 dark:hover:border-orange-500/30 transition-all group"
    >
      {isLink
        ? <LinkIcon size={12} className="text-sky-400 flex-shrink-0" />
        : <Paperclip size={12} className="text-orange-400 flex-shrink-0" />}
      <span className="flex-1 truncate">{material.title ?? material.url}</span>
      {isLink && <ExternalLink size={11} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </a>
  )
}

// ── Lesson card ───────────────────────────────────────────────────────────────
function LessonCard({ lesson, colorIdx, expanded, onToggle }) {
  const color  = getSubjectColor(colorIdx)
  const [materials, setMaterials] = useState(lesson.materials ?? null)
  const [loadingMat, setLoadingMat] = useState(false)

  const handleExpand = async () => {
    onToggle()
    if (!expanded && materials === null) {
      setLoadingMat(true)
      try {
        const res = await getStudentLessonMaterials(lesson.id)
        const raw = res.data?.data
        setMaterials(Array.isArray(raw) ? raw : raw?.materials ?? [])
      } catch { setMaterials([]) }
      finally { setLoadingMat(false) }
    }
  }

  return (
    <div className={`${CARD_BASE} overflow-hidden transition-all duration-200`}>
      {/* Header row */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-orange-50/50 dark:hover:bg-white/5 transition-colors"
      >
        {/* Order number */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
          ${color.bg} border ${color.border}`}>
          <span className={`text-xs font-bold ${color.text}`}>{lesson.order ?? '?'}</span>
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h3 className="text-sm font-semibold dark:text-white text-gray-900 line-clamp-1 leading-tight">
            {lesson.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {lesson.subject?.name && (
              <span className={`text-[10px] font-medium ${color.text}`}>{lesson.subject.name}</span>
            )}
            {lesson.createdAt && (
              <span className="text-[10px] dark:text-gray-600 text-gray-400">{formatDate(lesson.createdAt)}</span>
            )}
            {lesson._count?.materials > 0 && (
              <span className="text-[10px] dark:text-gray-500 text-gray-400 flex items-center gap-0.5">
                <Paperclip size={9} /> {lesson._count.materials} tài liệu
              </span>
            )}
          </div>
        </div>

        <ChevronDown size={14} className={`flex-shrink-0 dark:text-gray-500 text-gray-400
          transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t dark:border-[#21262D] border-gray-100">
          {/* Description */}
          {lesson.description && (
            <div className="pt-3">
              <div className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5">
                Nội dung
              </div>
              <p className="text-xs dark:text-gray-300 text-gray-600 leading-relaxed whitespace-pre-line">
                {lesson.description}
              </p>
            </div>
          )}

          {/* Materials */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1.5 flex items-center gap-1">
              <Paperclip size={10} /> Tài liệu đính kèm
            </div>
            {loadingMat ? (
              <div className="h-8 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ) : materials?.length > 0 ? (
              <div className="space-y-1.5">
                {materials.map(m => <MaterialItem key={m.id} material={m} />)}
              </div>
            ) : (
              <p className="text-[11px] dark:text-gray-600 text-gray-400">Không có tài liệu đính kèm</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LessonsPage() {
  const [params]          = useSearchParams()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const subjectId = params.get('subjectId')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentLessons(subjectId ? { subjectId } : {})
      const raw = res.data?.data
      setLessons(Array.isArray(raw) ? raw : raw?.lessons ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải danh sách bài học')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [subjectId])

  // Group by subject
  const grouped = lessons.reduce((acc, l) => {
    const key = l.subject?.id ?? 'other'
    const name = l.subject?.name ?? 'Bài học'
    if (!acc[key]) acc[key] = { name, items: [] }
    acc[key].items.push(l)
    return acc
  }, {})

  const filtered = Object.entries(grouped).reduce((acc, [key, group]) => {
    const items = group.items.filter(l =>
      !search || l.title?.toLowerCase().includes(search.toLowerCase())
    )
    if (items.length > 0) acc[key] = { ...group, items }
    return acc
  }, {})

  return (
    <div className="pb-6">
      <SectionHeader
        title="Bài học"
        desc={`${lessons.length} bài học`}
        icon={FileText}
        actions={
          <div className="w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm bài học..." />
          </div>
        }
      />

      {loading ? <SkeletonList count={5} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && Object.keys(filtered).length === 0 ? (
        <EmptyLearningState
          icon={FileText}
          title="Chưa có bài học"
          desc="Giảng viên chưa xuất bản bài học nào. Kiểm tra lại sau bạn nhé."
        />
      ) : null}

      {!loading && !error && Object.keys(filtered).length > 0 && (
        <div className="space-y-6">
          {Object.entries(filtered).map(([key, group], groupIdx) => (
            <div key={key}>
              {/* Subject group header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${getSubjectColor(groupIdx).dot}`} />
                <span className="text-xs font-bold dark:text-gray-300 text-gray-700">{group.name}</span>
                <span className="text-[10px] dark:text-gray-600 text-gray-400">({group.items.length} bài)</span>
              </div>
              <div className="space-y-2 pl-4 border-l-2 dark:border-[#21262D] border-orange-100">
                {group.items.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    colorIdx={groupIdx}
                    expanded={expandedId === lesson.id}
                    onToggle={() => setExpandedId(id => id === lesson.id ? null : lesson.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}