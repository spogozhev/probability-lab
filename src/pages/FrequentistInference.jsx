import { useState } from 'react'
import { Ruler } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import PointEstimation from '../components/PointEstimation.jsx'
import ConfidenceInterval from '../components/ConfidenceInterval.jsx'
import TheBootstrap from '../components/TheBootstrap.jsx'

const tabs = [
  { id: 'point', label: 'Точечное оценивание', component: PointEstimation },
  { id: 'interval', label: 'Доверительный интервал', component: ConfidenceInterval },
  { id: 'bootstrap', label: 'Бутстрэп', component: TheBootstrap },
]

function FrequentistInference() {
  const [activeTab, setActiveTab] = useState('point')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Ruler className="w-8 h-8 text-rose-600" />
        <h1 className="text-3xl font-bold text-rose-700">Частотный вывод</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Частотный вывод — это процесс определения свойств лежащего в основе распределения на
        основе наблюдаемых данных.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="rose" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default FrequentistInference
