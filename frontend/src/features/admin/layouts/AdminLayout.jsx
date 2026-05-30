import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader  from '../components/AdminHeader'

function AdminLayoutInner() {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)

  return (
    <div className="flex h-screen overflow-hidden dark:bg-gray-950 bg-gray-50 dark:text-gray-100 text-gray-900 transition-colors duration-200">

      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main — expands to fill when sidebar collapsed */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        <AdminHeader onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  return <AdminLayoutInner />
}