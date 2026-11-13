import { REFLECTION_QUESTS, type Quest } from './content'
import {
  ACTIONS_PER_THEME,
  THEME_COUNT,
  emptyMandala,
  normalizeCellValue,
  setCellValue,
  type MandalaState,
} from './mandala'
import { emptyReflection, isQuestAnswered, normalizeAnswer, setAnswer, type ReflectionState } from './reflection'

export type SheetRow = string[]
export type FormId = 'reflection' | 'mandala'

export const DRAFT_VERSION = 1

export interface Draft {
  form: FormId
  name: string
  savedAt: string
  version: number
  data: unknown
}

const FORMULA_TRIGGERS = /^[=+\-@]/

export function prefixFormulaLikeTextWithApostrophe(value: string): string {
  const trimmed = value.trim()
  return FORMULA_TRIGGERS.test(trimmed) ? `'${trimmed}` : trimmed
}

function questColumnCount(quest: Quest): number {
  switch (quest.input.kind) {
    case 'text':
      return 1
    case 'slots':
      return quest.input.slotCount
  }
}

function questHeaders(quest: Quest): string[] {
  const count = questColumnCount(quest)
  return count === 1 && quest.input.kind === 'text'
    ? [quest.id]
    : Array.from({ length: count }, (_, i) => `${quest.id}_${i + 1}`)
}

export const REFLECTION_HEADER: SheetRow = [
  'timestamp',
  'name',
  ...REFLECTION_QUESTS.flatMap(questHeaders),
]

function questCells(state: ReflectionState, quest: Quest): string[] {
  const width = questColumnCount(quest)
  const cells = isQuestAnswered(state, quest) ? normalizeAnswer(quest, state.answers[quest.id]) : []
  const list = typeof cells === 'string' ? [cells] : cells
  return Array.from({ length: width }, (_, i) => prefixFormulaLikeTextWithApostrophe(list[i] ?? ''))
}

export function reflectionRow(state: ReflectionState, name: string, now: Date): SheetRow {
  return [
    now.toISOString(),
    prefixFormulaLikeTextWithApostrophe(name),
    ...REFLECTION_QUESTS.flatMap((quest) => questCells(state, quest)),
  ]
}

export const MANDALA_HEADER: SheetRow = [
  'timestamp',
  'name',
  'goal',
  ...Array.from({ length: THEME_COUNT }, (_, t) => `theme_${t + 1}`),
  ...Array.from({ length: THEME_COUNT }, (_, t) =>
    Array.from({ length: ACTIONS_PER_THEME }, (_, a) => `action_${t + 1}_${a + 1}`),
  ).flat(),
]

export function mandalaRow(state: MandalaState, name: string, now: Date): SheetRow {
  const cell = (value: string) => prefixFormulaLikeTextWithApostrophe(normalizeCellValue(value))
  return [
    now.toISOString(),
    prefixFormulaLikeTextWithApostrophe(name),
    cell(state.goal),
    ...state.themes.map(cell),
    ...state.actions.flatMap((row) => row.map(cell)),
  ]
}

export function createDraft(form: FormId, name: string, data: unknown, now: Date): Draft {
  return { form, name, savedAt: now.toISOString(), version: DRAFT_VERSION, data }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseDraft(raw: unknown): Draft | null {
  if (!isRecord(raw)) return null
  const { form, name, savedAt, version, data } = raw
  if (form !== 'reflection' && form !== 'mandala') return null
  if (typeof savedAt !== 'string' || Number.isNaN(Date.parse(savedAt))) return null
  if (!isRecord(data)) return null
  return {
    form,
    name: typeof name === 'string' ? name : '',
    savedAt,
    version: typeof version === 'number' ? version : DRAFT_VERSION,
    data,
  }
}

export function parseDraftJson(text: string): Draft | null {
  try {
    return parseDraft(JSON.parse(text))
  } catch {
    return null
  }
}

export function newerDraft<T extends { savedAt: string }>(a: T | null, b: T | null): T | null {
  if (!a || !b) return a ?? b
  return Date.parse(b.savedAt) > Date.parse(a.savedAt) ? b : a
}

export function restoreReflectionState(data: unknown): ReflectionState {
  if (!isRecord(data)) return emptyReflection()
  const answers = isRecord(data.answers) ? data.answers : {}
  let state = emptyReflection()
  for (const [id, value] of Object.entries(answers)) {
    state = setAnswer(state, id, value)
  }
  const skipped = Array.isArray(data.skipped) ? data.skipped : []
  const knownSkips = REFLECTION_QUESTS.filter(
    (quest) => skipped.includes(quest.id) && !isQuestAnswered(state, quest),
  ).map((quest) => quest.id)
  return { ...state, skipped: knownSkips }
}

export function restoreMandalaState(data: unknown): MandalaState {
  let state = emptyMandala()
  if (!isRecord(data)) return state
  const text = (value: unknown) => (typeof value === 'string' ? value : '')
  state = setCellValue(state, { kind: 'goal' }, text(data.goal))
  const themes = Array.isArray(data.themes) ? data.themes : []
  const actions = Array.isArray(data.actions) ? data.actions : []
  for (let theme = 0; theme < THEME_COUNT; theme++) {
    state = setCellValue(state, { kind: 'theme', theme }, text(themes[theme]))
    const row: unknown[] = Array.isArray(actions[theme]) ? actions[theme] : []
    for (let action = 0; action < ACTIONS_PER_THEME; action++) {
      state = setCellValue(state, { kind: 'action', theme, action }, text(row[action]))
    }
  }
  return state
}
