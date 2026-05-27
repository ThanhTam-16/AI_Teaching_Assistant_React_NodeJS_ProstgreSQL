export const formatDate = (date, opts = {}) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', ...opts,
  }).format(new Date(date))
}

export const formatDateTime = (date) =>
  formatDate(date, { hour: '2-digit', minute: '2-digit' })

export const formatRelative = (date) => {
  if (!date) return '—'
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (mins < 1)   return 'Vừa xong'
  if (mins < 60)  return `${mins} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7)   return `${days} ngày trước`
  return formatDate(date)
}