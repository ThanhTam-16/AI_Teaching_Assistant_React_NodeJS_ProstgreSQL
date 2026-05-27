import React from 'react'

const TECH = [
  { name: 'React JS', icon: '⚛️', cat: 'Frontend' },
  { name: 'Node.js', icon: '🟢', cat: 'Backend' },
  { name: 'Python FastAPI', icon: '🐍', cat: 'Backend' },
  { name: 'PostgreSQL', icon: '🐘', cat: 'Database' },
  { name: 'GPT / Claude', icon: '🤖', cat: 'AI Engine' },
  { name: 'AWS / GCP', icon: '☁️', cat: 'Cloud' },
  { name: 'Flutter', icon: '💙', cat: 'Mobile (optional)' },
  { name: 'NLP Models', icon: '🧠', cat: 'AI Engine' },
]

const STATS = [
  { value: '3–5s', label: 'Thời gian phản hồi AI', icon: '⚡' },
  { value: '4', label: 'Module AI tích hợp', icon: '🤖' },
  { value: '2+', label: 'Vai trò người dùng', icon: '👥' },
  { value: '100%', label: 'Responsive mọi thiết bị', icon: '📱' },
]

export default function TechStack() {
  return (
    <section id="workflow" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center bg-fpt-pastel rounded-2xl border border-fpt-pale py-5 px-4 animate-on-scroll"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-fpt-orange">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        {/* <div className="text-center mb-10 animate-on-scroll">
          <span className="inline-block px-3 py-1 rounded-full bg-fpt-pale border border-fpt-light/40 text-fpt-orange text-xs font-semibold uppercase tracking-wide mb-3">
            Công nghệ
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-3">
            Xây dựng trên nền tảng hiện đại
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Stack công nghệ được lựa chọn kỹ lưỡng, đảm bảo hiệu năng, khả năng mở rộng và bảo mật.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {TECH.map((t, i) => (
            <div
              key={t.name}
              className="flex items-center gap-2 bg-white border border-fpt-pale rounded-xl px-4 py-2.5 hover:border-fpt-light hover:shadow-orange-sm transition-all duration-200 cursor-default animate-on-scroll"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="text-lg">{t.icon}</span>
              <div>
                <div className="text-sm font-semibold text-gray-700">{t.name}</div>
                <div className="text-[10px] text-gray-400">{t.cat}</div>
              </div>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}