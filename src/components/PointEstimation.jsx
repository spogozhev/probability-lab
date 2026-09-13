import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'

const MAX_POINTS = 4000

function PointEstimation() {
  const [points, setPoints] = useState([])

  const drop = (n) => {
    const batch = []
    for (let i = 0; i < n; i++) {
      batch.push([Math.random(), Math.random()])
    }
    setPoints((prev) => [...prev, ...batch].slice(0, MAX_POINTS))
  }

  const reset = () => setPoints([])

  const inside = points.filter(([x, y]) => x * x + y * y <= 1).length
  const n = points.length
  const piHat = n ? (4 * inside) / n : 0
  const error = n ? Math.abs(piHat - Math.PI) : 0

  // Кривая текущей оценки 4m/n
  const curve = []
  let m = 0
  for (let i = 0; i < n; i++) {
    if (points[i][0] ** 2 + points[i][1] ** 2 <= 1) m++
    if (i < 30 || i % Math.ceil(n / 400 || 1) === 0 || i === n - 1) {
      curve.push([i + 1, (4 * m) / (i + 1)])
    }
  }

  const S = 260 // размер квадрата на экране
  const curveMin = curve.length ? Math.min(...curve.map((p) => p[1])) : Math.PI
  const curveMax = curve.length ? Math.max(...curve.map((p) => p[1])) : Math.PI
  const yMinPlot = Math.min(2, curveMin - 0.2)
  const yMaxPlot = Math.max(4.5, curveMax + 0.2)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-rose-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Точечное оценивание (Point Estimation)</h3>
        <p className="text-gray-700 mb-3">
          Одна из главных задач статистики — <strong>оценивание неизвестных параметров</strong>.
          Оценкой называется функция от случайной выборки, приближающая интересующий нас параметр
          распределения.
        </p>
        <p className="text-gray-700 mb-3">
          Классический пример — оценивание числа π. Будем равномерно бросать точки в квадрат с
          вписанной в него четвертью окружности. Доля точек, попавших внутрь круга, приближает
          отношение площадей π/4, поэтому оценка имеет вид{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">π̂ = 4·(m/n)</span>, где m —
          число точек в круге, а n — всего точек.
        </p>
        <p className="text-gray-700">
          Эта оценка <strong>несмещённая</strong> (её математическое ожидание равно π) и{' '}
          <strong>состоятельная</strong> (с ростом n она сходится по вероятности к π). Убедитесь в
          этом сами: с ростом числа точек кривая оценки прижимается к истинному значению π.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-rose-200 p-6">
          <h3 className="text-lg font-semibold mb-3">Квадрат с четвертью круга</h3>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="select-none">
            <rect x="0" y="0" width={S} height={S} fill="#fff1f2" stroke="#fda4af" />
            <path
              d={`M0,${S} A${S},${S} 0 0 1 ${S},0 L0,0 Z`}
              fill="rgba(244,63,94,0.15)"
              stroke="#f43f5e"
              strokeWidth="2"
            />
            {points.slice(-1500).map(([x, y], i) => (
              <circle
                key={i}
                cx={x * S}
                cy={S - y * S}
                r="1.6"
                fill={x * x + y * y <= 1 ? '#f43f5e' : '#9ca3af'}
              />
            ))}
          </svg>
          <p className="text-xs text-gray-500 mt-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 align-middle mr-1"></span>
            точки внутри круга (m)
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400 align-middle ml-3 mr-1"></span>
            вне круга
          </p>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-4">Текущая оценка π̂ = 4·(m/n)</h3>
          <Plot
            xMin={1}
            xMax={Math.max(20, n)}
            yMin={yMinPlot}
            yMax={yMaxPlot}
            xLabel="Число точек n"
            yLabel="Оценка"
          >
            {({ sx, sy }) => (
              <>
                <line
                  x1={sx(1)}
                  x2={sx(Math.max(20, n))}
                  y1={sy(Math.PI)}
                  y2={sy(Math.PI)}
                  stroke="#be123c"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                {n > 0 && (
                  <path d={linePath(curve, sx, sy)} fill="none" stroke="#e11d48" strokeWidth="2" />
                )}
              </>
            )}
          </Plot>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
            <span>
              π̂ = <strong className="text-rose-600 tabular-nums">{n ? piHat.toFixed(5) : '—'}</strong>
            </span>
            <span>
              |π̂ − π| = <strong className="tabular-nums">{n ? error.toFixed(5) : '—'}</strong>
            </span>
            <span>
              m/n = <strong className="tabular-nums">{n ? `${inside}/${n}` : '—'}</strong>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-200 p-6 min-w-[220px] space-y-2 self-start">
          <h3 className="text-lg font-semibold mb-2">Симуляция</h3>
          <button
            onClick={() => drop(1)}
            className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Бросить 1 точку
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => drop(100)}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors"
            >
              100 точек
            </button>
            <button
              onClick={() => drop(1000)}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-sm font-medium transition-colors"
            >
              1000 точек
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
  )
}

export default PointEstimation
