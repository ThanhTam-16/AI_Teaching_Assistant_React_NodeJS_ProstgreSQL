import React from 'react'
import { ArrowRight, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-fpt-pastel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA Banner */}
        <div className="relative bg-orange-gradient rounded-3xl p-8 sm:p-12 mb-16 overflow-hidden animate-on-scroll">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 text-center">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
              Sẵn sàng nâng cao chất lượng giảng dạy?
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              Tham gia cùng các giảng viên FPT đang sử dụng AITA để tiết kiệm thời gian và tập trung vào điều quan trọng nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="group flex items-center justify-center gap-2 px-6 py-3 bg-white text-fpt-orange font-semibold rounded-xl hover:bg-fpt-cream transition-all duration-200">
                Bắt đầu ngay hôm nay
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white hover:bg-white/10 transition-all duration-200">
                Đặt lịch demo
              </button>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="text-center mb-10 animate-on-scroll">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Liên hệ với chúng tôi</h2>
          <p className="text-gray-500 text-sm">Có câu hỏi về AITA? Chúng tôi luôn sẵn sàng hỗ trợ.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: <Mail size={20} className="text-fpt-orange" />,
              label: 'Email',
              value: 'aita@fpt.edu.vn',
              sub: 'Phản hồi trong 24 giờ',
            },
            {
              icon: <MapPin size={20} className="text-fpt-orange" />,
              label: 'Địa chỉ',
              value: 'FPT University',
              sub: 'Quy Nhon, Bình Định, Việt Nam',
            },
            {
              icon: <MessageCircle size={20} className="text-fpt-orange" />,
              label: 'Hỗ trợ trực tiếp',
              value: 'Chat với chúng tôi',
              sub: 'Thứ 2 – Thứ 6, 8:00 – 17:00',
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-fpt-pale p-5 flex items-start gap-4 hover:shadow-orange-sm transition-all animate-on-scroll"
            >
              <div className="w-10 h-10 rounded-xl bg-fpt-pastel flex items-center justify-center flex-shrink-0">
                {c.icon}
              </div>
              <div>
                <div className="text-[11px] text-gray-400 font-medium mb-0.5">{c.label}</div>
                <div className="font-semibold text-gray-800 text-sm">{c.value}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}