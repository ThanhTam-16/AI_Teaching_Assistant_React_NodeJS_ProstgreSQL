import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'

const BREADCRUMB_MAP = {
  '/admin':             'Dashboard',
  '/admin/users':       'Tất cả người dùng',
  '/admin/lecturers':   'Giảng viên',
  '/admin/students':    'Sinh viên',
  '/admin/subjects':    'Môn học',
  '/admin/ai-settings': 'Cài đặt AI',
  '/admin/settings':    'Cài đặt hệ thống',
}

const PAGE_SUB = {
  '/admin':             'Tổng quan hệ thống',
  '/admin/users':       'Quản lý tài khoản',
  '/admin/lecturers':   'Danh sách giảng viên',
  '/admin/students':    'Danh sách sinh viên',
  '/admin/subjects':    'Danh sách môn học',
  '/admin/ai-settings': 'Bật / tắt module AI',
  '/admin/settings':    'Cấu hình hệ thống',
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

const DAYS_VI = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']
const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']

export default function AdminHeader({ onMobileMenuOpen }) {
  const location = useLocation()
  const now = useClock()

  const pageTitle = BREADCRUMB_MAP[location.pathname] ?? 'Admin'
  const pageSub   = PAGE_SUB[location.pathname] ?? ''

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dayStr  = DAYS_VI[now.getDay()]
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

  return (
    <header className="
      h-12 flex items-center justify-between px-4 flex-shrink-0
      dark:bg-gray-950/80 bg-white/80 backdrop-blur-sm
      border-b dark:border-gray-800/60 border-gray-200/60
    ">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center dark:text-gray-200 text-slate-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-slate-900 transition-all"
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb + title */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] dark:text-gray-600 text-gray-400 mb-0.5">
            <span>Admin</span>
            <span>/</span>
            <span className="dark:text-gray-400 text-gray-500">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold dark:text-white text-gray-900 leading-none">{pageTitle}</h1>
            {pageSub && (
              <span className="hidden sm:inline text-[10px] dark:text-gray-600 text-gray-400">· {pageSub}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: clock + bell */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="text-sm font-bold dark:text-gray-200 text-gray-700 tabular-nums tracking-wide">
            {timeStr}
          </span>
          <span className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">
            {dayStr}, {dateStr}
          </span>
        </div>

        {/* Mobile clock - compact */}
        <div className="sm:hidden flex items-center gap-1">
          <span className="text-xs font-bold dark:text-gray-200 text-gray-700 tabular-nums">
            {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Notification */}
        <button className="relative w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all">
          <Bell size={14} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
        </button>
      </div>
    </header>
  )
}