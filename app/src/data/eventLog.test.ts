import { describe, expect, it, vi } from 'vitest'
import { makeEvent, type TrackEvent } from '../core/events'
import type { ApiResult } from './api'
import { appendBuffered, loadBuffered } from './eventBuffer'
import { EVENT_BATCH_SIZE, createEventFlusher, type SendEvents } from './eventLog'
import type { StorageLike } from './localDrafts'

function memoryStorage(): StorageLike {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const event = (name: string, i: number): TrackEvent =>
  makeEvent('save', name, 'reflection', { answered: i, chars: 0 }, new Date(Date.UTC(2026, 10, 14, 0, 0, i % 60)))

function fill(storage: StorageLike, name: string, count: number) {
  for (let i = 0; i < count; i++) appendBuffered(event(name, i), storage)
}

const ok: ApiResult = { ok: true }

describe('createEventFlusher', () => {
  it('sends the buffered events and clears them', async () => {
    const storage = memoryStorage()
    fill(storage, 'a', 3)
    const send = vi.fn<SendEvents>(async () => ok)
    expect(await createEventFlusher(send, () => storage)('a')).toBe(true)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0]?.[1]).toHaveLength(3)
    expect(loadBuffered('a', storage)).toEqual([])
  })

  it('does not call the server when there is nothing to send', async () => {
    const send = vi.fn<SendEvents>(async () => ok)
    expect(await createEventFlusher(send, () => memoryStorage())('a')).toBe(true)
    expect(send).not.toHaveBeenCalled()
  })

  it('keeps the events when the server fails, and when send throws', async () => {
    const storage = memoryStorage()
    fill(storage, 'a', 2)
    const failing = createEventFlusher(async () => ({ ok: false, error: 'network' }), () => storage)
    expect(await failing('a')).toBe(false)
    const throwing = createEventFlusher(async () => {
      throw new Error('boom')
    }, () => storage)
    expect(await throwing('a')).toBe(false)
    expect(loadBuffered('a', storage)).toHaveLength(2)
  })

  it('splits a large buffer into batches', async () => {
    const storage = memoryStorage()
    fill(storage, 'a', EVENT_BATCH_SIZE * 2 + 5)
    const send = vi.fn<SendEvents>(async () => ok)
    await createEventFlusher(send, () => storage)('a')
    expect(send.mock.calls.map((call) => call[1].length)).toEqual([EVENT_BATCH_SIZE, EVENT_BATCH_SIZE, 5])
    expect(loadBuffered('a', storage)).toEqual([])
  })

  it('shares one in-flight send between concurrent flushes of the same name', async () => {
    const storage = memoryStorage()
    fill(storage, 'a', 1)
    const send = vi.fn<SendEvents>(async () => ok)
    const flush = createEventFlusher(send, () => storage)
    await Promise.all([flush('a'), flush('a')])
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('keeps events added during a send for the next round', async () => {
    const storage = memoryStorage()
    fill(storage, 'a', 1)
    const send = vi.fn<SendEvents>(async () => {
      if (send.mock.calls.length === 1) appendBuffered(event('a', 9), storage)
      return ok
    })
    await createEventFlusher(send, () => storage)('a')
    expect(send).toHaveBeenCalledTimes(2)
    expect(loadBuffered('a', storage)).toEqual([])
  })
})
