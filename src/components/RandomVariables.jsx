import { useState } from 'react'

const GRID = 4 // сетка 4×4, 16 равновероятных исходов
const N = GRID * GRID

function RandomVariables() {
  // values[i] — значение случайной величины, приписанное клетке i (null — не задано)
  const [values, setValues] = useState(Array(N).fill(null))
  const [selected, setSelected] = useState(new Set())
  const [inputValue, setInputValue] = useState('1')
  const [sample, setSample] = useState([])

  const toggleCell = (i) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  const assign = () => {
    const v = Number(inputValue)
    if (Number.isNaN(v)) return
    if (selected.size === 0) return
    setValues((prev) => prev.map((val, i) => (selected.has(i) ? v : val)))
    setSelected(new Set())
    setSample([])
  }

  const clearAll = () => {
    setValues(Array(N).fill(null))
    setSample([])
  }

  const doSample = () => {
    // Выбираем только клетки с заданным значением
    const assigned = []
    values.forEach((v) => {
      if (v !== null) assigned.push(v)
    })
    if (assigned.length === 0) return
    const draws = []
    for (let i = 0; i < 2000; i++) {
      draws.push(assigned[Math.floor(Math.random() * assigned.length)])
    }
    setSample(draws)
  }

  // Гистограмма по дискретным значениям
  const counts = {}
  for (const x of sample) counts[x] = (counts[x] || 0) + 1
  const distinct = Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b)
  const maxCount = Math.max(1, ...distinct.map((v) => counts[v]))
  const assignedCount = values.filter((v) => v !== null).length

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-emerald-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Случайные величины (Random Variables)</h3>
        <p className="text-gray-700 mb-3">
          Строго говоря, <strong>случайная величина — это функция</strong>, которая каждому исходу
          из вероятностного пространства сопоставляет вещественное число.
        </p>
        <p className="text-gray-700 mb-3">
          Задайте собственную дискретную случайную величину на равновероятном пространстве
          исходов: выделяйте клетки сетки мышью и присваивайте им числовые значения. Каждая клетка
          — равновозможный исход с вероятностью 1/16.
        </p>
        <p className="text-gray-700">
          Затем нажмите «Показать распределение»: генератор случайных исходов многократно
          «бросает» точку в сетку, а гистограмма показывает эмпирическое распределение построенной
          случайной величины.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-emerald-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Вероятностное пространство (16 равновероятных исходов)</h3>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`, width: 240 }}
          >
            {values.map((v, i) => {
              const isSel = selected.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleCell(i)}
                  className={`h-14 rounded-md border-2 flex flex-col items-center justify-center text-sm transition-colors ${
                    isSel
                      ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                      : v !== null
                        ? 'border-gray-300 bg-emerald-50 text-emerald-700 font-semibold'
                        : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {v !== null ? v : '·'}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Выделено клеток: {selected.size}. Задано значений: {assignedCount} из {N}.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-6 min-w-[300px] space-y-4">
          <h3 className="text-lg font-semibold">Конструктор случайной величины</h3>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Значение:</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              onClick={assign}
              disabled={selected.size === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Присвоить выделенным
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelected(new Set(values.map((_, i) => i)))}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            >
              Выделить все
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            >
              Снять выделение
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            >
              Очистить значения
            </button>
          </div>

          <button
            onClick={doSample}
            disabled={assignedCount === 0}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Показать распределение (2000 испытаний)
          </button>
        </div>

        <div className="bg-white rounded-xl border border-emerald-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-4">Эмпирическое распределение X</h3>
          {sample.length === 0 ? (
            <p className="text-sm text-gray-400 h-48 flex items-center justify-center">
              Задайте значения клеткам и нажмите «Показать распределение».
            </p>
          ) : (
            <>
              <div className="flex items-end gap-2 h-48 border-b border-l border-gray-300 pl-2">
                {distinct.map((v) => (
                  <div key={v} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500 mb-1">
                      {((counts[v] / sample.length) * 100).toFixed(1)}%
                    </span>
                    <div
                      className="w-full max-w-[56px] bg-emerald-400 rounded-t"
                      style={{ height: `${(counts[v] / maxCount) * 150}px` }}
                    />
                    <span className="text-sm font-medium text-gray-700 mt-1">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Значения случайной величины X и эмпирические частоты их появления.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default RandomVariables
