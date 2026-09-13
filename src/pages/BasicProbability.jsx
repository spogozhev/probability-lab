import { useState } from 'react'
import { Dices } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import ChanceEvents from '../components/ChanceEvents.jsx'
import Expectation from '../components/Expectation.jsx'
import Variance from '../components/Variance.jsx'

const tabs = [
  { id: 'chance', label: 'Случайные события', component: ChanceEvents },
  { id: 'expectation', label: 'Математическое ожидание', component: Expectation },
  { id: 'variance', label: 'Дисперсия', component: Variance },
]

function BasicProbability() {
  const [activeTab, setActiveTab] = useState('chance')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Dices className="w-8 h-8 text-amber-600" />
        <h1 className="text-3xl font-bold text-amber-700">Основы теории вероятностей</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Эта глава знакомит с базовыми понятиями теории вероятностей: случайными событиями,
        математическим ожиданием и дисперсией.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="amber" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default BasicProbability
