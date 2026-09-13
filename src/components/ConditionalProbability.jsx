import { useState } from 'react'

const COLS = 15
const ROWS = 10
const N_DAYS = COLS * ROWS

// Цвета: дождь/облачно — тёмно-синий, дождь/ясно — голубой,
// без дождя/облачно — оранжевый, без дождя/ясно — серый
function categorize(cloudy, rain) {
  if (cloudy && rain) return 'cr'
  if (!cloudy && rain) return 'ur'
  if (cloudy && !rain) return 'cu'
  return 'uu'
}

const DOT_COLORS = {
  cr: '#1d4ed8',
  ur: '#60a5fa',
  cu: '#fb923c',
  uu: '#d1d5db',
}

function generateDays() {
  const days = []
  for (let i = 0; i < N_DAYS; i++) {
    const cloudy = Math.random() < 0.4
    const rain = cloudy ? Math.random() < 0.6 : Math.random() < 0.15
    days.push({ cloudy, rain })
  }
  return days
}

function ConditionalProbability() {
  const [days, setDays] = useState(generateDays)
  const [tab, setTab] = useState('all')

  const n = days.length
  const nA = days.filter((d) => d.cloudy).length // A: облачный день
  const nB = days.filter((d) => d.rain).length // B: дождливый день
  const nAB = days.filter((d) => d.cloudy && d.rain).length

  const pB = nB / n
  const pA = nA / n
  const pAB = nAB / n
  const pBgA = nA ? nAB / nA : 0
  const pAgB = nB ? nAB / nB : 0

  const isVisible = (d) => {
    if (tab === 'all') return true
    if (tab === 'A') return d.cloudy
    if (tab === 'B') return d.rain
    return d.cloudy && d.rain
  }

  const stats = {
    all: { label: 'P(B) — вероятность дождя', value: pB, subset: n },
    A: { label: 'P(B | A) — вероятность дождя в облачный день', value: pBgA, subset: nA },
    B: { label: 'P(A | B) — вероятность того, что дождливый день облачный', value: pAgB, subset: nB },
    AB: { label: 'P(A ∩ B) — облачно и дождливо', value: pAB, subset: nAB },
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-violet-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Условная вероятность (Conditional Probability)</h3>
        <p className="text-gray-700 mb-3">
          Условные вероятности позволяют учесть информацию, которой мы уже располагаем о системе.
          Например, если сегодня облачно, то вероятность дождя завтра мы оцениваем выше, чем без
          этой информации: «дождь при условии облаков» — именно <strong>условная</strong>{' '}
          вероятность, поскольку она учитывает существенные сведения.
        </p>
        <p className="text-gray-700 mb-3">
          Математически вычисление условной вероятности сводится к <strong>сужению выборочного
          пространства</strong> до конкретного события. Вместо того чтобы считать долю дождливых
          дней среди всех дней, мы рассматриваем лишь дни, которым предшествовал облачный день, и
          считаем долю дождливых среди них:{' '}
          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">P(B | A) = P(A ∩ B) / P(A)</span>.
        </p>
        <p className="text-gray-700">
          Каждая точка — один день: закрашены дождливые, серые — нет. Переключайте вкладки и
          наблюдайте, как сужается выборочное пространство.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-violet-200 p-6 flex-1 min-w-[340px]">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'all', label: 'Все дни' },
              { id: 'A', label: 'Только облачные (A)' },
              { id: 'B', label: 'Только дождливые (B)' },
              { id: 'AB', label: 'Облачные и дождливые (A ∩ B)' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <svg viewBox={`0 0 ${COLS * 32 + 8} ${ROWS * 32 + 8}`} className="w-full h-auto select-none">
            <rect x="2" y="2" width={COLS * 32 + 4} height={ROWS * 32 + 4} rx="10" fill="#fafafa" stroke="#e5e7eb" />
            {days.map((d, i) => {
              const col = i % COLS
              const row = Math.floor(i / COLS)
              const visible = isVisible(d)
              const cx = 18 + col * 32
              const cy = 18 + row * 32
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill={DOT_COLORS[categorize(d.cloudy, d.rain)]}
                  opacity={visible ? 1 : 0.12}
                  stroke={visible ? 'none' : '#e5e7eb'}
                />
              )
            })}
          </svg>

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {[
              { c: DOT_COLORS.cr, t: 'облачно и дождливо' },
              { c: DOT_COLORS.ur, t: 'дождливо, без облаков' },
              { c: DOT_COLORS.cu, t: 'облачно, без дождя' },
              { c: DOT_COLORS.uu, t: 'ясно, без дождя' },
            ].map(({ c, t }) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: c }}></span>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 p-6 min-w-[300px] space-y-4">
          <h3 className="text-lg font-semibold">Результат</h3>

          <div className="p-4 bg-violet-50 rounded-lg">
            <p className="text-sm text-gray-600">{stats[tab].label}</p>
            <p className="text-3xl font-bold text-violet-700 mt-1 tabular-nums">
              {(stats[tab].value * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              дней в суженом пространстве: {stats[tab].subset} из {n}
            </p>
          </div>

          <div className="text-sm text-gray-600 space-y-1.5">
            <p>
              Дней всего: <strong>{n}</strong>
            </p>
            <p>
              Облачных (A): <strong>{nA}</strong> — P(A) = {(pA * 100).toFixed(1)}%
            </p>
            <p>
              Дождливых (B): <strong>{nB}</strong> — P(B) = {(pB * 100).toFixed(1)}%
            </p>
            <p>
              A ∩ B: <strong>{nAB}</strong> — {(pAB * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            Сравните: P(B) = {(pB * 100).toFixed(1)}%, а P(B | A) = {(pBgA * 100).toFixed(1)}%.
            Информация об облачности {pBgA > pB ? 'повышает' : 'снижает'} ожидание дождя.
          </div>

          <button
            onClick={() => {
              setDays(generateDays())
              setTab('all')
            }}
            className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Новая выборка дней
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConditionalProbability
