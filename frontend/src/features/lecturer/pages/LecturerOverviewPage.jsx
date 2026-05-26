import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import {
  BookOpen, Users, FileText, BarChart3,
  Sparkles, Bell, LogOut, ChevronRight,
  GraduationCap, ClipboardList, Star
} from 'lucide-react'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    green:  { bg: 'bg-lecturer-50',  icon: 'bg-lecturer-100 text-lecturer-600', val: 'text-lecturer-700' },
    orange: { bg: 'bg-fpt-pastel',   icon: 'bg-fpt-pale text-fpt-orange',       val: 'text-fpt-orange'   },
    teal:   { bg: 'bg-cyan-50',      icon: 'bg-cyan-100 text-cyan-600',          val: 'text-cyan-700'     },
    purple: { bg: 'bg-purple-50',    icon: 'bg-purple-100 text-purple-600',      val: 'text-purple-700'   },
  }
  const c = colors[color] || colors.green
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

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ icon, label, desc, soon }) {
  return (
    <button
      disabled={soon}
      className="group relative flex items-center gap-3 bg-white border border-lecturer-100 rounded-2xl px-4 py-3.5 text-left hover:border-lecturer-300 hover:shadow-green-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-default w-full"
    >
      <div className="w-9 h-9 rounded-xl bg-lecturer-50 flex items-center justify-center flex-shrink-0 group-hover:bg-lecturer-100 transition-colors text-lecturer-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
      {soon
        ? <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">Sắp có</span>
        : <ChevronRight size={14} className="text-gray-300 group-hover:text-lecturer-500 transition-colors" />
      }
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LecturerOverviewPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lecturer-50 via-white to-fpt-pastel">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-lecturer-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-gradient flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lecturer-600 text-sm">AITA</span>
              <span className="hidden sm:inline text-gray-400 text-xs ml-1.5">· Giảng viên</span>
            </div>
          </div>

          {/* User + actions */}
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-400 hover:text-lecturer-600 hover:bg-lecturer-50 rounded-lg transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-fpt-orange rounded-full" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-lecturer-50 rounded-xl border border-lecturer-100">
              <div className="w-6 h-6 rounded-full bg-green-gradient flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {user?.fullName?.[0] || 'G'}
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

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lecturer-100 rounded-full mb-3">
            <GraduationCap size={13} className="text-lecturer-600" />
            <span className="text-xs font-bold text-lecturer-700 uppercase tracking-wide">Giảng viên</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">
            Xin chào, <span className="text-lecturer-600">{user?.fullName || 'Giảng viên'}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm">{user?.email} · Học kỳ Summer 2026</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <StatCard icon={<BookOpen size={18}/>}      label="Lớp học"       value="3"  sub="Đang hoạt động" color="green"  />
          <StatCard icon={<Users size={18}/>}         label="Sinh viên"     value="72" sub="Tổng 3 lớp"      color="orange" />
          <StatCard icon={<FileText size={18}/>}      label="Bài tập"       value="12" sub="Đã tạo"           color="teal"   />
          <StatCard icon={<BarChart3 size={18}/>}     label="Bài nộp"       value="48" sub="Chờ chấm điểm"   color="purple" />
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Quick actions — 3 cols */}
          <div className="lg:col-span-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="font-display font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-fpt-orange" /> Công cụ AI
            </h2>
            <div className="space-y-2.5">
              <QuickAction icon={<span className="text-base">🎨</span>} label="Tạo slide từ CLO"        desc="AI tự động tạo nội dung bài giảng" soon />
              <QuickAction icon={<span className="text-base">📝</span>} label="Tạo bài tập"             desc="Bài tập theo chủ đề và độ khó"    soon />
              <QuickAction icon={<span className="text-base">💻</span>} label="Phân tích code sinh viên" desc="Đánh giá chất lượng và logic"      soon />
              <QuickAction icon={<span className="text-base">🧠</span>} label="Phản hồi học tập AI"     desc="Gợi ý cá nhân hoá cho sinh viên"   soon />
            </div>

            <h2 className="font-display font-semibold text-gray-800 text-sm mt-6 mb-3 flex items-center gap-2">
              <ClipboardList size={14} className="text-lecturer-600" /> Quản lý
            </h2>
            <div className="space-y-2.5">
              <QuickAction icon={<BookOpen size={16}/>}   label="Quản lý lớp học"    desc="Xem và quản lý danh sách lớp"   soon />
              <QuickAction icon={<FileText size={16}/>}   label="Bài nộp của sinh viên" desc="Xem và chấm bài tập đã nộp"  soon />
              <QuickAction icon={<BarChart3 size={16}/>}  label="Báo cáo & Điểm số"  desc="Tổng hợp kết quả học tập"       soon />
            </div>
          </div>

          {/* Activity feed — 2 cols */}
          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <Bell size={14} className="text-fpt-orange" /> Hoạt động gần đây
            </h2>
            <div className="bg-white rounded-2xl border border-lecturer-100 overflow-hidden">
              {[
                { icon: '📥', text: 'Nguyễn Văn A đã nộp bài tập Lab 3',   time: '5 phút trước',   dot: 'bg-green-400'  },
                { icon: '🤖', text: 'AI đã tạo xong slide Chương 5',        time: '1 giờ trước',    dot: 'bg-fpt-orange' },
                { icon: '📥', text: 'Trần Thị B đã nộp bài Assignment 2',  time: '2 giờ trước',    dot: 'bg-green-400'  },
                { icon: '📊', text: 'Báo cáo tuần được tạo tự động',        time: 'Hôm qua',        dot: 'bg-blue-400'   },
                { icon: '👤', text: 'Sinh viên mới tham gia lớp SE1234',    time: 'Hôm qua',        dot: 'bg-purple-400' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < 4 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-base mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.dot}`} />
                </div>
              ))}
            </div>

            {/* Coming soon banner */}
            <div className="mt-4 bg-gradient-to-br from-lecturer-50 to-fpt-pastel rounded-2xl border border-lecturer-100 p-4 text-center">
              <Star size={18} className="mx-auto text-fpt-orange mb-2" />
              <p className="text-xs font-semibold text-gray-700 mb-1">Dashboard đầy đủ sắp ra mắt</p>
              <p className="text-[10px] text-gray-400">Các tính năng quản lý lớp học và AI đang được phát triển.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}