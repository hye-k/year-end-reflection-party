import { Sprite } from '../Sprite'
import { Bands, Buoy, Foam, Group, HalfSun, Rect } from './pixel'
import { twinkle } from '../motion'

const WL = 520

const STREAKS = [
  [1010, 408, 150, '#cf573c'],
  [1050, 424, 90, '#cf573c'],
  [640, 452, 120, '#c65197'],
  [660, 468, 70, '#c65197'],
  [930, 386, 70, '#cf573c'],
] as const

const GLINTS = [
  [528, 200, '#e8c170', 8],
  [540, 130, '#da863e', 8],
  [554, 210, '#e8c170', 8],
  [570, 100, '#da863e', 4],
  [588, 160, '#e8c170', 4],
  [608, 70, '#da863e', 4],
] as const

const SPLASH = [
  [1020, WL - 12, 8], [1012, WL - 28, 4], [1108, WL - 14, 8], [1120, WL - 30, 4],
  [1000, WL - 4, 12], [1128, WL - 4, 12], [1030, WL - 44, 4], [1100, WL - 46, 4],
] as const

export function SunsetScene() {
  return (
    <>
      <Bands from={0} to={WL} stops={[[110, '#3c5e8b'], [215, '#c65197'], [320, '#cf573c'], [484, '#da863e'], [WL, '#e8c170']]} />
      <HalfSun cx={820} cy={WL} r={100} color="#e8c170" core="#e7d5b3" coreR={60} />
      {STREAKS.map(([x, y, w, c]) => (
        <Rect key={`${x}-${y}`} x={x} y={y} w={w} h={8} c={c} />
      ))}
      <Rect x={0} y={WL} w={1280} h={240} c="linear-gradient(180deg,#3c5e8b 0 33%,#253a5e 33% 71%,#172038 71% 100%)" />
      <Rect x={656} y={WL} w={4} h={170} c="#ebede9" />
      <Sprite sheet="fish" x={860} y={626} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 100, dur: 16 }} />
      <Sprite sheet="diver" row={2} x={1000} y={WL - 78} frames={{ count: 6, fps: 6 }} motion={{ kind: 'bob', dist: 4, dur: 2.4 }} />
      <Rect x={0} y={WL} w={1280} h={240} c="rgba(37,58,94,0.55)" />
      {GLINTS.map(([y, w, c, h], i) => (
        <Rect key={y} x={820 - w / 2} y={y} w={w} h={h} c={c} style={{ animation: twinkle(2 + (i % 3) * 0.7, i * 0.6) }} />
      ))}
      <Sprite sheet="coral" x={1040} y={696} />
      <Sprite sheet="bubble" col={3} x={1030} y={572} motion={{ kind: 'rise', dist: 60, dur: 5 }} />
      <Sprite sheet="bubble" col={3} x={1086} y={610} motion={{ kind: 'rise', dist: 80, dur: 6 }} phase={2} />
      <Sprite sheet="bubble" col={3} x={1052} y={650} motion={{ kind: 'rise', dist: 100, dur: 7 }} phase={4} />
      <Foam y={WL - 4} dash={16} gap={24} />
      {SPLASH.map(([x, y, s], i) => (
        <Rect key={`${x}-${y}`} x={x} y={y} w={s} h={s} c="#ebede9" style={{ animation: twinkle(1.6 + (i % 3) * 0.5, i * 0.4) }} />
      ))}
      <Group motion={{ kind: 'bob', dist: 4, dur: 3 }}>
        <Buoy x={642} y={WL - 14} />
      </Group>
      <div aria-hidden="true" style={{ position: 'absolute', left: 630, top: 686, width: 56, height: 32, boxSizing: 'border-box', border: '4px solid #090a14', background: '#e8c170', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, lineHeight: 1 }}>
        40M
      </div>
    </>
  )
}
