import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'
import {
  randBernoulli,
  randPoisson,
  randExponential,
  randNormal,
  randUniform,
  binomialPmf,
  poissonPmf,
  exponentialPdf,
  normalPdf,
  uniformPdf,
  mean,
} from '../utils/stats.js'

// Каждое распределение: параметр θ, генератор выборки и правдоподобие L(θ | x)
const MODELS = {
  bernoulli: {
    name: 'Бернулли',
    thetaLabel: 'p (вероятность успеха)',
    thetaMin: 0.01,
    thetaMax: 0.99,
    thetaStep: 0.005,
    gen: (n) => Array.from({ length: n }, () => randBernoulli(0.5)),
    logL: (theta, xs) => {
      let s = 0
      for (const x of xs) s += x ? Math.log(theta) : Math.log(1 - theta)
      return s
    },
    mle: (xs) => mean(xs),
  },
  binomial: {
    name: 'Биномиальное (n = 10)',
    thetaLabel: 'p',
    thetaMin: 0.01,
    thetaMax: 0.99,
    thetaStep: 0.005,
    gen: (n) => {
      const trials = 10
      return Array.from({ length: n }, () => {
        let s = 0
        for (let i = 0; i < trials; i++) s += randBernoulli(0.5)
        return s
      })
    },
    logL: (theta, xs) => {
      let s = 0
      for (const x of xs) {
        const p = binomialPmf(x, 10, theta)
        s += p > 0 ? Math.log(p) : -Infinity
      }
      return s
    },
    mle: (xs) => mean(xs) / 10,
  },
  poisson: {
    name: 'Пуассона',
    thetaLabel: 'λ',
    thetaMin: 0.1,
    thetaMax: 15,
    thetaStep: 0.05,
    gen: (n) => Array.from({ length: n }, () => randPoisson(3)),
    logL: (theta, xs) => {
      let s = 0
      for (const x of xs) s += Math.log(poissonPmf(x, theta))
      return s
    },
    mle: (xs) => mean(xs),
  },
  exponential: {
    name: 'Экспоненциальное',
    thetaLabel: 'λ',
    thetaMin: 0.1,
    thetaMax: 6,
    thetaStep: 0.01,
    gen: (n) => Array.from({ length: n }, () => randExponential(1)),
    logL: (theta, xs) => {
      let s = 0
      for (const x of xs) s += Math.log(exponentialPdf(x, theta))
      return s
    },
    mle: (xs) => 1 / mean(xs),
  },
  normal: {
    name: 'Нормальное (σ = 1)',
    thetaLabel: 'μ',
    thetaMin: -6,
    thetaMax: 6,
    thetaStep: 0.02,
    gen: (n) => Array.from({ length: n }, () => randNormal(0, 1)),
    logL: (theta, xs) => {
      let s = 0
      for (const x of xs) s += Math.log(normalPdf(x, theta, 1))
      return s
    },
    mle: (xs) => mean(xs),
  },
  uniform: {
    name: 'Равномерное (0, θ)',
    thetaLabel: 'θ (правая граница)',
    thetaMin: 0.5,
    thetaMax: 12,
    thetaStep: 0.01,
    gen: (n) => Array.from({ length: n }, () => randUniform(0, 3)),
    logL: (theta, xs) => {
      const mx = Math.max(...xs)
      if (theta < mx) return -Infinity
      return -xs.length * Math.log(theta)
    },
    mle: (xs) => Math.max(...xs),
  },
}

function makeLogLCurve(model, xs, thetaMin, thetaMax, steps = 200) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const theta = thetaMin + ((thetaMax - thetaMin) * i) / steps
    pts.push([theta, model.logL(theta, xs)])
  }
  return pts
}

