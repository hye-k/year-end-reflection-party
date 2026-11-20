import { EVENTS_HEADER, eventRow, type TrackEvent } from '../core/events'
import { parseDraftJson, type Draft, type FormId } from '../core/serialize'
import { APPS_SCRIPT_URL } from './config'

export type ApiResult<T = object> = ({ ok: true } & T) | { ok: false; error: string }

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export interface ApiOptions {
  url?: string
  fetch?: FetchLike
  readTimeoutMs?: number
  submitTimeoutMs?: number
}

export const READ_TIMEOUT_MS = 15_000
export const SUBMIT_TIMEOUT_MS = 30_000

const MAX_ERROR_LENGTH = 100

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function shortError(value: unknown): string {
  const text = typeof value === 'string' && value.trim() ? value.trim() : 'server-error'
  return text.slice(0, MAX_ERROR_LENGTH)
}

export function createApi(options: ApiOptions = {}) {
  const url = 'url' in options ? options.url : APPS_SCRIPT_URL
  const fetchImpl: FetchLike = options.fetch ?? ((input, init) => fetch(input, init))
  const readTimeoutMs = options.readTimeoutMs ?? READ_TIMEOUT_MS
  const submitTimeoutMs = options.submitTimeoutMs ?? SUBMIT_TIMEOUT_MS

  async function request(
    makeRequest: (baseUrl: string) => [string, RequestInit],
    timeoutMs: number,
  ): Promise<ApiResult<{ body: JsonRecord }>> {
    if (!url) return { ok: false, error: 'not-configured' }
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)
    try {
      const [target, init] = makeRequest(url)
      const response = await fetchImpl(target, { ...init, signal: controller.signal })
      if (!response.ok) return { ok: false, error: `http-${response.status}` }
      let parsed: unknown
      try {
        parsed = JSON.parse(await response.text())
      } catch {
        return timedOut ? { ok: false, error: 'timeout' } : { ok: false, error: 'invalid-json' }
      }
      if (!isRecord(parsed)) return { ok: false, error: 'invalid-json' }
      if (parsed.ok !== true) return { ok: false, error: shortError(parsed.error) }
      return { ok: true, body: parsed }
    } catch {
      return { ok: false, error: timedOut ? 'timeout' : 'network' }
    } finally {
      clearTimeout(timer)
    }
  }

  function get(params: Record<string, string>, timeoutMs: number) {
    return request((base) => [`${base}?${new URLSearchParams(params).toString()}`, {}], timeoutMs)
  }

  function post(payload: JsonRecord, timeoutMs: number, extra: RequestInit = {}) {
    return request(
      (base) => [
        base,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          ...extra,
        },
      ],
      timeoutMs,
    )
  }

  async function fetchNames(): Promise<ApiResult<{ names: string[] }>> {
    const result = await get({ action: 'names' }, readTimeoutMs)
    if (!result.ok) return result
    const { names } = result.body
    if (!Array.isArray(names) || !names.every((n) => typeof n === 'string')) {
      return { ok: false, error: 'bad-response' }
    }
    return { ok: true, names }
  }

  async function fetchRemoteDraft(name: string, form: FormId): Promise<ApiResult<{ draft: Draft | null }>> {
    const result = await get({ action: 'draft', name, form }, readTimeoutMs)
    if (!result.ok) return result
    const { draft } = result.body
    if (!isRecord(draft) || typeof draft.json !== 'string') return { ok: true, draft: null }
    const parsed = parseDraftJson(draft.json)
    return { ok: true, draft: parsed && parsed.form === form ? parsed : null }
  }

  async function saveRemoteDraft(draft: Draft): Promise<ApiResult> {
    const result = await post(
      {
        action: 'saveDraft',
        form: draft.form,
        name: draft.name,
        savedAt: draft.savedAt,
        json: JSON.stringify(draft),
      },
      readTimeoutMs,
    )
    return result.ok ? { ok: true } : result
  }

  async function deleteRemoteDraft(name: string, form: FormId): Promise<ApiResult> {
    const result = await post({ action: 'deleteDraft', form, name }, readTimeoutMs)
    return result.ok ? { ok: true } : result
  }

  async function submitForm(form: FormId, name: string, header: string[], row: string[]): Promise<ApiResult> {
    const result = await post({ action: 'submit', form, name, header, row }, submitTimeoutMs)
    return result.ok ? { ok: true } : result
  }

  async function logEvents(name: string, events: TrackEvent[]): Promise<ApiResult> {
    const result = await post(
      { action: 'logEvents', name, header: EVENTS_HEADER, rows: events.map(eventRow) },
      readTimeoutMs,
      { keepalive: true },
    )
    return result.ok ? { ok: true } : result
  }

  return { fetchNames, fetchRemoteDraft, saveRemoteDraft, deleteRemoteDraft, submitForm, logEvents }
}

export const { fetchNames, fetchRemoteDraft, saveRemoteDraft, deleteRemoteDraft, submitForm, logEvents } = createApi()
