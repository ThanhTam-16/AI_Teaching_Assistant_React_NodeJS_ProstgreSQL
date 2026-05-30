import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal } from 'lucide-react'

export default function PortalDropdown({
  trigger,
  children,
  align = 'right', // 'left' | 'right'
  width = 'w-36',
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  const updateCoords = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    
    // Estimate dropdown dimensions to prevent boundary clipping
    const dropdownHeight = 120
    const dropdownWidth = 144

    let top = rect.bottom + window.scrollY
    let left = align === 'right'
      ? rect.right - dropdownWidth + window.scrollX
      : rect.left + window.scrollX

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Vertical boundary check: open upwards if too close to bottom
    if (rect.bottom + dropdownHeight > viewportHeight) {
      top = rect.top - dropdownHeight + window.scrollY - 4
    } else {
      top = rect.bottom + window.scrollY + 4
    }

    // Horizontal boundary check
    if (left + dropdownWidth > viewportWidth) {
      left = viewportWidth - dropdownWidth - 8
    }
    if (left < 0) {
      left = 8
    }

    setCoords({ top, left })
  }

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!open) {
      updateCoords()
    }
    setOpen(!open)
  }

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (e) => {
      if (dropdownRef.current && dropdownRef.current.contains(e.target)) return
      if (triggerRef.current && triggerRef.current.contains(e.target)) return
      setOpen(false)
    }

    const handleScrollAndResize = () => {
      setOpen(false)
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('click', handleOutsideClick, { capture: true })
    window.addEventListener('scroll', handleScrollAndResize, { capture: true })
    window.addEventListener('resize', handleScrollAndResize)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('click', handleOutsideClick, { capture: true })
      window.removeEventListener('scroll', handleScrollAndResize, { capture: true })
      window.removeEventListener('resize', handleScrollAndResize)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      {trigger ? (
        React.cloneElement(trigger, { onClick: handleToggle })
      ) : (
        <button
          onClick={handleToggle}
          className="w-6 h-6 rounded-md flex items-center justify-center dark:text-gray-500 text-gray-400 dark:hover:bg-[#21262D] hover:bg-gray-100 transition-all focus:outline-none"
        >
          <MoreHorizontal size={13} />
        </button>
      )}

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'absolute',
              top: coords.top,
              left: coords.left,
            }}
            className={`z-50 ${width} dark:bg-[#161B22] bg-white border dark:border-[#21262D] border-gray-200 rounded-xl shadow-2xl py-1 animate-in fade-in slide-in-from-top-1 duration-100`}
            onClick={() => setOpen(false)}
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  )
}
