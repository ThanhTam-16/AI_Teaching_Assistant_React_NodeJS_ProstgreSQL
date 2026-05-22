import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <img
                src="/logo/logofpt.png"
                alt="FPT logo"
                className="h-12 w-auto object-contain bg-transparent"
                />            
                <div>
                <span className="font-display font-bold text-white text-sm">AITA</span>
                <span className="text-gray-500 text-xs ml-2">· AI Teaching Assistant</span>
                </div>
            </div>

          {/* Nav */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs">
            {['Tổng quan', 'Tính năng', 'Quy trình', 'Đối tượng', 'Liên hệ'].map((item) => (
              <a
                key={item}
                href={`#${item === 'Tổng quan' ? 'overview' : item === 'Tính năng' ? 'features' : item === 'Quy trình' ? 'workflow' : item === 'Đối tượng' ? 'audience' : 'contact'}`}
                className="hover:text-fpt-orange transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Legal */}
          <p className="text-xs text-gray-600 text-center sm:text-right">
            © 2026 AITA · FPT University Quy Nhon
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-600">
            Capstone Project SU2026 · Software Engineer · IS Specialty
          </p>
        </div>
      </div>
    </footer>
  )
}