// ── Student Design Tokens ─────────────────────────────────────────────────────
// Màu chủ đạo: cam pastel + mint + lavender + vàng kem + hồng phấn
// Dùng cho toàn bộ Student Dashboard

export const STUDENT_PALETTE = {
  // Cam pastel chính
  orange:  { light: '#FF8C42', pale: '#FFF3E8', soft: '#FFE0C2', dark: '#FF6B1A' },
  // Xanh mint
  mint:    { light: '#34D399', pale: '#ECFDF5', soft: '#A7F3D0', dark: '#10B981' },
  // Xanh nước nhạt
  sky:     { light: '#38BDF8', pale: '#F0F9FF', soft: '#BAE6FD', dark: '#0EA5E9' },
  // Tím lavender
  lavender:{ light: '#A78BFA', pale: '#F5F3FF', soft: '#DDD6FE', dark: '#7C3AED' },
  // Hồng phấn
  pink:    { light: '#F472B6', pale: '#FDF2F8', soft: '#FBCFE8', dark: '#EC4899' },
  // Vàng kem
  amber:   { light: '#FBBF24', pale: '#FFFBEB', soft: '#FDE68A', dark: '#D97706' },
}

// Màu theo subject (dùng để distinguish các môn học)
export const SUBJECT_COLORS = [
  { bg: 'bg-orange-50 dark:bg-orange-500/10',   border: 'border-orange-200 dark:border-orange-500/20',   text: 'text-orange-600 dark:text-orange-400',   dot: 'bg-orange-400' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
  { bg: 'bg-sky-50 dark:bg-sky-500/10',         border: 'border-sky-200 dark:border-sky-500/20',         text: 'text-sky-600 dark:text-sky-400',         dot: 'bg-sky-400' },
  { bg: 'bg-violet-50 dark:bg-violet-500/10',   border: 'border-violet-200 dark:border-violet-500/20',   text: 'text-violet-600 dark:text-violet-400',   dot: 'bg-violet-400' },
  { bg: 'bg-pink-50 dark:bg-pink-500/10',       border: 'border-pink-200 dark:border-pink-500/20',       text: 'text-pink-600 dark:text-pink-400',       dot: 'bg-pink-400' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10',     border: 'border-amber-200 dark:border-amber-500/20',     text: 'text-amber-600 dark:text-amber-400',     dot: 'bg-amber-400' },
]

export const getSubjectColor = (index) => SUBJECT_COLORS[index % SUBJECT_COLORS.length]

// Status badges cho assignment/submission
export const SUBMISSION_STATUS = {
  NOT_SUBMITTED: {
    label: 'Chưa nộp',
    cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    dot: 'bg-gray-400',
  },
  SUBMITTED: {
    label: 'Đã nộp',
    cls: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    dot: 'bg-sky-400',
  },
  LATE: {
    label: 'Trễ hạn',
    cls: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    dot: 'bg-rose-400',
  },
  GRADED: {
    label: 'Đã chấm',
    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
}

export const DIFFICULTY_BADGE = {
  EASY:   'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  MEDIUM: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  HARD:   'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
}

export const DIFFICULTY_LABEL = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }

// Card base classes
export const CARD_BASE = 'bg-white dark:bg-[#161B22] border border-gray-100 dark:border-[#21262D] rounded-2xl shadow-sm'
export const CARD_HOVER = 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200'
export const GLASS_CARD = 'bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 rounded-2xl'