import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StudentSidebar from '../components/StudentSidebar'
import StudentHeader  from '../components/StudentHeader'

export default function StudentLayout() {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden
      dark:bg-[#0D1117] bg-[#FFF8F3]
      dark:text-gray-100 text-gray-900 transition-colors duration-200">
      <StudentSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        <StudentHeader onMobileOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}