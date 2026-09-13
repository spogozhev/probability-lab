import { useMemo, useState } from 'react'
import { factorial, combinations } from '../utils/stats.js'

const LETTERS = ['A', 'B', 'C', 'D']
const LETTER_COLORS = { A: '#f4a261', B: '#2dd4bf', C: '#60a5fa', D: '#eab308' }

// Геометрия графа
const ROOT = { x: 30, y: 320 }
const COL_X = [70, 220, 370, 520]
const MIDY = 320
const SPAN = 600 // доступная вертикаль для узлов столбца
const W = 680
const H = 640

// Все перестановки длины k (в лексикографическом порядке)
function kPermutations(items, k) {
  if (k === 0) return ['']
  const res = []
  const rec = (prefix, remaining) => {
    if (prefix.length === k) {
      res.push(prefix)
      return
    }
    for (let i = 0; i < remaining.length; i++) {
      rec(prefix + remaining[i], remaining.filter((_, j) => j !== i))
    }
  }
  rec('', items)
  return res
}

// Все сочетания из k элементов (в лексикографическом порядке)
function kCombinations(items, k) {
  if (k === 0) return ['']
  const res = []
  const rec = (start, prefix) => {
    if (prefix.length === k) {
      res.push(prefix)
      return
    }
    for (let i = start; i < items.length; i++) rec(i + 1, prefix + items[i])
  }
  rec(0, '')
  return res
}

// Ширина узла: метка + цветные точки
const CHAR_W = 9
const DOT_D = 13
const nodeWidth = (label) => label.length * CHAR_W + 8 + label.length * DOT_D

