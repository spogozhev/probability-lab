import { Ruler } from 'lucide-react'
import SimulatorPage from '../components/SimulatorPage.jsx'
import PointEstimation from '../components/PointEstimation.jsx'
import ConfidenceInterval from '../components/ConfidenceInterval.jsx'
import TheBootstrap from '../components/TheBootstrap.jsx'

const tabs = [
  { id: 'point', label: 'Точечное оценивание', component: PointEstimation },
  { id: 'interval', label: 'Доверительный интервал', component: ConfidenceInterval },
  { id: 'bootstrap', label: 'Бутстрэп', component: TheBootstrap },
]

function FrequentistInference() {
  return (
    <SimulatorPage
      basePath="frequentist"
      title="Частотный вывод"
      description="Частотный вывод — это процесс определения свойств лежащего в основе распределения на основе наблюдаемых данных."
      icon={Ruler}
      accent="rose"
      tabs={tabs}
      defaultTab="point"
    />
  )
}

export default FrequentistInference
