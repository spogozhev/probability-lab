import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'
import {
  bernoulliPmf,
  binomialPmf,
  binomialCdf,
  geometricPmf,
  geometricCdf,
  poissonPmf,
  poissonCdf,
  negBinomialPmf,
  tCdf,
  chiSqCdf,
  fCdf,
  incompleteGamma,
  incompleteBeta,
  uniformPdf,
  normalPdf,
  normalCdf,
  studentTPdf,
  chiSqPdf,
  exponentialPdf,
  fPdf,
  gammaPdf,
  betaPdf,
} from '../utils/stats.js'

const DISCRETE = {
  bernoulli: {
    name: 'Бернулли',
    blurb: 'Одно испытание с двумя исходами — «успех» или «неудача», как бросок монеты.',
    params: [{ key: 'p', label: 'p (вероятность успеха)', min: 0.01, max: 0.99, step: 0.01, def: 0.5 }],
    domain: [0, 3],
    pmf: (x, pr) => bernoulliPmf(x, pr.p),
    cdf: (x, pr) => (x < 0 ? 0 : x < 1 ? 1 - pr.p : 1),
  },
  binomial: {
    name: 'Биномиальное',
    blurb: 'Число успехов в серии из n независимых испытаний Бернулли с вероятностью успеха p.',
    params: [
      { key: 'n', label: 'n (число испытаний)', min: 1, max: 30, step: 1, def: 10 },
      { key: 'p', label: 'p (вероятность успеха)', min: 0.01, max: 0.99, step: 0.01, def: 0.5 },
    ],
    domain: [0, 30],
    pmf: (x, pr) => binomialPmf(x, pr.n, pr.p),
    cdf: (x, pr) => binomialCdf(Math.floor(x), pr.n, pr.p),
  },
  geometric: {
    name: 'Геометрическое',
    blurb: 'Номер испытания, на котором впервые происходит успех (1, 2, 3, …).',
    params: [{ key: 'p', label: 'p (вероятность успеха)', min: 0.05, max: 0.95, step: 0.01, def: 0.3 }],
    domain: [0, 25],
    pmf: (x, pr) => geometricPmf(x, pr.p),
    cdf: (x, pr) => geometricCdf(Math.floor(x), pr.p),
  },
  poisson: {
    name: 'Пуассона',
    blurb: 'Число событий за фиксированный промежуток времени — например, голов в футбольном матче.',
    params: [{ key: 'lambda', label: 'λ (среднее число событий)', min: 0.5, max: 20, step: 0.1, def: 4 }],
    domain: [0, 40],
    pmf: (x, pr) => poissonPmf(x, pr.lambda),
    cdf: (x, pr) => poissonCdf(Math.floor(x), pr.lambda),
  },
  negbinom: {
    name: 'Отрицательное биномиальное',
    blurb: 'Число неудач до наступления r-го успеха.',
    params: [
      { key: 'r', label: 'r (число успехов)', min: 1, max: 10, step: 1, def: 3 },
      { key: 'p', label: 'p (вероятность успеха)', min: 0.05, max: 0.95, step: 0.01, def: 0.4 },
    ],
    domain: [0, 40],
    pmf: (x, pr) => negBinomialPmf(x, pr.r, pr.p),
    cdf: (x, pr) => {
      let s = 0
      for (let k = 0; k <= Math.floor(x); k++) s += negBinomialPmf(k, pr.r, pr.p)
      return s
    },
  },
}

