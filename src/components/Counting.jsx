import { useState } from 'react'
import Slider from './Slider.jsx'
import { factorial, combinations, permutationsOf, combinationsOf } from '../utils/stats.js'

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#14b8a6']
const DISPLAY_CAP = 80

function Marble({ colorIdx, size = 20 }) {
  return (
    <span
      className="inline-block rounded-full border border-black/10 shrink-0"
      style={{ width: size, height: size, backgroundColor: COLORS[colorIdx] }}
    />
  )
}

function Counting() {
  const [n, setN] = useState(4)
  const [mode, setMode] = useState('permutations') // permutations | combinations
  const [k, setK] = useState(2)

  const marbles = Array.from({ length: n }, (_, i) => i)

  const perCount = factorial(n)
  const comCount = combinations(n, k)
  const list =
    mode === 'permutations'
      ? permutationsOf(marbles, DISPLAY_CAP)
      : combinationsOf(marbles, k, DISPLAY_CAP)
  const total = mode === 'permutations' ? perCount : comCount

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-violet-200 p-6">
        <h3 className="text-lg font-semibold mb-3">Комбинаторика (Counting)</h3>
        <p className="text-gray-700 mb-3">
          Подсчитать число последовательностей или наборов, удовлетворяющих заданным условиям,
          бывает на удивление трудно. Классическая задача: в мешке лежат шарики разных цветов,
          которые вынимают по одному <strong>без возвращения</strong>. Сколько различных
          упорядоченных последовательностей (перестановок) и скольких неупорядоченных наборов
          (сочетаний) можно получить?
        </p>
        <p className="text-gray-700 mb-3">
          Число перестановок n шариков равно <span className="font-mono bg-gray-100 px-1.5 rounded">n!</span>,
          а число сочетаний из n по k —{' '}
          <span className="font-mono bg-gray-100 px-1.5 rounded">C(n, k) = n! / (k!·(n−k)!)</span>.
          Комбинаторика лежит в основе подсчёта вероятностей: вероятность = число благоприятных
          исходов / число всех исходов.
        </p>
        <p className="text-gray-700">
          Выберите, сколько шариков лежит в мешке, и нажмите на таблицу, чтобы увидеть все
          возможные перестановки или сочетания.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="bg-white rounded-xl border border-violet-200 p-6 min-w-[300px] space-y-5">
          <h3 className="text-lg font-semibold">Мешок с шариками</h3>

          <div className="flex gap-2">
            {marbles.map((i) => (
              <Marble key={i} colorIdx={i} size={26} />
            ))}
          </div>

          <Slider
            label="Число шариков n"
            value={n}
            min={1}
            max={7}
            step={1}
            onChange={(v) => {
              setN(v)
              if (k > v) setK(v)
            }}
            accentClass="accent-violet-600"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setMode('permutations')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'permutations' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Перестановки
            </button>
            <button
              onClick={() => setMode('combinations')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'combinations' ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Сочетания
            </button>
          </div>

          {mode === 'combinations' && (
            <Slider
              label="Размер набора k"
              value={k}
              min={0}
              max={n}
              step={1}
              onChange={setK}
              accentClass="accent-violet-600"
            />
          )}

          <div className="p-3 bg-violet-50 rounded-lg text-sm text-gray-700">
            {mode === 'permutations' ? (
              <p>
                Число перестановок: <strong className="text-violet-700">{n}! = {perCount}</strong>
              </p>
            ) : (
              <p>
                Число сочетаний: <strong className="text-violet-700">C({n}, {k}) = {comCount}</strong>
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-violet-200 p-6 flex-1 min-w-[320px]">
          <h3 className="text-lg font-semibold mb-3">
            Все возможные {mode === 'permutations' ? 'перестановки' : 'сочетания'}
          </h3>
          <div className="max-h-96 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
            {list.map((arr, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50">
                <span className="text-xs text-gray-400 w-10 text-right tabular-nums">{idx + 1}.</span>
                <div className="flex gap-1.5">
                  {arr.map((c, j) => (
                    <Marble key={j} colorIdx={c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {total > DISPLAY_CAP
              ? `Показаны первые ${DISPLAY_CAP} из ${total} вариантов.`
              : `Всего вариантов: ${total}.`}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Counting
