import React, { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

// ── Role configs ──────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  ADMIN: {
    label: 'Admin Portal',
    sub: 'Đang tải hệ thống quản trị...',
    primary: '#f97316',     // orange
    secondary: '#fb923c',
    glow: 'rgba(249,115,22,0.3)',
    ring: 'rgba(249,115,22,0.15)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L4 7v5c0 5.25 3.75 10.15 8 11 4.25-.85 8-5.75 8-11V7L12 2z"/>
      </svg>
    ),
  },
  LECTURER: {
    label: 'Lecturer Portal',
    sub: 'Đang tải không gian giảng dạy...',
    primary: '#3b82f6',     // blue
    secondary: '#60a5fa',
    glow: 'rgba(59,130,246,0.3)',
    ring: 'rgba(59,130,246,0.15)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  STUDENT: {
    label: 'Student Portal',
    sub: 'Đang tải không gian học tập...',
    primary: '#10b981',     // emerald
    secondary: '#34d399',
    glow: 'rgba(16,185,129,0.3)',
    ring: 'rgba(16,185,129,0.15)',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
}

export default function RoleLoading({ role = 'ADMIN' }) {
  const { dark } = useTheme()
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.ADMIN
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 500)
    return () => clearInterval(t)
  }, [])

  const bgGradient = dark
    ? `radial-gradient(ellipse, ${cfg.glow} 0%, transparent 70%)`
    : `radial-gradient(ellipse, ${cfg.glow.replace('0.3', '0.12')} 0%, transparent 70%)`

  const centerBg = dark
    ? `linear-gradient(135deg, ${cfg.primary}20, ${cfg.secondary}10)`
    : `linear-gradient(135deg, ${cfg.primary}15, ${cfg.secondary}05)`

  const centerBorder = `1px solid ${dark ? cfg.primary + '40' : cfg.primary + '20'}`
  const centerGlow = dark
    ? `0 0 32px ${cfg.glow}, inset 0 1px 0 ${cfg.primary}20`
    : `0 0 16px ${cfg.glow.replace('0.3', '0.15')}, inset 0 1px 0 ${cfg.primary}10`

  return (
    <div
      style={{ background: dark ? '#0a0a0f' : '#f9fafb' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Ambient glow bg */}
      <div
        style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: bgGradient,
          filter: 'blur(40px)',
          animation: 'pulse-glow 2.5s ease-in-out infinite',
        }}
      />

      {/* Orbit rings */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 80 + i * 70,
            height: 80 + i * 70,
            borderRadius: '50%',
            border: `1px solid ${dark ? cfg.ring : cfg.ring.replace('0.15', '0.08')}`,
            animation: `spin-ring ${4 + i * 2}s linear infinite`,
            animationDirection: i % 2 === 0 ? 'reverse' : 'normal',
            opacity: 0.6 - i * 0.15,
          }}
        >
          {/* Dot on ring */}
          <div
            style={{
              position: 'absolute',
              top: -3, left: '50%', transform: 'translateX(-50%)',
              width: 6, height: 6, borderRadius: '50%',
              background: i === 1 ? cfg.primary : cfg.secondary,
              boxShadow: `0 0 8px ${cfg.glow}`,
            }}
          />
        </div>
      ))}

      {/* Center icon */}
      <div
        style={{
          width: 72, height: 72, borderRadius: 20,
          background: centerBg,
          border: centerBorder,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.primary,
          boxShadow: centerGlow,
          animation: 'float-icon 3s ease-in-out infinite',
          marginBottom: 32,
          zIndex: 1,
        }}
      >
        {cfg.icon}
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div
          style={{
            fontSize: 18, fontWeight: 700, color: dark ? '#fff' : '#111827',
            letterSpacing: '0.02em', marginBottom: 6,
          }}
        >
          {cfg.label}
        </div>
        <div style={{ fontSize: 12, color: dark ? '#6b7280' : '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{cfg.sub.replace('...', '')}</span>
          <span style={{ color: cfg.primary, fontWeight: 700, minWidth: 18 }}>
            {'.'.repeat(dots + 1)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${cfg.primary}, ${cfg.secondary}, transparent)`,
          animation: 'progress-slide 1.8s ease-in-out infinite',
          zIndex: 1,
        }}
      />

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50%       { opacity: 1;   transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes float-icon {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes progress-slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}