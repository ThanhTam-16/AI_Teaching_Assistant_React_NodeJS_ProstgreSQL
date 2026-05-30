import React, { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Users, ClipboardList, CheckCircle2, Clock, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react'
import { getOverviewReport, getClassReport } from '../../../services/report.api'
import { getLecturerClasses } from '../../../services/class.api'
import { PageHeader, Sk } from '../components/LecturerUI'
import LecturerStatCard from '../components/LecturerStatCard'
import { useTheme } from '../../../contexts/ThemeContext'

// Mock fallback data
const MOCK_SCORE_DIST = [
  { range: '0-4',   count: 3  },
  { range: '5-6',   count: 12 },
  { range: '6-7',   count: 18 },
  { range: '7-8',   count: 25 },
  { range: '8-9',   count: 16 },
  { range: '9-10',  count: 8  },
]

const MOCK_SUBMISSION_STATUS = [
  { name: 'Đã nộp & chấm', value: 45, color: '#34D399' },
  { name: 'Nộp chờ chấm',  value: 18, color: '#3B9EE8' },
  { name: 'Chưa nộp',      value: 12, color: '#FB7185' },
]

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/80 rounded-xl p-4 ${className}`}>
      <h3 className="text-xs font-bold dark:text-gray-300 text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label, dark }) {
  if (!active || !payload?.length) return null
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs shadow-xl ${dark
      ? 'bg-[#161B22] border-[#21262D] text-gray-200'
      : 'bg-white border-gray-200 text-gray-700'}`}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          {p.name}: <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function StudentNeedHelpRow({ student }) {
  return (
    <div className="flex items-center gap-2.5 py-2 border-b dark:border-[#21262D]/60 border-gray-100 last:border-0">
      <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-400/20 flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-bold text-rose-400">{student.name?.[0]?.toUpperCase() ?? 'S'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium dark:text-gray-200 text-gray-700 truncate">{student.name}</div>
        <div className="text-[10px] dark:text-gray-500 text-gray-400">{student.reason ?? 'Điểm thấp hoặc chưa nộp bài'}</div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-rose-400">{student.avgScore ?? '?'}</span>
        <span className="text-[10px] dark:text-gray-600 text-gray-400">/ 10</span>
      </div>
    </div>
  )
}

