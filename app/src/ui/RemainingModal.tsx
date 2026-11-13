import { useEffect } from 'react'
import { GoldButton } from './GoldButton'
import { Panel } from './Panel'
import { QuestSummary, type QuestSummaryProps } from './QuestSummary'

interface RemainingModalProps extends QuestSummaryProps {
  // Covers the browser window instead of the positioned parent (the desktop stage is its own fixed-size box).
  fixed: boolean
  compact: boolean
  onReturn: () => void
  onClose: () => void
}

// Shown when the writer tries to surface with quests still open.
export function RemainingModal({ answered, remaining, fixed, compact, onReturn, onClose }: RemainingModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: fixed ? 'fixed' : 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box', background: 'rgba(9,10,20,0.62)' }}
    >
      <Panel style={{ width: compact ? '100%' : 520, maxWidth: '100%', padding: compact ? '22px 20px 24px' : '28px 32px 32px', gap: 16 }}>
        <div role="dialog" aria-modal="true" aria-labelledby="remaining-title" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="label" style={{ color: 'var(--navy)' }}>SURFACE CHECK</div>
          <h2 id="remaining-title" style={{ margin: 0, fontWeight: 400, fontSize: compact ? 24 : 32, lineHeight: 1.3, wordBreak: 'keep-all' }}>아직 답하지 않은 퀘스트가 있어요</h2>
          <QuestSummary answered={answered} remaining={remaining} />
          <p className="panel-text" style={{ color: 'var(--navy)' }}>모든 퀘스트에 답해야 제출할 수 있어요.</p>
          <GoldButton autoFocus onClick={onReturn}>
            남은 퀘스트로 ◀
          </GoldButton>
        </div>
      </Panel>
    </div>
  )
}
