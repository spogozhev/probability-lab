import { BarChart3 } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import RandomVariables from '../components/RandomVariables.jsx'
import DiscreteContinuous from '../components/DiscreteContinuous.jsx'
import CentralLimitTheorem from '../components/CentralLimitTheorem.jsx'

const tabs = [
  { id: 'random', label: 'Случайные величины', component: RandomVariables },
  { id: 'disccont', label: 'Дискретные и непрерывные', component: DiscreteContinuous },
  { id: 'clt', label: 'Центральная предельная теорема', component: CentralLimitTheorem },
]

function ProbabilityDistributions() {
  return (
    <SimulatorPage
      basePath="distributions"
      title="Вероятностные распределения"
      description="Вероятностное распределение задаёт относительные правдоподобия всех возможных исходов случайного эксперимента."
      icon={BarChart3}
      accent="emerald"
      tabs={tabs}
      defaultTab="disccont"
    />
  )
}

export default ProbabilityDistributions
