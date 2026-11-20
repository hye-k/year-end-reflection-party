# data

Browser data layer: Apps Script client, localStorage drafts, and the draft/submit hook.

- `config.ts`: `APPS_SCRIPT_URL` (from `VITE_APPS_SCRIPT_URL`, `undefined` when unset).
- `api.ts`: `fetchNames`, `fetchRemoteDraft`, `saveRemoteDraft`, `deleteRemoteDraft`, `submitForm`, `logEvents` (never throw, return `ApiResult`); `createApi({url, fetch, readTimeoutMs, submitTimeoutMs})` for injection.
- `localDrafts.ts`: `loadLocalDraft`, `saveLocalDraft`, `clearLocalDraft`, `loadLastName`, `saveLastName` (storage-failure safe, optional injected `StorageLike`).
- `eventBuffer.ts`: localStorage buffer of usage events per name (`ydp:v1:events:<name>`, capped).
- `eventLog.ts`: `recordEvent` (buffers an event) and `flushEvents` (sends the buffer through `logEvents`; best effort, one send in flight per name).
- `useFormDraft.ts`: `useFormDraft` hook (local save 0.5 s after an edit, server autosave 20 s after the first unsaved edit) plus `SyncStatus`, `SubmitStatus` types.
- `useFormDraft.logic.ts`: pure helpers `shouldApplyRemote`, `createDebouncer`, `createInFlightGuard`.
