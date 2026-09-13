import { useState } from 'react'
import { Layers } from 'lucide-react'
import GameSidebar from '../components/GameSidebar.jsx'
import SetTheory from '../components/SetTheory.jsx'
import Counting from '../components/Counting.jsx'
import ConditionalProbability from '../components/ConditionalProbability.jsx'

const tabs = [
  { id: 'sets', label: 'Теория множеств', component: SetTheory },
  { id: 'counting', label: 'Комбинаторика', component: Counting },
  { id: 'conditional', label: 'Условная вероятность', component: ConditionalProbability },
]

function CompoundProbability() {
  const [activeTab, setActiveTab] = useState('conditional')

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Layers className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-violet-700">Вероятность сложного события</h1>
      </div>
      <p className="text-gray-600 mb-6">
        Дальнейшие концепции, лежащие в основе теории вероятностей: алгебра множеств, подсчёт
        исходов и условные вероятности.
      </p>

      <div className="flex gap-6">
        <GameSidebar tabs={tabs} activeTab={activeTab} onSelect={setActiveTab} accentColor="violet" />

        <div className="flex-1 min-w-0">
          <ActiveComponent />
        </div>
      </div>
    </div>
  )
}

export default CompoundProbability
