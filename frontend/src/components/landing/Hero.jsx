import React, { useEffect, useRef } from 'react'
import { ArrowRight, Sparkles, GraduationCap, BookOpen, BarChart3 } from 'lucide-react'

const FLOATING_CARDS = [
  {
    icon: <Sparkles size={16} className="text-fpt-orange" />,
    label: 'Tạo slide AI',
    sub: 'Dựa trên CLO',
    delay: '0s',
    pos: 'top-8 -left-4 sm:top-12 sm:-left-8',
  },
  {
    icon: <BookOpen size={16} className="text-emerald-500" />,
    label: 'Bài tập tự động',
    sub: 'Theo từng bài học',
    delay: '0.8s',
    pos: 'top-8 -right-4 sm:top-16 sm:-right-8',
  },
  {
    icon: <BarChart3 size={16} className="text-blue-500" />,
    label: 'Phân tích code',
    sub: 'Đánh giá thông minh',
    delay: '1.6s',
    pos: 'bottom-16 -left-2 sm:bottom-20 sm:-left-10',
  },
  {
    icon: <GraduationCap size={16} className="text-purple-500" />,
    label: 'Phản hồi cá nhân',
    sub: 'Cải thiện hiệu quả',
    delay: '0.4s',
    pos: 'bottom-8 -right-2 sm:bottom-12 sm:-right-8',
  },
]

export default function Hero() {
  const badgeRef = useRef(null)

  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern pt-16"
    >
      {/* Decorative blobs */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-fpt-pale rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fpt-light/20 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fpt-pale border border-fpt-light/50 mb-6 animate-on-scroll"
            >
              <span className="w-2 h-2 rounded-full bg-fpt-orange animate-pulse" />
              <span className="text-xs font-semibold text-fpt-orange tracking-wide uppercase">
                FPT University · SU2026
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 mb-5 animate-on-scroll animation-delay-100">
              Trợ giảng thông minh{' '}
              <span className="relative inline-block">
                <span className="text-fpt-orange">AI</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 100 6"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,4 Q25,0 50,4 Q75,8 100,4"
                    stroke="#FBBF80"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              cho giảng viên FPT
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0 animate-on-scroll animation-delay-200">
              AITA tự động hoá việc tạo slide, bài tập và đánh giá sinh viên — giúp giảng viên tập trung vào điều quan trọng nhất:{' '}
              <span className="text-fpt-orange font-semibold">nâng cao chất lượng giảng dạy</span>.
            </p>

            {/* Stats row */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-8 animate-on-scroll animation-delay-300">
              {[
                { value: '3–5s', label: 'Phản hồi AI' },
                { value: '4+', label: 'Module AI' },
                { value: '100%', label: 'Responsive' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display font-bold text-xl text-fpt-orange">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 animate-on-scroll animation-delay-400">
              <button className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-fpt-orange text-white font-semibold rounded-xl shadow-orange-md hover:bg-primary-700 hover:shadow-orange-lg transition-all duration-200 animate-pulse-orange">
                Bắt đầu miễn phí
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-fpt-light hover:text-fpt-orange hover:bg-fpt-pastel transition-all duration-200">
                Xem demo
              </button>
            </div>

            {/* Trust note */}
            <p className="mt-5 text-xs text-gray-400 animate-on-scroll animation-delay-500">
              Dành riêng cho giảng viên & sinh viên FPT University · Không yêu cầu cài đặt
            </p>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="relative flex justify-center lg:justify-end animate-on-scroll animation-delay-200">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Main card */}
              <div className="relative bg-white rounded-2xl shadow-orange-lg border border-fpt-pale overflow-hidden">
                {/* Card header */}
                <div className="bg-orange-gradient px-5 py-4 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  </div>
                  <div className="flex-1 bg-white/20 rounded-md h-5 flex items-center px-2">
                    <span className="text-white/80 text-[10px]">aita.fpt.edu.vn/dashboard</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  {/* Welcome */}
                  <div>
                    <div className="text-[11px] text-gray-400 font-medium mb-1">Xin chào, Giảng viên 👋</div>
                    <div className="font-display font-bold text-gray-800 text-sm">
                      Lớp SE1234 – Lập trình Web
                    </div>
                  </div>

                  {/* AI action pills */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '✨ Tạo slide', bg: 'bg-fpt-pastel text-fpt-orange' },
                      { label: '📝 Tạo bài tập', bg: 'bg-emerald-50 text-emerald-600' },
                      { label: '📊 Xem tiến độ', bg: 'bg-blue-50 text-blue-600' },
                    ].map((pill) => (
                      <span key={pill.label} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${pill.bg}`}>
                        {pill.label}
                      </span>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2.5">
                    <div className="text-[11px] font-semibold text-gray-600 mb-1">Tiến độ sinh viên</div>
                    {[
                      { name: 'Nguyễn Văn A', pct: 85, color: 'bg-fpt-orange' },
                      { name: 'Trần Thị B', pct: 72, color: 'bg-amber-400' },
                      { name: 'Lê Minh C', pct: 58, color: 'bg-fpt-light' },
                    ].map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-fpt-pale flex items-center justify-center text-[9px] font-bold text-fpt-orange flex-shrink-0">
                          {s.name.split(' ').pop()[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-gray-600">{s.name}</span>
                            <span className="text-[10px] font-semibold text-gray-700">{s.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${s.color} rounded-full`}
                              style={{ width: `${s.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI generating badge */}
                  <div className="flex items-center gap-2 bg-fpt-pastel rounded-xl px-3 py-2.5">
                    <div className="w-6 h-6 rounded-full bg-orange-gradient flex items-center justify-center flex-shrink-0">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-gray-700">AI đang tạo slide…</div>
                      <div className="text-[10px] text-gray-400">Chương 3 – RESTful API Design</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-fpt-orange animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              {FLOATING_CARDS.map((card) => (
                <div
                  key={card.label}
                  className={`absolute ${card.pos} bg-white rounded-xl shadow-orange-md border border-fpt-pale px-3 py-2 flex items-center gap-2 animate-float`}
                  style={{ animationDelay: card.delay }}
                >
                  <div className="w-7 h-7 rounded-lg bg-fpt-pastel flex items-center justify-center flex-shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-700">{card.label}</div>
                    <div className="text-[9px] text-gray-400">{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full">
          <path d="M0,30 Q360,60 720,30 Q1080,0 1440,30 L1440,60 L0,60 Z" fill="#FFF5EE" />
        </svg>
      </div>
    </section>
  )
}