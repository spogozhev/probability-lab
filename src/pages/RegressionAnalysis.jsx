import { TrendingUp } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import OrdinaryLeastSquares from '../components/OrdinaryLeastSquares.jsx'
import Correlation from '../components/Correlation.jsx'
import AnalysisOfVariance from '../components/AnalysisOfVariance.jsx'

const tabs = [
  { id: 'ols', label: 'Метод наименьших квадратов', component: OrdinaryLeastSquares },
  { id: 'correlation', label: 'Корреляция', component: Correlation },
  { id: 'anova', label: 'Дисперсионный анализ', component: AnalysisOfVariance },
]

function RegressionAnalysis() {
  return (
    <SimulatorPage
      basePath="regression"
      title="Регрессионный анализ"
      description="Линейная регрессия — это подход к моделированию линейной зависимости между двумя переменными."
      icon={TrendingUp}
      accent="cyan"
      tabs={tabs}
      defaultTab="ols"
    />
  )
}

export default RegressionAnalysis
