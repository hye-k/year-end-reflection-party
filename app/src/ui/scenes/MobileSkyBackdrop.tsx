import type { CSSProperties, ReactNode } from 'react'
import { Sprite } from '../Sprite'
import { twinkle } from '../motion'
import { Buoy, Cloud, Foam, Group, HalfSun, Rect } from './pixel'

export type SkyVariant = 'sunset' | 'morning'

const SEA_H = 230
const CANVAS_W = 1280
const CENTRE = CANVAS_W / 2

const SKY: Record<SkyVariant, string> = {
  sunset: 'linear-gradient(180deg,#3c5e8b 0 16%,#c65197 16% 38%,#cf573c 38% 62%,#da863e 62% 84%,#e8c170 84% 100%)',
  morning: 'linear-gradient(180deg,#73bed3 0 20%,#a4dddb 20% 44%,#ebede9 44% 72%,#e7d5b3 72% 90%,#e8c170 90% 100%)',
}

const SEA: Record<SkyVariant, string> = {
  sunset: 'linear-gradient(180deg,#3c5e8b 0 33%,#253a5e 33% 71%,#172038 71% 100%)',
  morning: 'linear-gradient(180deg,#73bed3 0 33%,#4f8fba 33% 71%,#3c5e8b 71% 100%)',
}

// A 1280px-wide canvas centred on the screen, so desktop-style absolute coordinates still work.
function Canvas({ style, children }: { style: CSSProperties; children: ReactNode }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '50%', marginLeft: -CENTRE, width: CANVAS_W, ...style }}>
      {children}
    </div>
  )
}

const GLINTS = [
  [16, 100, 'gold'],
  [32, 70, 'light'],
  [48, 110, 'gold'],
  [64, 50, 'light'],
] as const

function SkyDetails({ variant }: { variant: SkyVariant }) {
  const sunset = variant === 'sunset'
  return (
    <Canvas style={{ bottom: SEA_H, height: 760 }}>
      {sunset ? (
        <>
          <Rect x={CENTRE - 190} y={716} w={110} h={8} c="#cf573c" />
          <Rect x={CENTRE + 90} y={732} w={90} h={8} c="#c65197" />
          <HalfSun cx={CENTRE} cy={760} r={84} color="#e8c170" core="#e7d5b3" coreR={48} />
        </>
      ) : (
        <>
          <HalfSun cx={CENTRE} cy={760} r={72} color="#ebede9" />
          {[[-110, 686, 24, 4], [86, 686, 24, 4], [-8, 656, 4, 16]].map(([dx, y, w, h], i) => (
            <Rect key={dx} x={CENTRE + dx} y={y} w={w} h={h} c="#ebede9" style={{ animation: twinkle(2.4, i * 0.5) }} />
          ))}
        </>
      )}
      <Group motion={{ kind: 'bob', dist: 4, dur: 3.4 }}>
        <Buoy x={CENTRE + 100} y={744} flag={!sunset} />
      </Group>
      <Sprite sheet="diver" row={sunset ? 2 : 0} col={sunset ? 0 : 6} x={CENTRE - 150} y={682} scale={3} frames={sunset ? { count: 6, fps: 6 } : { count: 4, fps: 3, axis: 'y' }} motion={{ kind: 'bob', dist: 4, dur: 2.4 }} />
    </Canvas>
  )
}

function Clouds() {
  return (
    <Canvas style={{ top: 0, height: 200 }}>
      <Group motion={{ kind: 'drift', dist: -40, dur: 40 }}>
        <Cloud x={CENTRE - 150} y={40} color="#ebede9" shade="#a4dddb" />
        <Cloud x={CENTRE + 60} y={96} color="#ebede9" shade="#a4dddb" />
      </Group>
    </Canvas>
  )
}

function Sea({ variant }: { variant: SkyVariant }) {
  const sunset = variant === 'sunset'
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: SEA_H, background: SEA[variant] }} />
      <Canvas style={{ bottom: 0, height: SEA_H }}>
        <Foam y={-4} dash={16} gap={24} />
        {GLINTS.map(([y, w, tone], i) => (
          <Rect key={y} x={CENTRE - w / 2} y={y} w={w} h={4} c={tone === 'gold' ? '#e8c170' : '#ebede9'} style={{ animation: twinkle(2 + (i % 3) * 0.7, i * 0.6) }} />
        ))}
        <Sprite sheet="fish" x={CENTRE - 150} y={96} scale={3} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 100, dur: 16 }} />
        <Sprite sheet="jelly" x={CENTRE + 90} y={110} scale={2} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 8, dur: 3 }} />
        <Sprite sheet="bubble" col={3} x={CENTRE + 20} y={SEA_H - 70} scale={2} motion={{ kind: 'rise', dist: 60, dur: 6 }} />
        <Sprite sheet="bubble" col={3} x={CENTRE - 60} y={SEA_H - 60} scale={2} motion={{ kind: 'rise', dist: 50, dur: 5 }} phase={2} />
        <Sprite sheet="coral" x={CENTRE - 190} y={SEA_H - 62} scale={3} />
        <Sprite sheet="coral" row={5} col={1} x={CENTRE - 120} y={SEA_H - 62} scale={3} />
        <Sprite sheet="clam" x={CENTRE + 100} y={SEA_H - 56} scale={3} />
        <Sprite sheet="coral" row={4} col={2} x={CENTRE + 150} y={SEA_H - 62} scale={3} />
        {!sunset && <Sprite sheet="shrimp" x={CENTRE - 30} y={SEA_H - 96} scale={2} frames={{ count: 4, fps: 6 }} motion={{ kind: 'driftR', dist: 30, dur: 12 }} />}
      </Canvas>
    </>
  )
}

export function MobileSkyBackdrop({ variant }: { variant: SkyVariant }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: SKY[variant] }} />
      {variant === 'morning' && <Clouds />}
      <SkyDetails variant={variant} />
      <Sea variant={variant} />
    </>
  )
}
