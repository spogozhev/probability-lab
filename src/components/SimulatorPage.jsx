import { Navigate, useNavigate, useParams } from 'react-router-dom'
import GameSidebar from './GameSidebar.jsx'

const accentMap = {
  amber: { icon: 'text-amber-600', title: 'text-amber-700' },
  emerald: { icon: 'text-emerald-600', title: 'text-emerald-700' },
  violet: { icon: 'text-violet-600', title: 'text-violet-700' },
  rose: { icon: 'text-rose-600', title: 'text-rose-700' },
  teal: { icon: 'text-teal-600', title: 'text-teal-700' },
  cyan: { icon: 'text-cyan-600', title: 'text-cyan-700' },
}

/**
 * Страница главы: активный симулятор хранится в URL (/chapter/simulator),
 * поэтому на каждый симулятор можно дать прямую ссылку.
 */
function SimulatorPage({ basePath, title, description, icon: Icon, accent, tabs, defaultTab }) {
  const { simId } = useParams()
  const navigate = useNavigate()
  const accentCls = accentMap[accent] || accentMap.amber

  // Нет или неверный id симулятора — редирект на симулятор по умолчанию
  if (!simId || !tabs.some((t) => t.id === simId)) {
    return <Navigate to={`/${basePath}/${defaultTab}`} replace />
  }

  const ActiveComponent = tabs.find((t) => t.id === simId).component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-8 h-8 ${accentCls.icon}`} />
        <h1 className={`text-3xl font-bold ${accentCls.title}`}>{title}</h1>
      </div>
      <p className="text-gray-600 mb-6">{description}</p>

      <div className="flex gap-6">
        <GameSidebar
          tabs={tabs}
          activeTab={simId}
          onSelect={(id) => navigate(`/${basePath}/${id}`)}
          accentColor={accent}
        />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default SimulatorPage
