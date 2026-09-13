import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import RandomVariables from '../components/RandomVariables.jsx'
import DiscreteContinuous from '../components/DiscreteContinuous.jsx'
import CentralLimitTheorem from '../components/CentralLimitTheorem.jsx'

const tabs = [
  { id: 'random', label: 'Случайные величины', component: RandomVariables },
  { id: 'disccont', label: 'Дискретные и непрерывные', component: DiscreteContinuous },
  { id: 'clt', label: 'Центральная предельная теорема', component: CentralLimitTheorem },
]

function ProbabilityDistributions() {
  const [activeTab, setActiveTab] = useState('disccont')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <BarChart3 className="w-8 h-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-emerald-700">Вероятностные распределения</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Вероятностное распределение задаёт относительные правдоподобия всех возможных исходов
        случайного эксперимента.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="emerald" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default ProbabilityDistributions