function CountingTree() {
  const [mode, setMode] = useState('comb') // 'perm' | 'comb'
  const [n, setN] = useState(4)
  const [depth, setDepth] = useState(4)

  const letters = LETTERS.slice(0, n)
  const ks = Array.from({ length: n + 1 }, (_, i) => i)
  const countAt = (k) => (mode === 'perm' ? factorial(n) / factorial(n - k) : combinations(n, k))

  const { levels, edges } = useMemo(() => {
    const lvls = []
    for (let L = 1; L <= depth; L++) {
      const labels = mode === 'perm' ? kPermutations(letters, L) : kCombinations(letters, L)
      const sp = Math.min(70, SPAN / labels.length)
      lvls.push({
        L,
        x: COL_X[L - 1],
        labelLen: L,
        nodes: labels.map((label, i) => ({
          label,
          y: MIDY + (i - (labels.length - 1) / 2) * sp,
        })),
      })
    }
    const e = []
    for (let li = 0; li < lvls.length; li++) {
      const level = lvls[li]
      if (li === 0) {
        for (const node of level.nodes) {
          e.push({
            key: `root->${node.label}`,
            sx: ROOT.x + 5,
            sy: ROOT.y,
            ex: level.x - 6,
            ey: node.y,
            level: level.L,
          })
        }
      } else {
        const prev = lvls[li - 1]
        const yByLabel = new Map(prev.nodes.map((p) => [p.label, p.y]))
        for (const node of level.nodes) {
          // перестановка растёт из префикса, сочетание — из каждого своего элемента:
          // AB получает дуги и от A, и от B; ABC — от AB, AC и BC
          const parentLabels =
            mode === 'comb'
              ? node.label
                  .split('')
                  .map((_, i) => node.label.slice(0, i) + node.label.slice(i + 1))
              : [node.label.slice(0, -1)]
          for (const parentLabel of parentLabels) {
            const py = yByLabel.get(parentLabel)
            if (py === undefined) continue
            e.push({
              key: `${parentLabel}->${node.label}`,
              sx: prev.x + nodeWidth(parentLabel) + 2,
              sy: py,
              ex: level.x - 6,
              ey: node.y,
              level: level.L,
            })
          }
        }
      }
    }
    return { levels: lvls, edges: e }
  }, [mode, n, depth, letters])

  return (
    <div className="mt-10 pt-8 border-t border-gray-200">
      <div className="bg-white rounded-xl border border-violet-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Дерево вариантов (Counting Tree)</h3>
        <p className="text-gray-700 mb-3">
          Подсчитать число последовательностей или наборов удобно с помощью{' '}
          <strong>дерева вариантов</strong>: каждый уровень дерева — очередной выбор элемента, а
          путь от корня до вершины — один готовый вариант. Для перестановок порядок важен, поэтому
          на каждом уровне появляются пути для всех ещё не использованных элементов; для сочетаний
          порядок не важен, и мы идём только по элементам, идущим после уже выбранных.
        </p>
        <p className="text-gray-700">
          Выберите, сколько элементов (A–D) лежит в мешке, переключите режим и{' '}
          <strong>кликните по ячейке таблицы</strong> — граф перестроится с анимацией ровно до
          выбранного столбца.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-violet-200 p-6 min-w-[300px] space-y-5">
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="tree-mode"
                checked={mode === 'perm'}
                onChange={() => setMode('perm')}
                className="accent-violet-600"
              />
              Перестановки
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="tree-mode"
                checked={mode === 'comb'}
                onChange={() => setMode('comb')}
                className="accent-violet-600"
              />
              Сочетания
            </label>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Сколько элементов в мешке:</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setN(sz)
                    setDepth(sz)
                  }}
                  className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                    n === sz
                      ? 'bg-emerald-400'
                      : 'bg-white border border-gray-200 hover:border-violet-300'
                  }`}
                  title={`${sz} элемент(ов)`}
                >
                  <span className="flex flex-wrap justify-center gap-0.5 w-12">
                    {LETTERS.slice(0, sz).map((l) => (
                      <span
                        key={l}
                        className="w-5 h-5 rounded-full text-white flex items-center justify-center"
                        style={{ backgroundColor: LETTER_COLORS[l], fontSize: 10 }}
                      >
                        {l}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">
              Кликните по столбцу — граф построится до него:
            </p>
            <table className="border-collapse text-sm">
              <tbody>
                <tr>
                  <td className="px-3 h-11 text-center italic font-semibold text-gray-700 border border-gray-200">
                    n
                  </td>
                  {ks.map((k) => (
                    <td
                      key={k}
                      onClick={() => setDepth(k)}
                      className={`w-14 h-11 text-center cursor-pointer transition-colors ${
                        depth === k
                          ? 'bg-emerald-400 text-white font-semibold'
                          : 'hover:bg-emerald-100 text-gray-600'
                      } border border-gray-200`}
                    >
                      {k}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-3 h-11 text-center italic font-semibold text-gray-700 border border-gray-200">
                    {mode === 'perm' ? 'P(n, k)' : 'C(n, k)'}
                  </td>
                  {ks.map((k) => (
                    <td
                      key={k}
                      onClick={() => setDepth(k)}
                      className={`w-14 h-11 text-center cursor-pointer transition-colors ${
                        depth === k
                          ? 'bg-emerald-400 text-white font-semibold'
                          : 'hover:bg-emerald-100 text-gray-600'
                      } border border-gray-200`}
                    >
                      {countAt(k)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            {mode === 'perm' ? 'Перестановок' : 'Сочетаний'} из {n} по {depth}:{' '}
            <strong className="text-violet-700">{countAt(depth)}</strong>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 p-6 flex-1 min-w-[420px]">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            <g key={`${mode}-${n}-${depth}`}>
              {/* корень */}
              <circle cx={ROOT.x} cy={ROOT.y} r="4.5" fill="#9ca3af" className="tree-node" />

              {/* рёбра */}
              {edges.map((e) => {
                const mx = (e.sx + e.ex) / 2
                return (
                  <path
                    key={e.key}
                    d={`M${e.sx},${e.sy} C${mx},${e.sy} ${mx},${e.ey} ${e.ex},${e.ey}`}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                    pathLength="1"
                    className="tree-edge"
                    style={{ animationDelay: `${e.level * 0.16}s` }}
                  />
                )
              })}

              {/* узлы */}
              {levels.map((level) =>
                level.nodes.map((node) => (
                  <g
                    key={level.L + node.label}
                    className="tree-node"
                    style={{ animationDelay: `${level.L * 0.16 + 0.12}s` }}
                  >
                    <text
                      x={level.x}
                      y={node.y + 4.5}
                      fontSize="14"
                      fill="#374151"
                      fontFamily="ui-sans-serif, system-ui"
                    >
                      {node.label}
                    </text>
                    {node.label.split('').map((ch, i) => (
                      <circle
                        key={i}
                        cx={level.x + nodeWidth(node.label) - (node.label.length - i) * DOT_D + DOT_D / 2 - 2}
                        cy={node.y}
                        r="5.5"
                        fill={LETTER_COLORS[ch]}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    ))}
                  </g>
                ))
              )}
            </g>
          </svg>
          <p className="text-xs text-gray-500 mt-2">
            Уровень дерева — сколько элементов уже выбрано. Цветные точки у вершины показывают
            выбранные элементы.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CountingTree
