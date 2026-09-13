import { useState } from 'react'
import { Plot, areaPath, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'
import {
  histogram,
  mean,
  normalPdf,
  randUniform,
  randNormal,
  randExponential,
  randBeta,
} from '../utils/stats.js'

// Источники распределений: { name, gen, mu, sigma, params }
const SOURCES = {
  uniform: {
    name: 'Равномерное',
    params: [],
    mu: 5,
    sigma: Math.sqrt(100 / 12),
    gen: () => randUniform(0, 10),
    domain: [0, 10],
  },
  normal: {
    name: 'Нормальное',
    params: [{ key: 'mu', label: 'μ (среднее)', min: 0, max: 10, step: 0.5, def: 5 }],
    mu: (p) => p.mu,
    sigma: 2,
    gen: (p) => randNormal(p.mu, 2),
    domain: (p) => [p.mu - 8, p.mu + 8],
  },
  exponential: {
    name: 'Экспоненциальное',
    params: [{ key: 'lambda', label: 'λ (интенсивность)', min: 0.2, max: 2, step: 0.1, def: 0.5 }],
    mu: (p) => 1 / p.lambda,
    sigma: (p) => 1 / p.lambda,
    gen: (p) => randExponential(p.lambda),
    domain: (p) => [0, 6 / p.lambda],
  },
  beta: {
    name: 'Бета',
    params: [
      { key: 'a', label: 'α (форма)', min: 0.5, max: 8, step: 0.5, def: 0.8 },
      { key: 'b', label: 'β (форма)', min: 0.5, max: 8, step: 0.5, def: 0.8 },
    ],
    mu: (p) => p.a / (p.a + p.b),
    sigma: (p) =>
      Math.sqrt((p.a * p.b) / ((p.a + p.b) ** 2 * (p.a + p.b + 1))),
    gen: (p) => randBeta(p.a, p.b),
    domain: [0, 1],
  },
}

function CentralLimitTheorem() {
  const [srcKey, setSrcKey] = useState('exponential')
  const [params, setParams] = useState(() =>
    Object.fromEntries(
      Object.entries(SOURCES).map(([k, s]) => [
        k,
        Object.fromEntries(s.params.map((p) => [p.key, p.def])),
      ])
    )
  )
  const [sampleSize, setSampleSize] = useState(10)
  const [means, setMeans] = useState([])
  const [showNormal, setShowNormal] = useState(true)

  const src = SOURCES[srcKey]
  const p = params[srcKey]
  const mu = typeof src.mu === 'function' ? src.mu(p) : src.mu
  const sigma = typeof src.sigma === 'function' ? src.sigma(p) : src.sigma
  const domain = typeof src.domain === 'function' ? src.domain(p) : src.domain

  const addSamples = (count) => {
    const batch = []
    for (let c = 0; c < count; c++) {
      let s = 0
      for (let i = 0; i < sampleSize; i++) s += src.gen(p)
      batch.push(s / sampleSize)
    }
    setMeans((prev) => [...prev, ...batch].slice(0, 20000))
  }

  const reset = () => setMeans([])

  const selectSrc = (k) => {
    setSrcKey(k)
    setMeans([])
  }

  const se = sigma / Math.sqrt(sampleSize)
  const hist = means.length ? histogram(means, 40, domain[0], domain[1]) : null
  const meanOfMeans = means.length ? mean(means) : 0

  // Область для графика: вокруг теоретического среднего выборочного среднего
  const center = mu
  const halfWidth = Math.max(4 * se, (domain[1] - domain[0]) * 0.15)
  const xMin = Math.max(domain[0] - halfWidth * 0.3, center - halfWidth)
  const xMax = Math.min(domain[1] + halfWidth * 0.3, center + halfWidth)
  // Ось Y: высота пика нормальной кривой 1/(σ/√n·√(2π)) плюс запас,
  // чтобы кривая помещалась целиком; учитываем и максимумы гистограммы
  const curvePeak = normalPdf(center, center, se)
  const histMaxDensity = hist ? Math.max(...hist.map((b) => b.density)) : 0
  const yMax = Math.max(curvePeak * 1.15, histMaxDensity * 1.05)

  const normalCurve = []
  for (let i = 0; i <= 200; i++) {
    const x = xMin + ((xMax - xMin) * i) / 200
    normalCurve.push([x, normalPdf(x, center, se)])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-emerald-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Центральная предельная теорема (Central Limit Theorem)</h3>
        <p className="text-gray-700 mb-3">
          Центральная предельная теорема — один из самых важных результатов статистики. Она
          утверждает, что <strong>выборочное среднее достаточно большого числа независимых
          одинаково распределённых случайных величин имеет приблизительно нормальное
          распределение</strong>, причём чем больше объём выборки, тем лучше приближение.
        </p>
        <p className="text-gray-700 mb-3">
          Примечательно, что форма исходного распределения может быть любой — несимметричной,
          скошенной, с «провалом». Тем не менее средние по выборкам из него будут распределяться
          почти нормально с тем же центром и стандартным отклонением σ/√n.
        </p>
        <p className="text-gray-700">
          Выберите форму исходного распределения, задайте объём выборки n и постройте как можно
          больше выборочных средних. Включите отображение теоретической нормальной кривой и
          убедитесь, насколько хорошо она описывает гистограмму.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-emerald-200 p-6 flex-1 min-w-[340px]">
          <h3 className="text-lg font-semibold mb-4">Распределение выборочных средних</h3>
          <Plot xMin={xMin} xMax={xMax} yMin={0} yMax={yMax} xLabel="Выборочное среднее" yLabel="Плотность">
            {({ sx, sy }) => (
              <>
                {hist &&
                  hist.map((b, i) => (
                    <rect
                      key={i}
                      x={sx(b.x0)}
                      y={sy(b.density)}
                      width={Math.max(1, sx(b.x1) - sx(b.x0))}
                      height={sy(0) - sy(b.density)}
                      fill="#6ee7b7"
                      stroke="#34d399"
                    />
                  ))}
                {showNormal && (
                  <>
                    <path
                      d={areaPath(normalCurve, sx, sy)}
                      fill="rgba(249,115,22,0.15)"
                      stroke="none"
                    />
                    <path d={linePath(normalCurve, sx, sy)} fill="none" stroke="#f97316" strokeWidth="2.5" />
                  </>
                )}
              </>
            )}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-3 bg-emerald-300 align-middle mr-1 rounded-sm"></span>
            гистограмма выборочных средних
            <span className="inline-block w-3 h-0.5 bg-orange-500 align-middle ml-4 mr-1"></span>
            нормальная кривая N({mu.toFixed(2)}, {se.toFixed(3)}²)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-6 min-w-[300px] space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-2">Исходное распределение:</p>
            <div className="space-y-1">
              {Object.entries(SOURCES).map(([k, s]) => (
                <button
                  key={k}
                  onClick={() => selectSrc(k)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    srcKey === k ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            {src.params.map((prm) => (
              <Slider
                key={prm.key}
                label={prm.label}
                value={p[prm.key]}
                min={prm.min}
                max={prm.max}
                step={prm.step}
                onChange={(v) => {
                  setParams((prev) => ({ ...prev, [srcKey]: { ...prev[srcKey], [prm.key]: v } }))
                  setMeans([])
                }}
                accentClass="accent-emerald-600"
              />
            ))}
            <Slider
              label="Объём выборки n"
              value={sampleSize}
              min={1}
              max={100}
              step={1}
              onChange={(v) => {
                setSampleSize(v)
                setMeans([])
              }}
              accentClass="accent-emerald-600"
            />
          </div>

          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 rounded-lg p-3">
            <p>
              μ = <strong className="text-gray-800">{mu.toFixed(3)}</strong>, σ/√n ={' '}
              <strong className="text-gray-800">{se.toFixed(4)}</strong>
            </p>
            {means.length > 0 && (
              <p>
                Средних построено: <strong className="text-gray-800">{means.length}</strong>
                <br />
                Их среднее: <strong className="text-emerald-700">{meanOfMeans.toFixed(3)}</strong>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => addSamples(1)}
              className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Одна выборка
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addSamples(100)}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-medium transition-colors"
              >
                100 выборок
              </button>
              <button
                onClick={() => addSamples(1000)}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-sm font-medium transition-colors"
              >
                1000 выборок
              </button>
            </div>
            <button
              onClick={reset}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Сбросить
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={showNormal}
                onChange={(e) => setShowNormal(e.target.checked)}
                className="rounded border-gray-300"
              />
              Показать нормальную кривую
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CentralLimitTheorem
