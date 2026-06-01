import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, TrendingUp } from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { getStudentNotifications } from '../../../services/notification.api'

const PAGE_TITLES = {
  '/student':               'Dashboard',
  '/student/classes':       'Lớp của tôi',
  '/student/subjects':      'Môn học',
  '/student/lessons':       'Bài học',
  '/student/assignments':   'Bài tập',
  '/student/feedback':      'Phản hồi',
  '/student/progress':      'Tiến độ học tập',
  '/student/notifications': 'Thông báo',
}

const DAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function StudentHeader({ onMobileOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const now = useClock()
  const [dropOpen, setDropOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const dropRef = useRef(null)

  const title = PAGE_TITLES[location.pathname] ?? 'Student Portal'

  // Fetch unread notification count
  useEffect(() => {
    getStudentNotifications({ limit: 1 })
      .then(r => {
        const data = r.data?.data
        if (data?.unreadCount !== undefined) setUnreadCount(data.unreadCount)
      })
      .catch(() => {})
  }, [location.pathname])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setDropOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

  return (
    <header className="relative z-30 flex-shrink-0 h-14 flex items-center justify-between px-4
      dark:bg-[#0D1117]/90 bg-white/90 backdrop-blur-sm border-b dark:border-[#21262D] border-orange-100/60">
      
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button onClick={onMobileOpen}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center
            dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-orange-50 border dark:border-transparent border-orange-100 transition-all">
          <Menu size={16} />
        </button>

        {/* Logo on mobile */}
        <img src="/logo/logo.png" alt="AITA" className="h-7 w-7 object-contain md:hidden flex-shrink-0" />

        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[9px] dark:text-gray-500 text-orange-400 font-bold uppercase tracking-wider mb-0.5">
            <span className="hidden md:inline">Student Portal</span>
            <span className="hidden md:inline">/</span>
            <span className="dark:text-orange-400 text-orange-600">{title}</span>
          </div>
          {/* Page title */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold dark:text-white text-gray-900 leading-none">{title}</h1>
            <span className="hidden sm:inline text-[9px] dark:text-gray-600 text-gray-400">· {dateStr}</span>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Dynamic Clock for desktop */}
        <div className="hidden lg:flex flex-col items-end leading-none mr-1.5">
          <span className="text-xs font-bold dark:text-orange-400 text-orange-600 tabular-nums tracking-wide">{timeStr}</span>
          <span className="text-[9px] dark:text-gray-500 text-gray-400 mt-0.5">{dateStr}</span>
        </div>

        {/* Notifications */}
        <Link to="/student/notifications"
          className="relative w-8 h-8 rounded-xl flex items-center justify-center
            dark:text-gray-400 text-gray-500 dark:hover:bg-gray-800 hover:bg-orange-50
            border dark:border-transparent border-orange-100 transition-all duration-150">
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-500
              text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button onClick={() => setDropOpen(o => !o)}
            className="flex items-center gap-2 px-2 py-1 rounded-xl
              dark:hover:bg-gray-800 hover:bg-orange-50 transition-all duration-150">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
              bg-gradient-to-br from-orange-400 to-amber-400 shadow-sm">
              <span className="text-[11px] font-bold text-white">{user?.name?.[0]?.toUpperCase() ?? 'S'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-semibold dark:text-gray-200 text-gray-700 leading-none">
                {user?.name ?? 'Student'}
              </div>
              <div className="text-[9px] text-orange-400 leading-none mt-0.5">Sinh viên</div>
            </div>
            <ChevronDown size={12} className={`dark:text-gray-500 text-gray-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl shadow-xl z-50 overflow-hidden
              dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-100">
              <div className="px-3 py-2.5 border-b dark:border-[#21262D] border-gray-100">
                <div className="text-xs font-semibold dark:text-gray-200 text-gray-700 truncate">{user?.name}</div>
                <div className="text-[10px] dark:text-gray-500 text-gray-400 truncate">{user?.email}</div>
              </div>
              <div className="py-1">
                <Link to="/student/progress" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs dark:text-gray-400 text-gray-600
                    dark:hover:bg-gray-800 hover:bg-gray-50 transition-colors">
                  <TrendingUp size={13} />
                  Tiến độ học tập
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs w-full text-left
                    dark:text-rose-400 text-rose-500 dark:hover:bg-rose-500/5 hover:bg-rose-50 transition-colors">
                  <LogOut size={13} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}