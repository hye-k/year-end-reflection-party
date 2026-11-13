import { describe, expect, it } from 'vitest'
import {
  MANDALA_CELL_LIMIT,
  MANDALA_CELL_TOTAL,
  cellAt,
  emptyMandala,
  getValueAt,
  mandalaProgress,
  positionsOf,
  allCells,
  setValueAt,
} from './mandala'

describe('mandala structure', () => {
  it('counts every distinct cell once', () => {
    expect(MANDALA_CELL_TOTAL).toBe(73)
    expect(allCells()).toHaveLength(73)
  })

  it('maps every grid position to exactly one source cell, with themes shown twice', () => {
    const seen = new Map<string, number>()
    for (let block = 0; block < 9; block++) {
      for (let cell = 0; cell < 9; cell++) {
        const key = JSON.stringify(cellAt(block, cell))
        seen.set(key, (seen.get(key) ?? 0) + 1)
      }
    }
    expect(seen.size).toBe(1 + 8 + 64)
    const themeCounts = [...seen.entries()].filter(([key]) => key.includes('"theme"' ) && !key.includes('action'))
    expect(themeCounts.every(([, count]) => count === 2)).toBe(true)
  })

  it('round-trips positionsOf and cellAt', () => {
    for (const cell of [{ kind: 'goal' as const }, { kind: 'theme' as const, theme: 5 }, { kind: 'action' as const, theme: 6, action: 7 }]) {
      for (const { block, cell: c } of positionsOf(cell)) {
        expect(cellAt(block, c)).toEqual(cell)
      }
    }
  })

  it('rejects out-of-range indices', () => {
    expect(() => cellAt(9, 0)).toThrow(RangeError)
    expect(() => cellAt(0, -1)).toThrow(RangeError)
  })
})

describe('theme mirroring', () => {
  it('writing the centre-ring cell and the outer-block centre cell hits the same state', () => {
    const [ring, outer] = positionsOf({ kind: 'theme', theme: 2 })
    expect(ring).toEqual({ block: 4, cell: 2 })
    expect(outer).toEqual({ block: 2, cell: 4 })

    let state = setValueAt(emptyMandala(), ring.block, ring.cell, '수심')
    expect(getValueAt(state, outer.block, outer.cell)).toBe('수심')
    state = setValueAt(state, outer.block, outer.cell, '체력')
    expect(getValueAt(state, ring.block, ring.cell)).toBe('체력')
    expect(state.themes[2]).toBe('체력')
  })

  it('does not mutate the previous state', () => {
    const before = emptyMandala()
    setValueAt(before, 4, 4, '목표')
    expect(before.goal).toBe('')
  })
})

describe('cell limit', () => {
  it('is 9', () => {
    expect(MANDALA_CELL_LIMIT).toBe(9)
  })

  it('counts Korean syllables as one each', () => {
    const state = setValueAt(emptyMandala(), 4, 4, '가나다라마바사아자차카')
    expect(state.goal).toBe('가나다라마바사아자')
  })

  it('counts emoji graphemes as one each', () => {
    const family = '👨‍👩‍👧‍👦'
    const state = setValueAt(emptyMandala(), 4, 4, family.repeat(10))
    expect(state.goal).toBe(family.repeat(9))
  })
})

describe('progress', () => {
  it('starts at 0 of 73 with every cell empty', () => {
    const progress = mandalaProgress(emptyMandala())
    expect(progress).toMatchObject({ filled: 0, total: 73 })
    expect(progress.empty).toHaveLength(73)
  })

  it('counts mirrored themes once and ignores whitespace-only values', () => {
    let state = setValueAt(emptyMandala(), 4, 4, '목표')
    state = setValueAt(state, 4, 0, '체력')
    state = setValueAt(state, 0, 0, '   ')
    const progress = mandalaProgress(state)
    expect(progress.filled).toBe(2)
    expect(progress.empty).not.toContainEqual({ kind: 'goal' })
    expect(progress.empty).not.toContainEqual({ kind: 'theme', theme: 0 })
    expect(progress.empty).toContainEqual({ kind: 'action', theme: 0, action: 0 })
  })

  it('reaches 73 when every cell is filled', () => {
    let state = emptyMandala()
    for (const cell of allCells()) {
      for (const { block, cell: c } of positionsOf(cell)) state = setValueAt(state, block, c, 'x')
    }
    const progress = mandalaProgress(state)
    expect(progress.filled).toBe(73)
    expect(progress.empty).toEqual([])
  })
})
