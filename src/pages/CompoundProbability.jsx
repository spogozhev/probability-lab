import { Layers } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import SetTheory from '../components/SetTheory.jsx'
import Counting from '../components/Counting.jsx'
import ConditionalProbability from '../components/ConditionalProbability.jsx'
import SetCalculator from '../components/SetCalculator.jsx'

const tabs = [
  { id: 'sets', label: 'Теория множеств', component: SetTheory },
  { id: 'calculator', label: 'Калькулятор множеств', component: SetCalculator },
  { id: 'counting', label: 'Комбинаторика', component: Counting },
  { id: 'conditional', label: 'Условная вероятность', component: ConditionalProbability },
]

function CompoundProbability() {
  return (
    <SimulatorPage
      basePath="compound"
      title="Вероятность сложного события"
      description="Дальнейшие концепции, лежащие в основе теории вероятностей: алгебра множеств, подсчёт исходов и условные вероятности."
      icon={Layers}
      accent="violet"
      tabs={tabs}
      defaultTab="conditional"
    />
  )
}

export default CompoundProbability
