// Математическая библиотека для симуляторов теории вероятностей

// ---------- Специальные функции ----------

// Функция ошибок (аппроксимация Абрамовица-Стегана)
export function erf(x) {
  const sign = x >= 0 ? 1 : -1
  const z = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * z)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-z * z)
  return sign * y
}

// Логарифм гамма-функции (аппроксимация Ланцоша)
export function logGamma(x) {
  const g = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  x -= 1
  let a = 0.99999999999980993
  const t = x + 7.5
  for (let i = 0; i < 8; i++) a += g[i] / (x + i + 1)
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a)
}

export function logBeta(a, b) {
  return logGamma(a) + logGamma(b) - logGamma(a + b)
}

export function factorial(n) {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export function combinations(n, k) {
  if (k < 0 || k > n) return 0
  k = Math.min(k, n - k)
  let r = 1
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i
  return Math.round(r)
}

// Неполная бета-функция (регуляризованная), по схеме из Numerical Recipes
function betacf(a, b, x) {
  const MAXIT = 300
  const EPS = 3e-12
  const FPMIN = 1e-300
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1 / d
  let h = d
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    h *= d * c
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + aa * d
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < EPS) break
  }
  return h
}

export function incompleteBeta(a, b, x) {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
  )
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b
}

// Нижняя регуляризованная неполная гамма-функция P(a, x)
function gammaSeries(a, x) {
  let ap = a
  let sum = 1 / a
  let del = sum
  for (let n = 1; n < 300; n++) {
    ap++
    del *= x / ap
    sum += del
    if (Math.abs(del) < Math.abs(sum) * 1e-12) break
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
}

function gammaContFrac(a, x) {
  const FPMIN = 1e-300
  let b = x + 1 - a
  let c = 1 / FPMIN
  let d = 1 / b
  let h = d
  for (let i = 1; i < 300; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = b + an / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-12) break
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
}

export function incompleteGamma(a, x) {
  if (x <= 0) return 0
  return x < a + 1 ? gammaSeries(a, x) : 1 - gammaContFrac(a, x)
}

// ---------- Нормальное распределение ----------

export const normalPdf = (x, mu = 0, sigma = 1) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI))

export const normalCdf = (x, mu = 0, sigma = 1) =>
  0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)))

// Квантиль нормального распределения (алгоритм Питера Аклама)
export function normalQuantile(p) {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]
  const plow = 0.02425
  const phigh = 1 - plow
  let q, r
  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
  if (p <= phigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  }
  q = Math.sqrt(-2 * Math.log(1 - p))
  return (
    -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  )
}

// ---------- Плотности непрерывных распределений ----------

export const uniformPdf = (x, a, b) => (x >= a && x <= b ? 1 / (b - a) : 0)

export function studentTPdf(x, df) {
  const c = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI)
  return c * Math.pow(1 + (x * x) / df, -(df + 1) / 2)
}

export function chiSqPdf(x, k) {
  if (x <= 0) return 0
  return Math.exp(((k / 2 - 1) * Math.log(x) - x / 2 - (k / 2) * Math.LN2 - logGamma(k / 2)))
}

export const exponentialPdf = (x, lambda) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x))

export function fPdf(x, d1, d2) {
  if (x <= 0) return 0
  const lg =
    (d1 / 2) * Math.log(d1 / d2) +
    (d1 / 2 - 1) * Math.log(x) -
    ((d1 + d2) / 2) * Math.log(1 + (d1 * x) / d2) -
    logBeta(d1 / 2, d2 / 2)
  return Math.exp(lg)
}

export function gammaPdf(x, shape, scale) {
  if (x <= 0) return 0
  return Math.exp((shape - 1) * Math.log(x) - x / scale - logGamma(shape) - shape * Math.log(scale))
}

export function betaPdf(x, a, b) {
  if (x < 0 || x > 1) return 0
  if (x === 0) return a === 1 ? Math.exp(-logBeta(a, b)) : a > 1 ? 0 : Infinity
  if (x === 1) return b === 1 ? Math.exp(-logBeta(a, b)) : b > 1 ? 0 : Infinity
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - logBeta(a, b))
}

