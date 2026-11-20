import { useCallback, useEffect, useRef, useState } from 'react'
import type { Tally } from '../core/events'
import { createDraft, type Draft, type FormId } from '../core/serialize'
import { fetchRemoteDraft, saveRemoteDraft, submitForm } from './api'
import { flushEvents, recordEvent } from './eventLog'
import { loadLocalDraft, saveLocalDraft } from './localDrafts'
import {
  createDebouncer,
  createInFlightGuard,
  shouldApplyRemote,
  type Debouncer,
  type InFlightGuard,
} from './useFormDraft.logic'

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'
export type SubmitStatus = 'idle' | 'submitting' | 'submitted' | 'error'

export interface UseFormDraftOptions<S> {
  form: FormId
  name: string | null
  empty: () => S
  restore: (data: unknown) => S
  header: string[]
  toRow: (state: S, name: string, now: Date) => string[]
  progress: (state: S) => Tally
}

export interface UseFormDraftResult<S> {
  state: S
  update: (fn: (prev: S) => S) => void
  ready: boolean
  localSavedAt: string | null
  serverStatus: SyncStatus
  serverSavedAt: string | null
  saveToServer: () => Promise<boolean>
  submitStatus: SubmitStatus
  submit: () => Promise<boolean>
}

const LOCAL_SAVE_DEBOUNCE_MS = 500
// Edits reach the server at most this long after the first unsaved one, however long the writer keeps typing.
// Nothing is scheduled without an edit, so an idle tab makes no calls.
const SERVER_AUTOSAVE_MS = 20_000

interface Store<S> {
  key: string | null
  state: S
  ready: boolean
  localSavedAt: string | null
  serverStatus: SyncStatus
  serverSavedAt: string | null
  submitStatus: SubmitStatus
}

interface Session {
  key: string
  name: string
  form: FormId
  cancelled: boolean
  edited: boolean
  serverDirty: boolean
  debouncer: Debouncer
  autosave: Debouncer
  saveGuard: InFlightGuard
  submitGuard: InFlightGuard
}

const sessionKey = (form: FormId, name: string) => `${form}\u0000${name}`

function freshStore<S>(key: string | null, state: S): Store<S> {
  return {
    key,
    state,
    ready: false,
    localSavedAt: null,
    serverStatus: 'idle',
    serverSavedAt: null,
    submitStatus: 'idle',
  }
}

// Usage logging is best effort and must never break saving or submitting.
function logEvent<S>(event: 'save' | 'submit', session: Session, options: UseFormDraftOptions<S>, state: S, now: Date) {
  try {
    recordEvent(event, session.name, session.form, options.progress(state), '', now)
  } catch {
    // ignored on purpose
  }
}

