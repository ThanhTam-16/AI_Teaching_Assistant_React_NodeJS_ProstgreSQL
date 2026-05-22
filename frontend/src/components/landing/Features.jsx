import React, { useEffect } from 'react'
import {
  PresentationIcon,
  FileText,
  Code2,
  Brain,
  Users,
  BarChart3,
  Layers,
  Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: <PresentationIcon size={22} />,
    title: 'Tạo slide tự động',
    desc: 'AI tự động sinh nội dung slide theo CLO (Course Learning Outcomes), cấu trúc theo chương và bài học rõ ràng.',
    tag: 'Slide AI',
    color: 'text-fpt-orange bg-fpt-pastel border-fpt-pale',
    tagColor: 'bg-fpt-pale text-fpt-orange',
  },
  {
    icon: <FileText size={22} />,
    title: 'Bài tập thông minh',
    desc: 'Tự động tạo bài tập thực hành cho từng slide hoặc chương học, điều chỉnh độ khó theo trình độ sinh viên.',
    tag: 'Exercise AI',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    tagColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Phân tích code',
    desc: 'Đánh giá bài nộp của sinh viên theo chất lượng code, tính đúng đắn của logic và hiệu năng chương trình.',
    tag: 'Code AI',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    tagColor: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Brain size={22} />,
    title: 'Phản hồi cá nhân hoá',
    desc: 'AI xác định điểm yếu kiến thức của từng sinh viên và đưa ra gợi ý cải thiện, lộ trình học tập phù hợp.',
    tag: 'Feedback AI',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    tagColor: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Users size={22} />,
    title: 'Quản lý lớp học',
    desc: 'Tạo và quản lý lớp, gán môn học, tổ chức sinh viên và theo dõi lịch sử nộp bài một cách có hệ thống.',
    tag: 'Quản lý',
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    tagColor: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Báo cáo & Điểm số',
    desc: 'Quản lý điểm thưởng, tổng hợp điểm và xuất báo cáo hiệu suất học tập chi tiết cho từng sinh viên.',
    tag: 'Điểm số',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    tagColor: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <Layers size={22} />,
    title: 'Cổng sinh viên',
    desc: 'Sinh viên truy cập slide AI, nhận thông báo bài tập, nộp bài và xem phản hồi cải thiện từ hệ thống.',
    tag: 'Student Portal',
    color: 'text-teal-600 bg-teal-50 border-teal-100',
    tagColor: 'bg-teal-50 text-teal-600',
  },
  {
    icon: <Shield size={22} />,
    title: 'Bảo mật & Quy mô',
    desc: 'Kiến trúc có thể mở rộng, bảo mật dữ liệu người dùng và hỗ trợ tích hợp với hệ thống LMS hiện có.',
    tag: 'Hạ tầng',
    color: 'text-slate-600 bg-slate-50 border-slate-100',
    tagColor: 'bg-slate-50 text-slate-600',
  },
]

export default function Features() {
  useEffect(() => {
    const els = document.querySelectorAll('.animate-on-scroll')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-20 bg-fpt-pastel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14 animate-on-scroll">
          <span className="inline-block px-3 py-1 rounded-full bg-fpt-pale border border-fpt-light/40 text-fpt-orange text-xs font-semibold uppercase tracking-wide mb-3">
            Tính năng
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-3">
            Mọi công cụ giảng dạy trong một nền tảng
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Từ tạo nội dung đến đánh giá sinh viên — AITA hỗ trợ toàn bộ quy trình giảng dạy với sức mạnh của AI.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group bg-white rounded-2xl border border-fpt-pale p-5 hover:shadow-orange-md hover:-translate-y-1 transition-all duration-300 animate-on-scroll cursor-default"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${f.color}`}>
                {f.icon}
              </div>
              {/* Tag */}
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${f.tagColor}`}>
                {f.tag}
              </span>
              {/* Title */}
              <h3 className="font-display font-semibold text-gray-800 text-sm mt-2 mb-1.5 group-hover:text-fpt-orange transition-colors">
                {f.title}
              </h3>
              {/* Desc */}
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}