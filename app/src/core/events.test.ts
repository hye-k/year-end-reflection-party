import { describe, expect, it } from 'vitest'
import { EVENTS_HEADER, eventRow, makeEvent, mandalaTally, reflectionTally } from './events'
import { emptyMandala, setCellValue } from './mandala'
import { emptyReflection, setAnswer } from './reflection'

const NOW = new Date('2026-11-14T00:43:00.725Z')

describe('events', () => {
  it('has a row that aligns with the header', () => {
    const event = makeEvent('quest_enter', '혜원', 'reflection', { answered: 2, chars: 30 }, NOW, 'thanks')
    const row = eventRow(event)
    expect(EVENTS_HEADER).toEqual(['ts', 'name', 'form', 'event', 'quest', 'answered', 'chars'])
    expect(row).toHaveLength(EVENTS_HEADER.length)
    expect(row).toEqual([NOW.toISOString(), '혜원', 'reflection', 'quest_enter', 'thanks', '2', '30'])
  })

  it('leaves quest empty by default', () => {
    expect(eventRow(makeEvent('open', 'a', 'mandala', { answered: 0, chars: 0 }, NOW))[4]).toBe('')
  })

  it('tallies reflection answers: complete quests count as answered, all typed characters count', () => {
    let state = setAnswer(emptyReflection(), 'warmup-food', '김치찌개')
    state = setAnswer(state, 'brag', ['가나', '다'])
    expect(reflectionTally(state)).toEqual({ answered: 1, chars: 7 })
  })

  it('tallies an empty reflection as zero', () => {
    expect(reflectionTally(emptyReflection())).toEqual({ answered: 0, chars: 0 })
  })

  it('tallies mandala cells', () => {
    const state = setCellValue(emptyMandala(), { kind: 'goal' }, '건강')
    expect(mandalaTally(state)).toEqual({ answered: 1, chars: 2 })
  })
})
