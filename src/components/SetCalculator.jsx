import { useEffect, useMemo, useRef, useState } from 'react'

const W = 520
const H = 470
const UNIVERSE = { x: 260, y: 238, r: 212 }

const SET_COLORS = { A: '#f4a261', B: '#2dd4bf', C: '#60a5fa' }
const INITIAL_CIRCLES = {
  A: { x: 175, y: 180, r: 110 },
  B: { x: 345, y: 180, r: 110 },
  C: { x: 260, y: 300, r: 110 },
}

const TOKEN_ROWS = [
  ['A', 'B', 'C', '∅', 'U'],
  ['(', '∩', '∪', '′', ')'],
]
const TOKEN_INSERT = { A: 'A', B: 'B', C: 'C', '∅': '∅', U: 'U', '(': '(', '∩': '∩', '∪': '∪', '′': "'", ')': ')' }

const PRESETS = ["(A∪B)'", "A'∩B'", "(A∪B∪C)'", 'A∩B∩C', "A'∩(B∪C)", 'U', '∅']

// ---------- Разбор выражения ----------

function tokenize(s) {
  const tokens = []
  for (const ch of s) {
    if (ch === ' ') continue
    if (ch === 'A' || ch === 'B' || ch === 'C') tokens.push({ t: 'set', v: ch })
    else if (ch === 'U') tokens.push({ t: 'univ' })
    else if (ch === '∅') tokens.push({ t: 'empty' })
    else if (ch === '(') tokens.push({ t: '(' })
    else if (ch === ')') tokens.push({ t: ')' })
    else if (ch === '∩') tokens.push({ t: '∩' })
    else if (ch === '∪') tokens.push({ t: '∪' })
    else if (ch === "'" || ch === '′' || ch === '`' || ch === '´') tokens.push({ t: "'" })
    else throw new Error(`Недопустимый символ: «${ch}»`)
  }
  return tokens
}

// expr := term ( ∪ term )*
// term := factor ( ∩ factor )*
// factor := primary ( ′ )*
// primary := A | B | C | U | ∅ | ( expr )
function parse(tokens) {
  let pos = 0
  const peek = () => tokens[pos]

  function parseExpr() {
    let node = parseTerm()
    while (peek() && peek().t === '∪') {
      pos++
      node = { type: 'union', l: node, r: parseTerm() }
    }
    return node
  }

  function parseTerm() {
    let node = parseFactor()
    while (peek() && peek().t === '∩') {
      pos++
      node = { type: 'inter', l: node, r: parseFactor() }
    }
    return node
  }

  function parseFactor() {
    let node = parsePrimary()
    while (peek() && peek().t === "'") {
      pos++
      node = { type: 'comp', v: node }
    }
    return node
  }

  function parsePrimary() {
    const tk = peek()
    if (!tk) throw new Error('Выражение не завершено')
    if (tk.t === 'set') {
      pos++
      return { type: 'set', v: tk.v }
    }
    if (tk.t === 'univ') {
      pos++
      return { type: 'univ' }
    }
    if (tk.t === 'empty') {
      pos++
      return { type: 'empty' }
    }
    if (tk.t === '(') {
      pos++
      const node = parseExpr()
      if (!peek() || peek().t !== ')') throw new Error('Не хватает закрывающей скобки «)»')
      pos++
      return node
    }
    throw new Error(tk.t === ')' ? 'Лишняя закрывающая скобка' : 'Неожиданный символ')
  }

  const ast = parseExpr()
  if (pos < tokens.length) throw new Error('Лишние символы в конце выражения')
  return ast
}

function evalAst(ast, a, b, c) {
  switch (ast.type) {
    case 'set':
      return ast.v === 'A' ? a : ast.v === 'B' ? b : c
    case 'univ':
      return true
    case 'empty':
      return false
    case 'union':
      return evalAst(ast.l, a, b, c) || evalAst(ast.r, a, b, c)
    case 'inter':
      return evalAst(ast.l, a, b, c) && evalAst(ast.r, a, b, c)
    case 'comp':
      return !evalAst(ast.v, a, b, c)
    default:
      return false
  }
}

