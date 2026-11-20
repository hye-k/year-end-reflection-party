import { REFLECTION_QUESTS } from './content'
import { allCells, getCellValue, mandalaProgress, type MandalaState } from './mandala'
import { isQuestAnswered, normalizeAnswer, type ReflectionState } from './reflection'
import type { FormId, SheetRow } from './serialize'
import { graphemeLength } from './text'

export type EventKind = 'open' | 'quest_enter' | 'skip' | 'save' | 'submit'

// How far along the writer is at the moment of an event.
export interface Tally {
  answered: number
  chars: number
}

export interface TrackEvent extends Tally {
  ts: string
  name: string
  form: FormId
  event: EventKind
  quest: string
}

export const EVENTS_HEADER: SheetRow = ['ts', 'name', 'form', 'event', 'quest', 'answered', 'chars']

export function makeEvent(
  event: EventKind,
  name: string,
  form: FormId,
  tally: Tally,
  now: Date,
  quest = '',
): TrackEvent {
  return { ts: now.toISOString(), name, form, event, quest, answered: tally.answered, chars: tally.chars }
}

export function eventRow(event: TrackEvent): SheetRow {
  return [event.ts, event.name, event.form, event.event, event.quest, String(event.answered), String(event.chars)]
}

export function reflectionTally(state: ReflectionState): Tally {
  let answered = 0
  let chars = 0
  for (const quest of REFLECTION_QUESTS) {
    const value = normalizeAnswer(quest, state.answers[quest.id])
    const items = typeof value === 'string' ? [value] : value
    chars += items.reduce((sum, item) => sum + graphemeLength(item), 0)
    if (isQuestAnswered(state, quest)) answered += 1
  }
  return { answered, chars }
}

export function mandalaTally(state: MandalaState): Tally {
  const chars = allCells().reduce((sum, cell) => sum + graphemeLength(getCellValue(state, cell).trim()), 0)
  return { answered: mandalaProgress(state).filled, chars }
}
