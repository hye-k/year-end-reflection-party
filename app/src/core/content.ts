import ko from '../content/ko.json'

export type SectionName = 'warmup' | 'people' | 'attempts' | 'self' | 'brag' | 'finish'

export interface TextInput {
  kind: 'text'
  maxLength: number
  placeholder: string | null // null: the field shows its character limit instead
  salutation: string | null // set: the field is drawn as a letter that opens with this line; `{name}` is the writer
}

// A fixed number of single-line slots, all required. Labels are optional: without them the slots are only numbered.
export interface SlotsInput {
  kind: 'slots'
  slotCount: number
  slotLabels: readonly string[] | null
  slotPlaceholders: readonly (string | null)[] // null entries show the character limit
  slotMaxLength: number
  columns: 1 | 2
}

export type QuestInput = TextInput | SlotsInput

// A quest with its text already resolved for one language.
export interface Quest {
  id: string
  section: SectionName
  prompt: string
  hint: string
  required: boolean
  depthM: number
  input: QuestInput
}

// Language-independent part of a quest. All wording lives in content/<lang>.json.
type InputStructure =
  | { kind: 'text'; maxLength: number }
  | { kind: 'slots'; slotCount: number; slotMaxLength: number; columns: 1 | 2 }

interface QuestStructure {
  id: string
  section: SectionName
  required: boolean
  input: InputStructure
}

export interface QuestText {
  prompt: string
  hint: string
  placeholder?: string
  salutation?: string
  slotLabels?: string[]
  slotPlaceholders?: string[]
}

export interface ContentTexts {
  quests: Record<string, QuestText>
}

const SHORT = 100
const LONG = 300

const text = (maxLength: number): InputStructure => ({ kind: 'text', maxLength })

export const QUEST_STRUCTURES: readonly QuestStructure[] = [
  { id: 'warmup-food', section: 'warmup', required: true, input: text(SHORT) },
  { id: 'warmup-song', section: 'warmup', required: true, input: text(SHORT) },
  { id: 'warmup-purchase', section: 'warmup', required: true, input: text(SHORT) },
  { id: 'warmup-photo', section: 'warmup', required: true, input: text(SHORT) },
  { id: 'thanks', section: 'people', required: true, input: text(LONG) },
  { id: 'first-tries', section: 'attempts', required: true, input: { kind: 'slots', slotCount: 5, slotMaxLength: 40, columns: 2 } },
  { id: 'glad-i-did', section: 'attempts', required: true, input: { kind: 'slots', slotCount: 5, slotMaxLength: 40, columns: 2 } },
  { id: 'let-go', section: 'attempts', required: true, input: text(LONG) },
  { id: 'courage', section: 'attempts', required: true, input: text(LONG) },
  { id: 'new-self', section: 'self', required: true, input: text(LONG) },
  { id: 'brag', section: 'brag', required: true, input: { kind: 'slots', slotCount: 5, slotMaxLength: 100, columns: 1 } },
  { id: 'to-past-self', section: 'finish', required: true, input: text(LONG) },
  { id: 'year-sentence', section: 'finish', required: true, input: text(SHORT) },
]

export const MAX_DEPTH_M = 40

export const NAME_TOKEN = '{name}'

const orNull = (text: string | undefined) => (text?.trim() ? text : null)

function resolveInput(structure: QuestStructure, words: QuestText): QuestInput {
  const { id, input } = structure
  if (input.kind === 'slots') {
    const slotLabels = words.slotLabels ?? null
    if (slotLabels && slotLabels.length !== input.slotCount) throw new Error(`content: "${id}" needs ${input.slotCount} slotLabels`)
    const given = words.slotPlaceholders
    if (given && given.length !== input.slotCount) throw new Error(`content: "${id}" needs ${input.slotCount} slotPlaceholders`)
    const slotPlaceholders = Array.from({ length: input.slotCount }, (_, i) => orNull(given?.[i]))
    return { ...input, slotLabels, slotPlaceholders }
  }
  const salutation = orNull(words.salutation)
  if (salutation && !salutation.includes(NAME_TOKEN)) throw new Error(`content: "${id}" salutation needs ${NAME_TOKEN}`)
  return { ...input, placeholder: orNull(words.placeholder), salutation }
}

export function buildQuests(texts: ContentTexts): readonly Quest[] {
  return QUEST_STRUCTURES.map((structure, index) => {
    const words = texts.quests[structure.id]
    if (!words) throw new Error(`content: no text for "${structure.id}"`)
    return {
      id: structure.id,
      section: structure.section,
      prompt: words.prompt,
      hint: words.hint,
      required: structure.required,
      depthM: Math.round((index * MAX_DEPTH_M * 10) / (QUEST_STRUCTURES.length - 1)) / 10,
      input: resolveInput(structure, words),
    }
  })
}

export const REFLECTION_QUESTS: readonly Quest[] = buildQuests(ko)

export function findQuest(id: string): Quest | undefined {
  return REFLECTION_QUESTS.find((quest) => quest.id === id)
}
