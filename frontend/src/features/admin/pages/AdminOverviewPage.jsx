import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Users, GraduationCap, UserCheck, BookOpen, Bot, Clock, Activity } from 'lucide-react'
import StatCard from '../components/StatCard'
import PageHeader from '../../../components/common/PageHeader'
import { getDashboardOverview } from '../../../services/admin.api'
import { formatRelative } from '../../../utils/formatDate'
import { useTheme } from '../../../contexts/ThemeContext'

// ── Mock data (replace with API response fields when backend ready) ───────────
const MOCK_USER_GROWTH = [
  { month: 'T1', users: 12, lecturers: 3, students: 9 },
  { month: 'T2', users: 19, lecturers: 4, students: 15 },
  { month: 'T3', users: 28, lecturers: 5, students: 23 },
  { month: 'T4', users: 35, lecturers: 6, students: 29 },
  { month: 'T5', users: 47, lecturers: 8, students: 39 },
  { month: 'T6', users: 58, lecturers: 9, students: 49 },
]

const MOCK_ACTIVITY = [
  { day: 'T2', slides: 14, assignments: 8, submissions: 22 },
  { day: 'T3', slides: 20, assignments: 12, submissions: 31 },
  { day: 'T4', slides: 9,  assignments: 6,  submissions: 18 },
  { day: 'T5', slides: 25, assignments: 15, submissions: 40 },
  { day: 'T6', slides: 18, assignments: 10, submissions: 28 },
  { day: 'T7', slides: 5,  assignments: 3,  submissions: 8  },
  { day: 'CN', slides: 3,  assignments: 2,  submissions: 5  },
]

const MOCK_ROLE_PIE = [
  { name: 'Sinh viên',  value: 68, color: '#10b981' },
  { name: 'Giảng viên', value: 24, color: '#3b82f6' },
  { name: 'Admin',      value: 8,  color: '#f97316' },
]

