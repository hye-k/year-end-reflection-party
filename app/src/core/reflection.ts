import { findQuest, REFLECTION_QUESTS, type Quest } from './content'
import { clampGraphemes, isBlank } from './text'

export type Answer = string | string[]

export interface ReflectionState {
  answers: Record<string, Answer>
  skipped: string[]
}

export type GaugeState = 'answered' | 'skipped' | 'current' | 'upcoming'

export interface SubmitValidation {
  ok: boolean
  missingRequired: string[]
  skipped: string[]
}

export function emptyReflection(): ReflectionState {
  return { answers: {}, skipped: [] }
}

function coerceStrings(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : []
}

export function coerceAnswer(quest: Quest, raw: unknown): Answer {
  const { input } = quest
  switch (input.kind) {
    case 'text':
      return typeof raw === 'string' ? clampGraphemes(raw, input.maxLength) : ''
    case 'slots': {
      const given = coerceStrings(raw)
      return Array.from({ length: input.slotCount }, (_, i) => clampGraphemes(given[i] ?? '', input.slotMaxLength))
    }
  }
}

export function normalizeAnswer(quest: Quest, raw: unknown): Answer {
  const coerced = coerceAnswer(quest, raw)
  if (typeof coerced === 'string') return coerced.trim()
  return coerced.map((item) => item.trim())
}

export function isAnswered(quest: Quest, raw: unknown): boolean {
  const answer = normalizeAnswer(quest, raw)
  const { input } = quest
  switch (input.kind) {
    case 'text':
      return !isBlank(answer as string)
    case 'slots':
      return (answer as string[]).every((item) => item !== '')
  }
}

export function isQuestAnswered(state: ReflectionState, quest: Quest): boolean {
  return isAnswered(quest, state.answers[quest.id])
}

export function setAnswer(state: ReflectionState, questId: string, raw: unknown): ReflectionState {
  const quest = findQuest(questId)
  if (!quest) return state
  const answers = { ...state.answers, [questId]: coerceAnswer(quest, raw) }
  const skipped = isAnswered(quest, answers[questId]) ? state.skipped.filter((id) => id !== questId) : state.skipped
  return { answers, skipped }
}

export function skipQuest(state: ReflectionState, questId: string): ReflectionState {
  const quest = findQuest(questId)
  if (!quest || isQuestAnswered(state, quest) || state.skipped.includes(questId)) return state
  return { ...state, skipped: [...state.skipped, questId] }
}

export function gaugeStates(state: ReflectionState, currentIndex: number): GaugeState[] {
  return REFLECTION_QUESTS.map((quest, index) => {
    if (index === currentIndex) return 'current'
    if (isQuestAnswered(state, quest)) return 'answered'
    if (state.skipped.includes(quest.id)) return 'skipped'
    return 'upcoming'
  })
}

export function validateSubmit(state: ReflectionState): SubmitValidation {
  const unanswered = REFLECTION_QUESTS.filter((quest) => !isQuestAnswered(state, quest))
  const missingRequired = unanswered
    .filter((quest) => quest.required && !state.skipped.includes(quest.id))
    .map((quest) => quest.id)
  const skipped = unanswered.filter((quest) => state.skipped.includes(quest.id)).map((quest) => quest.id)
  return { ok: missingRequired.length === 0, missingRequired, skipped }
}
