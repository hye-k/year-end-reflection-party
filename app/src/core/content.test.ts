import { describe, expect, it } from 'vitest'
import ko from '../content/ko.json'
import { QUEST_STRUCTURES, REFLECTION_QUESTS, buildQuests } from './content'

describe('reflection content', () => {
  it('has 13 quests with unique ids', () => {
    expect(REFLECTION_QUESTS).toHaveLength(13)
    expect(new Set(REFLECTION_QUESTS.map((q) => q.id)).size).toBe(13)
  })

  it('maps depth linearly from 0m to 40m', () => {
    const depths = REFLECTION_QUESTS.map((q) => q.depthM)
    expect(depths[0]).toBe(0)
    expect(depths[12]).toBe(40)
    expect(depths).toEqual([...depths].sort((a, b) => a - b))
  })

  it('explains every quest with a sub-text', () => {
    expect(REFLECTION_QUESTS.every((q) => q.hint.trim().length > 0)).toBe(true)
  })

  it('has text for exactly the quests that exist, in every language', () => {
    expect(Object.keys(ko.quests).sort()).toEqual(QUEST_STRUCTURES.map((q) => q.id).sort())
  })

  it('refuses text that does not fit the quest structure', () => {
    const missingSlots = { quests: { ...ko.quests, brag: { prompt: 'p', hint: 'h', slotLabels: ['a'] } } }
    expect(() => buildQuests(missingSlots)).toThrow(/brag/)
    const { 'warmup-food': _omitted, ...rest } = ko.quests
    expect(() => buildQuests({ quests: rest })).toThrow(/warmup-food/)
  })

  it('has five numbered bragging slots in a single column', () => {
    const brag = REFLECTION_QUESTS.find((q) => q.id === 'brag')
    expect(brag?.input).toMatchObject({ kind: 'slots', slotCount: 5, slotLabels: null, columns: 1 })
  })

  it('draws the letter to the past self as a letter addressed to the writer', () => {
    const letter = REFLECTION_QUESTS.find((q) => q.id === 'to-past-self')
    expect(letter?.input).toMatchObject({ kind: 'text', salutation: '1월의 {name}에게' })
    expect(REFLECTION_QUESTS.filter((q) => q.input.kind === 'text' && q.input.salutation)).toHaveLength(1)
  })

  it('refuses a salutation that does not name the writer', () => {
    const bad = { quests: { ...ko.quests, 'to-past-self': { ...ko.quests['to-past-self'], salutation: '1월의 나에게' } } }
    expect(() => buildQuests(bad)).toThrow(/to-past-self/)
  })

  it('numbers the slots of the first-tries quest without labels', () => {
    const quest = REFLECTION_QUESTS.find((q) => q.id === 'first-tries')
    expect(quest?.input.kind === 'slots' && quest.input.slotLabels).toBeNull()
  })

  it('shows the character limit unless the text gives a placeholder', () => {
    expect(REFLECTION_QUESTS.find((q) => q.id === 'warmup-food')?.input).toMatchObject({ placeholder: null })
    const brag = REFLECTION_QUESTS.find((q) => q.id === 'brag')
    expect(brag?.input.kind === 'slots' && brag.input.slotPlaceholders).toHaveLength(5)
    const custom = { quests: { ...ko.quests, 'warmup-food': { ...ko.quests['warmup-food'], placeholder: '예시' } } }
    expect(buildQuests(custom)[0].input).toMatchObject({ placeholder: '예시' })
    const blank = { quests: { ...ko.quests, 'warmup-food': { ...ko.quests['warmup-food'], placeholder: '  ' } } }
    expect(buildQuests(blank)[0].input).toMatchObject({ placeholder: null })
  })

  it('refuses a slot placeholder list of the wrong length', () => {
    const bad = { quests: { ...ko.quests, brag: { ...ko.quests.brag, slotPlaceholders: ['a'] } } }
    expect(() => buildQuests(bad)).toThrow(/brag/)
  })
})
