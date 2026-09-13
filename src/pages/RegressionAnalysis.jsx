import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import OrdinaryLeastSquares from '../components/OrdinaryLeastSquares.jsx'
import Correlation from '../components/Correlation.jsx'
import AnalysisOfVariance from '../components/AnalysisOfVariance.jsx'

const tabs = [
  { id: 'ols', label: 'Метод наименьших квадратов', component: OrdinaryLeastSquares },
  { id: 'correlation', label: 'Корреляция', component: Correlation },
  { id: 'anova', label: 'Дисперсионный анализ', component: AnalysisOfVariance },
]

function RegressionAnalysis() {
  const [activeTab, setActiveTab] = useState('ols')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-8 h-8 text-cyan-600" />
        <h1 className="text-3xl font-bold text-cyan-700">Регрессионный анализ</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Линейная регрессия — это подход к моделированию линейной зависимости между двумя
        переменными.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="cyan" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default RegressionAnalysis
