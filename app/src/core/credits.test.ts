import { describe, expect, it } from 'vitest'
import { CREDITS, parseCredits } from './credits'

describe('credits', () => {
  it('loads the shipped credits', () => {
    expect(CREDITS.title).not.toBe('')
    expect(CREDITS.sections.length).toBeGreaterThan(0)
    expect(CREDITS.sections.every((section) => section.lines.length > 0)).toBe(true)
  })

  it('keeps the asset credit the licence asks for', () => {
    const lines = CREDITS.sections.flatMap((section) => section.lines).join(' ')
    expect(lines).toContain('Szym')
  })

  it('makes the footer optional', () => {
    expect(parseCredits({ title: 'T', sections: [] }).footer).toBeNull()
  })

  it('refuses malformed credits', () => {
    expect(() => parseCredits(null)).toThrow(/title/)
    expect(() => parseCredits({ title: 'T', sections: 'x' })).toThrow(/sections/)
    expect(() => parseCredits({ title: 'T', sections: [{ lines: ['a'] }] })).toThrow(/heading/)
    expect(() => parseCredits({ title: 'T', sections: [{ heading: 'H', lines: [1] }] })).toThrow(/lines/)
  })
})
