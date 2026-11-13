const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

function graphemes(value: string): string[] {
  return Array.from(segmenter.segment(value), (part) => part.segment)
}

export function graphemeLength(value: string): number {
  return graphemes(value).length
}

export function clampGraphemes(value: string, limit: number): string {
  return graphemes(value).slice(0, limit).join('')
}

export function isBlank(value: string): boolean {
  return value.trim() === ''
}
