import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import LecturerSidebar from '../components/LecturerSidebar'
import LecturerHeader  from '../components/LecturerHeader'

function LayoutInner() {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden dark:bg-[#0D1117] bg-[#F6F7F0] dark:text-gray-100 text-gray-900 transition-colors duration-200">
      <LecturerSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300">
        <LecturerHeader onMobileOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function LecturerLayout() {
  return <LayoutInner />
}