export function useFormDraft<S>(options: UseFormDraftOptions<S>): UseFormDraftResult<S> {
  const { form, name } = options
  const key = name === null ? null : sessionKey(form, name)

  const optionsRef = useRef(options)
  const sessionRef = useRef<Session | null>(null)
  const stateRef = useRef<S | null>(null)
  const saveToServerRef = useRef<() => Promise<boolean>>(() => Promise.resolve(false))
  const [store, setStore] = useState<Store<S>>(() => freshStore(null, options.empty()))

  useEffect(() => {
    optionsRef.current = options
  })

  useEffect(() => {
    if (name === null) return
    const current = optionsRef.current
    const sessionId = sessionKey(form, name)

    const setIfActive = (session: Session, change: (prev: Store<S>) => Store<S>) => {
      if (!session.cancelled) setStore((prev) => (prev.key === session.key ? change(prev) : prev))
    }

    const buildDraft = (): Draft => createDraft(form, name, stateRef.current, new Date())

    const persistLocal = (session: Session): Draft => {
      const draft = buildDraft()
      if (saveLocalDraft(draft)) setIfActive(session, (prev) => ({ ...prev, localSavedAt: draft.savedAt }))
      return draft
    }

    const session: Session = {
      key: sessionId,
      name,
      form,
      cancelled: false,
      edited: false,
      serverDirty: false,
      debouncer: createDebouncer(LOCAL_SAVE_DEBOUNCE_MS, () => persistLocal(session)),
      autosave: createDebouncer(SERVER_AUTOSAVE_MS, () => {
        if (session.serverDirty) void saveToServerRef.current()
      }),
      saveGuard: createInFlightGuard(),
      submitGuard: createInFlightGuard(),
    }
    sessionRef.current = session

    const localDraft = loadLocalDraft(name, form)
    const initial = localDraft ? current.restore(localDraft.data) : current.empty()
    stateRef.current = initial
    setStore({ ...freshStore(sessionId, initial), ready: true, localSavedAt: localDraft?.savedAt ?? null })

    void fetchRemoteDraft(name, form).then((result) => {
      if (session.cancelled || !result.ok) return
      if (!shouldApplyRemote(localDraft, result.draft, session.edited)) return
      const restored = optionsRef.current.restore(result.draft?.data)
      stateRef.current = restored
      setIfActive(session, (prev) => ({ ...prev, state: restored, serverSavedAt: result.draft?.savedAt ?? null }))
    })

    const flush = () => session.debouncer.flush()
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden') return
      flush()
      // Best effort: the tab may be about to close, so do not wait for the next autosave.
      if (session.serverDirty) void saveToServerRef.current()
      void flushEvents(name)
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', flush)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', flush)
      session.cancelled = true
      session.debouncer.flush()
      session.autosave.cancel()
      if (sessionRef.current === session) sessionRef.current = null
    }
  }, [form, name])

  const update = useCallback((fn: (prev: S) => S) => {
    const session = sessionRef.current
    if (!session || stateRef.current === null) return
    const next = fn(stateRef.current)
    stateRef.current = next
    session.edited = true
    setStore((prev) => (prev.key === session.key ? { ...prev, state: next } : prev))
    session.debouncer.schedule()
    session.serverDirty = true
    if (!session.autosave.isPending()) session.autosave.schedule()
  }, [])

  const saveToServer = useCallback((): Promise<boolean> => {
    const session = sessionRef.current
    if (!session) return Promise.resolve(false)
    return session.saveGuard.run(async () => {
      session.debouncer.cancel()
      session.serverDirty = false
      const draft = createDraft(session.form, session.name, stateRef.current, new Date())
      const savedLocally = saveLocalDraft(draft)
      const notify = (change: Partial<Store<S>>) => {
        if (!session.cancelled) setStore((prev) => (prev.key === session.key ? { ...prev, ...change } : prev))
      }
      notify({ serverStatus: 'saving', ...(savedLocally ? { localSavedAt: draft.savedAt } : {}) })
      const result = await saveRemoteDraft(draft)
      notify(result.ok ? { serverStatus: 'saved', serverSavedAt: draft.savedAt } : { serverStatus: 'error' })
      if (result.ok) logEvent('save', session, optionsRef.current, stateRef.current as S, new Date(draft.savedAt))
      void flushEvents(session.name)
      // A failure keeps the edits marked unsaved, but only the next edit (or the save button) tries again:
      // an idle tab left open offline must not keep calling the server.
      if (!result.ok) session.serverDirty = true
      return result.ok
    })
  }, [])

  useEffect(() => {
    saveToServerRef.current = saveToServer
  }, [saveToServer])

  const submit = useCallback((): Promise<boolean> => {
    const session = sessionRef.current
    if (!session) return Promise.resolve(false)
    const { header, toRow } = optionsRef.current
    return session.submitGuard.run(async () => {
      const notify = (submitStatus: SubmitStatus) => {
        if (!session.cancelled) {
          setStore((prev) => (prev.key === session.key ? { ...prev, submitStatus } : prev))
        }
      }
      notify('submitting')
      let row: string[]
      try {
        row = toRow(stateRef.current as S, session.name, new Date())
      } catch {
        notify('error')
        return false
      }
      const result = await submitForm(session.form, session.name, header, row)
      if (!result.ok) {
        notify('error')
        return false
      }
      // The submitted state stays as the draft so coming back restores it.
      session.debouncer.cancel()
      session.serverDirty = false
      const draft = createDraft(session.form, session.name, stateRef.current, new Date())
      saveLocalDraft(draft)
      void saveRemoteDraft(draft)
      logEvent('submit', session, optionsRef.current, stateRef.current as S, new Date())
      void flushEvents(session.name)
      notify('submitted')
      return true
    })
  }, [])

  if (store.key !== key) setStore(freshStore(key, options.empty()))

  return {
    state: store.state,
    update,
    ready: store.ready,
    localSavedAt: store.localSavedAt,
    serverStatus: store.serverStatus,
    serverSavedAt: store.serverSavedAt,
    saveToServer,
    submitStatus: store.submitStatus,
    submit,
  }
}
