import { makeEvent, type EventKind, type Tally, type TrackEvent } from '../core/events'
import type { FormId } from '../core/serialize'
import { logEvents, type ApiResult } from './api'
import { appendBuffered, loadBuffered, removeBuffered } from './eventBuffer'
import { browserStorage, type StorageLike } from './localDrafts'

// Keep in step with MAX_EVENT_ROWS in apps-script/Code.gs.
export const EVENT_BATCH_SIZE = 100

export type SendEvents = (name: string, events: TrackEvent[]) => Promise<ApiResult>

// Events are best effort: a failed send leaves them buffered and never surfaces an error.
export function createEventFlusher(send: SendEvents, storage: () => StorageLike | null = browserStorage) {
  const inFlight = new Map<string, Promise<boolean>>()

  async function drain(name: string): Promise<boolean> {
    for (;;) {
      const store = storage()
      const batch = loadBuffered(name, store).slice(0, EVENT_BATCH_SIZE)
      if (batch.length === 0) return true
      let result: ApiResult
      try {
        result = await send(name, batch)
      } catch {
        return false
      }
      if (!result.ok) return false
      removeBuffered(name, batch.length, store)
    }
  }

  return function flush(name: string): Promise<boolean> {
    const running = inFlight.get(name)
    if (running) return running
    const started = drain(name).finally(() => inFlight.delete(name))
    inFlight.set(name, started)
    return started
  }
}

export const flushEvents = createEventFlusher(logEvents)

export function recordEvent(
  event: EventKind,
  name: string,
  form: FormId,
  tally: Tally,
  quest = '',
  now: Date = new Date(),
): void {
  if (!name) return
  appendBuffered(makeEvent(event, name, form, tally, now, quest), browserStorage())
}
