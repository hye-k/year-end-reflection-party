import { describe, expect, it } from 'vitest'
import { createDraft } from '../core/serialize'
import {
  clearLocalDraft,
  loadLastName,
  loadLastStep,
  saveLastStep,
  loadLocalDraft,
  loadTourSeen,
  saveTourSeen,
  saveLastName,
  saveLocalDraft,
  type StorageLike,
} from './localDrafts'

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

const draft = createDraft('mandala', 'a', { goal: 'g' }, new Date('2026-01-01T00:00:00Z'))

describe('localDrafts', () => {
  it('round-trips a draft under a namespaced key', () => {
    const storage = memoryStorage()
    expect(saveLocalDraft(draft, storage)).toBe(true)
    expect([...storage.data.keys()].every((k) => k.startsWith('ydp:v1:'))).toBe(true)
    expect(loadLocalDraft('a', 'mandala', storage)).toEqual(draft)
    expect(loadLocalDraft('a', 'reflection', storage)).toBeNull()
    expect(loadLocalDraft('b', 'mandala', storage)).toBeNull()
  })

  it('clears a draft', () => {
    const storage = memoryStorage()
    saveLocalDraft(draft, storage)
    clearLocalDraft('a', 'mandala', storage)
    expect(loadLocalDraft('a', 'mandala', storage)).toBeNull()
  })

  it('returns null for corrupt data', () => {
    const storage = memoryStorage()
    saveLocalDraft(draft, storage)
    const [key] = [...storage.data.keys()]
    storage.data.set(key ?? '', '{broken')
    expect(loadLocalDraft('a', 'mandala', storage)).toBeNull()
  })

  it('remembers the last name', () => {
    const storage = memoryStorage()
    expect(loadLastName(storage)).toBeNull()
    saveLastName('a', storage)
    expect(loadLastName(storage)).toBe('a')
  })

  it('remembers the last step and clears it with null', () => {
    const storage = memoryStorage()
    expect(loadLastStep(storage)).toBeNull()
    saveLastStep({ name: 'a', screen: 'quest', index: 3 }, storage)
    expect(loadLastStep(storage)).toEqual({ name: 'a', screen: 'quest', index: 3 })
    saveLastStep(null, storage)
    expect(loadLastStep(storage)).toBeNull()
  })

  it('ignores a malformed last step', () => {
    const storage = memoryStorage()
    storage.setItem('ydp:v1:lastStep', '{"name":"a","screen":"quest","index":"x"}')
    expect(loadLastStep(storage)).toBeNull()
    storage.setItem('ydp:v1:lastStep', '{broken')
    expect(loadLastStep(storage)).toBeNull()
  })

  it('fails silently when storage throws or is unavailable', () => {
    expect(saveLocalDraft(draft, throwingStorage)).toBe(false)
    expect(loadLocalDraft('a', 'mandala', throwingStorage)).toBeNull()
    expect(() => clearLocalDraft('a', 'mandala', throwingStorage)).not.toThrow()
    expect(loadLastName(throwingStorage)).toBeNull()
    expect(() => saveLastName('a', throwingStorage)).not.toThrow()
    expect(loadLastStep(throwingStorage)).toBeNull()
    expect(() => saveLastStep(null, throwingStorage)).not.toThrow()
    expect(saveLocalDraft(draft, null)).toBe(false)
    expect(loadLocalDraft('a', 'mandala', null)).toBeNull()
  })
})

describe('tour seen flag', () => {
  it('is unseen until saved, then seen, per tour', () => {
    const storage = memoryStorage()
    expect(loadTourSeen('quest', storage)).toBe(false)
    saveTourSeen('quest', storage)
    expect(loadTourSeen('quest', storage)).toBe(true)
    expect(loadTourSeen('mandala', storage)).toBe(false)
  })

  it('treats unavailable storage as unseen without throwing', () => {
    expect(loadTourSeen('quest', throwingStorage)).toBe(false)
    expect(() => saveTourSeen('quest', throwingStorage)).not.toThrow()
    expect(loadTourSeen('quest', null)).toBe(false)
  })
})
