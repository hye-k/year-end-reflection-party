export interface QuestSummaryProps {
  answered: number
  remaining: number
}

function Tile({ value, label, accent }: { value: number; label: string; accent: boolean }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px', background: accent ? 'var(--field)' : 'var(--panel-deep)', border: `4px solid ${accent ? 'var(--orange)' : 'var(--ink)'}` }}>
      <span className="display" style={{ fontSize: 36, lineHeight: 1.1 }}>{value}</span>
      <span style={{ color: 'var(--navy)' }}>{label}</span>
    </div>
  )
}

// How many quests are answered and how many are still open.
export function QuestSummary({ answered, remaining }: QuestSummaryProps) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Tile value={answered} label="답변한 퀘스트" accent={false} />
      <Tile value={remaining} label="남은 퀘스트" accent />
    </div>
  )
}
