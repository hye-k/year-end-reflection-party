import { Sprite } from '../Sprite'
import { DitherOverlay, Foam, Rect } from './pixel'

const SHELLS = [
  { x: 230, y: 136, col: 2, row: 4 },
  { x: 372, y: 130, col: 1, row: 2 },
  { x: 600, y: 142, col: 1, row: 0 },
  { x: 790, y: 134, col: 5, row: 4 },
  { x: 1040, y: 140, col: 2, row: 2 },
]

function Frond() {
  return (
    <g>
        <g fill="#25562e"><rect x="0" y="-16" width="40" height="8" /><rect x="40" y="-8" width="32" height="8" /><rect x="72" y="0" width="24" height="8" /><rect x="96" y="8" width="16" height="16" /><rect x="8" y="0" width="24" height="8" /><rect x="24" y="16" width="16" height="16" /><rect x="32" y="32" width="8" height="16" /></g>
        <g fill="#468232"><rect x="8" y="-8" width="32" height="8" /><rect x="40" y="0" width="32" height="8" /><rect x="72" y="8" width="16" height="8" /><rect x="24" y="8" width="8" height="8" /></g>
        <g fill="#75a743"><rect x="16" y="-16" width="16" height="4" /><rect x="48" y="-8" width="16" height="4" /></g>
    </g>
  )
}

export function Palm() {
  return (
    <g>
      <g fill="#ad7757">
        <rect x="-8" y="0" width="16" height="16" /><rect x="-8" y="16" width="16" height="16" /><rect x="-8" y="32" width="16" height="16" />
        <rect x="0" y="48" width="16" height="16" /><rect x="0" y="64" width="16" height="16" /><rect x="0" y="80" width="16" height="16" />
        <rect x="8" y="96" width="16" height="16" /><rect x="8" y="112" width="16" height="16" />
      </g>
      <g fill="#7a4841">
        <rect x="-8" y="12" width="16" height="4" /><rect x="-8" y="28" width="16" height="4" /><rect x="-8" y="44" width="16" height="4" />
        <rect x="0" y="60" width="16" height="4" /><rect x="0" y="76" width="16" height="4" /><rect x="0" y="92" width="16" height="4" />
        <rect x="8" y="108" width="16" height="4" /><rect x="8" y="124" width="16" height="4" />
        <rect x="4" y="0" width="4" height="16" /><rect x="4" y="32" width="4" height="16" /><rect x="12" y="64" width="4" height="16" /><rect x="16" y="96" width="4" height="16" />
      </g>
      <Frond />
      <g transform="scale(-1,1)"><Frond /></g>
      <g fill="#25562e"><rect x="-8" y="-40" width="16" height="24" /><rect x="0" y="-48" width="8" height="8" /><rect x="-16" y="-32" width="8" height="8" /></g>
      <g fill="#468232"><rect x="-8" y="-32" width="8" height="16" /></g>
      <g fill="#884b2b"><rect x="-8" y="8" width="8" height="8" /><rect x="0" y="8" width="8" height="8" /><rect x="-4" y="16" width="8" height="8" /></g>
    </g>
  )
}

