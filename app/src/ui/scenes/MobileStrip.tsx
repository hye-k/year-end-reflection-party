import { Sprite } from '../Sprite'

const STRIP_W = 358

export function MobileStrip({ variant }: { variant: 'shallow' | 'deep' }) {
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: '100%', maxWidth: STRIP_W, height: 128, margin: '0 auto', flex: 'none' }}>
      <Sprite sheet="bubble" col={3} scale={3} x={86} y={70} motion={{ kind: 'rise', dist: 50, dur: 5 }} />
      <Sprite sheet="bubble" col={3} scale={3} x={250} y={84} motion={{ kind: 'rise', dist: 56, dur: 6 }} phase={2} />
      {variant === 'deep' ? (
        <>
          <Sprite sheet="shark" scale={3} x={8} y={32} frames={{ count: 8, fps: 6 }} motion={{ kind: 'driftR', dist: 220, dur: 28 }} />
          <Sprite sheet="jelly" scale={3} x={4} y={20} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 10, dur: 3 }} />
          <Sprite sheet="jelly" row={1} scale={3} x={256} y={14} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 10, dur: 3.6 }} phase={1} />
        </>
      ) : (
        <>
          <Sprite sheet="swordfish" scale={3} x={8} y={32} frames={{ count: 8, fps: 10 }} motion={{ kind: 'driftR', dist: 200, dur: 24 }} />
          <Sprite sheet="fish" scale={3} x={12} y={40} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 40, dur: 12 }} />
          <Sprite sheet="fish" scale={3} x={282} y={24} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 40, dur: 14 }} phase={5} />
        </>
      )}
      <Sprite sheet="diver" scale={4} x={115} y={0} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 6, dur: 2.6 }} />
    </div>
  )
}