function LikelihoodFunction() {
  const [modelKey, setModelKey] = useState('bernoulli')
  const [sampleSize, setSampleSize] = useState(10)
  const [sample, setSample] = useState(null)
  const [theta, setTheta] = useState(0.5)

  const model = MODELS[modelKey]
  const thetaMin = model.thetaMin
  const thetaMax = model.thetaMax

  const selectModel = (k) => {
    setModelKey(k)
    setSample(null)
    setTheta((MODELS[k].thetaMin + MODELS[k].thetaMax) / 2)
  }

  const draw = () => {
    setSample(model.gen(sampleSize))
  }

  const curve = sample
    ? makeLogLCurve(model, sample, thetaMin, thetaMax)
    : makeLogLCurve(model, [0.5], thetaMin, thetaMax)

  const finite = curve.filter((p) => isFinite(p[1]))
  const maxL = finite.length ? Math.max(...finite.map((p) => p[1])) : 0
  const minL = finite.length ? Math.min(...finite.map((p) => p[1])) : 0
  // Нормированное правдоподобие L/Lmax для наглядности
  const normCurve = finite.map(([t, l]) => [t, Math.exp(l - maxL)])
  const currentLogL = sample ? model.logL(theta, sample) : null
  const mle = sample ? model.mle(sample) : null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-teal-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Функция правдоподобия (Likelihood Function)</h3>
        <p className="text-gray-700 mb-3">
          В статистике функция правдоподобия имеет строгое определение:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">L(θ | x) = P(x | θ)</span> —
          это вероятность (или плотность) наблюдённых данных x, рассматриваемая как функция
          параметра θ.
        </p>
        <p className="text-gray-700 mb-3">
          Важно не путать: плотность фиксирует параметр и меняется по данным, а правдоподобие
          фиксирует данные и меняется по параметру. Правдоподобие играет фундаментальную роль
          <strong> и в байесовской, и в частотной статистике</strong>: оно связывает данные с
          моделью.
        </p>
        <p className="text-gray-700">
          Выберите распределение, сделайте выборку и двигайте ползунок θ: график показывает форму
          функции правдоподобия (нормированную на максимум). Значение θ, максимизирующее
          правдоподобие, называется оценкой максимального правдоподобия.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-teal-200 p-6 flex-1 min-w-[360px]">
          <h3 className="text-lg font-semibold mb-4">Правдоподобие L(θ | данные)</h3>
          <Plot
            xMin={thetaMin}
            xMax={thetaMax}
            yMin={0}
            yMax={1.05}
            xLabel="Параметр θ"
            yLabel="L(θ) / L(θ̂)"
          >
            {({ sx, sy }) => (
              <>
                <path
                  d={linePath(normCurve, sx, sy)}
                  fill="none"
                  stroke="#14b8a6"
                  strokeWidth="2.5"
                />
                <line
                  x1={sx(theta)}
                  x2={sx(theta)}
                  y1={sy(0)}
                  y2={sy(1)}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />
                {mle !== null && isFinite(mle) && (
                  <>
                    <circle cx={sx(mle)} cy={sy(1)} r="5" fill="#f59e0b" />
                    <text
                      x={sx(mle)}
                      y={sy(1) - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#b45309"
                    >
                      θ̂ (максимум)
                    </text>
                  </>
                )}
              </>
            )}
          </Plot>
          {sample && (
            <p className="text-sm text-gray-600 mt-2">
              Данные: [{sample.slice(0, 12).map((x) => (typeof x === 'number' ? Number(x.toFixed(2)) : x)).join(', ')}
              {sample.length > 12 ? ', …' : ''}]
              {currentLogL !== null && (
                <>
                  {' '}· log L(θ = {theta.toFixed(2)}) ={' '}
                  <strong className="text-teal-700 tabular-nums">
                    {isFinite(currentLogL) ? currentLogL.toFixed(2) : '−∞'}
                  </strong>
                </>
              )}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-teal-200 p-6 min-w-[300px] space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-2">Распределение:</p>
            <div className="space-y-1">
              {Object.entries(MODELS).map(([k, m]) => (
                <button
                  key={k}
                  onClick={() => selectModel(k)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    modelKey === k ? 'bg-teal-100 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Объём выборки n"
            value={sampleSize}
            min={1}
            max={50}
            step={1}
            onChange={setSampleSize}
            accentClass="accent-teal-600"
          />

          <button
            onClick={draw}
            className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Сделать выборку
          </button>

          <Slider
            label={model.thetaLabel}
            value={theta}
            min={thetaMin}
            max={thetaMax}
            step={model.thetaStep}
            onChange={setTheta}
            format={(v) => v.toFixed(2)}
            accentClass="accent-teal-600"
          />

          {sample && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              Текущее значение параметра:{' '}
              <strong className="text-teal-700 tabular-nums">{theta.toFixed(2)}</strong>
              <br />
              Оценка максимального правдоподобия:{' '}
              <strong className="text-amber-600 tabular-nums">{mle.toFixed(2)}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LikelihoodFunction
