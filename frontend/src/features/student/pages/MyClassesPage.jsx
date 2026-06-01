import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, User, BookOpen, ArrowRight, Users } from 'lucide-react'
import { getStudentClasses } from '../../../services/class.api'
import { formatDate } from '../../../utils/formatDate'
import {
  SkeletonGrid, EmptyLearningState, ErrorState,
  SectionHeader, SearchInput,
} from '../components/StudentUI'
import { CARD_BASE, CARD_HOVER, SUBJECT_COLORS, getSubjectColor } from '../studentTokens'

function ClassCard({ cls, colorIdx }) {
  const color = getSubjectColor(colorIdx)
  const lecturer = cls.lecturer ?? cls.class?.lecturer
  const subjectCount = cls.subjects?.length ?? cls._count?.classSubjects ?? 0

  return (
    <Link to={`/student/subjects?classId=${cls.id}`}
      className={`${CARD_BASE} ${CARD_HOVER} p-4 flex flex-col gap-3 group cursor-pointer`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          ${color.bg} border ${color.border}`}>
          <GraduationCap size={18} className={color.text} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg
          ${color.bg} ${color.text} border ${color.border}`}>
          {cls.status === 'ACTIVE' ? 'Đang học' : cls.status === 'COMPLETED' ? 'Đã kết thúc' : cls.status ?? 'Hoạt động'}
        </span>
      </div>

      {/* Name */}
      <div>
        <h3 className="text-sm font-bold dark:text-white text-gray-900
          group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight">
          {cls.name}
        </h3>
        {cls.code && (
          <span className="text-[10px] dark:text-gray-500 text-gray-400">{cls.code}</span>
        )}
      </div>

      {/* Meta */}
      <div className="space-y-1.5">
        {lecturer && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/20
              flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-orange-500">
                {lecturer.name?.[0]?.toUpperCase() ?? 'L'}
              </span>
            </div>
            <span className="text-[11px] dark:text-gray-400 text-gray-500 truncate">{lecturer.name}</span>
          </div>
        )}
        {subjectCount > 0 && (
          <div className="flex items-center gap-1.5">
            <BookOpen size={11} className="text-sky-400 flex-shrink-0" />
            <span className="text-[11px] dark:text-gray-400 text-gray-500">{subjectCount} môn học</span>
          </div>
        )}
        {(cls.startDate || cls.endDate) && (
          <div className="flex items-center gap-1.5">
            <Users size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-[11px] dark:text-gray-400 text-gray-500">
              {cls.startDate ? formatDate(cls.startDate) : '?'} — {cls.endDate ? formatDate(cls.endDate) : '?'}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center gap-1 text-[10px] font-medium mt-auto pt-2 border-t
        dark:border-[#21262D] border-gray-100 ${color.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
        Xem môn học <ArrowRight size={10} />
      </div>
    </Link>
  )
}

export default function MyClassesPage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentClasses()
      const raw = res.data?.data
      setClasses(Array.isArray(raw) ? raw : raw?.classes ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải danh sách lớp')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = classes.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pb-6">
      <SectionHeader
        title="Lớp của tôi"
        desc={`${classes.length} lớp đang tham gia`}
        icon={GraduationCap}
        actions={
          <div className="w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Tìm lớp học..." />
          </div>
        }
      />

      {loading ? <SkeletonGrid count={6} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && filtered.length === 0 ? (
        <EmptyLearningState
          icon={GraduationCap}
          title="Chưa có lớp học"
          desc="Bạn chưa được thêm vào lớp học nào. Liên hệ giảng viên để được thêm vào lớp."
        />
      ) : null}
      {!loading && !error && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls, i) => (
            <ClassCard key={cls.id} cls={cls} colorIdx={i} />
          ))}
        </div>
      ) : null}
    </div>
  )
}