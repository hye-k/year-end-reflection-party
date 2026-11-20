import type { TrackEvent } from '../core/events'
import { browserStorage, type StorageLike } from './localDrafts'

const bufferKey = (name: string) => `ydp:v1:events:${name}`

// A tab left offline for a long time must not grow the buffer without limit; the oldest events go first.
export const MAX_BUFFERED_EVENTS = 500

function isTrackEvent(value: unknown): value is TrackEvent {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.ts === 'string' &&
    typeof e.name === 'string' &&
    (e.form === 'reflection' || e.form === 'mandala') &&
    typeof e.event === 'string' &&
    typeof e.quest === 'string' &&
    typeof e.answered === 'number' &&
    typeof e.chars === 'number'
  )
}

export function loadBuffered(name: string, storage: StorageLike | null = browserStorage()): TrackEvent[] {
  try {
    const text = storage?.getItem(bufferKey(name))
    if (!text) return []
    const parsed: unknown = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.filter(isTrackEvent) : []
  } catch {
    return []
  }
}

function store(name: string, events: TrackEvent[], storage: StorageLike | null): void {
  try {
    if (events.length === 0) storage?.removeItem(bufferKey(name))
    else storage?.setItem(bufferKey(name), JSON.stringify(events))
  } catch {
    // Logging is best effort.
  }
}

export function appendBuffered(event: TrackEvent, storage: StorageLike | null = browserStorage()): void {
  const events = [...loadBuffered(event.name, storage), event]
  store(event.name, events.slice(-MAX_BUFFERED_EVENTS), storage)
}

export function removeBuffered(name: string, count: number, storage: StorageLike | null = browserStorage()): void {
  store(name, loadBuffered(name, storage).slice(count), storage)
}
