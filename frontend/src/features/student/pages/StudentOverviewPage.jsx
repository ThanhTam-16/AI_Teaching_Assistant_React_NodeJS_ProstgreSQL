import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import {
  BookOpen, ClipboardList, CheckCircle2, TrendingUp,
  Sparkles, Bell, LogOut, ChevronRight, Star, GraduationCap
} from 'lucide-react'

function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    teal:   { bg: 'bg-student-50',  icon: 'bg-student-100 text-student-600', val: 'text-student-700' },
    orange: { bg: 'bg-fpt-pastel',  icon: 'bg-fpt-pale text-fpt-orange',     val: 'text-fpt-orange'  },
    green:  { bg: 'bg-green-50',    icon: 'bg-green-100 text-green-600',      val: 'text-green-700'   },
    purple: { bg: 'bg-purple-50',   icon: 'bg-purple-100 text-purple-600',    val: 'text-purple-700'  },
  }
  const c = colors[color] || colors.teal
  return (
    <div className={`${c.bg} rounded-2xl border border-white p-5 flex items-start gap-4 shadow-card`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        {icon}
      </div>
      <div>
        <div className={`font-display font-bold text-2xl ${c.val}`}>{value}</div>
        <div className="text-xs font-semibold text-gray-700 mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function QuickAction({ icon, label, desc, badge, soon }) {
  return (
    <button
      disabled={soon}
      className="group flex items-center gap-3 bg-white border border-student-100 rounded-2xl px-4 py-3.5 text-left hover:border-student-300 hover:shadow-teal-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-default w-full"
    >
      <div className="w-9 h-9 rounded-xl bg-student-50 flex items-center justify-center flex-shrink-0 group-hover:bg-student-100 transition-colors text-student-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
      {badge && <span className="text-[10px] font-bold bg-fpt-pale text-fpt-orange px-2 py-0.5 rounded-full">{badge}</span>}
      {soon && !badge && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Sắp có</span>}
      {!soon && !badge && <ChevronRight size={14} className="text-gray-300 group-hover:text-student-500 transition-colors" />}
    </button>
  )
}

export default function StudentOverviewPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-50 via-white to-fpt-pastel">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-student-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-student-600 text-sm">AITA</span>
              <span className="hidden sm:inline text-gray-400 text-xs ml-1.5">· Sinh viên</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-student-600 hover:bg-student-50 rounded-lg transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-fpt-orange rounded-full animate-pulse" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-student-50 rounded-xl border border-student-100">
              <div className="w-6 h-6 rounded-full bg-teal-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {user?.fullName?.[0] || 'S'}
              </div>
              <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate">{user?.fullName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-student-100 rounded-full mb-3">
            <GraduationCap size={13} className="text-student-600" />
            <span className="text-xs font-bold text-student-700 uppercase tracking-wide">Sinh viên</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
            Xin chào, <span className="text-student-600">{user?.fullName || 'Sinh viên'}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm">{user?.email} · Học kỳ Summer 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <StatCard icon={<BookOpen size={18}/>}      label="Môn học"       value="3"  sub="Đang học"         color="teal"   />
          <StatCard icon={<ClipboardList size={18}/>} label="Bài tập"       value="5"  sub="Cần nộp"          color="orange" />
          <StatCard icon={<CheckCircle2 size={18}/>}  label="Đã hoàn thành" value="18" sub="Bài tập"          color="green"  />
          <StatCard icon={<TrendingUp size={18}/>}    label="Điểm TB"       value="8.4" sub="Học kỳ này"      color="purple" />
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Actions */}
          <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="font-display font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <BookOpen size={14} className="text-student-600" /> Học tập
            </h2>
            <div className="space-y-2.5">
              <QuickAction icon={<span className="text-base">📚</span>} label="Tài liệu bài giảng"  desc="Xem slide và nội dung AI"          soon />
              <QuickAction icon={<span className="text-base">📝</span>} label="Bài tập chờ nộp"     desc="5 bài tập cần hoàn thành"          badge="5 mới" />
              <QuickAction icon={<span className="text-base">💻</span>} label="Nộp code / bài tập"  desc="Upload bài làm của bạn"             soon />
              <QuickAction icon={<span className="text-base">🧠</span>} label="Phản hồi từ AI"       desc="Xem gợi ý cải thiện cá nhân hoá"  soon />
            </div>

            <h2 className="font-display font-semibold text-gray-800 text-sm mt-6 mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-fpt-orange" /> Tiến độ
            </h2>
            <div className="space-y-2.5">
              <QuickAction icon={<TrendingUp size={16}/>}  label="Tiến độ học tập"  desc="Xem biểu đồ tiến độ theo tuần"   soon />
              <QuickAction icon={<CheckCircle2 size={16}/>} label="Kết quả & Điểm"  desc="Điểm thi và bài tập tích lũy"    soon />
            </div>
          </div>

          {/* Upcoming assignments */}
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <ClipboardList size={14} className="text-fpt-orange" /> Bài tập sắp đến hạn
            </h2>
            <div className="bg-white rounded-2xl border border-student-100 overflow-hidden">
              {[
                { subject: 'SE1234', task: 'Lab 3 – RESTful API',       due: 'Hôm nay 23:59',   urgent: true  },
                { subject: 'SE1235', task: 'Assignment 2 – Database',   due: 'Ngày mai 17:00',  urgent: true  },
                { subject: 'SE1236', task: 'Quiz – OOP Concepts',       due: '28/05/2026',      urgent: false },
                { subject: 'SE1234', task: 'Project Milestone 1',       due: '01/06/2026',      urgent: false },
              ].map((a, i) => (
                <div key={i} className={`px-4 py-3 ${i < 3 ? 'border-b border-gray-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-student-600 bg-student-50 px-1.5 py-0.5 rounded">{a.subject}</span>
                      <p className="text-xs font-medium text-gray-700 mt-1">{a.task}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${a.urgent ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                      {a.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress preview */}
            <div className="mt-4 bg-white rounded-2xl border border-student-100 p-4">
              <h3 className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                <TrendingUp size={12} className="text-student-600" /> Tiến độ tuần này
              </h3>
              {[
                { name: 'SE1234 – Web Dev',   pct: 80 },
                { name: 'SE1235 – Database',  pct: 55 },
                { name: 'SE1236 – OOP',       pct: 70 },
              ].map((c) => (
                <div key={c.name} className="mb-2.5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{c.name}</span>
                    <span className="text-[10px] font-bold text-student-600">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-student-50 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-gradient rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-gradient-to-br from-student-50 to-fpt-pastel rounded-2xl border border-student-100 p-4 text-center">
              <Star size={18} className="mx-auto text-fpt-orange mb-2" />
              <p className="text-xs font-semibold text-gray-700 mb-1">Portal đầy đủ sắp ra mắt</p>
              <p className="text-[10px] text-gray-400">Tính năng học tập đầy đủ đang được phát triển.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}