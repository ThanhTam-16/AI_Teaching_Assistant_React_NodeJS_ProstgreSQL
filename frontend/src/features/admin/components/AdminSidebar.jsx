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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 h-12 border-b dark:border-gray-800/60 border-gray-200/60 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/logo/logo.png" alt="AITA" className="h-7 w-auto object-contain flex-shrink-0" />
            <div className="leading-tight overflow-hidden">
              <div className="text-xs font-bold dark:text-white text-gray-900 tracking-wide">AITA</div>
              <div className="text-[9px] dark:text-gray-500 text-gray-400 truncate">Admin Portal</div>
            </div>
          </div>
        )}
        {collapsed && (
          <img src="/logo/logo.png" alt="AITA" className="h-6 w-auto object-contain mx-auto" />
        )}
        <button
          onClick={onToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:text-gray-200 hover:text-gray-600 dark:hover:bg-gray-800 hover:bg-gray-100 transition-all flex-shrink-0"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {collapsed ? <Menu size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-thin">
        {NAV.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[9px] font-bold uppercase tracking-widest dark:text-gray-600 text-gray-400">
                {group.section}
              </div>
            )}
            {collapsed && <div className="my-1 mx-2 h-px dark:bg-gray-800 bg-gray-200" />}
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
                      ${collapsed ? 'justify-center px-2' : ''}
                    `}
                  >
                    <Icon size={14} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
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
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg dark:bg-gray-900/60 bg-gray-50 mb-1">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-orange-400">
                {user.name?.[0]?.toUpperCase() ?? 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold dark:text-gray-200 text-gray-700 truncate">{user.name}</div>
              <div className="text-[9px] dark:text-gray-500 text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        )}
        {collapsed && user && (
          <div className="flex justify-center mb-1">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-orange-400">{user.name?.[0]?.toUpperCase() ?? 'A'}</span>
            </div>
          </div>
        )}

        {/* Dark mode toggle */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-2 py-1.5' : 'gap-2.5 px-2.5 py-1.5'} rounded-lg`}>
          {!collapsed && (
            <span className="text-xs dark:text-gray-400 text-gray-500 flex-1">
              {dark ? 'Dark mode' : 'Light mode'}
            </span>
          )}
          <button
            onClick={toggleDark}
            className={`
              relative flex-shrink-0 rounded-full border transition-all duration-300
              ${dark
                ? 'bg-orange-500/20 border-orange-500/30 w-9 h-5'
                : 'bg-gray-200 border-gray-300 w-9 h-5'
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
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={13} />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`
        hidden md:flex flex-col h-full flex-shrink-0
        dark:bg-gray-950 bg-white
        border-r dark:border-gray-800/60 border-gray-200/60
        transition-all duration-200 ease-in-out
        ${collapsed ? 'w-14' : 'w-52'}
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onMobileClose}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-52 z-50 dark:bg-gray-950 bg-white border-r dark:border-gray-800/60 border-gray-200/60 flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}