import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'

const MAP = {
  '/lecturer':              ['Dashboard', 'Tổng quan giảng dạy'],
  '/lecturer/classes':      ['Lớp học', 'Quản lý lớp học'],
  '/lecturer/subjects':     ['Môn học', 'Môn được phân công'],
  '/lecturer/clos':         ['CLO', 'Chuẩn đầu ra học phần'],
  '/lecturer/lessons':      ['Bài học', 'Quản lý bài giảng'],
  '/lecturer/assignments':  ['Bài tập', 'Quản lý bài tập'],
  '/lecturer/submissions':  ['Bài nộp', 'Xem & chấm điểm'],
  '/lecturer/ai/exercises': ['AI Bài tập', 'Tạo bài tập bằng AI'],
  '/lecturer/ai/quizzes':   ['AI Quiz', 'Tạo câu hỏi trắc nghiệm'],
  '/lecturer/ai/feedback':  ['AI Feedback', 'Gợi ý phản hồi'],
  '/lecturer/ai/slides':    ['AI Slide', 'Tạo outline bài giảng'],
  '/lecturer/reports':      ['Báo cáo', 'Thống kê học tập'],
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

const DAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

export default function LecturerHeader({ onMobileOpen }) {
  const location = useLocation()
  const now = useClock()

  // Match grading page too
  const key = Object.keys(MAP).find(k => location.pathname.startsWith(k) && k !== '/lecturer')
    ?? (location.pathname === '/lecturer' ? '/lecturer' : null)
  const [title, sub] = MAP[key] ?? ['Lecturer', '']

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`

  return (
    <header className="h-12 flex items-center justify-between px-4 flex-shrink-0 dark:bg-[#0D1117]/80 bg-white/80 backdrop-blur-sm border-b dark:border-[#21262D] border-blue-100/60">
      <div className="flex items-center gap-3">
        <button onClick={onMobileOpen} className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center dark:text-gray-200 text-slate-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-slate-900 transition-all">
          <Menu size={18} />
        </button>
        <div>
          <div className="flex items-center gap-1.5 text-[10px] dark:text-gray-600 text-blue-300 mb-0.5">
            <span>Lecturer</span><span>/</span>
            <span className="dark:text-gray-400 text-blue-500">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold dark:text-white text-gray-900 leading-none">{title}</h1>
            {sub && <span className="hidden sm:inline text-[10px] dark:text-gray-600 text-blue-300">· {sub}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="text-sm font-bold dark:text-blue-300 text-blue-600 tabular-nums tracking-wide">{timeStr}</span>
          <span className="text-[10px] dark:text-gray-500 text-blue-300 mt-0.5">{dateStr}</span>
        </div>
        <button className="relative w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-400 text-blue-400 dark:hover:bg-gray-800 hover:bg-blue-50 transition-all">
          <Bell size={14} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
        </button>
      </div>
    </header>
  )
}