// ---------- Массовые функции дискретных распределений ----------

export const bernoulliPmf = (k, p) => (k === 1 ? p : k === 0 ? 1 - p : 0)

export function binomialPmf(k, n, p) {
  if (k < 0 || k > n) return 0
  return Math.exp(
    logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p)
  )
}

export function binomialCdf(k, n, p) {
  let s = 0
  for (let i = 0; i <= k; i++) s += binomialPmf(i, n, p)
  return s
}

export const geometricPmf = (k, p) => (k >= 1 ? Math.pow(1 - p, k - 1) * p : 0)
export const geometricCdf = (k, p) => (k >= 1 ? 1 - Math.pow(1 - p, k) : 0)

export function poissonPmf(k, lambda) {
  if (k < 0) return 0
  return Math.exp(-lambda + k * Math.log(lambda) - logGamma(k + 1))
}

export function poissonCdf(k, lambda) {
  let s = 0
  for (let i = 0; i <= k; i++) s += poissonPmf(i, lambda)
  return s
}

// Число неудач k до r-го успеха
export function negBinomialPmf(k, r, p) {
  if (k < 0) return 0
  return Math.exp(
    logGamma(k + r) - logGamma(k + 1) - logGamma(r) + r * Math.log(p) + k * Math.log(1 - p)
  )
}

// ---------- CDF и квантили для статистического вывода ----------

export const chiSqCdf = (x, k) => incompleteGamma(k / 2, x / 2)

export function tCdf(t, df) {
  const x = df / (df + t * t)
  const p = 0.5 * incompleteBeta(df / 2, 0.5, x)
  return t > 0 ? 1 - p : p
}

export function tQuantile(p, df) {
  let lo = -100
  let hi = 100
  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2
    if (tCdf(mid, df) < p) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function fCdf(x, d1, d2) {
  if (x <= 0) return 0
  return incompleteBeta((d1 * x) / (d1 * x + d2), d1 / 2, d2 / 2)
}

export const fPValue = (f, d1, d2) => 1 - fCdf(f, d1, d2)

export function betaQuantile(p, a, b) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    if (incompleteBeta(a, b, mid) < p) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// ---------- Генераторы случайных величин ----------

export const randUniform = (a = 0, b = 1) => a + Math.random() * (b - a)

export function randNormal(mu = 0, sigma = 1) {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export const randExponential = (lambda) => -Math.log(1 - Math.random()) / lambda

// Метод Марсальи-Цанга
export function randGamma(shape, scale = 1) {
  if (shape < 1) return randGamma(shape + 1, 1) * Math.pow(Math.random(), 1 / shape)
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  for (;;) {
    let x, v
    do {
      x = randNormal()
      v = 1 + c * x
    } while (v <= 0)
    v = v * v * v
    const u = Math.random()
    if (u < 1 - 0.0331 * x * x * x * x) return d * v * scale
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale
  }
}

export function randBeta(a, b) {
  const x = randGamma(a, 1)
  const y = randGamma(b, 1)
  return x / (x + y)
}

export const randChiSq = (df) => 2 * randGamma(df / 2, 1)

export function randStudentT(df) {
  return randNormal() / Math.sqrt(randChiSq(df) / df)
}

export function randF(d1, d2) {
  return (randChiSq(d1) / d1) / (randChiSq(d2) / d2)
}

export const randBernoulli = (p) => (Math.random() < p ? 1 : 0)

export function randBinomial(n, p) {
  let s = 0
  for (let i = 0; i < n; i++) if (Math.random() < p) s++
  return s
}

export function randGeometric(p) {
  return Math.max(1, Math.ceil(Math.log(1 - Math.random()) / Math.log(1 - p)))
}

export function randPoisson(lambda) {
  // Для больших lambda используем нормальную аппроксимацию
  if (lambda > 30) return Math.max(0, Math.round(randNormal(lambda, Math.sqrt(lambda))))
  const L = Math.exp(-lambda)
  let k = 0
  let prob = 1
  do {
    k++
    prob *= Math.random()
  } while (prob > L)
  return k - 1
}

export function randNegBinomial(r, p) {
  let failures = 0
  for (let i = 0; i < r; i++) {
    failures += randGeometric(p) - 1
  }
  return failures
}

// ---------- Простая статистика ----------

export function mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((s, x) => s + x, 0) / arr.length
}

// Выборочная дисперсия (n - 1 в знаменателе)
export function variance(arr) {
  const n = arr.length
  if (n < 2) return 0
  const m = mean(arr)
  return arr.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1)
}