const CONTINUOUS = {
  uniform: {
    name: 'Равномерное',
    blurb: 'Все значения на отрезке [a, b] равновозможны.',
    params: [
      { key: 'a', label: 'a (начало отрезка)', min: -5, max: 4, step: 0.1, def: 0 },
      { key: 'b', label: 'b (конец отрезка)', min: -4, max: 5, step: 0.1, def: 2 },
    ],
    fixParams: (pr) => ({ ...pr, b: Math.max(pr.b, pr.a + 0.5) }),
    domain: (pr) => [pr.a - 2, pr.b + 2],
    pdf: (x, pr) => uniformPdf(x, pr.a, pr.b),
    cdf: (x, pr) => (x < pr.a ? 0 : x > pr.b ? 1 : (x - pr.a) / (pr.b - pr.a)),
  },
  normal: {
    name: 'Нормальное',
    blurb: 'Возникает, когда множество независимых факторов складывается воедино — например, рост человека.',
    params: [
      { key: 'mu', label: 'μ (среднее)', min: -5, max: 5, step: 0.1, def: 0 },
      { key: 'sigma', label: 'σ (стандартное отклонение)', min: 0.3, max: 3, step: 0.05, def: 1 },
    ],
    domain: (pr) => [pr.mu - 4 * pr.sigma, pr.mu + 4 * pr.sigma],
    pdf: (x, pr) => normalPdf(x, pr.mu, pr.sigma),
    cdf: (x, pr) => normalCdf(x, pr.mu, pr.sigma),
  },
  student: {
    name: 'Стьюдента',
    blurb: 'Похоже на нормальное, но с более тяжёлыми хвостами; важно при малых выборках.',
    params: [{ key: 'df', label: 'ν (степени свободы)', min: 1, max: 30, step: 1, def: 3 }],
    domain: [-6, 6],
    pdf: (x, pr) => studentTPdf(x, pr.df),
    cdf: (x, pr) => tCdf(x, pr.df),
  },
  chisq: {
    name: 'Хи-квадрат',
    blurb: 'Распределение суммы квадратов независимых стандартных нормальных величин.',
    params: [{ key: 'k', label: 'k (степени свободы)', min: 1, max: 20, step: 1, def: 4 }],
    domain: (pr) => [0, pr.k + 5 * Math.sqrt(2 * pr.k)],
    pdf: (x, pr) => chiSqPdf(x, pr.k),
    cdf: (x, pr) => chiSqCdf(x, pr.k),
  },
  exponential: {
    name: 'Экспоненциальное',
    blurb: 'Время до наступления следующего события в потоке редких событий.',
    params: [{ key: 'lambda', label: 'λ (интенсивность)', min: 0.1, max: 3, step: 0.05, def: 1 }],
    domain: (pr) => [0, 5 / pr.lambda],
    pdf: (x, pr) => exponentialPdf(x, pr.lambda),
    cdf: (x, pr) => (x <= 0 ? 0 : 1 - Math.exp(-pr.lambda * x)),
  },
  fisher: {
    name: 'Фишера (F)',
    blurb: 'Отношение двух независимых хи-квадрат величин, делённых на свои степени свободы.',
    params: [
      { key: 'd1', label: 'd₁ (степени свободы)', min: 1, max: 20, step: 1, def: 5 },
      { key: 'd2', label: 'd₂ (степени свободы)', min: 2, max: 30, step: 1, def: 10 },
    ],
    domain: (pr) => [0, 6],
    pdf: (x, pr) => fPdf(x, pr.d1, pr.d2),
    cdf: (x, pr) => fCdf(x, pr.d1, pr.d2),
  },
  gamma: {
    name: 'Гамма',
    blurb: 'Обобщение экспоненциального: время до наступления α-го события.',
    params: [
      { key: 'k', label: 'α (форма)', min: 0.5, max: 10, step: 0.1, def: 3 },
      { key: 'theta', label: 'θ (масштаб)', min: 0.3, max: 3, step: 0.05, def: 1 },
    ],
    domain: (pr) => [0, pr.k * pr.theta + 5 * Math.sqrt(pr.k) * pr.theta],
    pdf: (x, pr) => gammaPdf(x, pr.k, pr.theta),
    cdf: (x, pr) => incompleteGamma(pr.k, x / pr.theta),
  },
  beta: {
    name: 'Бета',
    blurb: 'Распределение на отрезке [0, 1]; часто используется как априорное для вероятностей.',
    params: [
      { key: 'a', label: 'α', min: 0.5, max: 10, step: 0.1, def: 2 },
      { key: 'b', label: 'β', min: 0.5, max: 10, step: 0.1, def: 2 },
    ],
    domain: [0, 1],
    pdf: (x, pr) => betaPdf(x, pr.a, pr.b),
    cdf: (x, pr) => incompleteBeta(pr.a, pr.b, x),
  },
}

function makeCurve(fn, x0, x1, params, n = 240) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n
    pts.push([x, fn(x, params)])
  }
  return pts
}

