import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Brain, BookOpen, FileSliders, Search, ArrowRight, History, Calendar, Award, Plus } from 'lucide-react'
import { getAIHistory, saveAILessonOutline, saveAIExerciseAsAssignment, saveAIQuiz } from '../../../services/ai.api'
import { getLecturerSubjects } from '../../../services/subject.api'
import { getLecturerClasses } from '../../../services/class.api'
import { getLessons } from '../../../services/lesson.api'
import { getCLOs } from '../../../services/clo.api'
import { Modal, ModalHeader, ModalFooter, Sk, EmptyState, Badge, inputCls, labelCls, ErrorBanner } from './LecturerUI'

export default function ImportAIModal({ isOpen, onClose, onImportSuccess, type }) {
  if (!isOpen) return null

  const [historyList, setHistoryList] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [lessons, setLessons] = useState([])
  const [clos, setClos] = useState([])
  
  // Selection/Input states for importing
  const [importForm, setImportForm] = useState({
    subjectId: '',
    classId: '',
    lessonId: '',
    cloId: '',
    chapter: '1',
    dueDate: '',
    totalScore: 10,
    quizTitle: '',
    quizDifficulty: 'MEDIUM'
  })
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  // Load history list & basic dropdown options
  useEffect(() => {
    setLoadingHistory(true)
    Promise.all([
      getAIHistory(),
      getLecturerSubjects(),
      getLecturerClasses()
    ]).then(([histRes, subRes, classRes]) => {
      const allHist = histRes.data.data ?? []
      
      // Client-side filter based on type
      let filtered = []
      if (type === 'LESSON') {
        filtered = allHist.filter(h => h.type === 'LESSON_OUTLINE' || h.type === 'SLIDE_OUTLINE')
      } else if (type === 'ASSIGNMENT') {
        filtered = allHist.filter(h => h.type === 'EXERCISE')
      } else if (type === 'QUIZ') {
        filtered = allHist.filter(h => h.type === 'QUIZ')
      }
      setHistoryList(filtered)
      
      setSubjects(subRes.data.data?.subjects ?? subRes.data.data ?? [])
      setClasses(classRes.data.data?.classes ?? classRes.data.data ?? [])
    }).catch(() => {
      toast.error('Không thể tải lịch sử AI.')
    }).finally(() => {
      setLoadingHistory(false)
    })
  }, [type])

  // Select item logic
  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setError('')
    let parsed = item.result
    if (typeof item.result === 'string') {
      try {
        parsed = JSON.parse(item.result)
      } catch {
        parsed = item.result
      }
    }
    setParsedData(parsed)

    // Reset import form fields based on selection
    setImportForm({
      subjectId: '',
      classId: '',
      lessonId: '',
      cloId: '',
      chapter: '1',
      dueDate: '',
      totalScore: parsed?.exercises?.[0]?.totalScore ?? 10,
      quizTitle: parsed?.quizTitle ?? (item.type === 'QUIZ' ? item.prompt?.slice(0, 40) : ''),
      quizDifficulty: parsed?.difficulty ?? 'MEDIUM'
    })
  }

  // Load related lessons/CLOs when subjectId changes
  useEffect(() => {
    if (!importForm.subjectId) {
      setLessons([])
      setClos([])
      return
    }
    getLessons({ subjectId: importForm.subjectId }).then(r => {
      setLessons(Array.isArray(r.data.data) ? r.data.data : r.data.data?.lessons ?? [])
    }).catch(() => {})

    getCLOs({ subjectId: importForm.subjectId }).then(r => {
      setClos(r.data.data ?? [])
    }).catch(() => {})
  }, [importForm.subjectId])

  // Call the save API
  const handleImport = async () => {
    if (!selectedItem) return
    if (!importForm.subjectId) { toast.error('Vui lòng chọn môn học.'); return }
    if (type === 'ASSIGNMENT' && !importForm.classId) { toast.error('Vui lòng chọn lớp học.'); return }

    setImporting(true)
    setError('')

    try {
      if (type === 'LESSON') {
        // Prepare formatted markdown content
        let formattedContent = ''
        if (selectedItem.type === 'LESSON_OUTLINE') {
          // parse section by section
          const sections = parsedData?.sections ?? []
          formattedContent += `NỘI DUNG CHI TIẾT BÀI GIẢNG:\n\n`
          sections.forEach((sec, idx) => {
            formattedContent += `${idx + 1}. ${sec.heading || 'Phần ' + (idx + 1)}\n`
            formattedContent += `   Tóm tắt: ${sec.summary || ''}\n`
            if (sec.keyPoints && Array.isArray(sec.keyPoints)) {
              formattedContent += `   Các điểm chính:\n`
              sec.keyPoints.forEach(kp => {
                formattedContent += `   - ${kp}\n`
              })
            }
            formattedContent += `\n`
          })
          if (parsedData?.keyConcepts) {
            formattedContent += `\nCÁC KHÁI NIỆM CỐT LÕI:\n`
            parsedData.keyConcepts.forEach(kc => {
              formattedContent += `- ${kc}\n`
            })
          }
        } else if (selectedItem.type === 'SLIDE_OUTLINE') {
          const slides = parsedData?.slides ?? []
          formattedContent += `SLIDES BÀI GIẢNG:\n\n`
          slides.forEach((sl, idx) => {
            formattedContent += `Slide ${sl.slideNumber || idx + 1}: ${sl.title}\n`
            if (sl.bulletPoints && Array.isArray(sl.bulletPoints)) {
              sl.bulletPoints.forEach(bp => {
                formattedContent += `- ${bp}\n`
              })
            }
            formattedContent += `\n`
          })
        }

        await saveAILessonOutline({
          aiGenerationId: selectedItem.id,
          title: parsedData?.title || selectedItem.prompt?.slice(0, 40) || 'Bài học AI',
          content: formattedContent,
          subjectId: importForm.subjectId,
          cloId: importForm.cloId || undefined,
          chapter: importForm.chapter
        })
        toast.success('Import giáo án thành công ở trạng thái Nháp!')
      } else if (type === 'ASSIGNMENT') {
        const exercise = parsedData?.exercises?.[0] ?? parsedData
        await saveAIExerciseAsAssignment({
          aiGenerationId: selectedItem.id,
          exercise: exercise,
          classId: importForm.classId,
          subjectId: importForm.subjectId,
          lessonId: importForm.lessonId || undefined,
          cloId: importForm.cloId || undefined,
          dueDate: importForm.dueDate || undefined,
          totalScore: importForm.totalScore
        })
        toast.success('Import bài tập thành công ở trạng thái Nháp!')
      } else if (type === 'QUIZ') {
        await saveAIQuiz({
          aiGenerationId: selectedItem.id,
          questions: parsedData?.questions ?? parsedData,
          subjectId: importForm.subjectId,
          lessonId: importForm.lessonId || undefined,
          title: importForm.quizTitle,
          difficulty: importForm.quizDifficulty
        })
        toast.success('Import Quiz thành công ở trạng thái Nháp!')
      }

      onImportSuccess?.()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message ?? 'Import từ AI thất bại.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <Modal onClose={onClose} size="xl">
      <ModalHeader title={`Import từ lịch sử AI - ${type === 'LESSON' ? 'Giáo án' : type === 'ASSIGNMENT' ? 'Bài tập' : 'Quiz'}`} onClose={onClose} />
      <div className="flex h-[68vh] overflow-hidden">
        {/* Left Side: List */}
        <div className="w-1/3 border-r dark:border-gray-800 border-gray-150 overflow-y-auto p-4 space-y-2.5">
          <h4 className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-500 text-gray-400 mb-2">Bản ghi AI cũ</h4>
          
          {loadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => <Sk key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : historyList.length === 0 ? (
            <p className="text-xs dark:text-gray-500 text-gray-400 text-center py-8">Chưa có lịch sử tạo AI cho loại này.</p>
          ) : (
            historyList.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                  selectedItem?.id === item.id
                    ? 'bg-blue-500/10 border-blue-500 dark:border-blue-400/50'
                    : 'dark:bg-[#161B22]/30 bg-white dark:border-gray-800 border-gray-200 dark:hover:bg-[#21262D]/30 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center gap-2 mb-1.5">
                  <span className="text-[9px] font-bold uppercase dark:text-blue-400 text-blue-500">
                    {item.type === 'LESSON_OUTLINE' ? 'Giáo án' : item.type === 'SLIDE_OUTLINE' ? 'Slides' : item.type === 'EXERCISE' ? 'Bài tập' : 'Quiz'}
                  </span>
                  <span className="text-[8px] dark:text-gray-500 text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <p className="text-xs dark:text-gray-300 text-gray-700 font-medium truncate mb-1" title={item.prompt}>
                  {item.prompt || 'Chủ đề trống'}
                </p>
                <p className="text-[10px] dark:text-gray-500 text-gray-450 line-clamp-1">
                  Mã: {item.id}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Preview & Select destinations */}
        <div className="w-2/3 flex flex-col h-full overflow-hidden bg-gray-50/50 dark:bg-[#0D1117]/20">
          {selectedItem ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Preview Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="border-b dark:border-gray-800 border-gray-150 pb-3">
                  <h4 className="text-xs font-bold dark:text-white text-gray-800">Preview nội dung</h4>
                  <p className="text-[10px] dark:text-gray-500 text-gray-450 mt-1">Prompt: "{selectedItem.prompt}"</p>
                </div>

                {/* LESSON_OUTLINE PREVIEW */}
                {selectedItem.type === 'LESSON_OUTLINE' && parsedData?.sections && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-sky-400">{parsedData.title}</h5>
                    {parsedData.sections.map((sec, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#161B22]/50 border dark:border-gray-800 border-gray-200 rounded-lg p-3 space-y-1">
                        <h6 className="text-xs font-bold dark:text-gray-200 text-gray-700">{idx + 1}. {sec.heading}</h6>
                        <p className="text-[11px] dark:text-gray-400 text-gray-500 leading-relaxed">{sec.summary}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* SLIDE_OUTLINE PREVIEW */}
                {selectedItem.type === 'SLIDE_OUTLINE' && parsedData?.slides && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-orange-400">Slide Outline</h5>
                    {parsedData.slides.map((sl, idx) => (
                      <div key={idx} className="bg-white dark:bg-[#161B22]/50 border dark:border-gray-800 border-gray-200 rounded-lg p-3">
                        <h6 className="text-[11px] font-bold dark:text-orange-400 text-orange-500 mb-1">Slide {sl.slideNumber || idx + 1}: {sl.title}</h6>
                        <ul className="list-disc pl-4 space-y-0.5 text-[10px] dark:text-gray-400 text-gray-500">
                          {Array.isArray(sl.bulletPoints) ? sl.bulletPoints.map((bp, bpi) => <li key={bpi}>{bp}</li>) : <li>{sl.bulletPoints}</li>}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXERCISE PREVIEW */}
                {selectedItem.type === 'EXERCISE' && (
                  <div className="space-y-3">
                    {/* Handle arrays or single exercise output */}
                    {(() => {
                      const exList = Array.isArray(parsedData?.exercises) ? parsedData.exercises : [parsedData?.exercise ?? parsedData]
                      return exList.map((ex, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#161B22]/50 border dark:border-gray-800 border-gray-200 rounded-lg p-4 space-y-2">
                          <h5 className="text-xs font-bold dark:text-white text-gray-800">{ex.title}</h5>
                          <p className="text-[11px] dark:text-gray-400 text-gray-500 leading-relaxed whitespace-pre-wrap">{ex.description}</p>
                          {ex.requirements && (
                            <div className="text-[10px] dark:text-gray-500 text-gray-400">
                              <strong>Yêu cầu:</strong>
                              <ul className="list-disc pl-4 mt-0.5">
                                {Array.isArray(ex.requirements) ? ex.requirements.map((r, ri) => <li key={ri}>{r}</li>) : <li>{ex.requirements}</li>}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                    })()}
                  </div>
                )}

                {/* QUIZ PREVIEW */}
                {selectedItem.type === 'QUIZ' && (
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-violet-400">Bộ câu hỏi trắc nghiệm ({parsedData?.questions?.length ?? 0} câu)</h5>
                    {(() => {
                      const questions = parsedData?.questions ?? parsedData ?? []
                      return Array.isArray(questions) ? questions.map((q, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#161B22]/50 border dark:border-gray-800 border-gray-200 rounded-lg p-3 space-y-1.5">
                          <h6 className="text-[11px] font-bold dark:text-gray-250 text-gray-700">Câu {idx + 1}: {q.questionText}</h6>
                          <div className="grid grid-cols-2 gap-1.5 pl-2 text-[10px] dark:text-gray-400 text-gray-500">
                            {q.options && q.options.map((opt, oi) => (
                              <span key={oi}>{String.fromCharCode(65 + oi)}. {opt}</span>
                            ))}
                          </div>
                          <p className="text-[9px] text-emerald-400 font-bold">Đáp án: {q.correctAnswer}</p>
                        </div>
                      )) : null
                    })()}
                  </div>
                )}
              </div>

              {/* Destination configuration and Action Form */}
              <div className="border-t dark:border-gray-800 border-gray-150 p-5 bg-white dark:bg-[#161B22]/60 space-y-3">
                <ErrorBanner message={error} />
                <h4 className="text-[10px] font-bold uppercase tracking-wider dark:text-gray-400 text-gray-650">Cấu hình đích đến</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Môn học *</label>
                    <select
                      className={inputCls}
                      value={importForm.subjectId}
                      onChange={e => setImportForm(f => ({ ...f, subjectId: e.target.value, lessonId: '', cloId: '' }))}
                    >
                      <option value="">Chọn môn học</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                  </div>

                  {type === 'ASSIGNMENT' && (
                    <div>
                      <label className={labelCls}>Lớp học *</label>
                      <select
                        className={inputCls}
                        value={importForm.classId}
                        onChange={e => setImportForm(f => ({ ...f, classId: e.target.value }))}
                      >
                        <option value="">Chọn lớp học</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  )}

                  {type === 'LESSON' && (
                    <div>
                      <label className={labelCls}>Chương / Tuần</label>
                      <input
                        type="number"
                        min="1"
                        className={inputCls}
                        value={importForm.chapter}
                        onChange={e => setImportForm(f => ({ ...f, chapter: e.target.value }))}
                      />
                    </div>
                  )}

                  {(type === 'ASSIGNMENT' || type === 'QUIZ') && (
                    <div>
                      <label className={labelCls}>Bài học liên kết</label>
                      <select
                        className={inputCls}
                        value={importForm.lessonId}
                        onChange={e => setImportForm(f => ({ ...f, lessonId: e.target.value }))}
                      >
                        <option value="">Không liên kết</option>
                        {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                      </select>
                    </div>
                  )}

                  {type !== 'QUIZ' && (
                    <div>
                      <label className={labelCls}>CLO liên kết</label>
                      <select
                        className={inputCls}
                        value={importForm.cloId}
                        onChange={e => setImportForm(f => ({ ...f, cloId: e.target.value }))}
                      >
                        <option value="">Không liên kết</option>
                        {clos.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                      </select>
                    </div>
                  )}

                  {type === 'ASSIGNMENT' && (
                    <>
                      <div>
                        <label className={labelCls}>Điểm tối đa</label>
                        <input
                          type="number"
                          className={inputCls}
                          value={importForm.totalScore}
                          onChange={e => setImportForm(f => ({ ...f, totalScore: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Hạn nộp</label>
                        <input
                          type="datetime-local"
                          className={inputCls}
                          value={importForm.dueDate}
                          onChange={e => setImportForm(f => ({ ...f, dueDate: e.target.value }))}
                        />
                      </div>
                    </>
                  )}

                  {type === 'QUIZ' && (
                    <>
                      <div>
                        <label className={labelCls}>Tiêu đề Quiz</label>
                        <input
                          className={inputCls}
                          value={importForm.quizTitle}
                          onChange={e => setImportForm(f => ({ ...f, quizTitle: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Độ khó Quiz</label>
                        <select
                          className={inputCls}
                          value={importForm.quizDifficulty}
                          onChange={e => setImportForm(f => ({ ...f, quizDifficulty: e.target.value }))}
                        >
                          <option value="EASY">Dễ</option>
                          <option value="MEDIUM">Trung bình</option>
                          <option value="HARD">Khó</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 text-xs font-semibold dark:text-gray-400 text-gray-500 border dark:border-gray-700 border-gray-200 rounded-lg dark:hover:bg-gray-800 hover:bg-gray-50 transition-all"
                  >
                    Huỷ
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-all shadow-sm"
                  >
                    {importing ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={13} />}
                    Xác nhận Import (DRAFT)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center">
              <History size={32} className="text-gray-300 mb-2" />
              <h5 className="text-xs font-bold dark:text-gray-400 text-gray-650">Chưa chọn bản ghi</h5>
              <p className="text-[11px] dark:text-gray-500 text-gray-400 mt-1">Chọn một bản ghi AI ở danh sách bên trái để xem Preview và thiết lập import.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
