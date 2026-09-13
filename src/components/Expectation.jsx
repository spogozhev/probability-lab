import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'

const MAX_TRIALS = 5000

// Точки на грани кубика (как на настоящей кости)
const PIPS = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
}

function DieFace({ value, size = 72 }) {
  const pip = 8
  const cell = size / 3
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <rect x="2" y="2" width={size - 4} height={size - 4} rx="12" fill="white" stroke="#d1d5db" strokeWidth="2" />
      {(PIPS[value] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cell * cx + cell / 2} cy={cell * cy + cell / 2} r={pip / 2 + 2} fill="#374151" />
      ))}
    </svg>
  )
}

function Expectation() {
  const [weights, setWeights] = useState([1, 1, 1, 1, 1, 1])
  const [results, setResults] = useState([])
  const [last, setLast] = useState(null)

  const sum = weights.reduce((s, w) => s + w, 0)
  const probs = weights.map((w) => w / sum)
  const expectation = probs.reduce((s, p, i) => s + (i + 1) * p, 0)

  const rollOnce = () => {
    let r = Math.random() * sum
    for (let i = 0; i < 6; i++) {
      r -= weights[i]
      if (r <= 0) return i + 1
    }
    return 6
  }

  const roll = (n) => {
    const batch = []
    for (let i = 0; i < n; i++) batch.push(rollOnce())
    setLast(batch[batch.length - 1])
    setResults((prev) => [...prev, ...batch].slice(0, MAX_TRIALS))
  }

  const reset = () => {
    setResults([])
    setLast(null)
  }

  const total = results.reduce((s, x) => s + x, 0)
  const sampleMean = results.length ? total / results.length : 0

  const curve = []
  let acc = 0
  for (let i = 0; i < results.length; i++) {
    acc += results[i]
    const denom = i + 1
    if (i < 30 || i % Math.ceil(results.length / 400 || 1) === 0 || i === results.length - 1) {
      curve.push([denom, acc / denom])
    }
  }
  const xMax = Math.max(20, results.length)

  const setWeight = (i, v) => {
    setWeights((prev) => prev.map((w, j) => (j === i ? v : w)))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-amber-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Математическое ожидание (Expectation)</h3>
        <p className="text-gray-700 mb-3">
          Математическое ожидание — это число, характеризующее «центр» распределения случайной
          величины. Его можно понимать как <strong>среднее значение при большом числе независимых
          повторений</strong> случайного эксперимента.
        </p>
        <p className="text-gray-700 mb-3">
          Формально ожидание определяется как сумма возможных значений, взвешенных по их
          вероятностям:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
            E[X] = Σ x · P(x)
          </span>
          .
        </p>
        <p className="text-gray-700">
          Бросайте кубик и наблюдайте, как накопленное среднее сходится к теоретическому значению
          3,5. Затем передвиньте синие ползунки, чтобы сместить вероятности граней, — и
          математическое ожидание сдвинется вместе с ними.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-amber-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-4">Выборочное среднее от числа бросков</h3>
          <Plot
            xMin={1}
            xMax={xMax}
            yMin={1}
            yMax={6}
            xLabel="Число бросков"
            yLabel="Выборочное среднее"
          >
            {({ sx, sy }) => (
              <>
                <line
                  x1={sx(1)}
                  x2={sx(xMax)}
                  y1={sy(expectation)}
                  y2={sy(expectation)}
                  stroke="#dc2626"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                {results.length > 0 && (
                  <path d={linePath(curve, sx, sy)} fill="none" stroke="#d97706" strokeWidth="2" />
                )}
              </>
            )}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-red-600 align-middle mr-1"></span>
            E[X] = {expectation.toFixed(3)}
            <span className="inline-block w-3 h-0.5 bg-amber-600 align-middle ml-4 mr-1"></span>
            выборочное среднее = {sampleMean.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-6 min-w-[300px] space-y-5">
          <h3 className="text-lg font-semibold">Несимметричный кубик</h3>

          <div className="flex items-center gap-4">
            <DieFace value={last ?? 1} />
            <div className="text-sm text-gray-600">
              <p>
                Бросков: <strong className="text-gray-800">{results.length}</strong>
              </p>
              <p>
                Выборочное среднее:{' '}
                <strong className="text-amber-700 tabular-nums">
                  {results.length ? sampleMean.toFixed(3) : '—'}
                </strong>
              </p>
              <p>
                E[X] = Σ x·P(x) ={' '}
                <strong className="text-red-600 tabular-nums">{expectation.toFixed(3)}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Вероятности граней (нормированные веса):
            </p>
            {weights.map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 text-sm font-medium text-gray-700">{i + 1}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={w}
                  onChange={(e) => setWeight(i, Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="w-14 text-right text-xs text-gray-600 tabular-nums">
                  {(probs[i] * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => roll(1)}
              className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Бросить 1 раз
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => roll(100)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                100 бросков
              </button>
              <button
                onClick={() => roll(1000)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                1000 бросков
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

export default Expectation