function DiscreteContinuous() {
  const [kind, setKind] = useState('discrete')
  const [distKey, setDistKey] = useState('binomial')
  const [contKey, setContKey] = useState('normal')

  const defs = kind === 'discrete' ? DISCRETE : CONTINUOUS
  const key = kind === 'discrete' ? distKey : contKey
  const def = defs[key]

  const [paramsAll, setParamsAll] = useState(() => {
    const init = {}
    for (const [k, d] of Object.entries({ ...DISCRETE, ...CONTINUOUS })) {
      init[k] = Object.fromEntries(d.params.map((p) => [p.key, p.def]))
    }
    return init
  })

  const selectDist = (k) => {
    if (kind === 'discrete') setDistKey(k)
    else setContKey(k)
  }

  const rawParams = paramsAll[key]
  const params = def.fixParams ? def.fixParams(rawParams) : rawParams
  const domain = typeof def.domain === 'function' ? def.domain(params) : def.domain

  const yMax =
    kind === 'discrete'
      ? Math.max(0.15, Math.max(...Array.from({ length: 201 }, (_, i) => def.pmf(domain[0] + ((domain[1] - domain[0]) * i) / 200, params))))
      : Math.max(0.15, ...makeCurve(def.pdf, domain[0], domain[1], params, 200).map((p) => p[1]))

  const setParam = (k, v) => setParamsAll((prev) => ({ ...prev, [key]: { ...prev[key], [k]: v } }))

  // Точки для CDF (ступенька для дискретных)
  const cdfPts = []
  const steps = 240
  for (let i = 0; i <= steps; i++) {
    const x = domain[0] + ((domain[1] - domain[0]) * i) / steps
    cdfPts.push([x, def.cdf(x, params)])
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-emerald-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Дискретные и непрерывные распределения (Discrete and Continuous)</h3>
        <p className="text-gray-700 mb-3">
          Все распределения вероятностей делятся на два больших класса.{' '}
          <strong>Дискретное</strong> распределение описывает случайную величину с конечным или
          счётным набором возможных значений; его задаёт функция массы вероятности f(x) и функция
          распределения F(x).
        </p>
        <p className="text-gray-700 mb-3">
          <strong>Непрерывная</strong> случайная величина принимает несчётное множество значений, а
          вероятность попасть в интервал находится интегрированием плотности f(x) по этому
          интервалу.
        </p>
        <p className="text-gray-700">
          Выберите распределение и настройте его параметры: функция массы (плотности) вероятности
          показана <span className="inline-block w-3 h-3 bg-yellow-400 align-middle mx-1 rounded-sm"></span>
          жёлтым, а функция распределения F(x) —{' '}
          <span className="inline-block w-3 h-3 bg-orange-500 align-middle mx-1 rounded-sm"></span>
          оранжевым.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-emerald-200 p-6 flex-1 min-w-[340px]">
          <h3 className="text-lg font-semibold mb-4">
            {kind === 'discrete' ? 'Функция массы f(x) и F(x)' : 'Плотность f(x) и F(x)'}
          </h3>
          <Plot
            xMin={domain[0]}
            xMax={domain[1]}
            yMin={0}
            yMax={Math.min(1.6, yMax * 1.15)}
            xLabel="x"
            yLabel={kind === 'discrete' ? 'P(X = x)' : 'f(x)'}
            padRight={44}
          >
            {({ sx, sy, iw }) => {
              // Правая ось для F(x): фиксированная шкала 0..1
              const syR = (y) => sy(0) - y * (sy(0) - sy(Math.min(1.6, yMax * 1.15)))
              const rightX = sx(domain[1])
              return (
                <>
                  {/* правая ось CDF */}
                  <line x1={rightX} x2={rightX} y1={syR(0)} y2={syR(1)} stroke="#fdba74" strokeWidth="1.5" />
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <g key={`c${t}`}>
                      <line x1={rightX - 4} x2={rightX + 4} y1={syR(t)} y2={syR(t)} stroke="#fdba74" />
                      <text x={rightX + 8} y={syR(t) + 4} fontSize="10" fill="#f97316">
                        {t}
                      </text>
                    </g>
                  ))}
                  {kind === 'discrete' ? (
                    <>
                      {Array.from({ length: Math.min(121, Math.floor(domain[1] - domain[0]) + 1) }, (_, i) => {
                        const x = domain[0] + i
                        const h = def.pmf(x, params)
                        const w = Math.max(2, (sx(domain[0] + 1) - sx(domain[0])) * 0.7)
                        return (
                          <rect
                            key={i}
                            x={sx(x) - w / 2}
                            y={sy(h)}
                            width={w}
                            height={sy(0) - sy(h)}
                            fill="#facc15"
                            stroke="#eab308"
                          />
                        )
                      })}
                      <path
                        d={linePath(cdfPts, sx, syR)}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d={linePath(makeCurve(def.pdf, domain[0], domain[1], params), sx, sy)}
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="3"
                      />
                      <path
                        d={linePath(cdfPts, sx, syR)}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                      />
                    </>
                  )}
                </>
              )
            }}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-3 bg-yellow-400 align-middle mr-1 rounded-sm"></span>
            {kind === 'discrete' ? 'функция массы вероятности f(x)' : 'функция плотности f(x)'} (левая ось)
            <span className="inline-block w-3 h-3 bg-orange-500 align-middle ml-4 mr-1 rounded-sm"></span>
            функция распределения F(x) (правая ось, 0–1)
          </p>
          <p className="text-sm text-gray-600 mt-3 italic">{def.blurb}</p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-6 min-w-[280px] space-y-5">
          <div className="flex gap-2">
            <button
              onClick={() => setKind('discrete')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                kind === 'discrete' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Дискретные
            </button>
            <button
              onClick={() => setKind('continuous')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                kind === 'continuous' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Непрерывные
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Распределение:</p>
            <div className="space-y-1">
              {Object.entries(defs).map(([k, d]) => (
                <button
                  key={k}
                  onClick={() => selectDist(k)}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    key === k ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-100 pt-4">
            {def.params.map((p) => (
              <Slider
                key={p.key}
                label={p.label}
                value={params[p.key]}
                min={p.min}
                max={p.max}
                step={p.step}
                onChange={(v) => setParam(p.key, v)}
                accentClass="accent-emerald-600"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscreteContinuous
