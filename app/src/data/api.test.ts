import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDraft } from '../core/serialize'
import { createApi, type FetchLike } from './api'

const URL_BASE = 'https://example.test/exec'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })
}

function apiWith(fetchImpl: FetchLike, extra: { readTimeoutMs?: number } = {}) {
  return createApi({ url: URL_BASE, fetch: fetchImpl, ...extra })
}

function hangingFetch(): FetchLike {
  return (_input, init) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
    })
}

afterEach(() => {
  vi.useRealTimers()
})

describe('api', () => {
  it('returns not-configured without calling fetch when there is no url', async () => {
    const fetchImpl = vi.fn<FetchLike>()
    const api = createApi({ url: undefined, fetch: fetchImpl })
    expect(await api.fetchNames()).toEqual({ ok: false, error: 'not-configured' })
    expect(await api.submitForm('mandala', 'a', ['h'], ['v'])).toEqual({ ok: false, error: 'not-configured' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('fetches names with a GET query', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => jsonResponse({ ok: true, names: ['a', 'b'] }))
    expect(await apiWith(fetchImpl).fetchNames()).toEqual({ ok: true, names: ['a', 'b'] })
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(`${URL_BASE}?action=names`)
  })

  it('rejects a malformed names payload', async () => {
    const api = apiWith(async () => jsonResponse({ ok: true, names: [1] }))
    expect(await api.fetchNames()).toEqual({ ok: false, error: 'bad-response' })
  })

  it('posts submit as a simple text/plain request', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => jsonResponse({ ok: true, row: 2 }))
    expect(await apiWith(fetchImpl).submitForm('reflection', 'a', ['h'], ['v'])).toEqual({ ok: true })
    const init = fetchImpl.mock.calls[0]?.[1]
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({ 'Content-Type': 'text/plain;charset=utf-8' })
    expect(JSON.parse(String(init?.body))).toEqual({
      action: 'submit',
      form: 'reflection',
      name: 'a',
      header: ['h'],
      row: ['v'],
    })
  })

  it('maps ok:false to the server error', async () => {
    const api = apiWith(async () => jsonResponse({ ok: false, error: 'unknown name' }))
    expect(await api.submitForm('mandala', 'x', [], [])).toEqual({ ok: false, error: 'unknown name' })
  })

  it('maps HTTP errors, invalid JSON and network failures', async () => {
    expect(await apiWith(async () => jsonResponse('', 500)).fetchNames()).toEqual({ ok: false, error: 'http-500' })
    expect(await apiWith(async () => jsonResponse('<html>')).fetchNames()).toEqual({ ok: false, error: 'invalid-json' })
    expect(
      await apiWith(async () => {
        throw new TypeError('Failed to fetch')
      }).fetchNames(),
    ).toEqual({ ok: false, error: 'network' })
  })

  it('times out reads after the configured limit', async () => {
    vi.useFakeTimers()
    const pending = apiWith(hangingFetch(), { readTimeoutMs: 1000 }).fetchNames()
    await vi.advanceTimersByTimeAsync(1001)
    expect(await pending).toEqual({ ok: false, error: 'timeout' })
  })

  it('uses the 30 s limit for submit', async () => {
    vi.useFakeTimers()
    const pending = apiWith(hangingFetch()).submitForm('mandala', 'a', [], [])
    await vi.advanceTimersByTimeAsync(29_000)
    await vi.advanceTimersByTimeAsync(2_000)
    expect(await pending).toEqual({ ok: false, error: 'timeout' })
  })

  it('returns a parsed remote draft, or null when none or corrupt', async () => {
    const draft = createDraft('mandala', 'a', { goal: 'x' }, new Date('2026-01-01T00:00:00Z'))
    const found = apiWith(async () => jsonResponse({ ok: true, draft: { savedAt: 'ignored', json: JSON.stringify(draft) } }))
    expect(await found.fetchRemoteDraft('a', 'mandala')).toEqual({ ok: true, draft })
    const none = apiWith(async () => jsonResponse({ ok: true, draft: null }))
    expect(await none.fetchRemoteDraft('a', 'mandala')).toEqual({ ok: true, draft: null })
    const corrupt = apiWith(async () => jsonResponse({ ok: true, draft: { savedAt: '', json: '{nope' } }))
    expect(await corrupt.fetchRemoteDraft('a', 'mandala')).toEqual({ ok: true, draft: null })
    const wrongForm = apiWith(async () => jsonResponse({ ok: true, draft: { savedAt: '', json: JSON.stringify(draft) } }))
    expect(await wrongForm.fetchRemoteDraft('a', 'reflection')).toEqual({ ok: true, draft: null })
  })

  it('posts saveDraft with the stringified draft and deleteDraft', async () => {
    const fetchImpl = vi.fn<FetchLike>(async () => jsonResponse({ ok: true }))
    const api = apiWith(fetchImpl)
    const draft = createDraft('reflection', 'a', { answers: {} }, new Date('2026-01-01T00:00:00Z'))
    expect(await api.saveRemoteDraft(draft)).toEqual({ ok: true })
    expect(JSON.parse(String(fetchImpl.mock.calls[0]?.[1]?.body))).toEqual({
      action: 'saveDraft',
      form: 'reflection',
      name: 'a',
      savedAt: draft.savedAt,
      json: JSON.stringify(draft),
    })
    expect(await api.deleteRemoteDraft('a', 'reflection')).toEqual({ ok: true })
    expect(JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body))).toEqual({
      action: 'deleteDraft',
      form: 'reflection',
      name: 'a',
    })
  })
})
