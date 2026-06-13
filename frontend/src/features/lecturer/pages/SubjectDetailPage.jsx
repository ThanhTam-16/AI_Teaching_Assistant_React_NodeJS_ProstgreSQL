import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, BookOpen, GraduationCap, FileText, ClipboardList, Eye } from 'lucide-react'
import {
  getLecturerSubjectById, getSubjectClasses, getSubjectLessons, getSubjectAssignments
} from '../../../services/subject.api'
import {
  PageHeader, TableShell, Tr, Td, Badge, Sk, EmptyState
} from '../components/LecturerUI'

export default function SubjectDetailPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/subjects')
    }
  }
  
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('classes')
  const [tabLoading, setTabLoading] = useState(false)
  
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])

  const fetchSubjectInfo = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLecturerSubjectById(subjectId)
      setSubject(r.data.data)
    } catch {
      toast.error('Không thể tải thông tin môn học.')
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  const loadTabData = useCallback(async (tab) => {
    setTabLoading(true)
    try {
      if (tab === 'classes') {
        const r = await getSubjectClasses(subjectId)
        setClasses(r.data.data ?? [])
      } else if (tab === 'lessons') {
        const r = await getSubjectLessons(subjectId)
        setLessons(r.data.data ?? [])
      } else if (tab === 'assignments') {
        const r = await getSubjectAssignments(subjectId)
        setAssignments(r.data.data ?? [])
      }
    } catch {
      // ignore
    } finally {
      setTabLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchSubjectInfo()
  }, [fetchSubjectInfo])

  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab, loadTabData])

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map(i => <Sk key={i} className="h-20 rounded-xl" />)}
        </div>
        <Sk className="h-[40vh] rounded-xl" />
      </div>
    )
  }

  if (!subject) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Không tìm thấy môn học"
        sub="Môn học không tồn tại hoặc bạn không có quyền truy cập."
        action={
          <button onClick={() => navigate('/lecturer/subjects')} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại danh sách
          </button>
        }
      />
    )
  }

  const tabData = activeTab === 'classes' ? classes : activeTab === 'lessons' ? lessons : assignments

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại
      </button>

      <PageHeader
        title={subject.name}
        description={`Mã môn học: ${subject.code} | Số tín chỉ: ${subject.credits ?? '—'}`}
      />

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Mã môn', value: subject.code },
          { label: 'Số tín chỉ', value: `${subject.credits ?? 0} tín chỉ` },
          { label: 'Trạng thái', value: <Badge label={subject.status} /> },
        ].map((item, idx) => (
          <div key={idx} className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-blue-300 mb-1">{item.label}</div>
            <div className="text-xs font-bold dark:text-gray-200 text-gray-800">{item.value}</div>
          </div>
        ))}
      </div>

      {subject.description && (
        <div className="dark:bg-[#161B22]/40 bg-gray-50/50 border dark:border-[#21262D] border-gray-200 rounded-xl p-4 text-xs dark:text-gray-300 text-gray-600 leading-relaxed">
          <strong className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1.5">Mô tả môn học:</strong>
          {subject.description}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-[#21262D] border-gray-200 pb-px">
        {[
          { id: 'classes', label: 'Lớp học', icon: GraduationCap, count: classes.length },
          { id: 'lessons', label: 'Bài học', icon: FileText, count: lessons.length },
          { id: 'assignments', label: 'Bài tập', icon: ClipboardList, count: assignments.length },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-blue-500 text-blue-500 dark:text-blue-400'
                : 'border-transparent dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-gray-700'
            }`}
          >
            <t.icon size={13} />
            {t.label}
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
              activeTab === t.id
                ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 dark:text-gray-500 text-gray-500'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Data Table */}
      <div>
        {tabLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : tabData.length === 0 ? (
          <EmptyState
            title={`Chưa có ${activeTab === 'classes' ? 'lớp học' : activeTab === 'lessons' ? 'bài học' : 'bài tập'} nào`}
            sub="Dữ liệu liên quan sẽ hiển thị ở đây."
          />
        ) : (
          <TableShell
            headers={
              activeTab === 'classes'
                ? ['Tên lớp học', 'Học kỳ', 'Năm học', 'Sĩ số', 'Trạng thái', '']
                : activeTab === 'lessons'
                ? ['Tiêu đề bài học', 'Chương / Tuần', 'Trạng thái', 'Ngày tạo', '']
                : ['Tiêu đề bài tập', 'Hạn nộp', 'Điểm tối đa', 'Độ khó', 'Trạng thái', '']
            }
          >
            {activeTab === 'classes' && classes.map(c => (
              <Tr key={c.id} onClick={() => navigate(`/lecturer/classes/${c.id}`, { state: { from: location.pathname } })}>
                <Td>
                  <span className="text-xs font-semibold dark:text-gray-200 text-gray-800 hover:text-blue-500 cursor-pointer">{c.name}</span>
                </Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.semester ?? '—'}</span></Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.academicYear ?? '—'}</span></Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{c.studentCount ?? c.maxStudents ?? 0}</span></Td>
                <Td><Badge label={c.status} /></Td>
                <Td>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/lecturer/classes/${c.id}`, { state: { from: location.pathname } }) }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition-all">
                    <Eye size={10} /> Chi tiết
                  </button>
                </Td>
              </Tr>
            ))}

            {activeTab === 'lessons' && lessons.map(l => (
              <Tr key={l.id} onClick={() => navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } })}>
                <Td>
                  <span className="text-xs font-semibold dark:text-gray-200 text-gray-800 hover:text-blue-500 cursor-pointer">{l.title}</span>
                </Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">Chương {l.chapter ?? '—'}</span></Td>
                <Td><Badge label={l.status} /></Td>
                <Td><span className="text-xs dark:text-gray-500 text-gray-400">{new Date(l.createdAt).toLocaleDateString('vi-VN')}</span></Td>
                <Td>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/lecturer/lessons/${l.id}`, { state: { from: location.pathname } }) }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition-all">
                    <Eye size={10} /> Chi tiết
                  </button>
                </Td>
              </Tr>
            ))}

            {activeTab === 'assignments' && assignments.map(a => (
              <Tr key={a.id} onClick={() => navigate(`/lecturer/assignments/${a.id}`, { state: { from: location.pathname } })}>
                <Td>
                  <span className="text-xs font-semibold dark:text-gray-200 text-gray-800 hover:text-blue-500 cursor-pointer">{a.title}</span>
                </Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.dueDate ? new Date(a.dueDate).toLocaleDateString('vi-VN') : '—'}</span></Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.totalScore ?? 100}</span></Td>
                <Td><span className="text-xs dark:text-gray-400 text-gray-500">{a.difficulty}</span></Td>
                <Td><Badge label={a.status} /></Td>
                <Td>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/lecturer/assignments/${a.id}`, { state: { from: location.pathname } }) }}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition-all">
                    <Eye size={10} /> Chi tiết
                  </button>
                </Td>
              </Tr>
            ))}
          </TableShell>
        )}
      </div>
    </div>
  )
}
