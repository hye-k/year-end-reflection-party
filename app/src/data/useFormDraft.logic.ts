import { newerDraft } from '../core/serialize'

interface Stamped {
  savedAt: string
}

export function shouldApplyRemote(loaded: Stamped | null, remote: Stamped | null, editedSinceLoad: boolean): boolean {
  if (!remote || editedSinceLoad) return false
  return newerDraft(loaded, remote) === remote
}

export interface TimerApi {
  setTimeout: (callback: () => void, ms: number) => unknown
  clearTimeout: (handle: unknown) => void
}

const browserTimers: TimerApi = {
  setTimeout: (callback, ms) => setTimeout(callback, ms),
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}

export interface Debouncer {
  schedule: () => void
  flush: () => void
  cancel: () => void
  isPending: () => boolean
}

export function createDebouncer(delayMs: number, run: () => void, timers: TimerApi = browserTimers): Debouncer {
  let handle: unknown = null
  let pending = false

  const cancel = () => {
    if (handle !== null) timers.clearTimeout(handle)
    handle = null
    pending = false
  }

  return {
    schedule() {
      if (handle !== null) timers.clearTimeout(handle)
      pending = true
      handle = timers.setTimeout(() => {
        handle = null
        pending = false
        run()
      }, delayMs)
    },
    flush() {
      if (!pending) return
      cancel()
      run()
    },
    cancel,
    isPending: () => pending,
  }
}

export interface InFlightGuard {
  run: <T>(task: () => Promise<T>) => Promise<T>
}

export function createInFlightGuard(): InFlightGuard {
  let current: Promise<unknown> | null = null
  return {
    run<T>(task: () => Promise<T>): Promise<T> {
      if (current) return current as Promise<T>
      const started = task().finally(() => {
        current = null
      })
      current = started
      return started
    },
  }
}