export function Beach() {
  return (
    <svg aria-hidden="true" width={1280} height={208} viewBox="0 0 1280 208" shapeRendering="crispEdges" style={{ position: 'absolute', left: 0, top: 0 }}>
      <rect x="0" y="0" width="1280" height="72" fill="#73bed3" />
      <rect x="0" y="72" width="1280" height="64" fill="#a4dddb" />
      <g fill="#e8c170">
        <rect x="772" y="4" width="8" height="12" /><rect x="772" y="112" width="8" height="12" />
        <rect x="696" y="60" width="16" height="8" /><rect x="840" y="60" width="16" height="8" />
        <rect x="704" y="16" width="8" height="8" /><rect x="840" y="16" width="8" height="8" /><rect x="704" y="104" width="8" height="8" /><rect x="840" y="104" width="8" height="8" />
      </g>
      <g fill="#de9e41">
        <rect x="760" y="24" width="32" height="8" /><rect x="744" y="32" width="64" height="8" /><rect x="736" y="40" width="80" height="8" /><rect x="728" y="48" width="96" height="32" /><rect x="736" y="80" width="80" height="8" /><rect x="744" y="88" width="64" height="8" /><rect x="760" y="96" width="32" height="8" />
      </g>
      <g fill="#e8c170">
        <rect x="760" y="32" width="32" height="8" /><rect x="744" y="40" width="64" height="8" /><rect x="736" y="48" width="80" height="32" /><rect x="744" y="80" width="64" height="8" /><rect x="760" y="88" width="32" height="8" />
      </g>
      <g fill="#ebede9">
        <rect x="296" y="32" width="64" height="8" /><rect x="280" y="40" width="112" height="8" /><rect x="312" y="24" width="32" height="8" />
        <rect x="488" y="12" width="48" height="8" /><rect x="472" y="20" width="88" height="8" /><rect x="496" y="4" width="24" height="8" />
        <rect x="1100" y="40" width="64" height="8" /><rect x="1084" y="48" width="104" height="8" /><rect x="1116" y="32" width="32" height="8" />
      </g>
      <rect x="0" y="120" width="1280" height="16" fill="#4f8fba" />
      <g fill="#ebede9">
        <rect x="48" y="124" width="16" height="4" /><rect x="232" y="128" width="16" height="4" /><rect x="420" y="124" width="16" height="4" /><rect x="600" y="128" width="16" height="4" /><rect x="900" y="124" width="16" height="4" /><rect x="1060" y="128" width="16" height="4" />
      </g>
      <g fill="#e7d5b3">
        <rect x="0" y="136" width="1280" height="64" />
        <rect x="64" y="128" width="96" height="8" /><rect x="320" y="128" width="128" height="8" /><rect x="620" y="128" width="64" height="8" /><rect x="1000" y="128" width="160" height="8" />
      </g>
      <rect x="0" y="192" width="1280" height="8" fill="#c09473" />
      <g fill="#d7b594">
        <rect x="28" y="150" width="8" height="4" /><rect x="190" y="170" width="8" height="4" /><rect x="330" y="150" width="8" height="4" /><rect x="470" y="176" width="8" height="4" /><rect x="560" y="152" width="8" height="4" /><rect x="690" y="170" width="8" height="4" /><rect x="860" y="156" width="8" height="4" /><rect x="940" y="178" width="8" height="4" /><rect x="1160" y="160" width="8" height="4" />
      </g>
      <g transform="translate(110,64)"><Palm /></g>
      <g transform="translate(1210,80) scale(-1,1)"><Palm /></g>
    </svg>
  )
}

export function BeachTitleScene() {
  return (
    <>
      <Rect x={0} y={0} w={1280} h={760} c="#a4dddb" />
      <Beach />
      {SHELLS.map((s) => (
        <Sprite key={s.x} sheet="shell" col={s.col} row={s.row} x={s.x} y={s.y} />
      ))}
      <Rect x={0} y={208} w={1280} h={552} c="linear-gradient(180deg,#73bed3 0 18%,#4f8fba 18% 40%,#3c5e8b 40% 62%,#253a5e 62% 82%,#172038 82% 100%)" />
      <DitherOverlay top={208} height={552} alpha={0.1} />
      <Foam y={200} />
      <Foam y={208} color="#a4dddb" still />
      <Sprite sheet="diver" x={980} y={30} scale={6} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 6, dur: 2.4 }} />
      <Sprite sheet="bubble" col={3} x={860} y={330} motion={{ kind: 'rise', dist: 120, dur: 6 }} />
      <Sprite sheet="bubble" col={3} x={930} y={270} motion={{ kind: 'rise', dist: 90, dur: 5 }} phase={2} />
      <Sprite sheet="bubble" col={3} x={1080} y={360} motion={{ kind: 'rise', dist: 140, dur: 7 }} phase={4} />
      <Sprite sheet="fish" x={880} y={440} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 120, dur: 16 }} />
      <Sprite sheet="fish" x={1100} y={520} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 160, dur: 20 }} phase={7} />
      <Sprite sheet="jelly" x={1040} y={290} frames={{ count: 4, fps: 3 }} motion={{ kind: 'bob', dist: 16, dur: 3 }} />
      <Rect x={0} y={720} w={1280} h={40} c="#3c5e8b" />
      <Sprite sheet="coral" row={0} x={110} y={664} />
      <Sprite sheet="coral" row={5} col={1} x={190} y={668} />
      <Sprite sheet="clam" x={290} y={664} />
      <Sprite sheet="coral" row={4} col={2} x={390} y={662} />
      <Sprite sheet="shrimp" x={480} y={600} frames={{ count: 4, fps: 6 }} motion={{ kind: 'driftR', dist: 60, dur: 12 }} />
      <Sprite sheet="coral" row={2} col={3} x={580} y={666} />
      <Sprite sheet="squid" x={680} y={560} frames={{ count: 4, fps: 5 }} motion={{ kind: 'driftR', dist: 80, dur: 14 }} />
      <Sprite sheet="weed" x={20} y={600} frames={{ count: 12, fps: 5 }} phase={0.5} />
      <Sprite sheet="weed" x={860} y={600} frames={{ count: 12, fps: 5 }} />
      <Sprite sheet="weed" x={940} y={600} frames={{ count: 12, fps: 5 }} phase={1} />
      <Sprite sheet="weed" x={1180} y={600} frames={{ count: 12, fps: 5 }} phase={2} />
      <Sprite sheet="coral" x={1020} y={664} />
      <Sprite sheet="coral" col={1} x={1090} y={664} />
    </>
  )
}
