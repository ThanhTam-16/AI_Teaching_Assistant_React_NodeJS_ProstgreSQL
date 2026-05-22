import React from 'react'
import { Cpu, Layers, Zap, CheckCircle2 } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: <Layers size={20} className="text-fpt-orange" />,
    title: 'Giảng viên tạo lớp & môn học',
    desc: 'Đăng nhập hệ thống, tạo lớp, gán môn học và quản lý danh sách sinh viên một cách dễ dàng.',
    items: ['Tạo và quản lý lớp học', 'Gán sinh viên vào lớp', 'Thiết lập CLO cho môn học'],
  },
  {
    step: '02',
    icon: <Cpu size={20} className="text-fpt-orange" />,
    title: 'AI tạo nội dung tự động',
    desc: 'Nhập yêu cầu, AI tự động sinh slide bài giảng, bài tập thực hành theo đúng CLO đã thiết lập.',
    items: ['Slide đầy đủ theo chương', 'Bài tập điều chỉnh độ khó', 'Nội dung chuẩn theo CLO'],
  },
  {
    step: '03',
    icon: <Zap size={20} className="text-fpt-orange" />,
    title: 'Sinh viên học & nộp bài',
    desc: 'Sinh viên truy cập tài liệu, nhận thông báo bài tập và nộp bài (bao gồm code) lên hệ thống.',
    items: ['Xem slide AI trên portal', 'Nhận thông báo bài tập', 'Nộp bài & code trực tuyến'],
  },
  {
    step: '04',
    icon: <CheckCircle2 size={20} className="text-fpt-orange" />,
    title: 'AI đánh giá & phản hồi',
    desc: 'AI phân tích bài nộp, đánh giá code, chỉ ra điểm yếu và đề xuất lộ trình cải thiện cá nhân hoá.',
    items: ['Phân tích chất lượng code', 'Xác định điểm yếu kiến thức', 'Phản hồi cá nhân hoá'],
  },
]

export default function Overview() {
  return (
    <section id="overview" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 animate-on-scroll">
          <span className="inline-block px-3 py-1 rounded-full bg-fpt-pale border border-fpt-light/40 text-fpt-orange text-xs font-semibold uppercase tracking-wide mb-3">
            Quy trình
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-3">
            Hoạt động đơn giản, hiệu quả cao
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Chỉ 4 bước để có một hệ thống giảng dạy thông minh hoạt động đầy đủ.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-10 left-[calc(12.5%+1.25rem)] right-[calc(12.5%+1.25rem)] h-0.5 bg-gradient-to-r from-fpt-pale via-fpt-light to-fpt-pale" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="relative animate-on-scroll"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {/* Step number bubble */}
                <div className="flex justify-center lg:justify-start mb-4">
                  <div className="relative z-10 w-10 h-10 rounded-full bg-fpt-orange flex items-center justify-center shadow-orange-md">
                    {s.icon}
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-fpt-orange flex items-center justify-center text-[8px] font-bold text-fpt-orange">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-fpt-pale p-5 hover:shadow-orange-sm transition-all duration-200">
                  <div className="font-display font-bold text-fpt-orange/30 text-2xl mb-2">{s.step}</div>
                  <h3 className="font-display font-semibold text-gray-800 text-sm mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="mt-0.5 w-3.5 h-3.5 rounded-full bg-fpt-pastel flex items-center justify-center flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-fpt-orange" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}