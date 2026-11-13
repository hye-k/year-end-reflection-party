import { parseDraftJson, type Draft, type FormId } from '../core/serialize'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const KEY_PREFIX = 'ydp:v1:'
const LAST_NAME_KEY = `${KEY_PREFIX}lastName`
const LAST_STEP_KEY = `${KEY_PREFIX}lastStep`
export type TourId = 'quest' | 'mandala'

const tourSeenKey = (tour: TourId) => `${KEY_PREFIX}tourSeen:${tour}`

const draftKey = (name: string, form: FormId) => `${KEY_PREFIX}draft:${form}:${name}`

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function attempt<T>(fallback: T, action: () => T): T {
  try {
    return action()
  } catch {
    return fallback
  }
}

export function loadLocalDraft(name: string, form: FormId, storage: StorageLike | null = browserStorage()): Draft | null {
  return attempt(null, () => {
    const text = storage?.getItem(draftKey(name, form))
    if (!text) return null
    const draft = parseDraftJson(text)
    return draft && draft.form === form ? draft : null
  })
}

export function saveLocalDraft(draft: Draft, storage: StorageLike | null = browserStorage()): boolean {
  return attempt(false, () => {
    if (!storage) return false
    storage.setItem(draftKey(draft.name, draft.form), JSON.stringify(draft))
    return true
  })
}

export function clearLocalDraft(name: string, form: FormId, storage: StorageLike | null = browserStorage()): void {
  attempt(undefined, () => storage?.removeItem(draftKey(name, form)))
}

export function loadLastName(storage: StorageLike | null = browserStorage()): string | null {
  return attempt(null, () => storage?.getItem(LAST_NAME_KEY) || null)
}

export function saveLastName(name: string, storage: StorageLike | null = browserStorage()): void {
  attempt(undefined, () => storage?.setItem(LAST_NAME_KEY, name))
}

export interface LastStep {
  name: string
  screen: string
  index: number
}

export function loadLastStep(storage: StorageLike | null = browserStorage()): LastStep | null {
  return attempt(null, () => {
    const text = storage?.getItem(LAST_STEP_KEY)
    if (!text) return null
    const value: unknown = JSON.parse(text)
    if (typeof value !== 'object' || value === null) return null
    const { name, screen, index } = value as Record<string, unknown>
    if (typeof name !== 'string' || typeof screen !== 'string' || !Number.isInteger(index)) return null
    return { name, screen, index: index as number }
  })
}

export function saveLastStep(step: LastStep | null, storage: StorageLike | null = browserStorage()): void {
  attempt(undefined, () => (step ? storage?.setItem(LAST_STEP_KEY, JSON.stringify(step)) : storage?.removeItem(LAST_STEP_KEY)))
}

export function loadTourSeen(tour: TourId, storage: StorageLike | null = browserStorage()): boolean {
  return attempt(false, () => storage?.getItem(tourSeenKey(tour)) === '1')
}

export function saveTourSeen(tour: TourId, storage: StorageLike | null = browserStorage()): void {
  attempt(undefined, () => storage?.setItem(tourSeenKey(tour), '1'))
}
