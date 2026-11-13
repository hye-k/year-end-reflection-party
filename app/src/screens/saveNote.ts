import type { SyncStatus } from '../data/useFormDraft'

function clock(iso: string | null): string {
  if (!iso) return '--:--'
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Three states a writer cares about: saving, saved (with the time of the latest save), or failed.
// Where the copy lives (this device or the server) is not their concern; autosave keeps the two within seconds.
export function saveNote(serverStatus: SyncStatus, serverSavedAt: string | null, localSavedAt: string | null): string {
  if (serverStatus === 'saving') return '저장 중…'
  if (serverStatus === 'error') return '저장 실패, 저장 버튼을 눌러 주세요'
  const latest = [serverSavedAt, localSavedAt].filter((at): at is string => at !== null).sort().pop() ?? null
  return latest ? `저장됨 ${clock(latest)}` : '아직 저장 전'
}
