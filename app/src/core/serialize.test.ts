import { describe, expect, it } from 'vitest'
import { REFLECTION_QUESTS } from './content'
import { emptyMandala, setCellValue } from './mandala'
import { emptyReflection, setAnswer, skipQuest } from './reflection'
import {
  MANDALA_HEADER,
  REFLECTION_HEADER,
  createDraft,
  mandalaRow,
  newerDraft,
  parseDraft,
  parseDraftJson,
  prefixFormulaLikeTextWithApostrophe,
  reflectionRow,
  restoreMandalaState,
  restoreReflectionState,
} from './serialize'

const NOW = new Date('2026-12-20T10:00:00.000Z')

describe('reflection row', () => {
  const expectedWidth = 2 + 4 + 1 + 5 + 5 + 1 + 1 + 1 + 5 + 1 + 1

  it('aligns with the header', () => {
    const row = reflectionRow(emptyReflection(), '혜원', NOW)
    expect(REFLECTION_HEADER).toHaveLength(expectedWidth)
    expect(row).toHaveLength(REFLECTION_HEADER.length)
    expect(new Set(REFLECTION_HEADER).size).toBe(REFLECTION_HEADER.length)
  })

  it('starts with the ISO timestamp and name', () => {
    expect(reflectionRow(emptyReflection(), '혜원', NOW).slice(0, 2)).toEqual([NOW.toISOString(), '혜원'])
  })

  it('places list values by column', () => {
    const state = setAnswer(emptyReflection(), 'first-tries', ['서핑', '도예', '요가', '독서', '러닝'])
    const row = reflectionRow(state, 'a', NOW)
    const at = (header: string) => row[REFLECTION_HEADER.indexOf(header)]
    expect(at('first-tries_1')).toBe('서핑')
    expect(at('first-tries_2')).toBe('도예')
    expect(at('first-tries_3')).toBe('요가')
    expect(at('first-tries_5')).toBe('러닝')
  })

  it('leaves skipped quests empty', () => {
    const state = skipQuest(emptyReflection(), 'warmup-food')
    expect(reflectionRow(state, 'a', NOW)[REFLECTION_HEADER.indexOf('warmup-food')]).toBe('')
  })

  it('covers every quest in the header', () => {
    for (const quest of REFLECTION_QUESTS) {
      expect(REFLECTION_HEADER.some((h) => h === quest.id || h.startsWith(`${quest.id}_`))).toBe(true)
    }
  })
})

describe('mandala row', () => {
  it('has exactly 75 columns matching the header', () => {
    expect(MANDALA_HEADER).toHaveLength(75)
    expect(mandalaRow(emptyMandala(), '혜원', NOW)).toHaveLength(75)
  })

  it('orders goal, themes, then actions theme-major', () => {
    let state = setCellValue(emptyMandala(), { kind: 'goal' }, '목표')
    state = setCellValue(state, { kind: 'theme', theme: 1 }, '체력')
    state = setCellValue(state, { kind: 'action', theme: 2, action: 3 }, '수영')
    const row = mandalaRow(state, '혜원', NOW)
    const at = (header: string) => row[MANDALA_HEADER.indexOf(header)]
    expect(at('goal')).toBe('목표')
    expect(at('theme_2')).toBe('체력')
    expect(at('action_3_4')).toBe('수영')
    expect(MANDALA_HEADER.indexOf('action_3_4')).toBe(3 + 8 + 2 * 8 + 3)
  })
})

describe('formula injection', () => {
  it.each(['=SUM(A1)', '+1', '-1', '@cmd', '  =HYPERLINK("x")'])('prefixes %s', (value) => {
    expect(prefixFormulaLikeTextWithApostrophe(value)).toBe(`'${value.trim()}`)
  })

  it('leaves safe text trimmed and untouched', () => {
    expect(prefixFormulaLikeTextWithApostrophe('  라면 = 최고 ')).toBe('라면 = 최고')
    expect(prefixFormulaLikeTextWithApostrophe('')).toBe('')
  })

  it('is applied in row output', () => {
    const state = setAnswer(emptyReflection(), 'warmup-food', '=1+1')
    expect(reflectionRow(state, '@me', NOW).slice(0, 2)[1]).toBe("'@me")
    expect(reflectionRow(state, 'a', NOW)[REFLECTION_HEADER.indexOf('warmup-food')]).toBe("'=1+1")
    const mandala = setCellValue(emptyMandala(), { kind: 'goal' }, '-1')
    expect(mandalaRow(mandala, 'a', NOW)[2]).toBe("'-1")
  })
})

describe('drafts', () => {
  it('round-trips a created draft through JSON', () => {
    const draft = createDraft('reflection', '혜원', setAnswer(emptyReflection(), 'warmup-food', '라면'), NOW)
    const parsed = parseDraftJson(JSON.stringify(draft))
    expect(parsed).toEqual(draft)
    expect(restoreReflectionState(parsed?.data).answers['warmup-food']).toBe('라면')
  })

  it('tolerates missing optional fields and extra fields', () => {
    const parsed = parseDraft({ form: 'mandala', savedAt: NOW.toISOString(), data: {}, extra: 1 })
    expect(parsed).toMatchObject({ form: 'mandala', name: '', version: 1 })
  })

  it.each([null, undefined, 3, 'x', [], {}, { form: 'bingo', savedAt: NOW.toISOString(), data: {} }, { form: 'mandala', savedAt: 'not a date', data: {} }, { form: 'mandala', savedAt: NOW.toISOString() }])(
    'returns null for unusable input %j',
    (raw) => {
      expect(parseDraft(raw)).toBeNull()
    },
  )

  it('returns null for invalid JSON text', () => {
    expect(parseDraftJson('{oops')).toBeNull()
  })

  it('restores state defensively from garbage data', () => {
    expect(restoreMandalaState({ goal: 5, themes: 'x', actions: [[1, 2]] })).toEqual(emptyMandala())
    const state = restoreReflectionState({ answers: { 'warmup-food': 3, bogus: 'x', 'first-tries': ['a', 7] }, skipped: ['warmup-food', 'bogus'] })
    expect(state.answers.bogus).toBeUndefined()
    expect(state.skipped).toEqual(['warmup-food'])
    expect(state.answers['first-tries']).toEqual(['a', '', '', '', ''])
  })

  it('picks the draft with the later savedAt without merging', () => {
    const older = createDraft('mandala', 'a', { goal: 'old' }, new Date('2026-12-01T00:00:00Z'))
    const newer = createDraft('mandala', 'a', { goal: 'new' }, new Date('2026-12-02T00:00:00Z'))
    expect(newerDraft(older, newer)).toBe(newer)
    expect(newerDraft(newer, older)).toBe(newer)
    expect(newerDraft(older, null)).toBe(older)
    expect(newerDraft(null, newer)).toBe(newer)
    expect(newerDraft(null, null)).toBeNull()
  })
})
