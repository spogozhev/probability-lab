import { useState } from 'react'
import Slider from './Slider.jsx'
import { randNormal, mean, variance, fPValue } from '../utils/stats.js'

const GROUP_NAMES = ['Корм A', 'Корм B', 'Корм C', 'Корм D']
const GROUP_COLORS = ['#0891b2', '#f59e0b', '#7c3aed', '#db2777']

const W = 620
const H = 400
const PAD_L = 44
const PAD_B = 34
const Y_MIN = 0
const Y_MAX = 24

function generateGroups(k, nPer, shift, sigma) {
  // «Эксперимент с кормами»: k групп, средние разнесены на shift
  const groups = []
  for (let g = 0; g < k; g++) {
    const mu = 10 + (g - (k - 1) / 2) * shift
    const obs = Array.from({ length: nPer }, () => randNormal(mu, sigma))
    groups.push(obs)
  }
  return groups
}

function oneWayAnova(groups) {
  const k = groups.length
  const all = groups.flat()
  const N = all.length
  const grand = mean(all)
  let ssb = 0 // между группами
  let ssw = 0 // внутри групп
  for (const g of groups) {
    const m = mean(g)
    ssb += g.length * (m - grand) ** 2
    for (const x of g) ssw += (x - m) ** 2
  }
  const dfb = k - 1
  const dfw = N - k
  const msb = ssb / dfb
  const msw = ssw / dfw
  const f = msb / msw
  const p = fPValue(f, dfb, dfw)
  return { grand, ssb, ssw, dfb, dfw, msb, msw, f, p }
}

