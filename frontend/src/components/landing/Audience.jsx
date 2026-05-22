import React from 'react'
import { GraduationCap, UserCog, Settings } from 'lucide-react'

const ROLES = [
  {
    icon: <GraduationCap size={28} className="text-fpt-orange" />,
    role: 'Giảng viên',
    badge: 'Lecturer',
    tagline: 'Giảng dạy hiệu quả hơn với AI',
    bgFrom: 'from-fpt-pale',
    border: 'border-fpt-light/50',
    accent: 'text-fpt-orange',
    features: [
      'Tạo slide tự động theo CLO',
      'Thiết kế bài tập chỉ trong vài giây',
      'Xem kết quả AI đánh giá sinh viên',
      'Quản lý lớp và điểm số tập trung',
      'Nhận báo cáo hiệu suất chi tiết',
    ],
    cta: 'Đăng ký giảng viên',
    ctaStyle: 'bg-fpt-orange text-white hover:bg-primary-700 shadow-orange-md',
  },
  {
    icon: <UserCog size={28} className="text-blue-500" />,
    role: 'Sinh viên',
    badge: 'Student',
    tagline: 'Học tập cá nhân hoá, hiệu quả hơn',
    bgFrom: 'from-blue-50',
    border: 'border-blue-100',
    accent: 'text-blue-600',
    features: [
      'Truy cập slide AI mọi lúc mọi nơi',
      'Nhận bài tập và thông báo tức thì',
      'Nộp bài tập và code trực tuyến',
      'Xem phản hồi và gợi ý cải thiện',
      'Theo dõi tiến độ học tập cá nhân',
    ],
    cta: 'Khám phá portal sinh viên',
    ctaStyle: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md',
  },
  {
    icon: <Settings size={28} className="text-slate-500" />,
    role: 'Quản trị viên',
    badge: 'Admin',
    tagline: 'Kiểm soát toàn bộ hệ thống',
    bgFrom: 'from-slate-50',
    border: 'border-slate-200',
    accent: 'text-slate-600',
    features: [
      'Quản lý tài khoản giảng viên & sinh viên',
      'Cấu hình các module AI',
      'Giám sát toàn bộ hệ thống',
      'Quản lý dữ liệu phỏng vấn & bài tập',
      'Báo cáo sử dụng hệ thống',
    ],
    cta: 'Truy cập Admin Portal',
    ctaStyle: 'bg-slate-700 text-white hover:bg-slate-800 shadow-md',
  },
]

export default function Audience() {
  return (
    <section id="audience" className="py-20 bg-fpt-pastel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 animate-on-scroll">
          <span className="inline-block px-3 py-1 rounded-full bg-fpt-pale border border-fpt-light/40 text-fpt-orange text-xs font-semibold uppercase tracking-wide mb-3">
            Đối tượng
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-3">
            AITA phục vụ ai?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Hệ thống được thiết kế riêng cho từng vai trò trong hệ sinh thái giáo dục FPT.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {ROLES.map((r, i) => (
            <div
              key={r.role}
              className={`relative bg-gradient-to-b ${r.bgFrom} to-white rounded-2xl border ${r.border} p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-on-scroll flex flex-col`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Badge */}
              <div className="absolute top-5 right-5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border ${r.border} ${r.accent}`}>
                  {r.badge}
                </span>
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-white border ${r.border} flex items-center justify-center mb-4 shadow-sm`}>
                {r.icon}
              </div>

              <h3 className="font-display font-bold text-gray-800 text-lg mb-1">{r.role}</h3>
              <p className={`text-sm font-medium mb-4 ${r.accent}`}>{r.tagline}</p>

              <ul className="space-y-2 flex-1 mb-6">
                {r.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="mt-0.5 text-fpt-orange flex-shrink-0">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${r.ctaStyle}`}>
                {r.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}