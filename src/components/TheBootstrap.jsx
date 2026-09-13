import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'
import {
  histogram,
  mean,
  std,
  randNormal,
  randExponential,
  randUniform,
} from '../utils/stats.js'

const DISTS = {
  normal: { name: 'Нормальное', mu: 5, sigma: 2, gen: (n) => Array.from({ length: n }, () => randNormal(5, 2)), domain: [-2, 12] },
  exponential: { name: 'Экспоненциальное', mu: 1, sigma: 1, gen: (n) => Array.from({ length: n }, () => randExponential(1)), domain: [0, 4] },
  uniform: { name: 'Равномерное', mu: 5, sigma: 10 / Math.sqrt(12), gen: (n) => Array.from({ length: n }, () => randUniform(0, 10)), domain: [-1, 11] },
}

const MAX_BOOTSTRAP = 20000

function TheBootstrap() {
  const [distKey, setDistKey] = useState('exponential')
  const [n, setN] = useState(10)
  const [sample, setSample] = useState(null)
  const [bootMeans, setBootMeans] = useState([])

  const dist = DISTS[distKey]

  const drawSample = () => {
    setSample(dist.gen(n))
    setBootMeans([])
  }

  const resample = (count) => {
    if (!sample) return
    const batch = []
    for (let c = 0; c < count; c++) {
      let s = 0
      for (let i = 0; i < n; i++) {
        s += sample[Math.floor(Math.random() * n)]
      }
      batch.push(s / n)
    }
    setBootMeans((prev) => [...prev, ...batch].slice(0, MAX_BOOTSTRAP))
  }

  const resetAll = () => {
    setSample(null)
    setBootMeans([])
  }

  const sampleMean = sample ? mean(sample) : 0
  const sampleSd = sample ? std(sample) : 0
  const bootMean = bootMeans.length ? mean(bootMeans) : 0
  const bootSe = bootMeans.length ? std(bootMeans) : 0
  const theoreticalSe = dist.sigma / Math.sqrt(n)

  // Гистограмма бутстрэп-средних
  const histDomain = sample
    ? [
        Math.min(sampleMean - 3 * (theoreticalSe || 1), ...(sample.length ? sample : [0])),
        Math.max(sampleMean + 3 * (theoreticalSe || 1), ...(sample.length ? sample : [1])),
      ]
    : [0, 1]
  const hist = bootMeans.length ? histogram(bootMeans, 40, histDomain[0], histDomain[1]) : null
  const histMax = hist ? Math.max(...hist.map((b) => b.density)) : 1

  // Полоска исходной выборки
  const stripDomain = sample ? dist.domain : [0, 1]
  const stripX = (v) => 40 + ((v - stripDomain[0]) / (stripDomain[1] - stripDomain[0])) * 540

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-rose-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Бутстрэп (The Bootstrap)</h3>
        <p className="text-gray-700 mb-3">
          Бутстрэп — это удобный способ <strong>оценивать свойства статистических оценок с помощью
          повторных выборок</strong> из данных. Распределения многих оценок трудно вывести
          аналитически; бутстрэп обходит эту трудность.
        </p>
        <p className="text-gray-700 mb-3">
          Идея проста: вместо теоретического распределения используем{' '}
          <strong>эмпирическую функцию распределения</strong>, построенную по единственной выборке
          из генеральной совокупности, и многократно <strong>ресэмплируем с возвращением</strong>.
          Каждый раз заново вычисляем оценку (например, выборочное среднее) и смотрим, как
          полученные значения рассеяны вокруг исходной.
        </p>
        <p className="text-gray-700">
          Сделайте одну выборку из генеральной совокупности, затем ресэмплируйте её много раз:
          разброс бутстрэп-средних оценивает стандартную ошибку выборочного среднего (её можно
          сравнить с теоретическим значением σ/√n).
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-rose-200 p-6 flex-1 min-w-[340px]">
          <h3 className="text-lg font-semibold mb-3">Исходная выборка</h3>
          <svg viewBox="0 0 620 90" className="w-full h-auto select-none">
            <line x1="30" x2="600" y1="60" y2="60" stroke="#9ca3af" strokeWidth="1.5" />
            {sample
              ? sample.map((v, i) => (
                  <circle key={i} cx={stripX(v)} cy="60" r="4" fill="#f43f5e" opacity="0.75" />
                ))
              : null}
            {sample && (
              <>
                <line x1={stripX(sampleMean)} x2={stripX(sampleMean)} y1="40" y2="80" stroke="#0f172a" strokeWidth="2" />
                <text x={stripX(sampleMean)} y="26" textAnchor="middle" fontSize="12" fill="#0f172a">
                  x̄ = {sampleMean.toFixed(3)}
                </text>
              </>
            )}
          </svg>
          <p className="text-xs text-gray-500 mb-4">
            {sample
              ? `n = ${n} наблюдений из генеральной совокупности.`
              : 'Выборка ещё не сделана — нажмите «Сделать выборку».'}
          </p>

          <h3 className="text-lg font-semibold mb-3">Распределение бутстрэп-средних</h3>
          {bootMeans.length === 0 ? (
            <p className="text-sm text-gray-400 h-40 flex items-center justify-center">
              Пока нет ресэмплов.
            </p>
          ) : (
            <Plot
              xMin={histDomain[0]}
              xMax={histDomain[1]}
              yMin={0}
              yMax={histMax * 1.1}
              xLabel="Среднее по ресэмплу"
              yLabel="Плотность"
            >
              {({ sx, sy }) => (
                <>
                  {hist.map((b, i) => (
                    <rect
                      key={i}
                      x={sx(b.x0)}
                      y={sy(b.density)}
                      width={Math.max(1, sx(b.x1) - sx(b.x0))}
                      height={sy(0) - sy(b.density)}
                      fill="#fda4af"
                      stroke="#fb7185"
                    />
                  ))}
                  <path
                    d={linePath(
                      [
                        [sampleMean, 0],
                        [sampleMean, histMax],
                      ],
                      sx,
                      sy
                    )}
                    stroke="#0f172a"
                    strokeWidth="2"
                    strokeDasharray="5 4"
                    fill="none"
                  />
                </>
              )}
            </Plot>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mt-2">
            <span>
              Среднее бутстрэп-средних:{' '}
              <strong className="text-rose-700 tabular-nums">
                {bootMeans.length ? bootMean.toFixed(4) : '—'}
              </strong>
            </span>
            <span>
              Станд. ошибка (бутстрэп):{' '}
              <strong className="text-rose-700 tabular-nums">
                {bootMeans.length ? bootSe.toFixed(4) : '—'}
              </strong>
            </span>
            <span>
              Теория σ/√n: <strong className="tabular-nums">{theoreticalSe.toFixed(4)}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-6 min-w-[290px] space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-2">Генеральная совокупность:</p>
            <div className="space-y-1">
              {Object.entries(DISTS).map(([k, d]) => (
                <button
                  key={k}
                  onClick={() => {
                    setDistKey(k)
                    setSample(null)
                    setBootMeans([])
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    distKey === k ? 'bg-rose-100 text-rose-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <Slider
            label="Объём выборки n"
            value={n}
            min={2}
            max={50}
            step={1}
            onChange={(v) => {
              setN(v)
              setSample(null)
              setBootMeans([])
            }}
            accentClass="accent-rose-600"
          />

          <div className="space-y-2">
            <button
              onClick={drawSample}
              className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Сделать выборку
            </button>
            <button
              onClick={() => resample(1)}
              disabled={!sample}
              className="w-full px-4 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 text-rose-800 rounded-lg text-sm font-medium transition-colors"
            >
              1 ресэмпл
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => resample(100)}
                disabled={!sample}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 text-rose-800 rounded-lg text-sm font-medium transition-colors"
              >
                100 ресэмплов
              </button>
              <button
                onClick={() => resample(1000)}
                disabled={!sample}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 disabled:opacity-40 text-rose-800 rounded-lg text-sm font-medium transition-colors"
              >
                1000 ресэмплов
              </button>
            </div>
            <button
              onClick={resetAll}
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

export default TheBootstrap
