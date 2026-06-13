import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, Check } from 'lucide-react'
import {
  getLecturerNotifications,
  markLecturerNotificationRead,
  markAllLecturerNotificationsRead
} from '../../../services/notification.api'

const MAP = {
  '/lecturer': ['Dashboard', 'Tổng quan giảng dạy'],
  '/lecturer/classes': ['Lớp học', 'Quản lý lớp học'],
  '/lecturer/subjects': ['Môn học', 'Môn được phân công'],
  '/lecturer/clos': ['CLO', 'Chuẩn đầu ra học phần'],
  '/lecturer/lessons': ['Bài học', 'Quản lý bài giảng'],
  '/lecturer/assignments': ['Bài tập', 'Quản lý bài tập'],
  '/lecturer/submissions': ['Bài nộp', 'Xem & chấm điểm'],
  '/lecturer/ai/exercises': ['AI Bài tập', 'Tạo bài tập bằng AI'],
  '/lecturer/ai/quizzes': ['AI Quiz', 'Tạo câu hỏi trắc nghiệm'],
  '/lecturer/ai/feedback': ['AI Feedback', 'Gợi ý phản hồi'],
  '/lecturer/ai/slides': ['AI Slide', 'Tạo outline bài giảng'],
  '/lecturer/reports': ['Báo cáo', 'Thống kê học tập'],
}

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
  return now
}

const DAYS = ['CN', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7']

export default function LecturerHeader({ onMobileOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const now = useClock()

  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  const key = Object.keys(MAP).find(k => location.pathname.startsWith(k) && k !== '/lecturer')
    ?? (location.pathname === '/lecturer' ? '/lecturer' : null)
  const [title, sub] = MAP[key] ?? ['Lecturer', '']

  const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = `${DAYS[now.getDay()]}, ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await getLecturerNotifications({ limit: 20 })
      const list = res.data?.data?.notifications || res.data?.data?.items || []
      setNotifications(list)
      const unread = list.filter(n => !n.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    // Poll notifications every 60s
    const timer = setInterval(fetchNotifications, 60000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notif) => {
    setIsOpen(false)
    if (!notif.isRead) {
      try {
        await markLecturerNotificationRead(notif.id)
        // Update local state
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
    if (notif.relatedUrl) {
      navigate(notif.relatedUrl)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllLecturerNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  return (
    <header className="h-12 flex items-center justify-between px-4 flex-shrink-0 dark:bg-[#0D1117]/80 bg-white/80 backdrop-blur-sm border-b dark:border-[#21262D] border-blue-100/60 relative z-30">
      <div className="flex items-center gap-1.5">
        <button onClick={onMobileOpen} className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center dark:text-gray-200 text-slate-700 dark:hover:bg-gray-800 hover:bg-gray-100 dark:hover:text-white hover:text-slate-900 transition-all">
          <Menu size={18} />
        </button>
        {/* Mobile logos */}
        <div className="flex items-center gap-1.5 md:hidden">
          <img src="/logo/logo.png" alt="AITA Logo" className="h-5 w-auto object-contain" />
        </div>
        <div>
          <div className="hidden md:flex items-center gap-1.5 text-[10px] dark:text-gray-600 text-blue-300 mb-0.5">
            <span>Lecturer</span><span>/</span>
            <span className="dark:text-gray-400 text-blue-500">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold dark:text-white text-gray-900 leading-none">{title}</h1>
            {sub && <span className="hidden sm:inline text-[10px] dark:text-gray-600 text-blue-300">· {sub}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <div className="hidden sm:flex flex-col items-end leading-none">
          <span className="text-sm font-bold dark:text-blue-300 text-blue-600 tabular-nums tracking-wide">{timeStr}</span>
          <span className="text-[10px] dark:text-gray-500 text-blue-300 mt-0.5">{dateStr}</span>
        </div>

        {/* Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-400 text-blue-400 dark:hover:bg-gray-800 hover:bg-blue-50 transition-all"
        >
          <Bell size={14} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-9 w-80 sm:w-96 dark:bg-[#161B22] bg-white border dark:border-[#30363D] border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 mt-1">
            <div className="flex items-center justify-between px-4 py-2.5 border-b dark:border-[#21262D] border-gray-100 dark:bg-[#0D1117] bg-gray-50">
              <span className="text-xs font-bold dark:text-white text-gray-800">Thông báo</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Check size={11} /> Đánh dấu đọc tất cả
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y dark:divide-[#21262D]/60 divide-gray-150">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-xs dark:text-gray-500 text-gray-400">
                  Không có thông báo nào.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#21262D]/35 transition-all flex items-start gap-2.5 ${!notif.isRead ? 'bg-blue-50/20 dark:bg-blue-500/5' : ''
                      }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs truncate ${!notif.isRead ? 'font-bold dark:text-white text-gray-900' : 'dark:text-gray-300 text-gray-700'}`}>
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] dark:text-gray-400 text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[9px] dark:text-gray-550 text-gray-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}