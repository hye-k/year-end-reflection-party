import type { CSSProperties, ReactNode } from 'react'
import { motionAnimation, type Motion } from '../motion'

const P = 4

export function Rect({ x, y, w, h, c, style }: { x: number; y: number; w: number; h: number; c: string; style?: CSSProperties }) {
  return <div aria-hidden="true" style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: c, ...style }} />
}

function Seam({ y, a, b }: { y: number; a: string; b: string }) {
  return <Rect x={0} y={y} w={1280} h={16} c={`repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0/${2 * P}px ${2 * P}px`} />
}

export type Band = readonly [end: number, color: string]

export function Bands({ from, to, stops }: { from: number; to: number; stops: readonly Band[] }) {
  let prev = from
  let prevColor: string | null = null
  const out: ReactNode[] = []
  for (const [end, color] of stops) {
    out.push(<Rect key={`b${end}`} x={0} y={prev} w={1280} h={Math.min(end, to) - prev} c={color} />)
    if (prevColor) out.push(<Seam key={`s${end}`} y={prev - 8} a={prevColor} b={color} />)
    prev = end
    prevColor = color
  }
  return <>{out}</>
}

export function DitherOverlay({ top, height, alpha }: { top: number; height: number; alpha: number }) {
  return (
    <Rect
      x={0}
      y={top}
      w={1280}
      h={height}
      c="transparent"
      style={{
        backgroundImage: `linear-gradient(45deg, rgba(255,255,255,${alpha}) 25%, transparent 25% 75%, rgba(255,255,255,${alpha}) 75%)`,
        backgroundSize: '8px 8px',
      }}
    />
  )
}

export function Foam({ y, dash = 16, gap = 16, color = '#ebede9', still = false }: { y: number; dash?: number; gap?: number; color?: string; still?: boolean }) {
  const period = dash + gap
  const style = still ? undefined : ({ animation: `foam 4s steps(4, end) infinite`, '--shift': `${period}px` } as CSSProperties)
  return <Rect x={0} y={y} w={1280} h={8} c={`repeating-linear-gradient(90deg,${color} 0 ${dash}px,transparent ${dash}px ${period}px)`} style={style} />
}

export function Group({ motion, phase = 0, children }: { motion: Motion; phase?: number; children: ReactNode }) {
  const style = { position: 'absolute', inset: 0, animation: motionAnimation(motion, phase), '--dist': `${motion.dist}px` } as CSSProperties
  return <div aria-hidden="true" style={style}>{children}</div>
}

export function HalfSun({ cx, cy, r, color, core, coreR = 0 }: { cx: number; cy: number; r: number; color: string; core?: string; coreR?: number }) {
  const rows: ReactNode[] = []
  for (let y = cy - r; y < cy; y += P) {
    const dy = cy - y - P / 2
    const half = (radius: number) => Math.floor(Math.sqrt(Math.max(radius * radius - dy * dy, 0)) / P) * P
    const w = half(r)
    if (w > 0) rows.push(<rect key={`o${y}`} x={cx - w} y={y} width={2 * w} height={P} fill={color} />)
    const w2 = core ? half(coreR) : 0
    if (w2 > 0) rows.push(<rect key={`i${y}`} x={cx - w2} y={y} width={2 * w2} height={P} fill={core} />)
  }
  return (
    <svg aria-hidden="true" width={1280} height={760} viewBox="0 0 1280 760" shapeRendering="crispEdges" style={{ position: 'absolute', left: 0, top: 0 }}>
      {rows}
    </svg>
  )
}

const CLOUD_ROWS = [
  [12, 0, 16, 'top'],
  [4, 4, 32, 'top'],
  [0, 8, 44, 'top'],
  [4, 12, 36, 'shade'],
] as const

export function Cloud({ x, y, color, shade }: { x: number; y: number; color: string; shade: string }) {
  return (
    <>
      {CLOUD_ROWS.map(([dx, dy, w, tone]) => (
        <Rect key={`${dx}-${dy}`} x={x + dx} y={y + dy} w={w} h={P} c={tone === 'top' ? color : shade} />
      ))}
    </>
  )
}

export function Buoy({ x, y, flag = false }: { x: number; y: number; flag?: boolean }) {
  const edge = { boxShadow: '0 0 0 4px #090a14' }
  return (
    <>
      <Rect x={x} y={y - 16} w={32} h={16} c="#ebede9" style={edge} />
      <Rect x={x} y={y} w={32} h={12} c="#cf573c" style={edge} />
      <Rect x={x + 14} y={y - (flag ? 48 : 36)} w={4} h={flag ? 32 : 20} c="#090a14" />
      {flag && <Rect x={x + 18} y={y - 48} w={20} h={12} c="#cf573c" style={edge} />}
    </>
  )
}
