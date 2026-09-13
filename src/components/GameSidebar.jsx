import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

function GameSidebar({ tabs, activeTab, onSelect, accentColor }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const colorMap = {
    amber: { active: 'bg-amber-100 text-amber-700', btn: 'bg-amber-600 hover:bg-amber-700', border: 'border-amber-200' },
    emerald: { active: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', border: 'border-emerald-200' },
    violet: { active: 'bg-violet-100 text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700', border: 'border-violet-200' },
    rose: { active: 'bg-rose-100 text-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', border: 'border-rose-200' },
    teal: { active: 'bg-teal-100 text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700', border: 'border-teal-200' },
    cyan: { active: 'bg-cyan-100 text-cyan-700', btn: 'bg-cyan-600 hover:bg-cyan-700', border: 'border-cyan-200' },
  }
  const c = colorMap[accentColor] || colorMap.amber

  const handleSelect = (id) => {
    onSelect(id)
    setOpen(false)
  }

  const activeLabel = tabs.find(t => t.id === activeTab)?.label

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`md:hidden fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-white shadow-lg ${c.btn} transition-colors`}
      >
        <Menu className="w-5 h-5" />
        <span className="text-sm font-medium max-w-[140px] truncate">{activeLabel}</span>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className={`absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl border-r ${c.border} overflow-y-auto`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-semibold text-gray-700">Игры</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="p-3">
              <ul className="space-y-1">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => handleSelect(tab.id)}
                      className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? c.active
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <nav className="hidden md:block w-56 shrink-0">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onSelect(tab.id)}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? c.active
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default GameSidebar
