import { useState } from 'react'
import Slider from './Slider.jsx'
import { randNormal, pearson, olsFit } from '../utils/stats.js'

const W = 620
const H = 400
const PAD_L = 44
const PAD_B = 34
const X_MIN = -4
const X_MAX = 4
const Y_MIN = -4
const Y_MAX = 4

function generateData(rho, n) {
  const pts = []
  for (let i = 0; i < n; i++) {
    const z1 = randNormal()
    const z2 = randNormal()
    const x = z1
    const y = rho * z1 + Math.sqrt(Math.max(0, 1 - rho * rho)) * z2
    pts.push([x, y])
  }
  return pts
}

function Correlation() {
  const [rho, setRho] = useState(0.7)
  const [n, setN] = useState(80)
  const [points, setPoints] = useState(() => generateData(0.7, 80))

  const regenerate = (r = rho, count = n) => setPoints(generateData(r, count))

  const r = pearson(points)
  const fitYonX = olsFit(points)
  // Регрессия x на y: меняем местами координаты
  const fitXonY = olsFit(points.map(([x, y]) => [y, x]))

  const sx = (x) => PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - 14)
  const sy = (y) => H - PAD_B - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 14 - PAD_B)

  const interp = Math.abs(r) >= 0.8
    ? 'очень сильная'
    : Math.abs(r) >= 0.6
      ? 'сильная'
      : Math.abs(r) >= 0.4
        ? 'умеренная'
        : Math.abs(r) >= 0.2
          ? 'слабая'
          : 'практически отсутствует'
  const direction = r > 0.1 ? 'положительная' : r < -0.1 ? 'отрицательная' : ''

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-cyan-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Корреляция (Correlation)</h3>
        <p className="text-gray-700 mb-3">
          <strong>Корреляция — это мера линейной зависимости</strong> между двумя переменными.
          Коэффициент корреляции Пирсона принимает значения от −1 до +1: значения вблизи +1
          означают тесную положительную связь, вблизи −1 — тесную отрицательную, а вблизи нуля —
          отсутствие линейной зависимости.
        </p>
        <p className="text-gray-700 mb-3">
          С регрессией коэффициент связан изящной геометрией: если построить регрессию y на x и
          регрессию x на y, то коэффициент корреляции равен косинусу угла между этими прямыми (а
          также среднему геометрическому их наклонов, выраженных в стандартизованных единицах):
          чем теснее связь, тем меньше угол между прямыми.
        </p>
        <p className="text-gray-700">
          Задайте желаемый уровень связи ρ и сгенерируйте выборку из двумерного нормального
          распределения. Сравните выборочный коэффициент r с параметром ρ и посмотрите, как
          сближаются или расходятся две линии регрессии.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-cyan-200 p-6 flex-1 min-w-[380px]">
          <h3 className="text-lg font-semibold mb-4">Диаграмма рассеяния</h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            <rect x={sx(X_MIN)} y={sy(Y_MAX)} width={sx(X_MAX) - sx(X_MIN)} height={sy(Y_MIN) - sy(Y_MAX)} fill="#f8fafc" stroke="#e2e8f0" />
            {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
              <text key={`x${t}`} x={sx(t)} y={H - PAD_B + 16} textAnchor="middle" fontSize="11" fill="#9ca3af">{t}</text>
            ))}
            {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
              <text key={`y${t}`} x={PAD_L - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}</text>
            ))}
            <text x={(sx(X_MIN) + sx(X_MAX)) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#6b7280">x</text>
            <text x={12} y={(sy(Y_MIN) + sy(Y_MAX)) / 2} textAnchor="middle" fontSize="12" fill="#6b7280" transform={`rotate(-90 12 ${(sy(Y_MIN) + sy(Y_MAX)) / 2})`}>y</text>

            {fitYonX && (
              <line
                x1={sx(X_MIN)}
                y1={sy(fitYonX.a + fitYonX.b * X_MIN)}
                x2={sx(X_MAX)}
                y2={sy(fitYonX.a + fitYonX.b * X_MAX)}
                stroke="#0891b2"
                strokeWidth="2.5"
              />
            )}
            {fitXonY && (() => {
              // Прямая регрессии x на y: x = c + d·y => y = (x - c)/d
              const { a: c, b: d } = fitXonY
              if (Math.abs(d) < 1e-9) return null
              const y1 = (X_MIN - c) / d
              const y2 = (X_MAX - c) / d
              return (
                <line
                  x1={sx(X_MIN)}
                  y1={sy(Math.max(Y_MIN, Math.min(Y_MAX, y1)))}
                  x2={sx(X_MAX)}
                  y2={sy(Math.max(Y_MIN, Math.min(Y_MAX, y2)))}
                  stroke="#f97316"
                  strokeWidth="2.5"
                />
              )
            })()}

            {points.map(([x, y], i) => (
              <circle
                key={i}
                cx={sx(Math.max(X_MIN, Math.min(X_MAX, x)))}
                cy={sy(Math.max(Y_MIN, Math.min(Y_MAX, y)))}
                r="3.5"
                fill="#155e75"
                fillOpacity="0.55"
              />
            ))}
          </svg>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-cyan-600 align-middle mr-1"></span>
            регрессия y на x
            <span className="inline-block w-3 h-0.5 bg-orange-500 align-middle ml-4 mr-1"></span>
            регрессия x на y
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cyan-200 p-6 min-w-[290px] space-y-5">
          <Slider
            label="Желаемая связь ρ"
            value={rho}
            min={-0.99}
            max={0.99}
            step={0.01}
            onChange={(v) => {
              setRho(v)
              regenerate(v, n)
            }}
            format={(v) => v.toFixed(2)}
            accentClass="accent-cyan-600"
          />
          <Slider
            label="Объём выборки n"
            value={n}
            min={10}
            max={300}
            step={5}
            onChange={(v) => {
              setN(v)
              regenerate(rho, v)
            }}
            accentClass="accent-cyan-600"
          />

          <button
            onClick={() => regenerate()}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Новая выборка
          </button>

          <div className="p-4 bg-cyan-50 rounded-lg">
            <p className="text-sm text-gray-600">Выборочный коэффициент корреляции:</p>
            <p className="text-3xl font-bold text-cyan-700 mt-1 tabular-nums">
              {r >= 0 ? '+' : ''}
              {r.toFixed(3)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Связь {direction ? `${interp} ${direction}` : interp}.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Заметка: корреляция измеряет только линейную связь и не означает причинности — даже при
            r ≈ 0 зависимость нелинейного вида может существовать.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Correlation