function AnalysisOfVariance() {
  const [k, setK] = useState(3)
  const [nPer, setNPer] = useState(15)
  const [shift, setShift] = useState(1.5)
  const [sigma, setSigma] = useState(2)
  const [groups, setGroups] = useState(() => generateGroups(3, 15, 1.5, 2))

  const regenerate = (kk = k, nn = nPer, sh = shift, sg = sigma) =>
    setGroups(generateGroups(kk, nn, sh, sg))

  const a = oneWayAnova(groups)
  const significant = a.p < 0.05

  const sy = (y) => H - PAD_B - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - 16 - PAD_B)
  const groupSlot = (g) => {
    const slotW = (W - PAD_L - 14) / groups.length
    return PAD_L + slotW * g + slotW / 2
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-cyan-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Дисперсионный анализ (Analysis of Variance)</h3>
        <p className="text-gray-700 mb-3">
          <strong>ANOVA (дисперсионный анализ)</strong> — статистический метод проверки того, имеют
          ли несколько групп данных одно и то же среднее. Он обобщает t-критерий на случай двух и
          более групп.
        </p>
        <p className="text-gray-700 mb-3">
          Идея метода — в сравнении двух видов изменчивости: <strong>межгрупповой</strong>{' '}
          (насколько средние групп отклоняются от общего среднего) и{' '}
          <strong>внутригрупповой</strong> (насколько наблюдения разбросаны внутри своих групп).
          Их отношение образует F-статистику: если группы действительно различаются,
          межгрупповая изменчивость заметно превышает внутригрупповую.
        </p>
        <p className="text-gray-700">
          Смоделируйте «эксперимент с кормами»: несколько групп животных получают разные корма, и
          мы измеряем привес. Ползунками задайте число групп, их размер, разнос средних и шум, затем
          сгенерируйте данные и изучите таблицу ANOVA.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-cyan-200 p-6 flex-1 min-w-[380px]">
          <h3 className="text-lg font-semibold mb-4">Данные по группам</h3>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            <rect x={PAD_L} y={sy(Y_MAX)} width={W - PAD_L - 14} height={sy(Y_MIN) - sy(Y_MAX)} fill="#f8fafc" stroke="#e2e8f0" />
            {[0, 4, 8, 12, 16, 20, 24].map((t) => (
              <text key={t} x={PAD_L - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{t}</text>
            ))}
            <text x={14} y={(sy(Y_MIN) + sy(Y_MAX)) / 2} textAnchor="middle" fontSize="12" fill="#6b7280" transform={`rotate(-90 14 ${(sy(Y_MIN) + sy(Y_MAX)) / 2})`}>Привес</text>

            {groups.map((g, gi) => {
              const cx = groupSlot(gi)
              const color = GROUP_COLORS[gi]
              const jx = (i, n) => ((i / Math.max(1, n - 1)) - 0.5) * 26
              const m = mean(g)
              const sd = Math.sqrt(variance(g))
              return (
                <g key={gi}>
                  {/* интервал ± SD */}
                  <line x1={cx} x2={cx} y1={sy(m + sd)} y2={sy(m - sd)} stroke={color} strokeWidth="3" opacity="0.5" />
                  <line x1={cx - 7} x2={cx + 7} y1={sy(m + sd)} y2={sy(m + sd)} stroke={color} strokeWidth="3" opacity="0.7" />
                  <line x1={cx - 7} x2={cx + 7} y1={sy(m - sd)} y2={sy(m - sd)} stroke={color} strokeWidth="3" opacity="0.7" />
                  {/* среднее */}
                  <rect x={cx - 13} y={sy(m) - 2.5} width="26" height="5" rx="2" fill={color} />
                  {/* наблюдения */}
                  {g.map((v, i) => (
                    <circle key={i} cx={cx + jx(i, g.length)} cy={sy(v)} r="3.2" fill={color} fillOpacity="0.45" />
                  ))}
                  <text x={cx} y={H - PAD_B + 18} textAnchor="middle" fontSize="12" fill="#374151">
                    {GROUP_NAMES[gi]}
                  </text>
                  <text x={cx} y={H - PAD_B + 32} textAnchor="middle" fontSize="11" fill="#9ca3af">
                    x̄ = {m.toFixed(2)}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="text-xs text-gray-500 mt-2">
            Точки — наблюдения, жирная черта — среднее группы, столбик — ± одно стандартное
            отклонение.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-cyan-200 p-6 min-w-[300px] space-y-4">
          <Slider
            label="Число групп"
            value={k}
            min={2}
            max={4}
            step={1}
            onChange={(v) => {
              setK(v)
              regenerate(v, nPer, shift, sigma)
            }}
            accentClass="accent-cyan-600"
          />
          <Slider
            label="Наблюдений в группе"
            value={nPer}
            min={5}
            max={30}
            step={1}
            onChange={(v) => {
              setNPer(v)
              regenerate(k, v, shift, sigma)
            }}
            accentClass="accent-cyan-600"
          />
          <Slider
            label="Разнос средних групп"
            value={shift}
            min={0}
            max={4}
            step={0.1}
            onChange={(v) => {
              setShift(v)
              regenerate(k, nPer, v, sigma)
            }}
            format={(v) => v.toFixed(1)}
            accentClass="accent-cyan-600"
          />
          <Slider
            label="Шум внутри групп σ"
            value={sigma}
            min={0.5}
            max={4}
            step={0.1}
            onChange={(v) => {
              setSigma(v)
              regenerate(k, nPer, shift, v)
            }}
            format={(v) => v.toFixed(1)}
            accentClass="accent-cyan-600"
          />

          <button
            onClick={() => regenerate()}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Новые данные
          </button>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-gray-500 text-left">
                  <th className="py-1 pr-2 font-medium">Источник</th>
                  <th className="py-1 px-1 font-medium">SS</th>
                  <th className="py-1 px-1 font-medium">df</th>
                  <th className="py-1 px-1 font-medium">MS</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                <tr className="border-t border-gray-100">
                  <td className="py-1 pr-2">Между группами</td>
                  <td className="py-1 px-1">{a.ssb.toFixed(2)}</td>
                  <td className="py-1 px-1">{a.dfb}</td>
                  <td className="py-1 px-1">{a.msb.toFixed(2)}</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="py-1 pr-2">Внутри групп</td>
                  <td className="py-1 px-1">{a.ssw.toFixed(2)}</td>
                  <td className="py-1 px-1">{a.dfw}</td>
                  <td className="py-1 px-1">{a.msw.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={`p-4 rounded-lg ${significant ? 'bg-cyan-50' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-600">
              F = <strong className="text-cyan-700 tabular-nums">{a.f.toFixed(3)}</strong>, p-value ={' '}
              <strong className="text-cyan-700 tabular-nums">
                {a.p < 0.001 ? '< 0.001' : a.p.toFixed(3)}
              </strong>
            </p>
            <p className="text-sm mt-1 text-gray-700">
              {significant
                ? 'Различия между средними групп статистически значимы (p < 0.05).'
                : 'Значимых различий между группами не обнаружено (p ≥ 0.05).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisOfVariance
