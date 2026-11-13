import type { CSSProperties, ReactNode } from 'react'
import { Sprite } from '../Sprite'
import { Beach, Palm } from './BeachTitleScene'
import { DitherOverlay, Foam } from './pixel'

export type BackdropVariant = 'title' | 'shallow' | 'deep'

const WATER_Y = 104
const FLOOR_H = 28
const BOTTOM_H = 160

const GRADIENTS: Record<BackdropVariant, string> = {
  title: `linear-gradient(180deg,#73bed3 0 ${WATER_Y}px,#4f8fba ${WATER_Y}px 36%,#3c5e8b 36% 60%,#253a5e 60% 82%,#172038 82% 100%)`,
  shallow: 'linear-gradient(180deg,#73bed3 0 30%,#4f8fba 30% 62%,#3c5e8b 62% 100%)',
  deep: 'linear-gradient(180deg,#253a5e 0 34%,#172038 34% 66%,#10141f 66% 100%)',
}

const FLOOR_COLOR: Record<BackdropVariant, string> = {
  title: '#3c5e8b',
  shallow: '#3c5e8b',
  deep: '#172038',
}

const abs: CSSProperties = { position: 'absolute' }

function Anchor({ side, children }: { side: 'left' | 'center' | 'right'; children: ReactNode }) {
  const place = side === 'center' ? { left: '50%' } : { [side]: 0 }
  return <div style={{ ...abs, top: 0, width: 0, height: 0, ...place }}>{children}</div>
}

function TitleTop() {
  return (
    <>
      <div style={{ ...abs, left: 0, right: 0, top: 0, height: WATER_Y, overflow: 'hidden' }}>
        <div style={{ ...abs, right: 0, top: 0, width: 1280, height: 208, transform: 'scale(0.5)', transformOrigin: 'top right' }}>
          <Beach />
        </div>
        <div style={{ ...abs, left: 0, top: 0, width: 400, height: 208, transform: 'scale(0.5)', transformOrigin: 'top left' }}>
          <svg aria-hidden="true" width={400} height={208} viewBox="0 0 400 208" shapeRendering="crispEdges" style={abs}>
            <g transform="translate(110,64)">
              <Palm />
            </g>
          </svg>
        </div>
      </div>
      <Anchor side="left">
        <Sprite sheet="shell" col={2} row={4} scale={2} x={96} y={64} />
        <Sprite sheet="shell" col={1} row={2} scale={2} x={196} y={62} />
        <Sprite sheet="shell" col={5} row={4} scale={2} x={292} y={66} />
      </Anchor>
      <div style={{ ...abs, left: 0, right: 0, top: WATER_Y - 4, height: 8, overflow: 'hidden' }}>
        <Foam y={0} dash={8} gap={8} />
      </div>
      <Anchor side="center">
        <Sprite sheet="diver" scale={3} x={-20} y={16} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 4, dur: 2.4 }} />
      </Anchor>
      <Anchor side="left">
        <Sprite sheet="bubble" col={3} scale={2} x={24} y={WATER_Y + 90} motion={{ kind: 'rise', dist: 60, dur: 6 }} />
        <Sprite sheet="bubble" col={3} scale={2} x={160} y={WATER_Y + 70} motion={{ kind: 'rise', dist: 50, dur: 5 }} phase={2} />
        <Sprite sheet="fish" scale={3} x={40} y={WATER_Y + 40} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 60, dur: 14 }} />
      </Anchor>
      <Anchor side="right">
        <Sprite sheet="jelly" scale={2} x={-90} y={WATER_Y + 56} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 8, dur: 3 }} />
        <Sprite sheet="bubble" col={3} scale={2} x={-30} y={WATER_Y + 110} motion={{ kind: 'rise', dist: 60, dur: 7 }} phase={4} />
      </Anchor>
    </>
  )
}

function Floor({ variant }: { variant: BackdropVariant }) {
  const deep = variant === 'deep'
  return (
    <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: BOTTOM_H }}>
      <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: FLOOR_H, background: FLOOR_COLOR[variant] }} />
      {deep ? (
        <>
          <Anchor side="left">
            <Sprite sheet="jelly" scale={2} x={28} y={30} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 8, dur: 3.2 }} />
            <Sprite sheet="angler" scale={2} x={150} y={80} frames={{ count: 8, fps: 6 }} motion={{ kind: 'driftR', dist: 80, dur: 20 }} />
            <Sprite sheet="coral" row={4} scale={2} x={20} y={BOTTOM_H - FLOOR_H - 28} opacity={0.75} />
            <Sprite sheet="clam" scale={2} x={70} y={BOTTOM_H - FLOOR_H - 26} />
            <Sprite sheet="fish" scale={2} x={110} y={92} opacity={0.85} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 60, dur: 16 }} />
          </Anchor>
          <Anchor side="right">
            <Sprite sheet="jelly" row={1} scale={2} x={-94} y={8} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 8, dur: 3.8 }} phase={1} />
          </Anchor>
        </>
      ) : (
        <>
          <Anchor side="left">
            <Sprite sheet="weed" scale={2} x={14} y={BOTTOM_H - FLOOR_H - 60} frames={{ count: 12, fps: 5 }} />
            <Sprite sheet="coral" scale={2} x={58} y={BOTTOM_H - FLOOR_H - 28} />
            <Sprite sheet="clam" scale={2} x={104} y={BOTTOM_H - FLOOR_H - 28} />
            <Sprite sheet="coral" row={5} col={1} scale={2} x={146} y={BOTTOM_H - FLOOR_H - 28} />
            <Sprite sheet="shrimp" scale={2} x={196} y={BOTTOM_H - FLOOR_H - 56} frames={{ count: 4, fps: 6 }} motion={{ kind: 'driftR', dist: 30, dur: 12 }} />
            <Sprite sheet="fish" scale={2} x={120} y={40} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 60, dur: 16 }} />
          </Anchor>
          <Anchor side="right">
            <Sprite sheet="weed" scale={2} x={-46} y={BOTTOM_H - FLOOR_H - 60} frames={{ count: 12, fps: 5 }} phase={1.5} />
            <Sprite sheet="coral" col={1} scale={2} x={-96} y={BOTTOM_H - FLOOR_H - 28} />
            <Sprite sheet="coral" row={4} col={2} scale={2} x={-140} y={BOTTOM_H - FLOOR_H - 28} />
            <Sprite sheet="squid" scale={2} x={-190} y={30} frames={{ count: 4, fps: 5 }} motion={{ kind: 'driftR', dist: 60, dur: 14 }} />
          </Anchor>
        </>
      )}
    </div>
  )
}

export function MobileBackdrop({ variant }: { variant: BackdropVariant }) {
  return (
    <>
      <div style={{ ...abs, inset: 0, background: GRADIENTS[variant] }} />
      <DitherOverlay top={variant === 'title' ? WATER_Y : 0} height={2400} alpha={variant === 'deep' ? 0.05 : 0.1} />
      {variant === 'title' && <TitleTop />}
      <Floor variant={variant} />
    </>
  )
}
