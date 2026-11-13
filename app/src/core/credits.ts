import raw from '../content/credits.json'

export interface CreditSection {
  heading: string
  lines: string[]
}

export interface Credits {
  title: string
  sections: CreditSection[]
  footer: string | null
}

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

// The roll is edited by hand in content/credits.json, so a typo should fail loudly instead of rolling an empty box.
export function parseCredits(data: unknown): Credits {
  const { title, sections, footer } = (data ?? {}) as Record<string, unknown>
  if (!isText(title)) throw new Error('credits: "title" must be text')
  if (!Array.isArray(sections)) throw new Error('credits: "sections" must be a list')
  return {
    title,
    sections: sections.map((section, i) => {
      const { heading, lines } = (section ?? {}) as Record<string, unknown>
      if (!isText(heading)) throw new Error(`credits: section ${i + 1} needs a "heading"`)
      if (!Array.isArray(lines) || !lines.every(isText)) throw new Error(`credits: "${heading}" needs "lines" as a list of text`)
      return { heading, lines }
    }),
    footer: isText(footer) ? footer : null,
  }
}

export const CREDITS: Credits = parseCredits(raw)
