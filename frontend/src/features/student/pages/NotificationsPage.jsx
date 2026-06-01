import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck, Loader2, ClipboardList, MessageSquare, Star, Info } from 'lucide-react'
import { toast } from 'sonner'
import {
  getStudentNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../../services/notification.api'
import { formatRelative } from '../../../utils/formatDate'
import { SkeletonList, EmptyLearningState, ErrorState, SectionHeader } from '../components/StudentUI'
import { CARD_BASE } from '../studentTokens'

const NOTIF_ICON = {
  ASSIGNMENT: { icon: ClipboardList, bg: 'bg-orange-50 dark:bg-orange-500/10', cls: 'text-orange-500' },
  FEEDBACK:   { icon: MessageSquare, bg: 'bg-emerald-50 dark:bg-emerald-500/10', cls: 'text-emerald-500' },
  GRADE:      { icon: Star,          bg: 'bg-amber-50 dark:bg-amber-500/10',   cls: 'text-amber-500' },
  DEFAULT:    { icon: Info,          bg: 'bg-sky-50 dark:bg-sky-500/10',       cls: 'text-sky-500' },
}

function NotificationItem({ notification, onRead }) {
  const type = NOTIF_ICON[notification.type] ?? NOTIF_ICON.DEFAULT
  const Icon = type.icon

  return (
    <div
      onClick={() => !notification.isRead && onRead(notification.id)}
      className={`${CARD_BASE} p-3.5 flex items-start gap-3 cursor-pointer
        hover:bg-orange-50/30 dark:hover:bg-white/5 transition-colors
        ${!notification.isRead ? 'border-orange-200 dark:border-orange-500/20' : ''}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${type.bg}`}>
        <Icon size={14} className={type.cls} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold dark:text-gray-200 text-gray-700">
              {notification.title}
            </span>
            {!notification.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-[10px] dark:text-gray-600 text-gray-400 flex-shrink-0">
            {formatRelative(notification.createdAt)}
          </span>
        </div>
        {notification.message && (
          <p className="text-[11px] dark:text-gray-400 text-gray-500 leading-relaxed mt-0.5">
            {notification.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [markingAll, setMarkingAll]       = useState(false)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await getStudentNotifications()
      const raw = res.data?.data
      setNotifications(Array.isArray(raw) ? raw : raw?.notifications ?? [])
    } catch (e) {
      setError(e.response?.data?.message ?? 'Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id)
      setNotifications(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch { /* silent */ }
  }

  const handleReadAll = async () => {
    setMarkingAll(true)
    try {
      await markAllNotificationsRead()
      setNotifications(ns => ns.map(n => ({ ...n, isRead: true })))
      toast.success('Đã đánh dấu tất cả là đã đọc')
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Không thể đánh dấu')
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="pb-6">
      <SectionHeader
        title="Thông báo"
        desc={unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Tất cả đã đọc'}
        icon={Bell}
        actions={
          unreadCount > 0 ? (
            <button
              onClick={handleReadAll}
              disabled={markingAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400
                border border-orange-200 dark:border-orange-500/20
                hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors disabled:opacity-60">
              {markingAll
                ? <Loader2 size={11} className="animate-spin" />
                : <CheckCheck size={11} />}
              Đọc tất cả
            </button>
          ) : null
        }
      />

      {loading ? <SkeletonList count={6} /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && notifications.length === 0 ? (
        <EmptyLearningState
          icon={Bell}
          title="Chưa có thông báo"
          desc="Các thông báo về bài tập, điểm số và phản hồi sẽ hiển thị tại đây."
        />
      ) : null}

      {!loading && !error && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))}
        </div>
      ) : null}
    </div>
  )
}