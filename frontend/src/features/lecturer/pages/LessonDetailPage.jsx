import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { ChevronLeft, FileText, Plus, Trash2, Link2, Play, FileSliders, BookOpen } from 'lucide-react'
import {
  getLessonById, getLessonMaterials, addLessonMaterial, deleteMaterial
} from '../../../services/lesson.api'
import {
  PageHeader, Badge, Sk, EmptyState, inputCls, labelCls, ErrorBanner, Modal, ModalHeader, ModalFooter
} from '../components/LecturerUI'
import ConfirmModal from '../../../components/common/ConfirmModal'

// Schema: LessonMaterial { fileName, fileUrl, fileType }
const EMPTY_MATERIAL = { fileName: '', fileUrl: '', fileType: 'DOCUMENT' }

const FILE_TYPE_LABELS = {
  DOCUMENT: 'Tài liệu (PDF, Word...)',
  SLIDES: 'Slide bài giảng (PowerPoint)',
  VIDEO: 'Video hướng dẫn',
  LINK: 'Liên kết ngoài (Github, Web...)',
}

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from)
    } else {
      navigate('/lecturer/lessons')
    }
  }
  
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Materials state — schema fields: fileName, fileUrl, fileType
  const [materials, setMaterials] = useState([])
  const [materialsLoading, setMaterialsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingMaterial, setAddingMaterial] = useState(false)
  const [materialError, setMaterialError] = useState('')
  const [materialForm, setMaterialForm] = useState(EMPTY_MATERIAL)

  const fetchLessonInfo = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLessonById(lessonId)
      setLesson(r.data.data)
    } catch {
      toast.error('Không thể tải thông tin bài học.')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  const fetchMaterials = useCallback(async () => {
    setMaterialsLoading(true)
    try {
      const r = await getLessonMaterials(lessonId)
      setMaterials(r.data.data ?? [])
    } catch {
      setMaterials([])
    } finally {
      setMaterialsLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLessonInfo()
    fetchMaterials()
  }, [fetchLessonInfo, fetchMaterials])

  const handleAddMaterial = async () => {
    if (!materialForm.fileName.trim()) { toast.error('Vui lòng nhập tên học liệu.'); return }
    if (!materialForm.fileUrl.trim()) { toast.error('Vui lòng nhập đường dẫn học liệu.'); return }
    setAddingMaterial(true)
    setMaterialError('')
    try {
      // Send correct schema fields: fileName, fileUrl, fileType
      await addLessonMaterial(lessonId, {
        fileName: materialForm.fileName,
        fileUrl: materialForm.fileUrl,
        fileType: materialForm.fileType,
      })
      toast.success('Thêm học liệu thành công!')
      setMaterialForm(EMPTY_MATERIAL)
      setShowAddModal(false)
      fetchMaterials()
    } catch (e) {
      setMaterialError(e.response?.data?.message ?? 'Thêm học liệu thất bại.')
    } finally {
      setAddingMaterial(false)
    }
  }

  const handleDeleteMaterial = (materialId, name) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xoá học liệu',
      message: `Bạn có chắc chắn muốn xoá học liệu "${name}"?`,
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, loading: true }))
        try {
          await deleteMaterial(lessonId, materialId)
          toast.success(`Đã xoá học liệu "${name}".`)
          fetchMaterials()
        } catch {
          toast.error('Xoá học liệu thất bại.')
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })
        }
      }
    })
  }

  const getMaterialIcon = (fileType) => {
    switch (fileType) {
      case 'VIDEO': return <Play size={14} className="text-rose-400" />
      case 'LINK': return <Link2 size={14} className="text-emerald-400" />
      case 'SLIDES': return <FileSliders size={14} className="text-orange-400" />
      default: return <FileText size={14} className="text-blue-400" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-2xl">
        <Sk className="h-6 w-48 mb-2" />
        <Sk className="h-4 w-96 mb-6" />
        <div className="grid lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <Sk className="h-48 rounded-xl" />
          </div>
          <div className="lg:col-span-4">
            <Sk className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Không tìm thấy bài học"
        sub="Bài học không tồn tại hoặc bạn không có quyền truy cập."
        action={
          <button onClick={() => navigate('/lecturer/lessons')} className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-all">
            Quay lại danh sách
          </button>
        }
      />
    )
  }

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Back button left of title */}
      <button onClick={handleBack}
        className="flex items-center gap-1.5 text-xs dark:text-gray-400 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-1">
        <ChevronLeft size={14} /> Quay lại
      </button>

      <PageHeader
        title={lesson.title}
        description={`Môn học: ${lesson.subject?.name ?? '—'} | Chương / Tuần: ${lesson.chapter ?? '—'}`}
      />

      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Lesson Detail */}
        <div className="lg:col-span-8 space-y-4">
          <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-3">
              <span className="text-xs font-bold dark:text-gray-200 text-gray-800">Nội dung chi tiết</span>
              <Badge label={lesson.status} />
            </div>

            {lesson.description && (
              <div className="text-xs dark:text-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-900/20 p-3 rounded-lg border dark:border-gray-800 border-gray-100 italic">
                {lesson.description}
              </div>
            )}

            <div className="text-xs dark:text-gray-250 text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
              {lesson.content || <span className="text-gray-450 dark:text-gray-500 italic">Chưa có nội dung chi tiết cho bài học này.</span>}
            </div>
          </div>
        </div>

        {/* Lesson Materials */}
        <div className="lg:col-span-4 space-y-4">
          <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b dark:border-gray-800 border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-400" />
                <h4 className="text-xs font-bold dark:text-gray-200 text-gray-800">Tài liệu học tập</h4>
              </div>
              <button
                onClick={() => { setShowAddModal(true); setMaterialError('') }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-[10px] font-bold rounded-lg hover:bg-blue-600 transition-all shadow-sm"
              >
                <Plus size={10} /> Thêm
              </button>
            </div>

            {materialsLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2].map(i => <Sk key={i} className="h-10 w-full rounded-lg" />)}
              </div>
            ) : materials.length === 0 ? (
              <p className="text-[11px] dark:text-gray-500 text-gray-400 text-center py-6">Chưa có học liệu đính kèm.</p>
            ) : (
              <div className="space-y-2">
                {materials.map(m => {
                  // Support both schema field names for backwards compat
                  const displayName = m.fileName ?? m.title ?? 'Học liệu'
                  const displayType = m.fileType ?? m.type ?? 'DOCUMENT'
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg dark:bg-[#0D1117] bg-gray-50 border dark:border-[#21262D] border-gray-200">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center flex-shrink-0">
                          {getMaterialIcon(displayType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-semibold dark:text-gray-300 text-gray-700 hover:text-blue-500 dark:hover:text-blue-400 hover:underline truncate block">
                            {displayName}
                          </a>
                          <span className="text-[8px] font-bold dark:text-gray-500 text-gray-400 uppercase tracking-wide">
                            {FILE_TYPE_LABELS[displayType] ?? displayType}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMaterial(m.id, displayName)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/5 transition-all ml-2 flex-shrink-0"
                        title="Xoá học liệu"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} size="md">
          <ModalHeader title="Thêm học liệu bài học" onClose={() => setShowAddModal(false)} />
          <div className="px-5 py-4 space-y-3">
            <ErrorBanner message={materialError} />
            <div>
              <label className={labelCls}>Tên học liệu *</label>
              <input
                className={inputCls}
                placeholder="VD: Slide bài giảng Chương 3, Source code mẫu..."
                value={materialForm.fileName}
                onChange={e => setMaterialForm(f => ({ ...f, fileName: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Đường dẫn học liệu (URL/File Link) *</label>
              <input
                className={inputCls}
                placeholder="https://drive.google.com/... hoặc link github..."
                value={materialForm.fileUrl}
                onChange={e => setMaterialForm(f => ({ ...f, fileUrl: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Loại học liệu</label>
              <select
                className={inputCls}
                value={materialForm.fileType}
                onChange={e => setMaterialForm(f => ({ ...f, fileType: e.target.value }))}
              >
                {Object.entries(FILE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <ModalFooter
            onClose={() => setShowAddModal(false)}
            onSave={handleAddMaterial}
            saving={addingMaterial}
            saveLabel="Thêm học liệu"
          />
        </Modal>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        loading={confirmModal.loading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, loading: false })}
      />
    </div>
  )
}