export default function LecturerReportPage() {
  const [overview, setOverview] = useState(null)
  const [classReport, setClassReport] = useState(null)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(true)
  const [classLoading, setClassLoading] = useState(false)
  const { dark } = useTheme()

  const grid = dark ? '#21262D' : '#e0f0ff'
  const axis = dark ? '#6E7681' : '#93c5fd'

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    try {
      const [oRes, cRes] = await Promise.all([
        getOverviewReport(),
        getLecturerClasses(),
      ])
      setOverview(oRes.data.data)
      const cls = cRes.data.data?.classes ?? cRes.data.data ?? []
      setClasses(cls)
      if (cls.length > 0 && !selectedClass) setSelectedClass(cls[0].id)
    } catch { setOverview(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOverview() }, [fetchOverview])

  useEffect(() => {
    if (!selectedClass) return
    setClassLoading(true)
    getClassReport(selectedClass)
      .then(r => setClassReport(r.data.data))
      .catch(() => setClassReport(null))
      .finally(() => setClassLoading(false))
  }, [selectedClass])

  const o = overview ?? {}
  const cr = classReport ?? {}

  const scoreData = cr.scoreDistribution ?? MOCK_SCORE_DIST
  const statusData = cr.submissionStatus ?? MOCK_SUBMISSION_STATUS
  const needHelp   = cr.studentsNeedHelp ?? []

  return (
    <div className="space-y-4 max-w-screen-2xl">
      <PageHeader
        title="Báo cáo"
        description="Thống kê tổng quan hoạt động giảng dạy"
        actions={
          <button onClick={fetchOverview} disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs dark:text-gray-400 text-gray-500 border dark:border-[#21262D] border-gray-200 rounded-lg dark:hover:bg-[#21262D] hover:bg-gray-50 transition-all disabled:opacity-40">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Làm mới
          </button>
        }
      />

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <LecturerStatCard icon={Users}         label="Sinh viên"      value={loading ? null : (o.totalStudents    ?? '—')} accent="blue"   loading={loading} />
        <LecturerStatCard icon={ClipboardList} label="Bài đã giao"    value={loading ? null : (o.totalAssignments ?? '—')} accent="sky"    loading={loading} />
        <LecturerStatCard icon={CheckCircle2}  label="Đã nộp"         value={loading ? null : (o.totalSubmitted   ?? '—')} accent="green"  loading={loading} />
        <LecturerStatCard icon={Clock}         label="Chưa nộp"       value={loading ? null : (o.totalPending     ?? '—')} accent="amber"  loading={loading} />
        <LecturerStatCard icon={BarChart3}     label="Đã chấm"        value={loading ? null : (o.totalGraded      ?? '—')} accent="violet" loading={loading} />
        <LecturerStatCard icon={AlertTriangle} label="Điểm TB"        value={loading ? null : (o.avgScore != null ? `${Number(o.avgScore).toFixed(1)}` : '—')} accent="orange" loading={loading} />
      </div>

      {/* Class selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold dark:text-gray-400 text-gray-500 uppercase tracking-wide">Chọn lớp:</label>
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-blue-100 rounded-lg px-3 py-1.5 text-xs dark:text-gray-200 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400/50 transition-all"
        >
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {classLoading && <div className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />}
      </div>

      {/* Class-level charts */}
      <div className="grid lg:grid-cols-3 gap-3">

        {/* Bar chart - score distribution */}
        <ChartCard title="Phân bố điểm số" className="lg:col-span-2">
          {classLoading ? <Sk className="h-44 w-full" /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={scoreData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: axis }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                  <Bar dataKey="count" name="Sinh viên" radius={[4,4,0,0]}>
                    {scoreData.map((_, i) => (
                      <Cell key={i} fill={
                        i < 2 ? '#FB7185' : i < 3 ? '#FBBF24' : i < 5 ? '#3B9EE8' : '#34D399'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                {[{ c:'#FB7185',l:'Dưới TB' },{ c:'#3B9EE8',l:'Đạt' },{ c:'#34D399',l:'Giỏi' }].map(x => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: x.c }} />
                    <span className="text-[10px] dark:text-gray-500 text-gray-400">{x.l}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Pie - submission status */}
        <ChartCard title="Trạng thái bài nộp">
          {classLoading ? <Sk className="h-44 w-full" /> : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                    {statusData.map((e, i) => <Cell key={i} fill={e.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip dark={dark} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-1">
                {statusData.map(r => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                      <span className="text-[10px] dark:text-gray-400 text-gray-500">{r.name}</span>
                    </div>
                    <span className="text-[10px] font-bold dark:text-gray-300 text-gray-600">{r.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Class summary cards */}
      {!classLoading && cr && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Tổng sinh viên',   value: cr.totalStudents    ?? '—', accent: 'blue'   },
            { label: 'Đã nộp bài',       value: cr.totalSubmitted   ?? '—', accent: 'green'  },
            { label: 'Chưa nộp',         value: cr.totalPending     ?? '—', accent: 'amber'  },
            { label: 'Điểm trung bình',  value: cr.avgScore != null ? Number(cr.avgScore).toFixed(1) : '—', accent: 'violet' },
          ].map(s => (
            <div key={s.label}
              className="dark:bg-[#161B22]/60 bg-white border dark:border-[#21262D] border-blue-100/60 rounded-xl p-3 text-center">
              <div className="text-[10px] uppercase tracking-wide dark:text-gray-500 text-gray-400 mb-1">{s.label}</div>
              <div className={`text-xl font-bold ${
                s.accent === 'blue' ? 'dark:text-blue-300 text-blue-600' :
                s.accent === 'green' ? 'dark:text-emerald-300 text-emerald-600' :
                s.accent === 'amber' ? 'dark:text-amber-300 text-amber-600' :
                'dark:text-violet-300 text-violet-600'
              }`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Students needing help */}
      <ChartCard title="Sinh viên cần hỗ trợ">
        {classLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <Sk key={i} className="h-8 w-full rounded-lg" />)}</div>
        ) : needHelp.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
            <div className="text-xs dark:text-gray-500 text-gray-400">Tất cả sinh viên đang học tốt!</div>
          </div>
        ) : (
          <div>
            {needHelp.map((s, i) => <StudentNeedHelpRow key={s.id ?? i} student={s} />)}
          </div>
        )}
      </ChartCard>
    </div>
  )
}