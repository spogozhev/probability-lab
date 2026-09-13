import { useRef, useState } from 'react'
import { olsFit } from '../utils/stats.js'

// Квартет Энскомба — знаменитый набор из четырёх наборов данных
const ANSCOMBE = [
  [
    [10, 8.04], [8, 6.95], [13, 7.58], [9, 8.81], [11, 8.33], [14, 9.96],
    [6, 7.24], [4, 4.26], [12, 10.84], [7, 4.82], [5, 5.68],
  ],
  [
    [10, 9.14], [8, 8.14], [13, 8.74], [9, 8.77], [11, 9.26], [14, 8.1],
    [6, 6.13], [4, 3.1], [12, 9.13], [7, 7.26], [5, 4.74],
  ],
  [
    [10, 7.46], [8, 6.77], [13, 12.74], [9, 7.11], [11, 7.81], [14, 8.84],
    [6, 6.08], [4, 5.39], [12, 8.15], [7, 6.42], [5, 5.73],
  ],
  [
    [8, 6.58], [8, 5.76], [8, 7.71], [8, 8.84], [8, 8.47], [8, 7.04],
    [8, 5.25], [19, 12.5], [8, 5.56], [8, 7.91], [8, 6.89],
  ],
]

const X_MIN = 0
const X_MAX = 20
const Y_MIN = 0
const Y_MAX = 14
const W = 620
const H = 400
const PAD_L = 44
const PAD_B = 34

