import { Sprite } from '../Sprite'
import { Bands, Buoy, Cloud, Foam, Group, HalfSun, Rect } from './pixel'
import { twinkle } from '../motion'

const HZ = 690

const RAYS = [
  [206, 640, 24, 4], [350, 640, 24, 4], [288, 610, 4, 16], [236, 622, 4, 12], [344, 622, 4, 12],
] as const

const GLINTS = [
  [240, 698, 100, '#e8c170'],
  [260, 710, 70, '#ebede9'],
  [230, 724, 110, '#e8c170'],
  [270, 740, 50, '#ebede9'],
] as const

export function MorningScene() {
  return (
    <>
      <Bands from={0} to={HZ} stops={[[110, '#73bed3'], [250, '#a4dddb'], [400, '#ebede9'], [630, '#e7d5b3'], [HZ, '#e8c170']]} />
      <HalfSun cx={290} cy={HZ} r={60} color="#ebede9" />
      {RAYS.map(([x, y, w, h], i) => (
        <Rect key={`${x}-${y}`} x={x} y={y} w={w} h={h} c="#ebede9" style={{ animation: twinkle(2.4, i * 0.5) }} />
      ))}
      <Group motion={{ kind: 'drift', dist: -40, dur: 40 }}>
        <Cloud x={560} y={6} color="#ebede9" shade="#a4dddb" />
        <Cloud x={930} y={2} color="#ebede9" shade="#a4dddb" />
        <Cloud x={0} y={20} color="#ebede9" shade="#a4dddb" />
      </Group>
      <Rect x={0} y={HZ} w={1280} h={70} c="#73bed3" />
      <Foam y={HZ - 8} />
      {GLINTS.map(([x, y, w, c]) => (
        <Rect key={y} x={x} y={y} w={w} h={4} c={c} style={{ animation: twinkle(2.2, y % 5) }} />
      ))}
      <Sprite sheet="fish" x={880} y={712} frames={{ count: 8, fps: 10 }} motion={{ kind: 'drift', dist: 100, dur: 18 }} />
      <Sprite sheet="coral" x={1000} y={712} />
      <Sprite sheet="bubble" col={3} x={1060} y={650} motion={{ kind: 'rise', dist: 40, dur: 5 }} />
      <Sprite sheet="diver" col={6} x={372} y={HZ - 78} frames={{ count: 4, fps: 3, axis: 'y' }} motion={{ kind: 'bob', dist: 4, dur: 3 }} />
      <Rect x={360} y={HZ - 4} w={20} h={4} c="#ebede9" />
      <Rect x={470} y={HZ - 4} w={24} h={4} c="#ebede9" />
      <Rect x={386} y={HZ - 4} w={10} h={4} c="#ebede9" />
      <Group motion={{ kind: 'bob', dist: 4, dur: 3.4 }}>
        <Buoy x={110} y={HZ - 12} flag />
      </Group>
    </>
  )
}
