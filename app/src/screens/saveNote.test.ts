import { describe, expect, it } from 'vitest'
import { saveNote } from './saveNote'

const at = (hour: number, minute: number) => new Date(2026, 11, 1, hour, minute).toISOString()

describe('saveNote', () => {
  it('shows only saved, saving, failed, or not yet saved', () => {
    expect(saveNote('idle', null, null)).toBe('아직 저장 전')
    expect(saveNote('saving', at(9, 5), at(9, 5))).toBe('저장 중…')
    expect(saveNote('error', at(9, 5), at(9, 6))).toContain('저장 실패')
  })

  it('shows the time of the latest save, wherever it happened', () => {
    expect(saveNote('saved', at(9, 5), at(9, 7))).toBe('저장됨 09:07')
    expect(saveNote('saved', at(9, 9), at(9, 7))).toBe('저장됨 09:09')
    expect(saveNote('idle', null, at(23, 41))).toBe('저장됨 23:41')
  })
})