function OrdinaryLeastSquares() {
  const [points, setPoints] = useState(ANSCOMBE[0])
  const [showResiduals, setShowResiduals] = useState(true)
  const svgRef = useRef(null)
  const dragIdx = useRef(null)

  const sx = (x) => PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (W - PAD_L - 14)
  const sy = (y) => H - PAD_B - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 14 - PAD_B)

  const toData = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((clientX - rect.left) / rect.width) * W
    const py = ((clientY - rect.top) / rect.height) * H
    const x = X_MIN + ((px - PAD_L) / (W - PAD_L - 14)) * (X_MAX - X_MIN)
    const y = Y_MIN + ((H - PAD_B - py) / (H - 14 - PAD_B)) * (Y_MAX - Y_MIN)
    return [x, y]
  }

  const onMove = (e) => {
    if (dragIdx.current === null || !svgRef.current) return
    const [x, y] = toData(e.clientX, e.clientY)
    const cx = Math.max(X_MIN, Math.min(X_MAX, x))
    const cy = Math.max(Y_MIN, Math.min(Y_MAX, y))
    setPoints((prev) => prev.map((p, i) => (i === dragIdx.current ? [cx, cy] : p)))
  }

  const onCanvasClick = (e) => {
    if (!svgRef.current) return
    if (e.target.tagName !== 'svg' && e.target.tagName !== 'rect') return
    const [x, y] = toData(e.clientX, e.clientY)
    if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX) return
    setPoints((prev) => [...prev, [x, y]])
  }

  const fit = olsFit(points)
  const sse = fit
    ? points.reduce((s, [x, y]) => s + (y - (fit.a + fit.b * x)) ** 2, 0)
    : 0
  const linePts = fit
    ? [
        [X_MIN, fit.a + fit.b * X_MIN],
        [X_MAX, fit.a + fit.b * X_MAX],
      ]
    : []

  const clamp = (v) => Math.max(Y_MIN, Math.min(Y_MAX, v))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-cyan-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Метод наименьших квадратов (Ordinary Least Squares)</h3>
        <p className="text-gray-700 mb-3">
          Подход к регрессии, основанный на <strong>методе наименьших квадратов (МНК)</strong>,
          позволяет оценить параметры линейной модели y = a + b·x по данным. Метод ищет такую
          прямую, при которой <strong>сумма квадратов ошибок</strong> — отклонений наблюдений от
          предсказаний модели — минимальна.
        </p>
        <p className="text-gray-700 mb-3">
          Классический набор данных — <strong>квартет Энскомба</strong>: четыре набора с почти
          одинаковыми оценками регрессии, но совершенно разным характером разброса. Это напоминание
          о том, что одних только коэффициентов недостаточно — данные нужно смотреть.
        </p>
        <p className="text-gray-700">
          Перетаскивайте точки мышью, кликайте по полю, чтобы добавить точку, и наблюдайте, как
          перестраивается подгонка. Ошибки (остатки) показаны тонкими вертикальными отрезками, а
          их сумма квадратов выводится под графиком.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-cyan-200 p-6 flex-1 min-w-[380px]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none touch-none"
            onPointerMove={onMove}
            onPointerUp={() => {
              dragIdx.current = null
            }}
            onPointerLeave={() => {
              dragIdx.current = null
            }}
            onClick={onCanvasClick}
          >
            <rect x={sx(X_MIN)} y={sy(Y_MAX)} width={sx(X_MAX) - sx(X_MIN)} height={sy(Y_MIN) - sy(Y_MAX)} fill="#f8fafc" stroke="#e2e8f0" />
            {[0, 5, 10, 15, 20].map((t) => (
              <g key={`x${t}`}>
                <text x={sx(t)} y={H - PAD_B + 16} textAnchor="middle" fontSize="11" fill="#9ca3af">{t}</text>
              </g>
            ))}
            {[0, 2, 4, 6, 8, 10, 12, 14].map((t) => (
              <text key={`y${t}`} x={PAD_L - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}</text>
            ))}
            <text x={(sx(X_MIN) + sx(X_MAX)) / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#6b7280">x</text>
            <text x={12} y={(sy(Y_MIN) + sy(Y_MAX)) / 2} textAnchor="middle" fontSize="12" fill="#6b7280" transform={`rotate(-90 12 ${(sy(Y_MIN) + sy(Y_MAX)) / 2})`}>y</text>

            {fit && (
              <line
                x1={sx(linePts[0][0])}
                y1={sy(clamp(linePts[0][1]))}
                x2={sx(linePts[1][0])}
                y2={sy(clamp(linePts[1][1]))}
                stroke="#0891b2"
                strokeWidth="3"
              />
            )}

            {showResiduals &&
              fit &&
              points.map(([x, y], i) => (
                <line
                  key={`r${i}`}
                  x1={sx(x)}
                  y1={sy(y)}
                  x2={sx(x)}
                  y2={sy(clamp(fit.a + fit.b * x))}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}

            {points.map(([x, y], i) => (
              <circle
                key={i}
                cx={sx(x)}
                cy={sy(y)}
                r="7"
                fill="#0e7490"
                fillOpacity="0.75"
                stroke="#155e75"
                style={{ cursor: 'grab' }}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  dragIdx.current = i
                }}
              />
            ))}
          </svg>
          <p className="text-xs text-gray-500 mt-2">
            Перетащите точку, чтобы изменить её; клик по свободному месту добавляет новую точку.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cyan-200 p-6 min-w-[280px] space-y-4">
          <h3 className="text-lg font-semibold">Данные и подгонка</h3>

          <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 space-y-1">
            <p>
              Уравнение:{' '}
              <strong className="text-cyan-700 font-mono">
                {fit ? `y = ${fit.a.toFixed(2)} + ${fit.b.toFixed(3)}·x` : '—'}
              </strong>
            </p>
            <p>
              Сумма квадратов ошибок:{' '}
              <strong className="tabular-nums">{sse.toFixed(2)}</strong>
            </p>
            <p>
              Точек: <strong className="tabular-nums">{points.length}</strong>
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showResiduals}
              onChange={(e) => setShowResiduals(e.target.checked)}
              className="rounded border-gray-300"
            />
            Показывать остатки
          </label>

          <div>
            <p className="text-sm text-gray-600 mb-2">Квартет Энскомба:</p>
            <div className="grid grid-cols-2 gap-2">
              {ANSCOMBE.map((data, i) => (
                <button
                  key={i}
                  onClick={() => setPoints(data)}
                  className="px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Набор {['I', 'II', 'III', 'IV'][i]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() =>
              setPoints(
                Array.from({ length: 20 }, () => {
                  const x = Math.random() * 18 + 1
                  return [x, 2 + 0.4 * x + (Math.random() - 0.5) * 4]
                })
              )
            }
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Случайные данные
          </button>
          <button
            onClick={() => setPoints([])}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Очистить
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrdinaryLeastSquares
