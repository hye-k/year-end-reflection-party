# data

Browser data layer: Apps Script client, localStorage drafts, and the draft/submit hook.

- `config.ts`: `APPS_SCRIPT_URL` (from `VITE_APPS_SCRIPT_URL`, `undefined` when unset).
- `api.ts`: `fetchNames`, `fetchRemoteDraft`, `saveRemoteDraft`, `deleteRemoteDraft`, `submitForm` (never throw, return `ApiResult`); `createApi({url, fetch, readTimeoutMs, submitTimeoutMs})` for injection.
- `localDrafts.ts`: `loadLocalDraft`, `saveLocalDraft`, `clearLocalDraft`, `loadLastName`, `saveLastName` (storage-failure safe, optional injected `StorageLike`).
- `useFormDraft.ts`: `useFormDraft` hook (local save 0.5 s after an edit, server autosave 20 s after the first unsaved edit) plus `SyncStatus`, `SubmitStatus` types.
- `useFormDraft.logic.ts`: pure helpers `shouldApplyRemote`, `createDebouncer`, `createInFlightGuard`.