// ── Sub-components ─────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`dark:bg-gray-800 bg-gray-200 rounded animate-pulse ${className}`} />
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`dark:bg-gray-900/60 bg-white border dark:border-gray-800/60 border-gray-200/60 rounded-xl p-4 ${className}`}>
      <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function ActivityRow({ name, role, action, time }) {
  const ROLE_STYLE = {
    ADMIN:    'bg-orange-500/10 text-orange-400 dark:border-orange-500/20 border-orange-200',
    LECTURER: 'bg-blue-500/10 text-blue-400 dark:border-blue-500/20 border-blue-200',
    STUDENT:  'bg-emerald-500/10 text-emerald-400 dark:border-emerald-500/20 border-emerald-200',
  }
  return (
    <div className="flex items-center gap-2.5 py-2 border-b dark:border-gray-800/40 border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-full dark:bg-gray-800 bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold dark:text-gray-300 text-gray-500">{name?.[0]?.toUpperCase() ?? '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium dark:text-gray-200 text-gray-700 truncate">{name}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ROLE_STYLE[role] ?? 'dark:bg-gray-800 text-gray-400 dark:border-gray-700 border-gray-200'}`}>
            {role}
          </span>
        </div>
        <div className="text-[10px] dark:text-gray-500 text-gray-400 truncate">{action}</div>
      </div>
      <div className="text-[10px] dark:text-gray-600 text-gray-400 flex-shrink-0 flex items-center gap-1">
        <Clock size={9} />
        {formatRelative(time)}
      </div>
    </div>
  )
}

// ── Custom tooltip for charts ─────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs shadow-xl ${
      dark ? 'bg-gray-900 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    }`}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span>{p.name}: <span className="font-bold">{p.value}</span></span>
        </div>
      ))}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const { dark } = useTheme()

  const gridColor  = dark ? '#1f2937' : '#f3f4f6'
  const axisColor  = dark ? '#4b5563' : '#9ca3af'

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDashboardOverview()
        setData(res.data.data)
      } catch {
        // use mock data gracefully
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const stats = data?.stats ?? {}
  const recentUsers = data?.recentUsers ?? []
  const aiFeatures  = data?.aiFeatures  ?? []

  return (
    <div className="space-y-4 max-w-screen-2xl">

      <PageHeader
        title="Tổng quan hệ thống"
        description="Theo dõi toàn bộ hoạt động AITA theo thời gian thực"
        stats={[
          { label: 'Hệ thống', value: 'Hoạt động', accent: 'emerald' },
          { label: 'AI modules', value: `${aiFeatures.filter(f=>f.isActive).length || 4} bật`, accent: 'orange' },
        ]}
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="Tổng người dùng" value={loading ? null : (stats.totalUsers   ?? 156)} sub="tài khoản"        accent="orange"  loading={loading} />
        <StatCard icon={GraduationCap} label="Giảng viên"     value={loading ? null : (stats.totalLecturers ?? 24)} sub="đang hoạt động" accent="blue"    loading={loading} />
        <StatCard icon={UserCheck}    label="Sinh viên"        value={loading ? null : (stats.totalStudents  ?? 128)} sub="đã đăng ký"   accent="emerald" loading={loading} />
        <StatCard icon={BookOpen}     label="Môn học"          value={loading ? null : (stats.totalSubjects  ?? 18)} sub="trong hệ thống" accent="violet" loading={loading} />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid lg:grid-cols-3 gap-3">

        {/* Area chart — user growth */}
        <ChartCard title="Tăng trưởng người dùng (6 tháng)" className="lg:col-span-2">
          {loading ? <Skeleton className="h-44 w-full" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={data?.userGrowth ?? MOCK_USER_GROWTH} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gLecturers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Area type="monotone" dataKey="students"  name="Sinh viên"  stroke="#10b981" strokeWidth={1.5} fill="url(#gStudents)"  dot={false} />
                <Area type="monotone" dataKey="lecturers" name="Giảng viên" stroke="#3b82f6" strokeWidth={1.5} fill="url(#gLecturers)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-4 mt-2">
            {[{ color:'#10b981', label:'Sinh viên' }, { color:'#3b82f6', label:'Giảng viên' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-px rounded" style={{ background: l.color, display:'inline-block' }} />
                <span className="text-[10px] dark:text-gray-500 text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Pie — role distribution */}
        <ChartCard title="Phân bố vai trò">
          {loading ? <Skeleton className="h-44 w-full" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data?.roleDistribution ?? MOCK_ROLE_PIE}
                  cx="50%" cy="50%"
                  innerRadius={42} outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(data?.roleDistribution ?? MOCK_ROLE_PIE).map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip dark={dark} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-col gap-1.5 mt-1">
            {(data?.roleDistribution ?? MOCK_ROLE_PIE).map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-[10px] dark:text-gray-400 text-gray-500">{r.name}</span>
                </div>
                <span className="text-[10px] font-bold dark:text-gray-300 text-gray-600">{r.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid lg:grid-cols-3 gap-3">

        {/* Bar — weekly AI activity */}
        <ChartCard title="Hoạt động AI (7 ngày)" className="lg:col-span-2">
          {loading ? <Skeleton className="h-40 w-full" /> : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data?.weeklyActivity ?? MOCK_ACTIVITY} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={10} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Bar dataKey="slides"      name="Slides"      fill="#f97316" radius={[3,3,0,0]} />
                <Bar dataKey="assignments" name="Bài tập"     fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="submissions" name="Nộp bài"     fill="#10b981" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex items-center gap-4 mt-2">
            {[{ color:'#f97316',label:'Slides' },{ color:'#3b82f6',label:'Bài tập' },{ color:'#10b981',label:'Nộp bài' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                <span className="text-[10px] dark:text-gray-500 text-gray-400">{l.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* AI module status */}
        <ChartCard title="Module AI">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {(aiFeatures.length > 0 ? aiFeatures : [
                { id:1, name:'Slide Generator',    isActive: true  },
                { id:2, name:'Exercise AI',        isActive: true  },
                { id:3, name:'Code Analyzer',      isActive: false },
                { id:4, name:'Feedback AI',        isActive: true  },
              ]).map((f) => (
                <div key={f.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs ${
                  f.isActive
                    ? 'dark:bg-orange-500/5 bg-orange-50 dark:border-orange-500/20 border-orange-200'
                    : 'dark:bg-gray-800/30 bg-gray-50 dark:border-gray-800 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.isActive ? 'bg-orange-500 animate-pulse' : 'dark:bg-gray-600 bg-gray-300'}`} />
                    <span className={f.isActive ? 'dark:text-gray-200 text-gray-700' : 'dark:text-gray-500 text-gray-400'}>
                      {f.name}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    f.isActive ? 'text-orange-400 dark:bg-orange-500/10 bg-orange-100' : 'dark:text-gray-600 text-gray-400 dark:bg-gray-800 bg-gray-100'
                  }`}>
                    {f.isActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <a href="/admin/ai-settings" className="block text-center text-[10px] text-orange-400 hover:text-orange-300 transition-colors mt-3">
            Quản lý →
          </a>
        </ChartCard>
      </div>

      {/* ── Recent users ── */}
      <ChartCard title="Người dùng mới nhất">
        <div className="flex items-center justify-between mb-2">
          <span />
          <a href="/admin/users" className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors">Xem tất cả →</a>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-7 h-7 dark:bg-gray-800 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 dark:bg-gray-800 bg-gray-200 rounded animate-pulse w-28" />
                  <div className="h-2 dark:bg-gray-800 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="text-center py-6 text-xs dark:text-gray-600 text-gray-400">Chưa có người dùng mới.</div>
        ) : (
          recentUsers.map((u, i) => (
            <ActivityRow key={u.id ?? i} name={u.name} role={u.role} action="Đăng ký tài khoản" time={u.createdAt} />
          ))
        )}
      </ChartCard>
    </div>
  )
}