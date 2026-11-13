import { describe, expect, it } from 'vitest'
import { REFLECTION_QUESTS } from './content'
import { emptyReflection, gaugeStates, setAnswer, skipQuest, validateSubmit, type ReflectionState } from './reflection'

function answerEverything(): ReflectionState {
  let state = emptyReflection()
  for (const quest of REFLECTION_QUESTS) {
    const value =
      quest.input.kind === 'text' ? '답' : ['1', '2', '3', '4', '5']
    state = setAnswer(state, quest.id, value)
  }
  return state
}

describe('skip rules', () => {
  it('marks a quest skipped, then clears it once answered', () => {
    let state = skipQuest(emptyReflection(), 'warmup-food')
    expect(state.skipped).toEqual(['warmup-food'])
    state = setAnswer(state, 'warmup-food', '라면')
    expect(state.skipped).toEqual([])
  })

  it('keeps the skip when the later answer is blank', () => {
    let state = skipQuest(emptyReflection(), 'warmup-food')
    state = setAnswer(state, 'warmup-food', '   ')
    expect(state.skipped).toEqual(['warmup-food'])
  })

  it('ignores skipping an already answered quest and unknown ids', () => {
    const state = setAnswer(emptyReflection(), 'warmup-food', '라면')
    expect(skipQuest(state, 'warmup-food')).toBe(state)
    expect(skipQuest(state, 'nope')).toBe(state)
  })
})

describe('gauge', () => {
  it('reports answered, skipped, current and upcoming', () => {
    let state = setAnswer(emptyReflection(), 'warmup-food', '라면')
    state = skipQuest(state, 'warmup-song')
    const gauge = gaugeStates(state, 2)
    expect(gauge).toHaveLength(13)
    expect(gauge.slice(0, 4)).toEqual(['answered', 'skipped', 'current', 'upcoming'])
  })

  it('lets current win over answered', () => {
    const state = setAnswer(emptyReflection(), 'warmup-food', '라면')
    expect(gaugeStates(state, 0)[0]).toBe('current')
  })
})

describe('submit validation', () => {
  it('blocks on never-answered, never-skipped required quests', () => {
    const result = validateSubmit(emptyReflection())
    expect(result.ok).toBe(false)
    expect(result.missingRequired).toHaveLength(13)
    expect(result.skipped).toEqual([])
  })

  it('does not block on skipped quests but reports them', () => {
    let state = answerEverything()
    state = { answers: { ...state.answers, 'let-go': '' }, skipped: ['let-go'] }
    const result = validateSubmit(state)
    expect(result).toEqual({ ok: true, missingRequired: [], skipped: ['let-go'] })
  })

  it('separates skipped from never-answered', () => {
    let state = answerEverything()
    state = { answers: { ...state.answers, courage: '', 'let-go': '' }, skipped: ['let-go'] }
    const result = validateSubmit(state)
    expect(result.ok).toBe(false)
    expect(result.missingRequired).toEqual(['courage'])
    expect(result.skipped).toEqual(['let-go'])
  })

  it('passes when everything is answered', () => {
    expect(validateSubmit(answerEverything())).toEqual({ ok: true, missingRequired: [], skipped: [] })
  })
})

describe('list and slots quests', () => {
  it('requires all five items to be non-blank', () => {
    let state = setAnswer(emptyReflection(), 'first-tries', ['서핑', '  ', '', '도예', '요가'])
    expect(validateSubmit(state).missingRequired).toContain('first-tries')
    state = setAnswer(state, 'first-tries', ['서핑', '독서', '러닝', '도예', '요가'])
    expect(validateSubmit(state).missingRequired).not.toContain('first-tries')
  })

  it('does not accept fewer than five items for the glad-i-did quest', () => {
    const state = setAnswer(emptyReflection(), 'glad-i-did', ['기타'])
    expect(validateSubmit(state).missingRequired).toContain('glad-i-did')
  })

  it('truncates lists to the maximum', () => {
    const state = setAnswer(emptyReflection(), 'first-tries', ['1', '2', '3', '4', '5', '6', '7'])
    expect(state.answers['first-tries']).toHaveLength(5)
  })

  it('requires all five bragging slots', () => {
    let state = setAnswer(emptyReflection(), 'brag', ['a', 'b', 'c', 'd'])
    expect(validateSubmit(state).missingRequired).toContain('brag')
    state = setAnswer(state, 'brag', ['a', 'b', 'c', 'd', 'e'])
    expect(validateSubmit(state).missingRequired).not.toContain('brag')
  })
})
