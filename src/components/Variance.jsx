import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'

const CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const MAX_TRIALS = 5000

function Variance() {
  const [included, setIncluded] = useState(CARDS.map(() => true))
  const [draws, setDraws] = useState([])
  const [last, setLast] = useState(null)

  const activeCards = CARDS.filter((_, i) => included[i])

  const trueMean =
    activeCards.length > 0
      ? activeCards.reduce((s, x) => s + x, 0) / activeCards.length
      : 0
  const trueVar =
    activeCards.length > 0
      ? activeCards.reduce((s, x) => s + (x - trueMean) ** 2, 0) / activeCards.length
      : 0

  const draw = (n) => {
    if (activeCards.length === 0) return
    const batch = []
    for (let i = 0; i < n; i++) {
      batch.push(activeCards[Math.floor(Math.random() * activeCards.length)])
    }
    setLast(batch[batch.length - 1])
    setDraws((prev) => [...prev, ...batch].slice(0, MAX_TRIALS))
  }

  const reset = () => {
    setDraws([])
    setLast(null)
  }

  // Накопленное среднее квадратов отклонений
  const curve = []
  let acc = 0
  for (let i = 0; i < draws.length; i++) {
    acc += (draws[i] - trueMean) ** 2
    const denom = i + 1
    if (i < 30 || i % Math.ceil(draws.length / 400 || 1) === 0 || i === draws.length - 1) {
      curve.push([denom, acc / denom])
    }
  }
  const runningVar = draws.length ? acc / draws.length : 0
  const xMax = Math.max(20, draws.length)
  const curveMax = curve.length ? Math.max(...curve.map((p) => p[1])) : 0
  const yMaxPlot = Math.max(2, trueVar * 1.4, curveMax * 1.1)

  const toggleCard = (i) => {
    setIncluded((prev) => prev.map((v, j) => (j === i ? !v : v)))
    setDraws([])
    setLast(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-amber-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Дисперсия (Variance)</h3>
        <p className="text-gray-700 mb-3">
          Если математическое ожидание характеризует центр распределения, то{' '}
          <strong>дисперсия измеряет его разброс</strong> — то, насколько значения случайной
          величины рассеянны вокруг ожидания.
        </p>
        <p className="text-gray-700 mb-3">
          Формально дисперсия определяется как среднее значение квадрата отклонения случайной
          величины от её ожидания:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            Var(X) = E[(X − E[X])²]
          </span>
          .
        </p>
        <p className="text-gray-700">
          Перед вами десять карт с числами от 1 до 10. Нажимайте на карты, чтобы включать или
          исключать их из колоды, затем тяните карты наугад и наблюдайте, как накопленное среднее
          квадратов отклонений сходится к истинной дисперсии колоды.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-amber-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-4">
            Накопленное среднее (X − E[X])² от числа вытягиваний
          </h3>
          <Plot
            xMin={1}
            xMax={xMax}
            yMin={0}
            yMax={yMaxPlot}
            xLabel="Число вытягиваний"
            yLabel="Средний квадрат отклонения"
          >
            {({ sx, sy }) => (
              <>
                <line
                  x1={sx(1)}
                  x2={sx(xMax)}
                  y1={sy(trueVar)}
                  y2={sy(trueVar)}
                  stroke="#dc2626"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                {draws.length > 0 && (
                  <path d={linePath(curve, sx, sy)} fill="none" stroke="#d97706" strokeWidth="2" />
                )}
              </>
            )}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-red-600 align-middle mr-1"></span>
            истинная дисперсия Var(X) = {trueVar.toFixed(3)}
            <span className="inline-block w-3 h-0.5 bg-amber-600 align-middle ml-4 mr-1"></span>
            накопленное значение = {runningVar.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-6 min-w-[300px] space-y-5">
          <h3 className="text-lg font-semibold">Колода</h3>

          <div className="grid grid-cols-5 gap-2">
            {CARDS.map((card, i) => (
              <button
                key={card}
                onClick={() => toggleCard(i)}
                className={`h-12 rounded-lg border-2 font-bold text-lg transition-colors ${
                  included[i]
                    ? 'bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100'
                    : 'bg-gray-50 border-gray-200 text-gray-300 hover:border-gray-300'
                }`}
              >
                {card}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Нажмите на карту, чтобы включить или исключить её из колоды.
          </p>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-20 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                last === null
                  ? 'bg-gray-50 border-gray-200 text-gray-300'
                  : 'bg-amber-50 border-amber-400 text-amber-800'
              }`}
            >
              {last ?? '?'}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                E[X] = <strong className="text-gray-800 tabular-nums">{trueMean.toFixed(2)}</strong>
              </p>
              <p>
                Var(X) ={' '}
                <strong className="text-red-600 tabular-nums">{trueVar.toFixed(3)}</strong>
              </p>
              <p>
                Накоплено:{' '}
                <strong className="text-amber-700 tabular-nums">
                  {draws.length ? runningVar.toFixed(3) : '—'}
                </strong>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => draw(1)}
              disabled={activeCards.length === 0}
              className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Вытянуть 1 карту
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => draw(100)}
                disabled={activeCards.length === 0}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                100 карт
              </button>
              <button
                onClick={() => draw(1000)}
                disabled={activeCards.length === 0}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                1000 карт
              </button>
            </div>
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Variance
