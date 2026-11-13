import { describe, expect, it, vi } from 'vitest'
import { createDebouncer, createInFlightGuard, shouldApplyRemote, type TimerApi } from './useFormDraft.logic'

const older = { savedAt: '2026-01-01T00:00:00.000Z' }
const newer = { savedAt: '2026-01-02T00:00:00.000Z' }

describe('shouldApplyRemote', () => {
  it('applies a strictly newer remote when untouched', () => {
    expect(shouldApplyRemote(older, newer, false)).toBe(true)
    expect(shouldApplyRemote(null, newer, false)).toBe(true)
  })
  it('never overwrites edits', () => {
    expect(shouldApplyRemote(older, newer, true)).toBe(false)
  })
  it('ignores equal, older or missing remote', () => {
    expect(shouldApplyRemote(newer, older, false)).toBe(false)
    expect(shouldApplyRemote(older, { ...older }, false)).toBe(false)
    expect(shouldApplyRemote(older, null, false)).toBe(false)
  })
})

function fakeTimers() {
  let nextId = 1
  const tasks = new Map<number, () => void>()
  const api: TimerApi = {
    setTimeout: (callback) => {
      const id = nextId++
      tasks.set(id, callback)
      return id
    },
    clearTimeout: (handle) => void tasks.delete(handle as number),
  }
  return { api, tasks, fireAll: () => [...tasks.values()].forEach((t) => t()) }
}

describe('createDebouncer', () => {
  it('collapses repeated schedules into one run', () => {
    const timers = fakeTimers()
    const run = vi.fn()
    const debouncer = createDebouncer(500, run, timers.api)
    debouncer.schedule()
    debouncer.schedule()
    expect(timers.tasks.size).toBe(1)
    timers.fireAll()
    expect(run).toHaveBeenCalledTimes(1)
    expect(debouncer.isPending()).toBe(false)
  })
  it('flush runs a pending job immediately and only once', () => {
    const timers = fakeTimers()
    const run = vi.fn()
    const debouncer = createDebouncer(500, run, timers.api)
    debouncer.schedule()
    debouncer.flush()
    debouncer.flush()
    expect(run).toHaveBeenCalledTimes(1)
    expect(timers.tasks.size).toBe(0)
  })
  it('cancel drops the pending job', () => {
    const timers = fakeTimers()
    const run = vi.fn()
    const debouncer = createDebouncer(500, run, timers.api)
    debouncer.schedule()
    debouncer.cancel()
    debouncer.flush()
    expect(run).not.toHaveBeenCalled()
  })
  it('works with the real timers', () => {
    vi.useFakeTimers()
    const run = vi.fn()
    createDebouncer(500, run).schedule()
    vi.advanceTimersByTime(499)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

describe('createInFlightGuard', () => {
  it('returns the same promise while running, then allows a new run', async () => {
    const guard = createInFlightGuard()
    let release: (value: number) => void = () => {}
    const task = vi.fn(() => new Promise<number>((resolve) => (release = resolve)))
    const first = guard.run(task)
    const second = guard.run(task)
    expect(second).toBe(first)
    expect(task).toHaveBeenCalledTimes(1)
    release(7)
    expect(await first).toBe(7)
    await guard.run(async () => 1)
    const third = guard.run(task)
    expect(task).toHaveBeenCalledTimes(2)
    release(1)
    await third
  })
  it('releases after a rejection', async () => {
    const guard = createInFlightGuard()
    await expect(guard.run(() => Promise.reject(new Error('x')))).rejects.toThrow('x')
    expect(await guard.run(async () => 'ok')).toBe('ok')
  })
})
