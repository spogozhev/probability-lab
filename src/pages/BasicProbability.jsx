import { Dices } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import ChanceEvents from '../components/ChanceEvents.jsx'
import Expectation from '../components/Expectation.jsx'
import Variance from '../components/Variance.jsx'

const tabs = [
  { id: 'chance', label: 'Случайные события', component: ChanceEvents },
  { id: 'expectation', label: 'Математическое ожидание', component: Expectation },
  { id: 'variance', label: 'Дисперсия', component: Variance },
]

function BasicProbability() {
  return (
    <SimulatorPage
      basePath="basic"
      title="Основы теории вероятностей"
      description="Эта глава знакомит с базовыми понятиями теории вероятностей: случайными событиями, математическим ожиданием и дисперсией."
      icon={Dices}
      accent="amber"
      tabs={tabs}
      defaultTab="chance"
    />
  )
}

export default BasicProbability
