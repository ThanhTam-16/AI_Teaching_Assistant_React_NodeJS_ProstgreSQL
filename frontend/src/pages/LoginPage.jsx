import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle, BookOpen, ClipboardList, BarChart3, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { loginApi } from '../services/auth.api'
import { getRoleRedirectPath } from '../utils/roleRedirect'

// ── Decorative floating card ──────────────────────────────────────────────────
function FloatingCard({ className, style, children }) {
  return (
    <div style={style} className={`absolute bg-white/80 backdrop-blur-sm border border-fpt-pale rounded-2xl px-3 py-2 shadow-card flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [show,    setShow]    = useState(false)         // show password
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [shake,   setShake]   = useState(false)

  const from = location.state?.from?.pathname || null

  const handleChange = (e) => {
    setError('')
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.')
      triggerShake()
      return
    }

    setLoading(true)
    setError('')

    try {
      const res  = await loginApi({ email: form.email, password: form.password })
      const { token, user } = res.data.data

      login(token, user)

      // Redirect: back to where they came from, or role dashboard
      const dest = from || getRoleRedirectPath(user.role)
      navigate(dest, { replace: true })

    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Email hoặc mật khẩu không đúng.' : 'Đã có lỗi xảy ra, thử lại sau.')
      setError(msg)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-auth-pattern bg-fpt-pastel flex">

      {/* ── Left panel — decorative ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-fpt-pastel via-fpt-cream to-fpt-pale items-center justify-center p-12">

        {/* Soft blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-fpt-pale rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-fpt-light/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

        {/* Slow spinning ring */}
        <div className="absolute w-[420px] h-[420px] rounded-full border-2 border-dashed border-fpt-light/40 animate-spin-slow pointer-events-none" />

        {/* Center content */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo mark */}
          <div className="inline-flex items-center gap-3 mb-8">
            <img
                src="/logo/logo.png"
                alt="FPT logo"
                className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="text-left">
              <div className="font-display font-bold text-fpt-orange text-xl leading-tight">AITA</div>
              <div className="text-gray-400 text-xs">AI Teaching Assistant</div>
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3 leading-snug">
            Chào mừng trở lại<br />
            <span className="text-fpt-orange">FPT University</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hệ thống trợ giảng thông minh dành cho giảng viên và sinh viên FPT — được hỗ trợ bởi AI.
          </p>

          {/* Floating cards — decorative demo */}
          <div className="relative mt-10 h-44">
            <FloatingCard className="top-0 left-0 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-7 h-7 rounded-lg bg-fpt-pastel flex items-center justify-center flex-shrink-0">
                <BookOpen size={14} className="text-fpt-orange" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Slide AI</div>
                <div className="text-[9px] text-gray-400">Tự động theo CLO</div>
              </div>
            </FloatingCard>

            <FloatingCard className="top-4 right-0 animate-float" style={{ animationDelay: '0.8s' }}>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Bài tập AI</div>
                <div className="text-[9px] text-gray-400">Theo từng bài học</div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-0 left-4 animate-float" style={{ animationDelay: '1.4s' }}>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={14} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Phân tích code</div>
                <div className="text-[9px] text-gray-400">Đánh giá thông minh</div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-2 right-2 animate-float" style={{ animationDelay: '0.4s' }}>
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={14} className="text-purple-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Phản hồi cá nhân</div>
                <div className="text-[9px] text-gray-400">Cải thiện hiệu quả</div>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Back to landing */}
        <Link
          to="/"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-x text-gray-400 hover:text-fpt-orange transition-colors flex items-center gap-1"
        >
          ← Về trang chủ
        </Link>
      </div>

      {/* ── Right panel — login form ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-17 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo/logo.png" alt="FPT logo" className="h-10 w-auto" />
            </div>
            <span className="font-display font-bold text-fpt-orange text-lg">AITA</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Đăng nhập</h1>
            <p className="text-gray-500 text-sm">Nhập thông tin tài khoản FPT của bạn để tiếp tục</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Error banner */}
            {error && (
              <div className={`flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm ${shake ? 'animate-shake' : ''}`}>
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@fpt.edu.vn"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-fpt-orange/30 focus:border-fpt-orange transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-fpt-orange/30 focus:border-fpt-orange transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-fpt-orange transition-colors"
                  aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-xs text-fpt-orange hover:underline font-medium">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3 bg-fpt-orange text-white font-semibold text-sm rounded-xl shadow-orange-sm hover:bg-primary-700 hover:shadow-orange-md active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập…
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">hoặc</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Info note */}
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            Tài khoản được cấp bởi{' '}
            <span className="font-semibold text-fpt-orange">FPT University</span>.<br />
            Liên hệ quản trị viên nếu bạn chưa có tài khoản.
          </p>

          {/* Mobile — back to home */}
          <div className="lg:hidden mt-8 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-fpt-orange transition-colors">
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}