import { useState } from 'react'
import { Brain } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import BayesTheorem from '../components/BayesTheorem.jsx'
import LikelihoodFunction from '../components/LikelihoodFunction.jsx'
import PriorToPosterior from '../components/PriorToPosterior.jsx'

const tabs = [
  { id: 'bayes', label: 'Теорема Байеса', component: BayesTheorem },
  { id: 'likelihood', label: 'Функция правдоподобия', component: LikelihoodFunction },
  { id: 'prior', label: 'От априорного к апостериорному', component: PriorToPosterior },
]

function BayesianInference() {
  const [activeTab, setActiveTab] = useState('bayes')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Brain className="w-8 h-8 text-teal-600" />
        <h1 className="text-3xl font-bold text-teal-700">Байесовский вывод</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Байесовские методы определяют, как следует обновлять свои убеждения при получении новых
        данных.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="teal" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default BayesianInference
