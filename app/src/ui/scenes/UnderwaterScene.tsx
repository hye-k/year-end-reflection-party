import { Sprite } from '../Sprite'
import { DitherOverlay, Rect } from './pixel'

function Floor({ color }: { color: string }) {
  return <Rect x={0} y={724} w={1280} h={36} c={color} />
}

export function UnderwaterScene({ variant }: { variant: 'shallow' | 'deep' }) {
  const deep = variant === 'deep'
  return (
    <>
      <Rect
        x={0}
        y={0}
        w={1280}
        h={760}
        c={
          deep
            ? 'linear-gradient(180deg,#253a5e 0 30%,#172038 30% 62%,#10141f 62% 100%)'
            : 'linear-gradient(180deg,#73bed3 0 30%,#4f8fba 30% 62%,#3c5e8b 62% 100%)'
        }
      />
      <DitherOverlay top={0} height={760} alpha={deep ? 0.05 : 0.1} />
      {deep ? (
        <>
          <Sprite sheet="bubble" col={3} x={840} y={200} motion={{ kind: 'rise', dist: 100, dur: 6 }} />
          <Sprite sheet="bubble" col={3} x={1030} y={560} motion={{ kind: 'rise', dist: 140, dur: 7 }} phase={3} />
          <Sprite sheet="bubble" col={3} x={920} y={640} motion={{ kind: 'rise', dist: 160, dur: 8 }} phase={5} />
          <Sprite sheet="jelly" x={930} y={110} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 16, dur: 3.2 }} />
          <Sprite sheet="jelly" row={1} x={1010} y={300} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 20, dur: 3.8 }} phase={1} />
          <Sprite sheet="jelly" row={1} x={810} y={500} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 12, dur: 2.8 }} phase={2} />
          <Sprite sheet="fish" x={1080} y={600} opacity={0.85} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 140, dur: 18 }} />
          <Sprite sheet="diver" x={860} y={330} scale={6} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 8, dur: 2.6 }} />
          <Sprite sheet="shark" x={100} y={80} frames={{ count: 8, fps: 6 }} motion={{ kind: 'driftR', dist: 440, dur: 34 }} />
          <Sprite sheet="jelly" scale={2} x={20} y={420} glow="#73bed3" frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 14, dur: 3.4 }} phase={2} />
          <Floor color="#0b0e18" />
          <Sprite sheet="coral" row={4} x={110} y={696} opacity={0.75} />
          <Sprite sheet="coral" row={1} col={2} x={190} y={700} opacity={0.75} />
          <Sprite sheet="angler" x={250} y={632} frames={{ count: 8, fps: 6 }} motion={{ kind: 'driftR', dist: 120, dur: 20 }} />
          <Sprite sheet="squid" x={520} y={560} frames={{ count: 4, fps: 5 }} motion={{ kind: 'driftR', dist: 120, dur: 16 }} />
          <Sprite sheet="coral" row={5} col={1} x={700} y={698} opacity={0.75} />
          <Sprite sheet="clam" x={420} y={696} />
        </>
      ) : (
        <>
          <Sprite sheet="bubble" col={3} x={830} y={170} motion={{ kind: 'rise', dist: 100, dur: 6 }} />
          <Sprite sheet="bubble" col={3} x={920} y={110} motion={{ kind: 'rise', dist: 90, dur: 5 }} phase={2} />
          <Sprite sheet="bubble" col={3} x={1010} y={210} motion={{ kind: 'rise', dist: 120, dur: 7 }} phase={4} />
          <Sprite sheet="fish" x={850} y={560} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 120, dur: 16 }} />
          <Sprite sheet="fish" x={1030} y={620} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 160, dur: 20 }} phase={6} />
          <Sprite sheet="diver" x={860} y={290} scale={6} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 8, dur: 2.6 }} />
          <Sprite sheet="swordfish" x={120} y={80} frames={{ count: 8, fps: 10 }} motion={{ kind: 'driftR', dist: 420, dur: 28 }} />
          <Sprite sheet="fish3" x={560} y={190} frames={{ count: 8, fps: 10 }} motion={{ kind: 'driftR', dist: 180, dur: 18 }} phase={4} />
          <Sprite sheet="weed" x={4} y={632} frames={{ count: 12, fps: 5 }} phase={0.5} />
          <Floor color="#2f4a73" />
          <Sprite sheet="coral" row={0} x={110} y={696} />
          <Sprite sheet="coral" row={5} col={1} x={184} y={700} />
          <Sprite sheet="clam" x={282} y={696} />
          <Sprite sheet="coral" row={4} col={2} x={380} y={694} />
          <Sprite sheet="shrimp" x={466} y={632} frames={{ count: 4, fps: 6 }} motion={{ kind: 'driftR', dist: 60, dur: 12 }} />
          <Sprite sheet="coral" row={2} col={3} x={560} y={698} />
          <Sprite sheet="shell" col={2} row={4} x={640} y={696} />
          <Sprite sheet="coral" row={1} x={712} y={696} />
          <Sprite sheet="weed" x={800} y={632} frames={{ count: 12, fps: 5 }} />
          <Sprite sheet="weed" x={1150} y={632} frames={{ count: 12, fps: 5 }} phase={1.5} />
        </>
      )}
    </>
  )
}
