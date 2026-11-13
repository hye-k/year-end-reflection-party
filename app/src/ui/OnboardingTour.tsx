import { useEffect, useLayoutEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { ACTION } from './actionLabels'
import { GoldButton } from './GoldButton'
import { Panel } from './Panel'

export interface TourStep {
  target: string | null // value of the element's data-tour attribute; null centres the card on a plain dim
  title: string
  body: string
  placement?: 'below' | 'above' | 'left'
  icon?: 'mouse'
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

const CARD_MAX_WIDTH = 340
const MARGIN = 16
const CARD_ROOM = 200 // enough height to keep a card below its target on screen
const GAP = 14
const SPOT_PAD = 6
const SCROLL_MARGIN = 24
const DOCK_RESERVE = 232 // room a docked card needs: up to about 215px of text and buttons plus its margin
const DIM = 'rgba(9, 10, 20, 0.75)'

// On a phone the target may be below the fold, and the dim covers the page so the writer cannot scroll to it.
// So the tour scrolls it into view itself, top edge first, leaving the bottom of the screen for the docked card.
function bringIntoView(el: Element | null) {
  if (!(el instanceof HTMLElement)) return
  el.style.scrollMarginTop = `${SCROLL_MARGIN}px`
  el.scrollIntoView({ block: 'start', inline: 'nearest' })
}

function targetBox(target: string | null, scroll: boolean): Box | null {
  const el = target ? document.querySelector(`[data-tour="${target}"]`) : null
  if (scroll) bringIntoView(el)
  const rect = el?.getBoundingClientRect()
  return rect && rect.width > 0 ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

function cardPosition(box: Box | null, placement: TourStep['placement'], width: number, view: { w: number; h: number }): CSSProperties {
  if (!box) return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  const centreX = box.left + box.width / 2
  if (placement === 'left') {
    return { left: clamp(box.left - SPOT_PAD - GAP - width, MARGIN, view.w - width - MARGIN), top: clamp(box.top, MARGIN, view.h - 220) }
  }
  const left = clamp(centreX - width / 2, MARGIN, view.w - width - MARGIN)
  if (placement === 'above') return { left, bottom: view.h - box.top + SPOT_PAD + GAP }
  return { left, top: Math.min(box.top + box.height + SPOT_PAD + GAP, view.h - CARD_ROOM) }
}

// On a phone the card is docked full width to the bottom edge of the screen, or to the top edge when the target
// (the last thing on the page, say) ends up in the part of the screen the bottom card would cover.
function dockedPosition(box: Box | null, view: { w: number; h: number }): CSSProperties {
  const side = { left: MARGIN, right: MARGIN }
  if (!box) return { ...side, top: '50%', transform: 'translateY(-50%)' }
  const lower = view.h - (box.top + box.height) < DOCK_RESERVE
  return lower ? { ...side, top: 'max(16px, env(safe-area-inset-top))' } : { ...side, bottom: 'max(16px, env(safe-area-inset-bottom))' }
}

// Dims the page, lights up one element at a time and explains it. Measures the real element on screen,
// so it works the same on the scaled desktop stage and on a phone (`docked`).
export function OnboardingTour({ steps, onClose, docked = false }: { steps: TourStep[]; onClose: () => void; docked?: boolean }) {
  const [index, setIndex] = useState(0)
  const [view, setView] = useState({ w: window.innerWidth, h: window.innerHeight })
  const [box, setBox] = useState<Box | null>(null)
  const step = steps[index]
  const last = index === steps.length - 1

  useLayoutEffect(() => {
    const measure = () => {
      setView({ w: window.innerWidth, h: window.innerHeight })
      setBox(targetBox(step.target, docked))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [step.target, docked])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const width = Math.min(CARD_MAX_WIDTH, view.w - MARGIN * 2)
  return (
    <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 40, background: box ? 'transparent' : DIM }}>
      {box && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: box.left - SPOT_PAD,
            top: box.top - SPOT_PAD,
            width: box.width + SPOT_PAD * 2,
            height: box.height + SPOT_PAD * 2,
            boxSizing: 'border-box',
            border: '4px solid var(--gold)',
            boxShadow: `0 0 0 9999px ${DIM}`,
            pointerEvents: 'none',
          }}
        />
      )}
      <Panel style={{ position: 'fixed', boxSizing: 'border-box', padding: docked ? '14px 16px 16px' : '18px 20px 20px', gap: 10, ...(docked ? dockedPosition(box, view) : { width, ...cardPosition(box, step.placement, width, view) }) }}>
        <div role="dialog" aria-modal="true" aria-labelledby="tour-title" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="label" style={{ color: 'var(--navy)' }}>GUIDE {index + 1}/{steps.length}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step.icon === 'mouse' && (
              <span className="scroll-mouse" aria-hidden="true">
                <span className="scroll-mouse-dot" />
              </span>
            )}
            <h2 id="tour-title" style={{ margin: 0, fontWeight: 400, fontSize: docked ? 20 : 22, lineHeight: 1.3, wordBreak: 'keep-all' }}>{step.title}</h2>
          </div>
          <p className="panel-text" style={{ color: 'var(--navy)' }}>{step.body}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
            {last ? <span /> : <button type="button" className="link-btn" onClick={onClose}>건너뛰기</button>}
            <GoldButton size="sm" autoFocus onClick={() => (last ? onClose() : setIndex(index + 1))}>
              {last ? ACTION.confirm : ACTION.nextStage}
            </GoldButton>
          </div>
        </div>
      </Panel>
    </div>
  )
}
