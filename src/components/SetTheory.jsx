import { useRef, useState } from 'react'

const UNIVERSE = [1, 2, 3, 4, 5, 6, 7, 8]

function SetTheory() {
  const [setA, setSetA] = useState(new Set([1, 2, 3, 4]))
  const [setB, setSetB] = useState(new Set([3, 4, 5, 6]))
  const [custom, setCustom] = useState(new Set([2, 5]))
  const [op, setOp] = useState('none')
  const [circles, setCircles] = useState({ A: { x: 180, y: 130 }, B: { x: 300, y: 130 } })
  const svgRef = useRef(null)
  const dragId = useRef(null)
  const R = 85

  const toggle = (setter) => (num) => {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(num)) next.delete(num)
      else next.add(num)
      return next
    })
  }

  const union = new Set([...setA, ...setB])
  const intersection = new Set([...setA].filter((x) => setB.has(x)))
  const complementA = new Set(UNIVERSE.filter((x) => !setA.has(x)))
  const differenceAB = new Set([...setA].filter((x) => !setB.has(x)))

  const opResults = {
    none: null,
    union: { label: 'A ∪ B', set: union },
    intersection: { label: 'A ∩ B', set: intersection },
    complement: { label: 'Aᶜ', set: complementA },
    difference: { label: 'A ∖ B', set: differenceAB },
  }
  const highlight = opResults[op]?.set ?? null

  // Позиции чисел внутри диаграммы: по принадлежности к областям,
  // числа одной области раскладываются веером, чтобы не накладывались
  const computePositions = () => {
    const { A, B } = circles
    const dx = B.x - A.x
    const dy = B.y - A.y
    const len = Math.max(1, Math.hypot(dx, dy))
    const ux = dx / len
    const uy = dy / len
    const px = -uy // перпендикуляр к оси A-B
    const py = ux

    const groups = { A: [], B: [], AB: [], out: [] }
    UNIVERSE.forEach((num) => {
      const inA = setA.has(num)
      const inB = setB.has(num)
      groups[inA && inB ? 'AB' : inA ? 'A' : inB ? 'B' : 'out'].push(num)
    })

    const positions = {}
    const spread = (n, maxSpan) => (n <= 1 ? 0 : Math.min(24, maxSpan / (n - 1)))

    groups.A.forEach((num, i) => {
      const off = (i - (groups.A.length - 1) / 2) * spread(groups.A.length, 110)
      positions[num] = {
        x: A.x - ux * R * 0.5 + px * off,
        y: A.y - uy * R * 0.5 + py * off,
      }
    })
    groups.B.forEach((num, i) => {
      const off = (i - (groups.B.length - 1) / 2) * spread(groups.B.length, 110)
      positions[num] = {
        x: B.x + ux * R * 0.5 + px * off,
        y: B.y + uy * R * 0.5 + py * off,
      }
    })
    groups.AB.forEach((num, i) => {
      const off = (i - (groups.AB.length - 1) / 2) * spread(groups.AB.length, 80)
      positions[num] = {
        x: (A.x + B.x) / 2 + px * off,
        y: (A.y + B.y) / 2 + py * off,
      }
    })
    const outsideSlots = [
      { x: 40, y: 30 },
      { x: 40, y: 230 },
      { x: 440, y: 30 },
      { x: 440, y: 230 },
      { x: 40, y: 130 },
      { x: 440, y: 130 },
      { x: 240, y: 28 },
      { x: 240, y: 232 },
    ]
    groups.out.forEach((num, i) => {
      positions[num] = outsideSlots[i % outsideSlots.length]
    })
    return positions
  }

  const numberPositions = computePositions()

  const onPointerMove = (e) => {
    if (!dragId.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 480
    const y = ((e.clientY - rect.top) / rect.height) * 260
    const clampedX = Math.max(R / 2 + 10, Math.min(480 - R / 2 - 10, x))
    const clampedY = Math.max(R / 2 + 10, Math.min(260 - R / 2 - 10, y))
    setCircles((prev) => ({ ...prev, [dragId.current]: { x: clampedX, y: clampedY } }))
  }

  const stopDrag = () => {
    dragId.current = null
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-violet-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Теория множеств (Set Theory)</h3>
        <p className="text-gray-700 mb-3">
          Множество — это набор объектов. В теории вероятностей запись теории множеств используется
          для описания <strong>составных событий</strong>: например, событие «выпало чётное число»
          при броске кубика — это множество {'{'}2, 4, 6{'}'}.
        </p>
        <p className="text-gray-700 mb-3">
          Поэтому важно уметь обращаться с алгеброй множеств: объединением ∪, пересечением ∩,
          дополнением ᶜ и разностью ∖. Круги Эйлера-Венна позволяют наглядно увидеть отношения
          между событиями.
        </p>
        <p className="text-gray-700">
          Задайте множества A и B, нажимая на числа, затем постройте составное множество и
          подсветите его на диаграмме. Круги можно перетаскивать мышью. Диаграммой удобно
          пользоваться и для проверки тождеств типа (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-violet-200 p-6">
          <svg
            ref={svgRef}
            viewBox="0 0 480 260"
            className="w-full h-auto select-none touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerLeave={stopDrag}
          >
            {/* Универсум */}
            <rect x="4" y="4" width="472" height="252" rx="8" fill="#faf5ff" stroke="#c4b5fd" strokeWidth="1.5" />
            <text x="14" y="22" fontSize="13" fill="#7c3aed" fontStyle="italic">Ω</text>

            <circle
              cx={circles.A.x}
              cy={circles.A.y}
              r={R}
              fill="rgba(59,130,246,0.25)"
              stroke="#3b82f6"
              strokeWidth="2"
              style={{ cursor: 'grab' }}
              onPointerDown={() => {
                dragId.current = 'A'
              }}
            />
            <circle
              cx={circles.B.x}
              cy={circles.B.y}
              r={R}
              fill="rgba(239,68,68,0.2)"
              stroke="#ef4444"
              strokeWidth="2"
              style={{ cursor: 'grab' }}
              onPointerDown={() => {
                dragId.current = 'B'
              }}
            />
            <text x={circles.A.x - R + 12} y={circles.A.y - R + 6} fontSize="15" fontWeight="bold" fill="#2563eb">A</text>
            <text x={circles.B.x + R - 26} y={circles.B.y - R + 6} fontSize="15" fontWeight="bold" fill="#dc2626">B</text>

            {UNIVERSE.map((num) => {
              const p = numberPositions[num]
              const isHi = highlight ? highlight.has(num) : false
              const color = setA.has(num) && setB.has(num)
                ? '#7c3aed'
                : setA.has(num)
                  ? '#2563eb'
                  : setB.has(num)
                    ? '#dc2626'
                    : '#6b7280'
              return (
                <g key={num}>
                  {isHi && <circle cx={p.x} cy={p.y - 2} r="13" fill="#fbbf24" opacity="0.85" />}
                  <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>
                    {num}
                  </text>
                </g>
              )
            })}
          </svg>
          <p className="text-xs text-gray-500 mt-2">
            Нажмите и перетащите круг, чтобы изменить диаграмму. Числа вне кругов лежат в Ω, но не
            входят ни в A, ни в B.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 p-6 min-w-[320px] space-y-4">
          <h3 className="text-lg font-semibold">Задайте множества</h3>

          {[
            { label: 'A', set: setA, setter: setSetA, cls: 'border-blue-400 bg-blue-50 text-blue-700', off: 'border-gray-200 text-gray-400' },
            { label: 'B', set: setB, setter: setSetB, cls: 'border-red-400 bg-red-50 text-red-700', off: 'border-gray-200 text-gray-400' },
          ].map(({ label, set, setter, cls, off }) => (
            <div key={label}>
              <p className="text-sm text-gray-600 mb-1">
                Множество {label} = {'{'} {[...set].sort((a, b) => a - b).join(', ') || '∅'} {'}'}
              </p>
              <div className="flex flex-wrap gap-1">
                {UNIVERSE.map((num) => (
                  <button
                    key={num}
                    onClick={() => toggle(setter)(num)}
                    className={`w-9 h-9 rounded-lg border-2 text-sm font-semibold transition-colors ${
                      set.has(num) ? cls : `${off} hover:border-gray-300`
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-600 mb-2">Операция:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'union', label: 'A ∪ B' },
                { id: 'intersection', label: 'A ∩ B' },
                { id: 'complement', label: 'Aᶜ' },
                { id: 'difference', label: 'A ∖ B' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setOp(id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    op === id ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {op !== 'none' && (
            <div className="p-3 bg-amber-50 rounded-lg text-sm">
              <span className="font-semibold">{opResults[op].label}</span> = {'{'}{' '}
              {[...opResults[op].set].sort((a, b) => a - b).join(', ') || '∅'} {'}'} — результат
              подсвечен <span className="inline-block w-3 h-3 bg-amber-400 align-middle mx-1 rounded-full"></span>
              на диаграмме.
            </div>
          )}
          <button
            onClick={() => setOp('none')}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Убрать подсветку
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetTheory
