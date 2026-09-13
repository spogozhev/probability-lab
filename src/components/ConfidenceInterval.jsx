import { useState } from 'react'
import Slider from './Slider.jsx'
import {
  randUniform,
  randNormal,
  randStudentT,
  randChiSq,
  randExponential,
  randF,
  mean,
  std,
  tQuantile,
} from '../utils/stats.js'

const DISTS = {
  uniform: { name: 'Равномерное', mu: 0.5, gen: (n) => Array.from({ length: n }, () => randUniform(0, 1)), domain: [-0.2, 1.7] },
  normal: { name: 'Нормальное', mu: 5, gen: (n) => Array.from({ length: n }, () => randNormal(5, 2)), domain: [1.5, 8.5] },
  student: { name: 'Стьюдента', mu: 0, gen: (n) => Array.from({ length: n }, () => randStudentT(3)), domain: [-6, 6] },
  chisq: { name: 'Хи-квадрат', mu: 4, gen: (n) => Array.from({ length: n }, () => randChiSq(4)), domain: [-1, 18] },
  exponential: { name: 'Экспоненциальное', mu: 1, gen: (n) => Array.from({ length: n }, () => randExponential(1)), domain: [-0.8, 6] },
  fisher: { name: 'Фишера', mu: 1.25, gen: (n) => Array.from({ length: n }, () => randF(4, 10)), domain: [-0.5, 8] },
}

const MAX_INTERVALS = 120

function ConfidenceInterval() {
  const [distKey, setDistKey] = useState('exponential')
  const [sampleSize, setSampleSize] = useState(5)
  const [level, setLevel] = useState(0.9)
  const [intervals, setIntervals] = useState([]) // { lo, hi, hit }

  const dist = DISTS[distKey]

  const run = (count) => {
    const batch = []
    for (let c = 0; c < count; c++) {
      const sample = dist.gen(sampleSize)
      const xbar = mean(sample)
      const s = std(sample)
      const tcrit = tQuantile(1 - (1 - level) / 2, sampleSize - 1)
      const half = (tcrit * s) / Math.sqrt(sampleSize)
      const lo = xbar - half
      const hi = xbar + half
      batch.push({ lo, hi, hit: lo <= dist.mu && dist.mu <= hi })
    }
    setIntervals((prev) => [...prev, ...batch].slice(-MAX_INTERVALS))
  }

  const reset = () => setIntervals([])

  const shown = intervals.slice(-60).reverse()
  const hits = intervals.filter((i) => i.hit).length
  const captureRate = intervals.length ? hits / intervals.length : 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-rose-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Доверительный интервал (Confidence Interval)</h3>
        <p className="text-gray-700 mb-3">
          В отличие от точечной оценки, <strong>доверительный интервал оценивает параметр целым
          диапазоном возможных значений</strong>. Каждый интервал сопровождается доверительным
          уровнем — вероятностью того, что процедура построения даст интервал, накрывающий
          истинное значение параметра.
        </p>
        <p className="text-gray-700 mb-3">
          Важно понимать: параметр фиксирован, случайным является сам интервал. Если многократно
          повторять эксперимент, то доля «попаданий» интервалов будет приближаться к доверительному
          уровню 1 − α (например, 90%).
        </p>
        <p className="text-gray-700">
          Выберите распределение, задайте объём выборки n и доверительный уровень, затем постройте
          серию доверительных интервалов для среднего. Красным выделены интервалы, не накрывшие
          истинное среднее.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-rose-200 p-6 flex-1 min-w-[380px]">
          <h3 className="text-lg font-semibold mb-4">Последние доверительные интервалы</h3>
          <svg viewBox="0 0 620 480" className="w-full h-auto select-none">
            {(() => {
              const [x0, x1] = dist.domain
              const sx = (v) => 60 + ((v - x0) / (x1 - x0)) * 540
              const rowH = 480 / 62
              const rows = []
              for (let i = 59; i >= 0; i--) {
                rows.push(20 + (59 - i) * rowH)
              }
              return (
                <>
                  <line x1={sx(dist.mu)} x2={sx(dist.mu)} y1="10" y2="470" stroke="#9f1239" strokeDasharray="5 4" strokeWidth="1.5" />
                  <text x={sx(dist.mu) + 5} y="16" fontSize="11" fill="#9f1239">
                    истинное μ = {dist.mu}
                  </text>
                  {shown.map((iv, i) => (
                    <g key={i}>
                      <line
                        x1={sx(Math.max(x0, iv.lo))}
                        x2={sx(Math.min(x1, iv.hi))}
                        y1={rows[i]}
                        y2={rows[i]}
                        stroke={iv.hit ? '#334155' : '#e11d48'}
                        strokeWidth="2"
                      />
                      {!iv.hit && (
                        <>
                          {iv.lo > x0 && <circle cx={sx(iv.lo)} cy={rows[i]} r="2.6" fill="#e11d48" />}
                          {iv.hi < x1 && <circle cx={sx(iv.hi)} cy={rows[i]} r="2.6" fill="#e11d48" />}
                        </>
                      )}
                    </g>
                  ))}
                </>
              )
            })()}
          </svg>
          {intervals.length === 0 && (
            <p className="text-sm text-gray-400 text-center -mt-24">Нажмите «1 эксперимент» или «50 экспериментов».</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-slate-700 align-middle mr-1"></span>
            интервал накрыл μ
            <span className="inline-block w-3 h-0.5 bg-rose-600 align-middle ml-4 mr-1"></span>
            промах
          </p>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-6 min-w-[300px] space-y-5">
          <div>
            <p className="text-sm text-gray-600 mb-2">Распределение:</p>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(DISTS).map(([k, d]) => (
                <button
                  key={k}
                  onClick={() => {
                    setDistKey(k)
                    setIntervals([])
                  }}
                  className={`px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
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
            value={sampleSize}
            min={2}
            max={30}
            step={1}
            onChange={(v) => {
              setSampleSize(v)
              setIntervals([])
            }}
            accentClass="accent-rose-600"
          />

          <Slider
            label="Доверительный уровень 1 − α"
            value={level}
            min={0.5}
            max={0.99}
            step={0.01}
            onChange={(v) => {
              setLevel(v)
              setIntervals([])
            }}
            format={(v) => v.toFixed(2)}
            accentClass="accent-rose-600"
          />

          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            Построено интервалов: <strong className="text-gray-800">{intervals.length}</strong>
            <br />
            Накрыли μ: <strong className="text-gray-800">{hits}</strong>
            <br />
            Эмпирическая доля попаданий:{' '}
            <strong className={intervals.length ? 'text-rose-700' : 'text-gray-800'}>
              {intervals.length ? `${(captureRate * 100).toFixed(1)}%` : '—'}
            </strong>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => run(1)}
              className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              1 эксперимент
            </button>
            <button
              onClick={() => run(50)}
              className="w-full px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors"
            >
              50 экспериментов
            </button>
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

export default ConfidenceInterval
