import { describe, expect, it } from 'vitest'
import { makeEvent, type TrackEvent } from '../core/events'
import { MAX_BUFFERED_EVENTS, appendBuffered, loadBuffered, removeBuffered } from './eventBuffer'
import type { StorageLike } from './localDrafts'

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

const at = (seconds: number, quest = ''): TrackEvent =>
  makeEvent('quest_enter', 'a', 'reflection', { answered: 0, chars: 0 }, new Date(Date.UTC(2026, 10, 14, 0, 0, seconds)), quest)

describe('eventBuffer', () => {
  it('keeps events in order per name', () => {
    const storage = memoryStorage()
    appendBuffered(at(1), storage)
    appendBuffered(at(2), storage)
    appendBuffered({ ...at(3), name: 'b' }, storage)
    expect(loadBuffered('a', storage).map((e) => e.ts)).toEqual([at(1).ts, at(2).ts])
    expect(loadBuffered('b', storage)).toHaveLength(1)
  })

  it('removes only the first events that were sent', () => {
    const storage = memoryStorage()
    appendBuffered(at(1), storage)
    appendBuffered(at(2), storage)
    appendBuffered(at(3), storage)
    removeBuffered('a', 2, storage)
    expect(loadBuffered('a', storage).map((e) => e.ts)).toEqual([at(3).ts])
    removeBuffered('a', 5, storage)
    expect(loadBuffered('a', storage)).toEqual([])
    expect(storage.data.size).toBe(0)
  })

  it('drops the oldest events past the cap', () => {
    const storage = memoryStorage()
    for (let i = 0; i < MAX_BUFFERED_EVENTS + 3; i++) appendBuffered(at(i % 60, String(i)), storage)
    const kept = loadBuffered('a', storage)
    expect(kept).toHaveLength(MAX_BUFFERED_EVENTS)
    expect(kept[0]?.quest).toBe('3')
  })

  it('ignores malformed storage content', () => {
    const storage = memoryStorage()
    storage.setItem('ydp:v1:events:a', 'not json')
    expect(loadBuffered('a', storage)).toEqual([])
    storage.setItem('ydp:v1:events:a', JSON.stringify([{ foo: 1 }, at(1)]))
    expect(loadBuffered('a', storage)).toEqual([at(1)])
  })

  it('never throws when storage is blocked', () => {
    expect(() => appendBuffered(at(1), throwingStorage)).not.toThrow()
    expect(loadBuffered('a', throwingStorage)).toEqual([])
    expect(() => removeBuffered('a', 1, throwingStorage)).not.toThrow()
    expect(() => appendBuffered(at(1), null)).not.toThrow()
  })
})
