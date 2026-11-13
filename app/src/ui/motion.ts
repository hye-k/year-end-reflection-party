export interface Motion {
  kind: 'bob' | 'drift' | 'driftR' | 'rise'
  dist: number
  dur: number
  steps?: number
}

const DEFAULT_STEPS: Record<Motion['kind'], number> = { bob: 2, drift: 0, driftR: 0, rise: 8 }

export function motionAnimation({ kind, dur, steps = DEFAULT_STEPS[kind] }: Motion, phase = 0): string {
  const delay = `${-phase}s`
  switch (kind) {
    case 'bob':
      return `bob ${dur}s steps(${steps}, end) ${delay} infinite alternate`
    case 'drift':
      return `drift ${dur}s linear ${delay} infinite`
    case 'driftR':
      return `drift-r ${dur}s linear ${delay} infinite`
    case 'rise':
      return `rise ${dur}s steps(${steps}, end) ${delay} infinite`
  }
}

export const twinkle = (dur: number, phase = 0): string => `twinkle ${dur}s steps(2, end) ${-phase}s infinite`
