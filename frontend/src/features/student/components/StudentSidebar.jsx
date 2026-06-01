import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GraduationCap, BookOpen, FileText,
  ClipboardList, MessageSquare, TrendingUp, Bell,
  LogOut, X, Sun, Moon, Menu, Sparkles,
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useTheme } from '../../../contexts/ThemeContext'

const NAV = [
  {
    section: 'Tổng quan',
    items: [
      { label: 'Dashboard',    href: '/student',             icon: LayoutDashboard },
      { label: 'Thông báo',   href: '/student/notifications',icon: Bell },
    ],
  },
  {
    section: 'Học tập',
    items: [
      { label: 'Lớp của tôi',  href: '/student/classes',     icon: GraduationCap },
      { label: 'Môn học',      href: '/student/subjects',    icon: BookOpen },
      { label: 'Bài học',      href: '/student/lessons',     icon: FileText },
    ],
  },
  {
    section: 'Bài tập',
    items: [
      { label: 'Bài tập',      href: '/student/assignments', icon: ClipboardList },
    ],
  },
  {
    section: 'Kết quả',
    items: [
      { label: 'Phản hồi',     href: '/student/feedback',    icon: MessageSquare },
      { label: 'Tiến độ',      href: '/student/progress',    icon: TrendingUp },
    ],
  },
]

export default function StudentSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const { dark, toggle: toggleDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const Content = ({ isMobile }) => {
    const showFull = !collapsed || isMobile
    return (
      <div className="flex flex-col h-full">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between px-3 h-14 border-b flex-shrink-0
          dark:border-[#21262D] border-orange-100/80`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/logo/logo.png" alt="AITA" className="h-7 w-7 object-contain flex-shrink-0" />
            <div className={`leading-tight transition-all duration-300 ease-in-out ${
              showFull ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 pointer-events-none'
            } overflow-hidden`}>
              <div className="text-xs font-bold dark:text-white text-gray-900 whitespace-nowrap">AITA</div>
              <div className="text-[9px] text-orange-400 whitespace-nowrap">Student Portal</div>
            </div>
          </div>
          {!isMobile && (
            <button onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                dark:text-gray-500 text-orange-300 dark:hover:bg-gray-800 hover:bg-orange-50
                transition-all flex-shrink-0">
              <Menu size={14} />
            </button>
          )}
          {isMobile && (
            <button onClick={onMobileClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                dark:text-gray-500 text-orange-300 dark:hover:bg-gray-800 hover:bg-orange-50
                transition-all flex-shrink-0">
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Nav ────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className={`px-2 mb-1 text-[9px] font-bold uppercase tracking-widest
                dark:text-gray-600 text-orange-300/70 transition-all duration-300
                ${showFull ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'}`}>
                {group.section}
              </div>
              {!showFull && <div className="my-1 mx-2 h-px dark:bg-[#21262D] bg-orange-100 transition-all" />}
              <ul className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <NavLink
                      to={href}
                      end={href === '/student'}
                      onClick={onMobileClose}
                      className={({ isActive }) => `
                        flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium
                        transition-all duration-150 group relative
                        ${isActive
                          ? 'bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20'
                          : 'dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-orange-700 dark:hover:bg-[#21262D] hover:bg-orange-50/60'
                        }
                        ${!showFull ? 'justify-center px-2' : ''}
                      `}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className={`truncate transition-all duration-300 origin-left ${
                        showFull ? 'opacity-100 max-w-[130px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
                      }`}>{label}</span>
                      {!showFull && (
                        <div className="absolute left-full ml-2.5 px-2.5 py-1.5 dark:bg-gray-900 bg-gray-800
                          text-white text-[11px] rounded-lg opacity-0 pointer-events-none
                          group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                          {label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent
                            dark:border-r-gray-900 border-r-gray-800" />
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Bottom ─────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t dark:border-[#21262D] border-orange-100/60 p-2 space-y-1">
          {/* User info */}
          {user && (
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-xl mb-1
              dark:bg-[#0D1117] bg-orange-50/60 overflow-hidden`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                bg-gradient-to-br from-orange-400 to-amber-400 shadow-sm">
                <span className="text-[11px] font-bold text-white">{user.name?.[0]?.toUpperCase() ?? 'S'}</span>
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${
                showFull ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
              }`}>
                <div className="text-[11px] font-semibold dark:text-gray-200 text-gray-700 truncate">{user.name}</div>
                <div className="text-[9px] text-orange-400 truncate">Sinh viên</div>
              </div>
            </div>
          )}

          {/* Dark toggle */}
          <div className={`flex items-center ${!showFull ? 'justify-center px-2 py-1.5' : 'gap-2.5 px-2.5 py-1.5'} rounded-xl`}>
            <span className={`text-xs dark:text-gray-400 text-gray-500 flex-1 transition-all duration-300 ${
              showFull ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
            }`}>
              {dark ? 'Dark' : 'Light'}
            </span>
            <button onClick={toggleDark}
              className={`relative flex-shrink-0 rounded-full border transition-all duration-300 w-9 h-5
                ${dark ? 'bg-orange-500/20 border-orange-400/30' : 'bg-gray-200 border-gray-300'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center
                transition-all duration-300 shadow-sm ${dark ? 'left-4 bg-orange-400' : 'left-0.5 bg-white'}`}>
                {dark ? <Moon size={9} className="text-white" /> : <Sun size={9} className="text-gray-500" />}
              </span>
            </button>
          </div>

          <button onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl text-xs
              dark:text-gray-500 text-gray-400 dark:hover:text-rose-400 hover:text-rose-500
              dark:hover:bg-rose-500/5 hover:bg-rose-50 transition-all ${!showFull ? 'justify-center' : ''}`}>
            <LogOut size={13} className="flex-shrink-0" />
            <span className={`transition-all duration-300 ${
              showFull ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
            }`}>Đăng xuất</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <aside className={`hidden md:flex flex-col h-full flex-shrink-0 transition-all duration-300
        dark:bg-[#0D1117] bg-white border-r dark:border-[#21262D] border-orange-100/60
        ${collapsed ? 'w-14' : 'w-52'}`}>
        <Content isMobile={false} />
      </aside>

      {/* Mobile overlay */}
      <div className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300
        ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onMobileClose} />
      <aside className={`md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50
        dark:bg-[#0D1117] bg-white border-r dark:border-[#21262D] border-orange-100
        flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Content isMobile={true} />
      </aside>
    </>
  )
}