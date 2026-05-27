import React from 'react'

/**
 * PageHeader — compact summary row at top of each admin page
 * @prop {string}   title
 * @prop {string}   [description]
 * @prop {Array}    [stats]       — [{ label, value, accent? }]
 * @prop {ReactNode} [actions]   — buttons etc.
 */
export default function PageHeader({ title, description, stats = [], actions }) {
  const ACCENT_TEXT = {
    orange:  'text-orange-500 dark:text-orange-400',
    blue:    'text-blue-500   dark:text-blue-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    violet:  'text-violet-500 dark:text-violet-400',
    rose:    'text-rose-500   dark:text-rose-400',
    default: 'dark:text-white text-gray-900',
  }

  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      {/* Left: title + description + quick stats */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h2 className="text-sm font-bold dark:text-white text-gray-900">{title}</h2>
          {description && (
            <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-0.5">{description}</p>
          )}
        </div>

        {stats.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-px h-3 dark:bg-gray-800 bg-gray-200" />}
                <span className="text-[10px] dark:text-gray-500 text-gray-400">{s.label}</span>
                <span className={`text-xs font-bold ${ACCENT_TEXT[s.accent ?? 'default']}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: actions */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}