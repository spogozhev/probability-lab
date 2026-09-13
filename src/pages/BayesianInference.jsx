import { Brain } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import BayesTheorem from '../components/BayesTheorem.jsx'
import LikelihoodFunction from '../components/LikelihoodFunction.jsx'
import PriorToPosterior from '../components/PriorToPosterior.jsx'

const tabs = [
  { id: 'bayes', label: 'Теорема Байеса', component: BayesTheorem },
  { id: 'likelihood', label: 'Функция правдоподобия', component: LikelihoodFunction },
  { id: 'prior', label: 'От априорного к апостериорному', component: PriorToPosterior },
]

function BayesianInference() {
  return (
    <SimulatorPage
      basePath="bayesian"
      title="Байесовский вывод"
      description="Байесовские методы определяют, как следует обновлять свои убеждения при получении новых данных."
      icon={Brain}
      accent="teal"
      tabs={tabs}
      defaultTab="bayes"
    />
  )
}

export default BayesianInference