// Таблица истинности по 8 областям диаграммы Венна (принадлежность A, B, C)
function buildLut(ast) {
  const lut = new Array(8)
  for (let m = 0; m < 8; m++) {
    lut[m] = evalAst(ast, !!(m & 1), !!(m & 2), !!(m & 4))
  }
  return lut
}

function SetCalculator() {
  const [expr, setExpr] = useState("A'∪(B∩C)'")
  const [circles, setCircles] = useState(INITIAL_CIRCLES)
  const [dragging, setDragging] = useState(null)
  const svgRef = useRef(null)
  const canvasRef = useRef(null)
  const dragRef = useRef(null)

  const parsed = useMemo(() => {
    const trimmed = expr.trim()
    if (!trimmed) return { ast: null, error: null }
    try {
      return { ast: parse(tokenize(trimmed)), error: null }
    } catch (e) {
      return { ast: null, error: e.message }
    }
  }, [expr])

  const lut = useMemo(() => (parsed.ast ? buildLut(parsed.ast) : null), [parsed])

  // Закрашиваем жёлтым точки универсума, в которых выражение истинно
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, W, H)
    if (!lut) return
    const img = ctx.createImageData(W, H)
    const d = img.data
    const { x: ux, y: uy, r: ur } = UNIVERSE
    const ur2 = ur * ur
    const sets = [
      { cx: circles.A.x, cy: circles.A.y, r2: circles.A.r * circles.A.r, bit: 1 },
      { cx: circles.B.x, cy: circles.B.y, r2: circles.B.r * circles.B.r, bit: 2 },
      { cx: circles.C.x, cy: circles.C.y, r2: circles.C.r * circles.C.r, bit: 4 },
    ]
    const x0 = Math.max(0, Math.floor(ux - ur))
    const x1 = Math.min(W - 1, Math.ceil(ux + ur))
    const y0 = Math.max(0, Math.floor(uy - ur))
    const y1 = Math.min(H - 1, Math.ceil(uy + ur))
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dxu = x - ux
        const dyu = y - uy
        if (dxu * dxu + dyu * dyu > ur2) continue
        let mask = 0
        for (let s = 0; s < 3; s++) {
          const set = sets[s]
          const ddx = x - set.cx
          const ddy = y - set.cy
          if (ddx * ddx + ddy * ddy <= set.r2) mask |= set.bit
        }
        if (lut[mask]) {
          const i = (y * W + x) * 4
          d[i] = 255
          d[i + 1] = 255
          d[i + 2] = 0
          d[i + 3] = 255
        }
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [lut, circles])

  const toSvg = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    }
  }

  const onPointerDown = (name) => (e) => {
    e.preventDefault()
    const p = toSvg(e)
    dragRef.current = { name, dx: p.x - circles[name].x, dy: p.y - circles[name].y }
    setDragging(name)
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId)
    } catch {
      // синтетические события без активного указателя не поддерживают захват
    }
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    const p = toSvg(e)
    const r = circles[drag.name].r
    const nx = Math.max(r + 6, Math.min(W - r - 6, p.x - drag.dx))
    const ny = Math.max(r + 6, Math.min(H - r - 6, p.y - drag.dy))
    setCircles((prev) => ({ ...prev, [drag.name]: { ...prev[drag.name], x: nx, y: ny } }))
  }

  const onPointerUp = () => {
    dragRef.current = null
    setDragging(null)
  }

  const appendToken = (tok) => setExpr((prev) => prev + tok)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-violet-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Калькулятор множеств (Set Calculator)</h3>
        <p className="text-gray-700 mb-3">
          Множество — это набор объектов. В теории вероятностей обозначения теории множеств
          используются для описания составных событий: например, событие «выпало чётное число» —
          это множество {'{'}2, 4, 6{'}'}. Поэтому важно свободно владеть алгеброй множеств:
          объединением ∪, пересечением ∩ и дополнением ′.
        </p>
        <p className="text-gray-700 mb-3">
          Здесь универс <span className="italic font-semibold">U</span> — все точки большого круга,
          а A, B и C — три множества. Составьте выражение из кнопок (дополнение обозначается
          штрихом: A′ — «не A») — оно вычисляется сразу, и области, где оно истинно, подсвечиваются{' '}
          <span className="inline-block w-3.5 h-3.5 bg-yellow-300 align-middle mx-0.5 rounded-sm border border-yellow-400"></span>{' '}
          жёлтым.
        </p>
        <p className="text-gray-700">
          Круги можно перетаскивать мышью — картина пересчитается мгновенно. На готовых примерах
          удобно проверять тождества, например законы де Моргана: (A∪B)′ = A′∩B′.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-violet-200 p-6 min-w-[300px] space-y-4">
          <h3 className="text-lg font-semibold">Конструктор выражений</h3>

          <div className="space-y-2">
            {TOKEN_ROWS.map((row, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                {row.map((tok) => (
                  <button
                    key={tok}
                    onClick={() => appendToken(TOKEN_INSERT[tok])}
                    className="w-11 h-10 rounded-lg border border-gray-300 bg-white hover:bg-violet-50 hover:border-violet-300 text-base font-medium transition-colors"
                  >
                    {tok}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            spellCheck="false"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-base focus:outline-none focus:ring-1 focus:ring-violet-400"
          />

          {expr.trim() === '' && (
            <p className="text-sm text-gray-400">Введите выражение или воспользуйтесь кнопками.</p>
          )}
          {parsed.error && <p className="text-sm text-red-600">Ошибка: {parsed.error}</p>}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setExpr((prev) => prev.slice(0, -1))}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              ⌫ Удалить
            </button>
            <button
              onClick={() => setExpr('')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Очистить
            </button>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Примеры (проверьте тождества):</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setExpr(p)}
                  className={`px-2.5 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                    expr === p
                      ? 'border-violet-400 bg-violet-100 text-violet-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 p-6 flex-1 min-w-[360px]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-2 text-sm text-gray-700">
            {['A', 'B', 'C'].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3.5 h-3.5 rounded-sm border-2"
                  style={{ borderColor: SET_COLORS[s] }}
                ></span>
                {s}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 rounded-sm bg-yellow-300 border border-yellow-400"></span>
              <span className="font-mono">{expr.trim() || '∅'}</span>
            </span>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="w-full h-auto block absolute inset-0"
            />
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto block relative select-none touch-none"
            >
              {/* Универс */}
              <circle
                cx={UNIVERSE.x}
                cy={UNIVERSE.y}
                r={UNIVERSE.r}
                fill="none"
                stroke="#111827"
                strokeWidth="2.5"
              />
              <text
                x={UNIVERSE.x - UNIVERSE.r + 14}
                y={UNIVERSE.y - UNIVERSE.r + 26}
                fontSize="17"
                fontStyle="italic"
                fill="#111827"
              >
                Ω
              </text>

              {['A', 'B', 'C'].map((name) => {
                const c = circles[name]
                const lx = Math.max(18, Math.min(W - 18, c.x + c.r * 0.74))
                const ly = Math.max(20, Math.min(H - 8, c.y - c.r * 0.74))
                return (
                  <g key={name}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={c.r}
                      fill="transparent"
                      stroke={SET_COLORS[name]}
                      strokeWidth={dragging === name ? 4.5 : 3}
                      style={{ cursor: dragging === name ? 'grabbing' : 'grab' }}
                      onPointerDown={onPointerDown(name)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                    />
                    <text
                      x={lx}
                      y={ly}
                      fontSize="19"
                      fontWeight="bold"
                      fill={SET_COLORS[name]}
                      pointerEvents="none"
                    >
                      {name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Перетащите круг мышью, чтобы изменить диаграмму. Закрашена область универсума, в
            которой выражение истинно.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SetCalculator
