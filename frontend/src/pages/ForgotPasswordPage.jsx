import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2, Send, ShieldCheck, Lock } from 'lucide-react'

// ── Decorative floating card ──────────────────────────────────────────────────
function FloatingCard({ className, style, children }) {
  return (
    <div style={style} className={`absolute bg-white/80 backdrop-blur-sm border border-fpt-pale rounded-2xl px-3 py-2 shadow-card flex items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}

// ── Step 1: Enter email ───────────────────────────────────────────────────────
function StepEmail({ onSubmit, loading }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handle = (e) => {
    e.preventDefault()
    if (!email) { setError('Vui lòng nhập email của bạn.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email không hợp lệ.'); return }
    onSubmit(email)
  }

  return (
    <form onSubmit={handle} noValidate className="animate-fade-up">
      <div className="mb-8">
        
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Quên mật khẩu?</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
        </p>
      </div>

      {/* Email input */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="reset-email">
          Địa chỉ email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder="example@fpt.edu.vn"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-fpt-orange/30 focus:border-fpt-orange transition-all"
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>

      {/* Note about feature */}
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-xs text-amber-700">
        <span className="text-base mt-0.5">⚠️</span>
        <span>
          Tính năng đặt lại mật khẩu qua email đang được phát triển. Vui lòng liên hệ quản trị viên để được hỗ trợ.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group w-full flex items-center justify-center gap-2 py-3 bg-fpt-orange text-white font-semibold text-sm rounded-xl shadow-orange-sm hover:bg-primary-700 hover:shadow-orange-md active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Đang gửi…
          </>
        ) : (
          <>
            <Send size={15} />
            Gửi hướng dẫn
          </>
        )}
      </button>
    </form>
  )
}

// ── Step 2: Success state ─────────────────────────────────────────────────────
function StepSuccess({ email }) {
  return (
    <div className="animate-fade-up text-center">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
      </div>
      <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Yêu cầu đã được ghi nhận!</h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-2">
        Nếu <span className="font-semibold text-gray-700">{email}</span> tồn tại trong hệ thống, chúng tôi sẽ liên hệ trong thời gian sớm nhất.
      </p>
      <p className="text-gray-400 text-xs mb-8">
        Trong lúc đó, bạn có thể liên hệ trực tiếp quản trị viên hệ thống qua email{' '}
        <span className="text-fpt-orange font-medium">aita@fpt.edu.vn</span>.
      </p>
      <Link
        to="/login"
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-fpt-orange text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-orange-sm"
      >
        Quay lại đăng nhập
      </Link>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [step,    setStep]    = useState('email')   // 'email' | 'success'
  const [loading, setLoading] = useState(false)
  const [sentTo,  setSentTo]  = useState('')

  const handleSubmitEmail = async (email) => {
    setLoading(true)
    // Simulate a small delay (no real endpoint yet)
    await new Promise((r) => setTimeout(r, 1200))
    setSentTo(email)
    setStep('success')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-auth-pattern bg-fpt-pastel flex">

      {/* ── Left panel — decorative ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-fpt-pastel via-fpt-cream to-fpt-pale items-center justify-center p-12">
        <div className="absolute top-10 left-10 w-64 h-64 bg-fpt-pale rounded-full blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-fpt-light/30 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute w-[420px] h-[420px] rounded-full border-2 border-dashed border-fpt-light/40 animate-spin-slow pointer-events-none" />

        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-17 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/logo/logo.png" alt="FPT logo" className="h-12 w-auto" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-fpt-orange text-xl">AITA</div>
              <div className="text-gray-400 text-xs">AI Teaching Assistant</div>
            </div>
          </div>

          <h2 className="font-display font-bold text-2xl text-gray-800 mb-3 leading-snug">
            Bảo mật tài khoản<br />
            <span className="text-fpt-orange">luôn được ưu tiên</span>
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Chúng tôi giúp bạn lấy lại quyền truy cập một cách an toàn và nhanh chóng.
          </p>

          <div className="relative mt-6 h-52">
            <FloatingCard className="top-0 left-0 animate-float" style={{ animationDelay: '0s' }}>
              <div className="w-7 h-7 rounded-lg bg-fpt-pastel flex items-center justify-center flex-shrink-0">
                <Mail size={14} className="text-fpt-orange" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Email</div>
                <div className="text-[9px] text-gray-400">Gửi mã xác thực nhanh chóng</div>
              </div>
            </FloatingCard>

            <FloatingCard className="top-4 right-0 animate-float" style={{ animationDelay: '0.8s' }}>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={14} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">OTP</div>
                <div className="text-[9px] text-gray-400">Xác thực an toàn</div>
              </div>
            </FloatingCard>

            <FloatingCard className="bottom-0 left-4 animate-float" style={{ animationDelay: '1.4s' }}>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Lock size={14} className="text-blue-600" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-gray-700">Mật khẩu mới</div>
                <div className="text-[9px] text-gray-400">An toàn và dễ nhớ</div>
              </div>
            </FloatingCard>
          </div>
        </div>

        <Link to="/" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-x text-gray-400 hover:text-fpt-orange transition-colors">
          ← Về trang chủ
        </Link>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-17 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo/logo.png" alt="FPT logo" className="h-10 w-auto" />
            </div>
            <span className="font-display font-bold text-fpt-orange text-lg">AITA</span>
          </div>

          {/* Back to login */}
          {step === 'email' && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-fpt-orange transition-colors mb-6 group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại đăng nhập
            </Link>
          )}

          {step === 'email'
            ? <StepEmail onSubmit={handleSubmitEmail} loading={loading} />
            : <StepSuccess email={sentTo} />
          }

          {/* Mobile back to home */}
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