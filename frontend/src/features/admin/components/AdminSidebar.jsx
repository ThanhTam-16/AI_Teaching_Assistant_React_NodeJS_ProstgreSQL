import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck,
  BookOpen, Bot, Settings, LogOut, Menu, X, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../../../hooks/useAuth'
import { useTheme } from '../../../contexts/ThemeContext'

const NAV = [
  {
    section: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Người dùng',
    items: [
      { label: 'Tất cả',      href: '/admin/users',     icon: Users },
      { label: 'Giảng viên',  href: '/admin/lecturers', icon: GraduationCap },
      { label: 'Sinh viên',   href: '/admin/students',  icon: UserCheck },
    ],
  },
  {
    section: 'Hệ thống',
    items: [
      { label: 'Môn học',    href: '/admin/subjects',    icon: BookOpen },
      { label: 'Cài đặt AI', href: '/admin/ai-settings', icon: Bot },
      { label: 'Hệ thống',  href: '/admin/settings',    icon: Settings },
    ],
  },
]

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const { dark, toggle: toggleDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const SidebarContent = ({ isMobile }) => {
    const showFull = !collapsed || isMobile
    return (
      <div className="flex flex-col h-full">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 h-12 border-b dark:border-gray-800/60 border-gray-200/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/logo/logo.png" alt="AITA" className="h-7 w-7 object-contain flex-shrink-0" />
            <div className={`leading-tight transition-all duration-300 ease-in-out ${
              showFull ? 'opacity-100 max-w-[120px] ml-0' : 'opacity-0 max-w-0 -ml-2 pointer-events-none'
            } overflow-hidden`}>
              <div className="text-xs font-bold dark:text-white text-gray-900 tracking-wide whitespace-nowrap">AITA</div>
              <div className="text-[9px] dark:text-gray-500 text-gray-400 truncate whitespace-nowrap">Admin Portal</div>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex-shrink-0"
              title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            >
              <Menu size={14} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={onMobileClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex-shrink-0"
              title="Đóng"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className={`px-2 mb-1 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400 transition-all duration-300 ${
                showFull ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'
              }`}>
                {group.section}
              </div>
              {!showFull && <div className="my-1 mx-2 h-px dark:bg-gray-800 bg-gray-200 transition-all" />}
              <ul className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <NavLink
                      to={href}
                      end={href === '/admin'}
                      onClick={onMobileClose}
                      className={({ isActive }) => `
                        flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                        transition-all duration-150 group relative
                        ${isActive
                          ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20'
                          : 'dark:text-gray-400 text-gray-500 dark:hover:text-gray-200 hover:text-gray-800 dark:hover:bg-gray-800/60 hover:bg-gray-100'
                        }
                        ${!showFull ? 'justify-center px-2' : ''}
                      `}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className={`truncate transition-all duration-300 origin-left ${
                        showFull ? 'opacity-100 max-w-[120px] ml-0' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
                      }`}>{label}</span>

                      {/* Tooltip when collapsed */}
                      {!showFull && (
                        <div className="absolute left-full ml-2.5 px-2 py-1 dark:bg-gray-800 bg-gray-900 text-white text-[11px] rounded-lg
                                        opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
                          {label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent dark:border-r-gray-800 border-r-gray-900" />
                        </div>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Bottom: user info + dark toggle + logout ── */}
        <div className="flex-shrink-0 border-t dark:border-gray-800/60 border-gray-200/60 p-2 space-y-1">

          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg dark:bg-gray-900/60 bg-gray-50 mb-1 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-orange-400">
                  {user.name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${
                showFull ? 'opacity-100 max-w-[120px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
              }`}>
                <div className="text-[11px] font-semibold dark:text-gray-200 text-gray-700 truncate">{user.name}</div>
                <div className="text-[9px] dark:text-gray-500 text-gray-400 truncate">{user.email}</div>
              </div>
            </div>
          )}

          {/* Dark mode toggle */}
          <div className={`flex items-center ${!showFull ? 'justify-center px-2 py-1.5' : 'gap-2.5 px-2.5 py-1.5'} rounded-lg`}>
            <span className={`text-xs dark:text-gray-400 text-gray-500 flex-1 transition-all duration-300 ${
              showFull ? 'opacity-100 max-w-[100px]' : 'opacity-0 max-w-0 overflow-hidden pointer-events-none'
            }`}>
              {dark ? 'Dark mode' : 'Light mode'}
            </span>
            <button
              onClick={toggleDark}
              className={`
                relative flex-shrink-0 rounded-full border transition-all duration-300 w-9 h-5
                ${dark
                  ? 'bg-orange-500/20 border-orange-500/30'
                  : 'bg-gray-200 border-gray-300'
                }
              `}
              title={dark ? 'Chuyển sang Light mode' : 'Chuyển sang Dark mode'}
            >
              <span className={`
                absolute top-0.5 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                ${dark
                  ? 'left-4 bg-orange-400'
                  : 'left-0.5 bg-white'
                }
              `}>
                {dark
                  ? <Moon size={9} className="text-white" />
                  : <Sun size={9} className="text-gray-500" />
                }
              </span>
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg
              text-xs dark:text-gray-500 text-gray-400 dark:hover:text-red-400 hover:text-red-500
              dark:hover:bg-red-500/5 hover:bg-red-50 transition-all duration-150
              ${!showFull ? 'justify-center' : ''}
            `}
          >
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
      {/* Desktop sidebar */}
      <aside className={`
        hidden md:flex flex-col h-full flex-shrink-0
        dark:bg-gray-950 bg-white
        border-r dark:border-gray-800/60 border-gray-200/60
        transition-all duration-300
        ${collapsed ? 'w-14' : 'w-52'}
      `}>
        <SidebarContent isMobile={false} />
      </aside>

      {/* Mobile drawer layout with animation */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onMobileClose}
      />
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-[280px] z-50 dark:bg-gray-950 bg-white border-r dark:border-gray-800/60 border-gray-200/60 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile={true} />
      </aside>
    </>
  )
}