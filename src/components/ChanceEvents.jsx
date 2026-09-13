import { useState } from 'react'
import { Plot, linePath } from './Plot.jsx'
import Slider from './Slider.jsx'

const MAX_TRIALS = 5000

function ChanceEvents() {
  const [pHeads, setPHeads] = useState(0.5)
  const [results, setResults] = useState([]) // true = орёл
  const [last, setLast] = useState(null)

  const flip = (n) => {
    const batch = []
    for (let i = 0; i < n; i++) batch.push(Math.random() < pHeads)
    setLast(batch[batch.length - 1])
    setResults((prev) => [...prev, ...batch].slice(0, MAX_TRIALS))
  }

  const reset = () => {
    setResults([])
    setLast(null)
  }

  const heads = results.filter(Boolean).length
  const freq = results.length ? heads / results.length : 0

  // Кривая накопленной частоты
  const curve = []
  let h = 0
  for (let i = 0; i < results.length; i++) {
    if (results[i]) h++
    if (i < 30 || i % Math.ceil(results.length / 400 || 1) === 0 || i === results.length - 1) {
      curve.push([i + 1, h / (i + 1)])
    }
  }
  const xMax = Math.max(20, results.length)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-amber-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Случайные события (Chance Events)</h3>
        <p className="text-gray-700 mb-3">
          Случайность окружает нас повсюду. Теория вероятностей даёт логическую основу для анализа
          случайных событий: вероятность принимает значение от 0 до 1 (достоверное событие).
        </p>
        <p className="text-gray-700 mb-3">
          Классический пример — бросание монеты: пока монета симметрична, вероятность выпадения
          орла или решки равна 1/2. При небольшом числе бросков частота может заметно отличаться от
          половины, однако <strong>с ростом числа бросков накопленная частота выпадения орла неуклонно
          приближается к 50%</strong> — в этом и состоит связь между вероятностью и частотой.
        </p>
        <p className="text-gray-700">
          Подвиньте ползунок, чтобы сделать монету несимметричной (задать истинную вероятность
          орла), и посмотрите, как частота сходится к заданному значению.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-amber-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-4">Частота выпадения орла от числа бросков</h3>
          <Plot
            xMin={1}
            xMax={xMax}
            yMin={0}
            yMax={1}
            xLabel="Число бросков"
            yLabel="Частота орла"
          >
            {({ sx, sy }) => (
              <>
                <line
                  x1={sx(1)}
                  x2={sx(xMax)}
                  y1={sy(pHeads)}
                  y2={sy(pHeads)}
                  stroke="#dc2626"
                  strokeDasharray="6 4"
                  strokeWidth="1.5"
                />
                {results.length > 0 && (
                  <path d={linePath(curve, sx, sy)} fill="none" stroke="#d97706" strokeWidth="2" />
                )}
              </>
            )}
          </Plot>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block w-3 h-0.5 bg-red-600 align-middle mr-1"></span>
            истинная вероятность p = {pHeads.toFixed(2)}
            <span className="inline-block w-3 h-0.5 bg-amber-600 align-middle ml-4 mr-1"></span>
            накопленная частота
          </p>
        </div>

        <div className="bg-white rounded-xl border border-amber-200 p-6 min-w-[280px] space-y-5">
          <h3 className="text-lg font-semibold">Симулятор монеты</h3>

          <div className="flex justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold border-4 transition-colors ${
                last === null
                  ? 'bg-gray-50 border-gray-200 text-gray-400'
                  : last
                    ? 'bg-amber-100 border-amber-400 text-amber-700'
                    : 'bg-gray-100 border-gray-400 text-gray-700'
              }`}
            >
              {last === null ? '?' : last ? 'Орёл' : 'Решка'}
            </div>
          </div>

          <Slider
            label="Вероятность орла p"
            value={pHeads}
            min={0}
            max={1}
            step={0.01}
            onChange={setPHeads}
            format={(v) => v.toFixed(2)}
            accentClass="accent-amber-600"
          />

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="p-2 bg-gray-50 rounded-lg text-center">
              Бросков: <strong className="text-gray-800">{results.length}</strong>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg text-center">
              Орлов: <strong className="text-gray-800">{heads}</strong>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg text-center col-span-2">
              Накопленная частота: <strong className="text-amber-700">{freq.toFixed(4)}</strong>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => flip(1)}
              className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Подбросить 1 раз
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => flip(100)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                100 бросков
              </button>
              <button
                onClick={() => flip(1000)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors"
              >
                1000 бросков
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
    </div>
  )
}

export default ChanceEvents
