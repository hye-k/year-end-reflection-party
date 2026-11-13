import type { CSSProperties } from 'react'
import { motionAnimation, type Motion } from './motion'
import angler from '../assets/sprites/angler.png'
import chest from '../assets/sprites/chest.png'
import clam from '../assets/sprites/clam.png'
import fish2 from '../assets/sprites/fish2.png'
import fish3 from '../assets/sprites/fish3.png'
import shark from '../assets/sprites/shark.png'
import shrimp from '../assets/sprites/shrimp.png'
import squid from '../assets/sprites/squid.png'
import swordfish from '../assets/sprites/swordfish.png'
import bubble from '../assets/sprites/bubble.png'
import coral from '../assets/sprites/coral.png'
import diver from '../assets/sprites/diver.png'
import fish from '../assets/sprites/fish.png'
import jelly from '../assets/sprites/jelly.png'
import shell from '../assets/sprites/shell.png'
import weed from '../assets/sprites/weed.png'

interface Sheet {
  url: string
  frameW: number
  frameH: number
  cols: number
  rows: number
}

const SHEETS = {
  diver: { url: diver, frameW: 32, frameH: 32, cols: 7, rows: 4 },
  fish: { url: fish, frameW: 16, frameH: 16, cols: 8, rows: 4 },
  coral: { url: coral, frameW: 16, frameH: 16, cols: 4, rows: 7 },
  weed: { url: weed, frameW: 16, frameH: 32, cols: 12, rows: 8 },
  shell: { url: shell, frameW: 16, frameH: 16, cols: 6, rows: 5 },
  bubble: { url: bubble, frameW: 8, frameH: 8, cols: 10, rows: 1 },
  jelly: { url: jelly, frameW: 32, frameH: 16, cols: 4, rows: 2 },
  squid: { url: squid, frameW: 32, frameH: 16, cols: 4, rows: 2 },
  shrimp: { url: shrimp, frameW: 16, frameH: 32, cols: 4, rows: 1 },
  clam: { url: clam, frameW: 16, frameH: 16, cols: 2, rows: 2 },
  chest: { url: chest, frameW: 16, frameH: 32, cols: 3, rows: 2 },
  swordfish: { url: swordfish, frameW: 48, frameH: 32, cols: 8, rows: 1 },
  fish2: { url: fish2, frameW: 32, frameH: 16, cols: 8, rows: 4 },
  fish3: { url: fish3, frameW: 32, frameH: 16, cols: 8, rows: 4 },
  shark: { url: shark, frameW: 32, frameH: 32, cols: 8, rows: 2 },
  angler: { url: angler, frameW: 32, frameH: 32, cols: 8, rows: 2 },
} satisfies Record<string, Sheet>

export type SheetName = keyof typeof SHEETS

interface FrameLoop {
  count: number
  fps: number
  axis?: 'x' | 'y'
}

interface SpriteProps {
  sheet: SheetName
  col?: number
  row?: number
  x: number
  y: number
  scale?: number
  opacity?: number
  glow?: string
  frames?: FrameLoop
  motion?: Motion
  phase?: number
}

export function Sprite({ sheet, col = 0, row = 0, x, y, scale = 4, opacity, glow, frames, motion, phase = 0 }: SpriteProps) {
  const s: Sheet = SHEETS[sheet]
  const w = s.frameW * scale
  const h = s.frameH * scale
  const axis = frames?.axis ?? 'x'
  const step = axis === 'x' ? w : h
  const animation = [
    frames && `sprite-${axis} ${frames.count / frames.fps}s steps(${frames.count}, end) ${-phase}s infinite`,
    motion && motionAnimation(motion, phase),
  ]
    .filter(Boolean)
    .join(', ')
  const style: CSSProperties & Record<string, string | number | undefined> = {
    left: x,
    top: y,
    width: w,
    height: h,
    backgroundImage: `url(${s.url})`,
    backgroundSize: `${s.cols * w}px ${s.rows * h}px`,
    backgroundPosition: `${-col * w}px ${-row * h}px`,
    opacity,
    filter: glow ? `drop-shadow(0 0 10px ${glow})` : undefined,
    animation: animation || undefined,
    '--x0': `${-col * w}px`,
    '--y0': `${-row * h}px`,
    '--span': frames ? `${frames.count * step}px` : undefined,
    '--dist': motion ? `${motion.dist}px` : undefined,
  }
  return <div aria-hidden="true" className="px-sprite" style={style} />
}
