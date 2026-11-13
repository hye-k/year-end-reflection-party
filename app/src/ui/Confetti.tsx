import { useEffect, useState } from 'react'

const PIECE_COUNT = 90
const COLORS = ['#e8c170', '#da863e', '#73bed3', '#c8e5e2', '#ebede9', '#e86a92']
// Longest fall (4.6s) plus the longest delay (1.4s), with a little slack.
const LIFETIME_MS = 6500

interface Piece {
  left: number
  size: number
  color: string
  fall: number
  delay: number
  sway: number
  swayTime: number
  spin: number
}

const between = (min: number, max: number) => min + Math.random() * (max - min)

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, () => ({
    left: between(0, 100),
    size: Math.random() < 0.3 ? 12 : 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    fall: between(3, 4.6),
    delay: between(0, 1.4),
    sway: between(12, 40),
    swayTime: between(0.8, 1.6),
    spin: between(0.6, 1.4),
  }))
}

// One burst of pixel confetti that falls once and removes itself. Hidden for reduced motion (see tokens.css).
// `fixed` covers the browser window instead of its positioned parent, for screens that are not a fixed-size stage.
export function Confetti({ fixed = false }: { fixed?: boolean }) {
  const [pieces] = useState(makePieces)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), LIFETIME_MS)
    return () => window.clearTimeout(timer)
  }, [])
  if (done) return null
  return (
    <div aria-hidden="true" className="confetti" style={{ position: fixed ? 'fixed' : 'absolute' }}>
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="confetti-fall"
          style={{ left: `${piece.left}%`, animationDuration: `${piece.fall}s`, animationDelay: `${piece.delay}s` }}
        >
          <span
            className="confetti-sway"
            style={{
              width: piece.size,
              height: piece.size,
              background: piece.color,
              animationDuration: `${piece.swayTime}s, ${piece.spin}s`,
              ['--sway' as string]: `${piece.sway}px`,
            }}
          />
        </span>
      ))}
    </div>
  )
}
