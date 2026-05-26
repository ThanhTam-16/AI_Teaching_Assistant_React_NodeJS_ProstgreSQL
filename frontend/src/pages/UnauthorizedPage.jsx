import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { getRoleRedirectPath } from '../utils/roleRedirect'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-fpt-pastel flex items-center justify-center p-6">
      <div className="text-center max-w-sm animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={28} className="text-red-400" />
        </div>
        <h1 className="font-display font-bold text-xl text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-500 text-sm mb-6">Bạn không có quyền truy cập trang này.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {user && (
            <Link
              to={getRoleRedirectPath(user.role)}
              className="px-5 py-2.5 bg-fpt-orange text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-orange-sm"
            >
              Về Dashboard
            </Link>
          )}
          <Link to="/" className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-fpt-light hover:text-fpt-orange transition-all">
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}