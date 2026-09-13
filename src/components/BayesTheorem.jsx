import { useState } from 'react'
import Slider from './Slider.jsx'

const POP = 10000
const GRID_COLS = 100
const GRID_ROWS = 40 // 4000 точек, каждая = 2.5 человека

function BayesTheorem() {
  const [prior, setPrior] = useState(0.01) // P(D) — распространённость болезни
  const [sensitivity, setSensitivity] = useState(0.99) // P(+|D)
  const [specificity, setSpecificity] = useState(0.95) // P(−|¬D)

  const falsePositive = 1 - specificity
  const pPlus = sensitivity * prior + falsePositive * (1 - prior)
  const posterior = (sensitivity * prior) / pPlus

  // Симуляция на представительной выборке
  const [sim, setSim] = useState(null)
  const simulate = () => {
    const dCount = Math.round(POP * prior)
    const healthy = POP - dCount
    const dPlus = Math.round(dCount * sensitivity)
    const dMinus = dCount - dPlus
    const hPlus = Math.round(healthy * falsePositive)
    const hMinus = healthy - hPlus
    const totalPlus = dPlus + hPlus
    setSim({
      dPlus,
      dMinus,
      hPlus,
      hMinus,
      empPosterior: totalPlus ? dPlus / totalPlus : 0,
    })
  }

  // Фиксированная сетка точек, раскрашиваем по категориям
  const [dots] = useState(() =>
    Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => ({
      col: i % GRID_COLS,
      row: Math.floor(i / GRID_COLS),
    }))
  )

  const counts = sim
    ? [
        { key: 'dPlus', n: sim.dPlus, color: '#be123c', label: 'болен, тест +' },
        { key: 'dMinus', n: sim.dMinus, color: '#fb7185', label: 'болен, тест −' },
        { key: 'hPlus', n: sim.hPlus, color: '#0f766e', label: 'здоров, тест +' },
        { key: 'hMinus', n: sim.hMinus, color: '#5eead4', label: 'здоров, тест −' },
      ]
    : null

  const dotCategory = (idx) => {
    if (!sim) return null
    const c1 = sim.dPlus
    const c2 = sim.dMinus
    const c3 = sim.hPlus
    const pos = idx * 2.5 // каждая точка = POP / 4000 человек
    if (pos < c1) return 'dPlus'
    if (pos < c1 + c2) return 'dMinus'
    if (pos < c1 + c2 + c3) return 'hPlus'
    return 'hMinus'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-teal-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Теорема Байеса (Bayes&apos; Theorem)</h3>
        <p className="text-gray-700 mb-3">
          Представьте, что вы сдали тест на редкую болезнь — и тест оказался положительным.{' '}
          <strong>Какова вероятность, что вы действительно больны?</strong> Интуиция часто подводит
          здесь из-за игнорирования редкости болезни.
        </p>
        <p className="text-gray-700 mb-3">
          Теорема Байеса даёт точный ответ:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm">
            P(D | +) = P(+ | D)·P(D) / P(+)
          </span>
          . Ключевую роль играет <strong>априорная вероятность</strong> болезни P(D) — её
          распространённость в популяции. Чем реже болезнь, тем больше вклад ложноположительных
          результатов среди здоровых и тем меньше апостериорная вероятность.
        </p>
        <p className="text-gray-700">
          Настройте априорную вероятность, чувствительность теста (долю истинно положительных) и
          специфичность (долю истинно отрицательных). Затем смоделируйте тестирование
          представительной выборки — таблица и точечная диаграмма покажут, откуда «берётся»
          апостериорная вероятность.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-teal-200 p-6 min-w-[300px] space-y-5">
          <h3 className="text-lg font-semibold">Параметры теста</h3>

          <Slider
            label="Априорная вероятность болезни P(D)"
            value={prior}
            min={0.001}
            max={0.5}
            step={0.001}
            onChange={(v) => {
              setPrior(v)
              setSim(null)
            }}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            accentClass="accent-teal-600"
          />
          <Slider
            label="Чувствительность P(+ | D)"
            value={sensitivity}
            min={0.5}
            max={1}
            step={0.005}
            onChange={(v) => {
              setSensitivity(v)
              setSim(null)
            }}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            accentClass="accent-teal-600"
          />
          <Slider
            label="Специфичность P(− | здоров)"
            value={specificity}
            min={0.5}
            max={1}
            step={0.005}
            onChange={(v) => {
              setSpecificity(v)
              setSim(null)
            }}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            accentClass="accent-teal-600"
          />

          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-gray-600">Апостериорная вероятность P(болен | +):</p>
            <p className="text-3xl font-bold text-teal-700 mt-1 tabular-nums">
              {(posterior * 100).toFixed(1)}%
            </p>
          </div>

          <button
            onClick={simulate}
            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Смоделировать {POP.toLocaleString('ru-RU')} человек
          </button>
        </div>

        <div className="bg-white rounded-xl border border-teal-200 p-6 flex-1 min-w-[340px]">
          <h3 className="text-lg font-semibold mb-3">Выборка населения (каждая точка ≈ 2,5 человека)</h3>
          <svg viewBox={`0 0 ${GRID_COLS * 6 + 4} ${GRID_ROWS * 6 + 4}`} className="w-full h-auto select-none">
            <rect x="2" y="2" width={GRID_COLS * 6} height={GRID_ROWS * 6} rx="6" fill="#f8fafc" stroke="#e2e8f0" />
            {!sim ? (
              <text x={GRID_COLS * 3} y={GRID_ROWS * 3} textAnchor="middle" fontSize="18" fill="#94a3b8">
                Нажмите «Смоделировать»
              </text>
            ) : (
              dots.map((d, i) => {
                const cat = dotCategory(i)
                const color = cat
                  ? { dPlus: '#be123c', dMinus: '#fb7185', hPlus: '#0f766e', hMinus: '#5eead4' }[cat]
                  : '#e2e8f0'
                return (
                  <rect
                    key={i}
                    x={6 + d.col * 6 - 2.4}
                    y={6 + d.row * 6 - 2.4}
                    width="4.8"
                    height="4.8"
                    rx="1"
                    fill={color}
                  />
                )
              })
            )}
          </svg>

          {sim && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-1.5 pr-2 font-medium">Группа</th>
                    <th className="py-1.5 px-2 font-medium">Человек</th>
                    <th className="py-1.5 px-2 font-medium">Доля</th>
                  </tr>
                </thead>
                <tbody>
                  {counts.map((c) => (
                    <tr key={c.key} className="border-t border-gray-100">
                      <td className="py-1.5 pr-2">
                        <span
                          className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                          style={{ backgroundColor: c.color }}
                        ></span>
                        {c.label}
                      </td>
                      <td className="py-1.5 px-2 tabular-nums">{c.n.toLocaleString('ru-RU')}</td>
                      <td className="py-1.5 px-2 tabular-nums text-gray-500">
                        {((c.n / POP) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 bg-teal-50 rounded-lg text-sm mt-3">
                Среди всех с <strong>положительным</strong> тестом ({(sim.dPlus + sim.hPlus).toLocaleString('ru-RU')}
                {' '}человек) действительно больны только{' '}
                <strong>{sim.dPlus.toLocaleString('ru-RU')}</strong> — эмпирическая апостериорная
                вероятность: <strong className="text-teal-700">{(sim.empPosterior * 100).toFixed(1)}%</strong>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BayesTheorem
