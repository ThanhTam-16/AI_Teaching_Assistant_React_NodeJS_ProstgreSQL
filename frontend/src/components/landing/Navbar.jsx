import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Tổng quan', href: '#overview' },
  { label: 'Tính năng', href: '#features' },
  { label: 'Quy trình', href: '#workflow' },
  { label: 'Đối tượng', href: '#audience' },
  { label: 'Liên hệ', href: '#contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setIsOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-orange-sm border-b border-fpt-pale'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
                src="/logo/logo.png"
                alt="FPT logo"
                className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-fpt-orange text-base">AITA</span>
              <span className="text-gray-400 text-[10px] font-medium hidden sm:block">AI Teaching Assistant</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-fpt-orange rounded-lg hover:bg-fpt-pastel transition-all duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-fpt-orange border border-fpt-orange rounded-lg hover:bg-fpt-pastel transition-all duration-200 text-center">
              Đăng nhập
            </Link>
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white bg-fpt-orange rounded-lg hover:bg-primary-700 shadow-orange-sm hover:shadow-orange-md transition-all duration-200 text-center">
              Dùng thử miễn phí
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-fpt-orange hover:bg-fpt-pastel transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-fpt-pale shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-fpt-orange hover:bg-fpt-pastel rounded-lg transition-all"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" className="w-full px-4 py-2.5 text-sm font-semibold text-fpt-orange border border-fpt-orange rounded-lg hover:bg-fpt-pastel transition-all text-center">
                Đăng nhập
              </Link>
              <Link to="/login" className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-fpt-orange rounded-lg hover:bg-primary-700 transition-all text-center">
                Dùng thử miễn phí
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}