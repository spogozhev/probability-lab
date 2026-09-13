import { useId } from 'react'
import { niceTicks } from '../utils/stats.js'

const PAD = { top: 14, right: 16, bottom: 38, left: 54 }

function formatTick(v) {
  if (Object.is(v, -0)) v = 0
  if (Number.isInteger(v)) return String(v)
  if (Math.abs(v) >= 1000) return String(Math.round(v))
  if (Math.abs(v) >= 10) return v.toFixed(1)
  if (Math.abs(v) >= 1) return v.toFixed(2).replace(/0$/, '')
  return v.toFixed(2)
}

/**
 * Базовый SVG-график с осями и сеткой.
 * children — функция ({ sx, sy, width, height }) => JSX
 */
export function Plot({
  width = 620,
  height = 340,
  xMin,
  xMax,
  yMin = 0,
  yMax = 1,
  xLabel,
  yLabel,
  xTickCount = 6,
  yTickCount = 5,
  padRight = 16,
  children,
}) {
  const iw = width - PAD.left - padRight
  const ih = height - PAD.top - PAD.bottom
  const sx = (x) => PAD.left + ((x - xMin) / (xMax - xMin)) * iw
  const sy = (y) => PAD.top + ih - ((y - yMin) / (yMax - yMin)) * ih
  const xTicks = niceTicks(xMin, xMax, xTickCount)
  const yTicks = niceTicks(yMin, yMax, yTickCount)
  const clipId = useId().replace(/[^a-zA-Z0-9-]/g, '')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD.left} y={PAD.top} width={iw} height={ih} />
        </clipPath>
      </defs>
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(t)} y2={sy(t)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD.left - 8} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
            {formatTick(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={sy(yMin)} y2={sy(yMax)} stroke="#fafafa" strokeWidth="1" />
          <text x={sx(t)} y={height - PAD.bottom + 16} textAnchor="middle" fontSize="11" fill="#9ca3af">
            {formatTick(t)}
          </text>
        </g>
      ))}
      <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(yMin)} y2={sy(yMin)} stroke="#9ca3af" strokeWidth="1.5" />
      <line x1={sx(xMin)} x2={sx(xMin)} y1={sy(yMin)} y2={sy(yMax)} stroke="#9ca3af" strokeWidth="1.5" />
      {xLabel && (
        <text x={PAD.left + iw / 2} y={height - 4} textAnchor="middle" fontSize="12" fill="#6b7280">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={14}
          y={PAD.top + ih / 2}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
          transform={`rotate(-90 14 ${PAD.top + ih / 2})`}
        >
          {yLabel}
        </text>
      )}
      <g clipPath={`url(#${clipId})`}>
        {children({ sx, sy, iw, ih })}
      </g>
    </svg>
  )
}

// Путь ломаной по массиву точек [x, y]
export function linePath(pts, sx, sy) {
  if (!pts || !pts.length) return ''
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    d += `${i === 0 ? 'M' : 'L'}${sx(pts[i][0]).toFixed(2)},${sy(pts[i][1]).toFixed(2)}`
  }
  return d
}

// Путь под кривой (заливка области до нуля)
export function areaPath(pts, sx, sy, y0 = 0) {
  if (!pts || !pts.length) return ''
  let d = linePath(pts, sx, sy)
  d += `L${sx(pts[pts.length - 1][0]).toFixed(2)},${sy(y0).toFixed(2)}`
  d += `L${sx(pts[0][0]).toFixed(2)},${sy(y0).toFixed(2)}Z`
  return d
}