export const std = (arr) => Math.sqrt(variance(arr))

export function histogram(samples, binCount, x0, x1) {
  const w = (x1 - x0) / binCount
  const counts = new Array(binCount).fill(0)
  for (const s of samples) {
    if (s < x0 || s > x1) continue
    let i = Math.floor((s - x0) / w)
    if (i >= binCount) i = binCount - 1
    if (i < 0) i = 0
    counts[i]++
  }
  const n = samples.length
  return counts.map((c, i) => ({
    x0: x0 + i * w,
    x1: x0 + (i + 1) * w,
    count: c,
    density: n ? c / (n * w) : 0,
  }))
}

// «Красивые» деления оси
export function niceTicks(min, max, count = 5) {
  if (!isFinite(min) || !isFinite(max)) return []
  if (min === max) {
    min -= 1
    max += 1
  }
  const step0 = (max - min) / Math.max(1, count - 1)
  const mag = Math.pow(10, Math.floor(Math.log10(step0)))
  const norm = step0 / mag
  let step
  if (norm <= 1) step = 1
  else if (norm <= 2) step = 2
  else if (norm <= 2.5) step = 2.5
  else if (norm <= 5) step = 5
  else step = 10
  step *= mag
  const start = Math.ceil(min / step) * step
  const ticks = []
  for (let v = start, i = 0; v <= max + step * 1e-9 && i < 100; v += step, i++) {
    ticks.push(Math.abs(step) < 1 ? Number(v.toFixed(6)) : v)
  }
  return ticks
}

// МНК-оценка прямой y = a + b x
export function olsFit(points) {
  const n = points.length
  if (n < 2) return null
  const mx = mean(points.map((p) => p[0]))
  const my = mean(points.map((p) => p[1]))
  let sxx = 0
  let sxy = 0
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2
    sxy += (x - mx) * (y - my)
  }
  if (sxx === 0) return null
  const b = sxy / sxx
  const a = my - b * mx
  return { a, b, xMean: mx, yMean: my }
}

// Коэффициент корреляции Пирсона
export function pearson(points) {
  const n = points.length
  if (n < 2) return 0
  const mx = mean(points.map((p) => p[0]))
  const my = mean(points.map((p) => p[1]))
  let sxy = 0
  let sxx = 0
  let syy = 0
  for (const [x, y] of points) {
    sxy += (x - mx) * (y - my)
    sxx += (x - mx) ** 2
    syy += (y - my) ** 2
  }
  if (sxx === 0 || syy === 0) return 0
  return sxy / Math.sqrt(sxx * syy)
}

// ---------- Перечисление комбинаторных объектов ----------

// Все перестановки массива (не более maxCount штук)
export function permutationsOf(arr, maxCount = Infinity) {
  const result = []
  const current = []
  const used = new Array(arr.length).fill(false)
  function rec() {
    if (result.length >= maxCount) return
    if (current.length === arr.length) {
      result.push([...current])
      return
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue
      used[i] = true
      current.push(arr[i])
      rec()
      current.pop()
      used[i] = false
      if (result.length >= maxCount) return
    }
  }
  rec()
  return result
}

// Все сочетания по k элементов (не более maxCount штук)
export function combinationsOf(arr, k, maxCount = Infinity) {
  const result = []
  const current = []
  function rec(start) {
    if (result.length >= maxCount) return
    if (current.length === k) {
      result.push([...current])
      return
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i])
      rec(i + 1)
      current.pop()
      if (result.length >= maxCount) return
    }
  }
  rec(0)
  return result
}
