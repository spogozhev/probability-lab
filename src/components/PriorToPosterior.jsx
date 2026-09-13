import { useState } from 'react'
import { Plot, areaPath, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'
import { betaPdf, betaQuantile } from '../utils/stats.js'

function betaCurve(a, b, steps = 240) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const x = i / steps
    pts.push([x, betaPdf(x, a, b)])
  }
  return pts
}

function PriorToPosterior() {
  const [trueP, setTrueP] = useState(() => Math.random())
  const [alpha0, setAlpha0] = useState(2)
  const [beta0, setBeta0] = useState(2)
  const [flips, setFlips] = useState([]) // true = орёл
  const [showTrue, setShowTrue] = useState(false)

  const heads = flips.filter(Boolean).length
  const tails = flips.length - heads

  const postA = alpha0 + heads
  const postB = beta0 + tails

  const postMean = postA / (postA + postB)
  const ciLo = betaQuantile(0.025, postA, postB)
  const ciHi = betaQuantile(0.975, postA, postB)

  const priorCurve = betaCurve(alpha0, beta0)
  const postCurve = betaCurve(postA, postB)

  const flip = (n) => {
    const batch = []
    for (let i = 0; i < n; i++) batch.push(Math.random() < trueP)
    setFlips((prev) => [...prev, ...batch])
  }

  const resetData = () => setFlips([])

  const newCoin = () => {
    setTrueP(Math.random())
    setFlips([])
    setShowTrue(false)
  }

  const bakeAsPrior = () => {
    // Апостериорное распределение становится новым априорным
    setAlpha0(Number(postA.toFixed(2)))
    setBeta0(Number(postB.toFixed(2)))
    setFlips([])
  }

  const yMax =
    Math.max(0.5, ...postCurve.map((p) => p[1]), ...priorCurve.map((p) => p[1])) * 1.12

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-teal-200 p-6">
        <h3 className="text-lg font-semibold mb-3">От априорного к апостериорному (Prior to Posterior)</h3>
        <p className="text-gray-700 mb-3">
          В основе байесовской статистики лежит идея о том, что{' '}
          <strong>убеждения следует обновлять по мере поступления новых данных</strong>. Рассмотрим
          монету со скрытой вероятностью орла p — мы не знаем, симметрична ли она.
        </p>
        <p className="text-gray-700 mb-3">
          Априорные убеждения о p задаются бета-распределением Beta(α, β), которое удобно
          настраивать ползунками. После каждой серии бросков по формуле Байеса получается
          апостериорное распределение — и оно же <strong>служит априорным для следующих
          бросков</strong>:
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm ml-1">
            Beta(α + орлы, β + решки)
          </span>
          .
        </p>
        <p className="text-gray-700">
          Бросайте монету и следите, как распределение сужается вокруг истинного значения p. Когда
          данных станет достаточно, нажмите «Зафиксировать апостериорное как априорное» и
          продолжите эксперимент — обновление убеждений можно продолжать бесконечно.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-teal-200 p-6 flex-1 min-w-[360px]">
          <h3 className="text-lg font-semibold mb-4">Распределение вероятности орла p</h3>
          <Plot xMin={0} xMax={1} yMin={0} yMax={yMax} xLabel="p — вероятность орла" yLabel="Плотность">
            {({ sx, sy }) => (
              <>
                <path
                  d={areaPath(priorCurve, sx, sy)}
                  fill="rgba(236,72,153,0.18)"
                  stroke="#ec4899"
                  strokeWidth="2"
                />
                <path
                  d={areaPath(postCurve, sx, sy)}
                  fill="rgba(13,148,136,0.25)"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                />
                {showTrue && (
                  <line
                    x1={sx(trueP)}
                    x2={sx(trueP)}
                    y1={sy(0)}
                    y2={sy(yMax)}
                    stroke="#0f172a"
                    strokeDasharray="5 4"
                    strokeWidth="1.5"
                  />
                )}
              </>
            )}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-pink-500 align-middle mr-1"></span>
            априорное Beta({alpha0}, {beta0})
            <span className="inline-block w-3 h-0.5 bg-teal-600 align-middle ml-4 mr-1"></span>
            апостериорное Beta({postA.toFixed(0)}, {postB.toFixed(0)})
            {showTrue && (
              <>
                <span className="inline-block w-3 h-0.5 bg-slate-800 align-middle ml-4 mr-1"></span>
                истинное p = {trueP.toFixed(3)}
              </>
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-teal-200 p-6 min-w-[300px] space-y-5">
          <h3 className="text-lg font-semibold">Априорное Beta(α, β)</h3>
          <Slider
            label="α"
            value={alpha0}
            min={0.5}
            max={20}
            step={0.5}
            onChange={setAlpha0}
            accentClass="accent-pink-500"
          />
          <Slider
            label="β"
            value={beta0}
            min={0.5}
            max={20}
            step={0.5}
            onChange={setBeta0}
            accentClass="accent-pink-500"
          />

          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
            <p>
              Бросков: <strong className="text-gray-800">{flips.length}</strong> (орлов: {heads},
              решек: {tails})
            </p>
            <p>
              Апостериорное среднее p:{' '}
              <strong className="text-teal-700 tabular-nums">{postMean.toFixed(3)}</strong>
            </p>
            <p>
              95%-й интервал: [
              <span className="tabular-nums">
                {ciLo.toFixed(3)}; {ciHi.toFixed(3)}
              </span>
              ]
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => flip(1)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Бросить 1 раз
            </button>
            <button
              onClick={() => flip(10)}
              className="px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-800 rounded-lg text-sm font-medium transition-colors"
            >
              Бросить 10 раз
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={bakeAsPrior}
              className="w-full px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-lg text-sm font-medium transition-colors"
            >
              Зафиксировать апостериорное как априорное
            </button>
            <button
              onClick={resetData}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Сбросить броски
            </button>
            <button
              onClick={newCoin}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Новая монета
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showTrue}
                onChange={(e) => setShowTrue(e.target.checked)}
                className="rounded border-gray-300"
              />
              Показать истинное p
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriorToPosterior
