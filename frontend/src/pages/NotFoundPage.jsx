import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-fpt-pastel flex items-center justify-center p-6">
      <div className="text-center max-w-sm animate-fade-up">
        <div className="font-display font-bold text-8xl text-fpt-pale mb-4 select-none">404</div>
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Trang không tìm thấy</h1>
        <p className="text-gray-500 text-sm mb-6">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-fpt-orange text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-orange-sm"
        >
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}