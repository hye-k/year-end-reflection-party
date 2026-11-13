import type { CSSProperties } from 'react'
import { MAX_DEPTH_M, REFLECTION_QUESTS } from '../core/content'
import { Plate } from './Panel'

export type GaugeState = 'answered' | 'skipped' | 'current' | 'upcoming'

interface DepthGaugeProps {
  states: GaugeState[]
  label?: string
  inline?: boolean
  onSelect?: (index: number) => void
  style?: CSSProperties
}

const PITCH = 28
const SLOT = 28
const MINOR_EVERY_M = 2
const MAJOR_EVERY_M = 10
const TICK_COLOR = 'var(--ink)'

const STATE_LABEL: Record<GaugeState, string> = {
  answered: '답함',
  skipped: '건너뜀',
  current: '지금 여기',
  upcoming: '아직',
}

const ariaFor = (state: GaugeState, i: number) => `${i + 1}번 퀘스트: ${STATE_LABEL[state]}`

function dotStyle(state: GaugeState, small: boolean): CSSProperties {
  const current = state === 'current'
  const size = small ? (current ? 16 : 13) : current ? 24 : 20
  return {
    width: size,
    height: size,
    flex: 'none',
    boxSizing: 'border-box',
    background: current ? 'var(--gold)' : state === 'answered' ? 'var(--navy)' : 'var(--field)',
    border: `${small ? 2 : 3}px solid ${state === 'skipped' ? 'var(--orange)' : current ? 'var(--gold)' : 'var(--ink)'}`,
  }
}

const marks = Array.from({ length: MAX_DEPTH_M / MINOR_EVERY_M + 1 }, (_, i) => i * MINOR_EVERY_M)
const isMajor = (m: number) => m % MAJOR_EVERY_M === 0

function Dot({ state, index, small, onSelect, style }: { state: GaugeState; index: number; small: boolean; onSelect?: (i: number) => void; style: CSSProperties }) {
  const box: CSSProperties = { position: 'absolute', width: SLOT, height: SLOT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: 0, background: 'none', ...style }
  if (!onSelect) {
    return (
      <div style={box} role="img" aria-label={ariaFor(state, index)}>
        <span style={dotStyle(state, small)} />
      </div>
    )
  }
  return (
    <button type="button" className="gauge-dot" style={box} aria-label={ariaFor(state, index)} aria-current={state === 'current' ? 'step' : undefined} onClick={() => onSelect(index)}>
      <span style={dotStyle(state, small)} />
    </button>
  )
}

function VerticalRuler({ length }: { length: number }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 38, top: SLOT / 2 - 2, width: 4, height: length + 4, background: TICK_COLOR }} />
      {marks.map((m) => {
        const y = SLOT / 2 + (m / MAX_DEPTH_M) * length
        const major = isMajor(m)
        const w = major ? 16 : 8
        return (
          <div key={m}>
            <div style={{ position: 'absolute', left: 38 - w, top: y - 1, width: w, height: 3, background: TICK_COLOR }} />
            {major && (
              <span className="label" style={{ position: 'absolute', left: 0, top: y - 20, lineHeight: '12px' }}>{m}m</span>
            )}
          </div>
        )
      })}
    </>
  )
}

export function DepthGauge({ states, label, inline = false, onSelect, style }: DepthGaugeProps) {
  const depthAt = (i: number) => REFLECTION_QUESTS[i]?.depthM ?? (i / Math.max(states.length - 1, 1)) * MAX_DEPTH_M

  if (inline) {
    return (
      <div role="group" aria-label="질문 이동" style={{ position: 'relative', height: SLOT + 14, margin: '0 14px', ...style }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: SLOT + 2, height: 3, background: TICK_COLOR }} />
        {marks.map((m) => (
          <div key={m} style={{ position: 'absolute', left: `${(m / MAX_DEPTH_M) * 100}%`, top: SLOT + 2, width: 3, height: isMajor(m) ? 10 : 5, marginLeft: -1, background: TICK_COLOR }} />
        ))}
        {states.map((state, i) => (
          <Dot key={i} state={state} index={i} small onSelect={onSelect} style={{ top: 0, left: `${(depthAt(i) / MAX_DEPTH_M) * 100}%`, marginLeft: -SLOT / 2 }} />
        ))}
      </div>
    )
  }

  const length = (states.length - 1) * PITCH
  return (
    <Plate style={{ alignItems: 'stretch', justifyContent: 'space-between', ...style }}>
      <div className="label">{label}</div>
      <div role="group" aria-label="질문 이동" style={{ position: 'relative', width: 78, height: length + SLOT, alignSelf: 'center' }}>
        <VerticalRuler length={length} />
        {states.map((state, i) => (
          <Dot key={i} state={state} index={i} small={false} onSelect={onSelect} style={{ left: 50, top: (depthAt(i) / MAX_DEPTH_M) * length }} />
        ))}
      </div>
    </Plate>
  )
}
