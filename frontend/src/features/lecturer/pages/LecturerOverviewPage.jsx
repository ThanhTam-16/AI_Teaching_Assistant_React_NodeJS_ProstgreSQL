import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  GraduationCap, BookOpen, FileText, ClipboardList,
  Inbox, CheckCircle2, Clock, Sparkles,
} from 'lucide-react'
import { getLecturerDashboard } from '../../../services/dashboard.api'
import LecturerStatCard from '../components/LecturerStatCard'
import { PageHeader, Sk } from '../components/LecturerUI'
import { useTheme } from '../../../contexts/ThemeContext'
import { formatRelative } from '../../../utils/formatDate'

function ChartCard({ title, children }) {
  return (
    <div className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4">
      <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs shadow-xl ${dark ? 'bg-[#161B22] border-[#21262D] text-gray-200' : 'bg-white border-gray-200 text-gray-700'}`}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          {p.name}: <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function RecentRow({ name, sub, badge, time, color = 'text-blue-400' }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b dark:border-[#21262D]/60 border-gray-100 last:border-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} style={{ background: 'currentColor' }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium dark:text-gray-200 text-gray-700 truncate">{name}</div>
        {sub && <div className="text-[10px] dark:text-gray-500 text-gray-400 truncate">{sub}</div>}
      </div>
      <div className="flex items-center gap-1.5">
        {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">{badge}</span>}
        <span className="text-[10px] dark:text-gray-600 text-gray-400 flex-shrink-0 flex items-center gap-1"><Clock size={9} />{formatRelative(time)}</span>
      </div>
    </div>
  )
}

export default function LecturerOverviewPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { dark } = useTheme()
  const grid = dark ? '#21262D' : '#e0f0ff'
  const axis = dark ? '#6E7681' : '#93c5fd'

  useEffect(() => {
    getLecturerDashboard()
      .then(r => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const s = data?.stats ?? data ?? {}
  const trendData = data?.submissionTrend || []
  const statusData = data?.submissionStatus || []
  const hasStatusData = statusData.some(d => d.value > 0)
  const hasTrendData = trendData.some(d => d.submitted > 0 || d.graded > 0)

  return (
    <div className="space-y-4 max-w-screen-2xl">
      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden border dark:border-[#21262D] border-blue-100 p-5"
        style={{ background: dark ? 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #0c1929 100%)' : 'linear-gradient(135deg, #EFF8FF 0%, #DBEAFE 50%, #E0F2FE 100%)' }}>
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3B9EE8, transparent)' }} />
        <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-blue-400" />
              <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Lecturer Portal</span>
            </div>
            <h2 className="text-base font-bold dark:text-white text-gray-900 mb-1">Xin chào, Giảng viên! 👋</h2>
            <p className="text-xs dark:text-gray-400 text-blue-700">Quản lý lớp học và tạo nội dung giảng dạy với AI.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block mr-1.5" />
              <span className="text-xs font-medium text-blue-400">AI sẵn sàng</span>
            </div>
          </div>
        </div>
      </div>

      <PageHeader
        title="Tổng quan"
        description="Thống kê hoạt động giảng dạy"
        stats={[
          { label: 'Bài nộp chờ', value: s.pendingSubmissions ?? '—', color: 'text-blue-500' },
          { label: 'Đã chấm', value: s.gradedSubmissions ?? '—', color: 'text-emerald-500' },
        ]}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <LecturerStatCard icon={GraduationCap} label="Lớp học"    value={loading ? null : (s.totalClasses    ?? 0)}  sub="đang phụ trách"  accent="blue"   loading={loading} />
        <LecturerStatCard icon={BookOpen}      label="Môn học"    value={loading ? null : (s.totalSubjects   ?? 0)}  sub="được phân công"  accent="sky"    loading={loading} />
        <LecturerStatCard icon={FileText}      label="Bài học"    value={loading ? null : (s.totalLessons    ?? 0)} sub="đã tạo"          accent="violet" loading={loading} />
        <LecturerStatCard icon={ClipboardList} label="Bài tập"    value={loading ? null : (s.totalAssignments ?? 0)} sub="đã giao"        accent="orange" loading={loading} />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-2 gap-3">
        <LecturerStatCard icon={Inbox}         label="Chờ chấm"   value={loading ? null : (s.pendingSubmissions ?? 0)} sub="bài nộp"       accent="amber"  loading={loading} />
        <LecturerStatCard icon={CheckCircle2}  label="Đã chấm"    value={loading ? null : (s.gradedSubmissions ?? 0)} sub="bài nộp"      accent="green"  loading={loading} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-3">
        <ChartCard title="Xu hướng nộp & chấm bài (6 tuần)" >
          {loading ? (
            <Sk className="h-[150px] w-full rounded-lg" />
          ) : hasTrendData ? (
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={trendData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
                <defs>
                  <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3B9EE8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B9EE8" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34D399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="week" tick={{ fontSize:10, fill:axis }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:axis }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />} />
                <Area type="monotone" dataKey="submitted" name="Nộp" stroke="#3B9EE8" strokeWidth={1.5} fill="url(#gSub)" dot={false} />
                <Area type="monotone" dataKey="graded"    name="Chấm" stroke="#34D399" strokeWidth={1.5} fill="url(#gGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-xs dark:text-gray-500 text-gray-400">
              Không có dữ liệu xu hướng nộp bài
            </div>
          )}
          {hasTrendData && (
            <div className="flex gap-4 mt-2">
              {[{c:'#3B9EE8',l:'Nộp bài'},{c:'#34D399',l:'Đã chấm'}].map(x => (
                <div key={x.l} className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{background:x.c}} /><span className="text-[10px] dark:text-gray-500 text-gray-400">{x.l}</span></div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Pie */}
        <ChartCard title="Trạng thái bài nộp">
          {loading ? (
            <Sk className="h-[150px] w-full rounded-lg" />
          ) : hasStatusData ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value">
                  {statusData.map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip dark={dark} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-xs dark:text-gray-500 text-gray-400">
              Không có dữ liệu trạng thái bài nộp
            </div>
          )}
          {hasStatusData && (
            <div className="flex flex-col gap-1.5 mt-1">
              {statusData.map(r => (
                <div key={r.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{background:r.color}} /><span className="text-[10px] dark:text-gray-400 text-gray-500">{r.name}</span></div>
                  <span className="text-[10px] font-bold dark:text-gray-300 text-gray-600">{r.value}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Recent assignments */}
        <ChartCard title="Bài tập gần đây">
          {loading ? (
            <div className="space-y-2">{[1,2,3,4].map(i => <Sk key={i} className="h-8 w-full rounded-lg" />)}</div>
          ) : (data?.recentAssignments ?? []).length === 0 ? (
            <p className="text-xs dark:text-gray-600 text-gray-400 text-center py-6">Chưa có bài tập.</p>
          ) : (
            (data?.recentAssignments ?? []).map((a, i) => (
              <RecentRow key={i} name={a.title} sub={a.className} badge={a.status} time={a.createdAt} color="text-blue-400" />
            ))
          )}
          <a href="/lecturer/assignments" className="block text-center text-[10px] text-blue-400 hover:text-blue-300 mt-3">Xem tất cả →</a>
        </ChartCard>
      </div>

      {/* Recent submissions */}
      <ChartCard title="Bài nộp gần đây">
        <div className="flex items-center justify-between mb-2"><span /><a href="/lecturer/submissions" className="text-[10px] text-blue-400 hover:text-blue-300">Xem tất cả →</a></div>
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i=><Sk key={i} className="h-7 w-full rounded" />)}</div>
        ) : (data?.recentSubmissions ?? []).length === 0 ? (
          <p className="text-xs dark:text-gray-600 text-gray-400 text-center py-6">Chưa có bài nộp.</p>
        ) : (
          (data?.recentSubmissions ?? []).map((s, i) => (
            <RecentRow key={i} name={s.studentName ?? 'Sinh viên'} sub={s.assignmentTitle} badge={s.status} time={s.submittedAt} />
          ))
        )}
      </ChartCard>
    </div>
  )
}