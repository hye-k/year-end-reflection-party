import { useRef, useState } from 'react'
import { clampGraphemes } from '../core/text'
import {
  MANDALA_CELL_LIMIT,
  cellAt,
  getValueAt,
  type MandalaCell,
  type MandalaProgress,
  type MandalaState,
} from '../core/mandala'
import { loadTourSeen, saveTourSeen } from '../data/localDrafts'
import { ACTION } from '../ui/actionLabels'
import { GoldButton } from '../ui/GoldButton'
import { BackButton, HelpButton, SaveButton } from '../ui/HeaderButtons'
import { MandalaCellInput } from '../ui/MandalaCell'
import { OnboardingTour, type TourStep } from '../ui/OnboardingTour'
import { Panel, Plate } from '../ui/Panel'
import { MobileShell } from '../ui/MobileShell'
import { Stage } from '../ui/Stage'
import { MobileSkyBackdrop } from '../ui/scenes/MobileSkyBackdrop'
import { MorningScene } from '../ui/scenes/MorningScene'
import { useVisualViewport } from '../ui/useVisualViewport'
import { useIsMobile } from '../ui/useLayout'

export type SubmitStatus = 'idle' | 'submitting' | 'submitted' | 'error'

export interface MandalaScreenProps {
  state: MandalaState
  progress: MandalaProgress
  saveNote: string
  submitStatus: SubmitStatus
  onSetCell: (block: number, cell: number, value: string) => void
  onSubmit: () => void
  onSkip: () => void // leave the bonus stage without submitting
  onBack: () => void
  onSave: () => void
}

const BLOCKS = Array.from({ length: 9 }, (_, i) => i)
const CELLS = Array.from({ length: 9 }, (_, i) => i)

function cellLabel(cell: MandalaCell, block: number, index: number): string {
  if (cell.kind === 'goal') return '2027 목표'
  if (cell.kind === 'theme') return `스테이지 ${cell.theme + 1} 이름`
  return `${block + 1}번 블록 ${index + 1}번 칸`
}

function focusNext(from: HTMLTextAreaElement) {
  const all = Array.from(document.querySelectorAll<HTMLTextAreaElement>('textarea[data-mandala-cell]'))
  const at = all.indexOf(from)
  all[(at + 1) % all.length]?.focus()
}

function submitMessage(props: MandalaScreenProps): string {
  if (props.submitStatus === 'error') return '제출하지 못했어요. 다시 눌러 주세요.'
  return props.progress.filled === props.progress.total ? '모두 채웠어요! 제출해 볼까요?' : ''
}

// Submit needs at least one cell written; every other cell is optional, and skipping leaves the stage without submitting.
function Actions({ props }: { props: MandalaScreenProps }) {
  const busy = props.submitStatus === 'submitting'
  const message = submitMessage(props)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <GoldButton data-tour="submit" disabled={busy || props.progress.filled === 0} onClick={props.onSubmit}>
          {busy ? ACTION.submitting : ACTION.submit}
        </GoldButton>
        <button type="button" className="link-btn" disabled={busy} onClick={props.onSkip}>건너뛰기</button>
      </div>
      {message && <span role={props.submitStatus === 'error' ? 'alert' : undefined} style={{ lineHeight: 1.4, wordBreak: 'keep-all' }}>{message}</span>}
    </div>
  )
}

// Which part of the board each tour step lights up. The wording says the same on both layouts except where the layout differs.
const mandalaTourSteps = (mobile: boolean): TourStep[] => [
  {
    target: 'grid',
    title: '적고 싶은 만큼만 적어요',
    body: `${mobile ? '블록을 누르면 크게 열려요. ' : ''}가운데 칸에 내년의 큰 목표를, 그 둘레 8칸에 작은 목표를, 나머지 칸에 작은 목표마다 이룰 일을 적어요. 비워 둬도 괜찮아요.`,
    placement: mobile ? 'below' : 'left',
  },
  {
    target: 'center',
    title: '가운데 블록은 바깥과 이어져 있어요',
    body: '가운데 블록의 작은 목표 칸은 화살표가 가리키는 바깥 블록의 가운데 칸과 같은 칸이에요. 한쪽에 쓰면 다른 쪽에도 나타나요.',
    placement: mobile ? 'below' : 'left',
  },
  { target: 'submit', title: '제출하거나 건너뛰어요', body: '한 칸이라도 적으면 SUBMIT!으로 제출할 수 있어요. 보너스니까 건너뛰어도 괜찮아요.', placement: 'above' },
]

const CELL_PX = 56
const CELL_GAP = 3
const BLOCK_PX = CELL_PX * 3 + CELL_GAP * 2
const BLOCK_GAP = 18
const GRID_PAD = 14
const GRID_PX = BLOCK_PX * 3 + BLOCK_GAP * 2 + GRID_PAD * 2
const SIDE_MARGIN = 60
const PANEL_GRID_GAP = 50
const INFO_PANEL_PX = 1280 - SIDE_MARGIN * 2 - GRID_PX - PANEL_GRID_GAP
const ARROW_PX = 16

const NEIGHBOURS = [-1, 0, 1].flatMap((dr) => [-1, 0, 1].map((dc) => ({ dr, dc }))).filter(({ dr, dc }) => dr !== 0 || dc !== 0)

// Points from a stage name in the centre block to the same name in the outer block.
function StageArrow({ dr, dc }: { dr: number; dc: number }) {
  const centre = BLOCK_PX + BLOCK_GAP
  const at = (d: number) => (d < 0 ? centre - BLOCK_GAP / 2 : d > 0 ? centre + BLOCK_PX + BLOCK_GAP / 2 : centre + BLOCK_PX / 2)
  const angle = (Math.atan2(dc, -dr) * 180) / Math.PI
  return (
    <svg
      aria-hidden="true"
      width={ARROW_PX}
      height={ARROW_PX}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      style={{ position: 'absolute', left: at(dc) - ARROW_PX / 2, top: at(dr) - ARROW_PX / 2, transform: `rotate(${angle}deg)`, pointerEvents: 'none' }}
    >
      <g fill="var(--navy)">
        <rect x="3" y="0" width="2" height="1" />
        <rect x="2" y="1" width="4" height="1" />
        <rect x="1" y="2" width="6" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="2" y="4" width="4" height="4" />
      </g>
    </svg>
  )
}

function DesktopGrid({ props }: { props: MandalaScreenProps }) {
  return (
    <Plate style={{ position: 'absolute', right: SIDE_MARGIN, top: 90, padding: GRID_PAD, alignItems: 'stretch', boxShadow: '0 -4px 0 0 var(--ink), 0 4px 0 0 var(--ink), -4px 0 0 0 var(--ink), 4px 0 0 0 var(--ink), 0 10px 0 0 rgba(9,10,20,0.45)' }}>
      <div data-tour="grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: BLOCK_GAP }}>
        {BLOCKS.map((block) => (
          <div key={block} data-tour={block === 4 ? 'center' : undefined} style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${CELL_PX}px)`, gap: CELL_GAP }}>
            {CELLS.map((index) => {
              const cell = cellAt(block, index)
              return (
                <MandalaCellInput
                  key={index}
                  cell={cell}
                  value={getValueAt(props.state, block, index)}
                  size={CELL_PX}
                  label={cellLabel(cell, block, index)}
                  onChange={(v) => props.onSetCell(block, index, v)}
                  onEnter={focusNext}
                />
              )
            })}
          </div>
        ))}
        {NEIGHBOURS.map(({ dr, dc }) => (
          <StageArrow key={`${dr}${dc}`} dr={dr} dc={dc} />
        ))}
      </div>
    </Plate>
  )
}

function Legend() {
  const item = (style: object, text: string) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 16, height: 16, flex: 'none', boxSizing: 'border-box', display: 'inline-block', ...style }} />
      {text}
    </span>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, lineHeight: 1.3 }}>
      {item({ background: 'var(--gold)', border: '3px solid var(--ink)' }, '내년의 큰 목표')}
      {item({ background: 'var(--stage)', border: '3px solid var(--ink)' }, '큰 목표를 위한 작은 목표')}
      {item({ background: 'var(--field)', border: '3px solid var(--ink)' }, '작은 목표마다 이룰 일')}
    </div>
  )
}

function Desktop({ props, onHelp }: { props: MandalaScreenProps; onHelp: () => void }) {
  return (
    <Stage>
      <MorningScene />
      <BackButton size={40} style={{ position: 'absolute', left: 60, top: 32, zIndex: 1 }} onClick={props.onBack} />
      <div style={{ position: 'absolute', right: 40, top: 32, zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span role="status" style={{ color: 'var(--ink)' }}>{props.saveNote}</span>
        <HelpButton size={40} onClick={onHelp} />
        <SaveButton size={40} onClick={props.onSave} />
      </div>
      <div style={{ position: 'absolute', left: SIDE_MARGIN, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <Panel style={{ width: INFO_PANEL_PX, padding: '24px 30px 28px', gap: 14 }}>
          <div className="label" style={{ color: 'var(--navy)' }}>BONUS STAGE · SEASON PLAN</div>
          <h1 style={{ margin: 0, fontWeight: 400, fontSize: 48, lineHeight: 1.2 }}>2027 시즌<br />훈련표</h1>
          <p className="panel-text">올해를 잘 돌아봤으니 보너스로 새해 목표를 세워봐요! <br/>최대 {MANDALA_CELL_LIMIT}자까지, 적고 싶은 칸만 적어도 돼요.</p>
          <Legend />
          <Actions props={props} />
        </Panel>
      </div>
      <DesktopGrid props={props} />
    </Stage>
  )
}

const MAP_GAP = 12
const MAP_ARROW_PX = 12
const MAP_PREVIEW_CHARS = 2

const mapSlot = (d: number) =>
  d < 0 ? `calc((100% - ${MAP_GAP * 2}px) / 3 + ${MAP_GAP / 2}px)` : d > 0 ? `calc((100% - ${MAP_GAP * 2}px) / 3 * 2 + ${MAP_GAP * 1.5}px)` : '50%'

function MapArrow({ dr, dc }: { dr: number; dc: number }) {
  const angle = (Math.atan2(dc, -dr) * 180) / Math.PI
  return (
    <svg
      aria-hidden="true"
      width={MAP_ARROW_PX}
      height={MAP_ARROW_PX}
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      style={{ position: 'absolute', left: mapSlot(dc), top: mapSlot(dr), transform: `translate(-50%, -50%) rotate(${angle}deg)`, pointerEvents: 'none' }}
    >
      <g fill="var(--navy)">
        <rect x="3" y="0" width="2" height="1" />
        <rect x="2" y="1" width="4" height="1" />
        <rect x="1" y="2" width="6" height="1" />
        <rect x="0" y="3" width="8" height="1" />
        <rect x="2" y="4" width="4" height="4" />
      </g>
    </svg>
  )
}

function MapCell({ cell, value }: { cell: MandalaCell; value: string }) {
  const filled = value.trim() !== ''
  const base = cell.kind === 'goal' ? 'var(--gold)' : cell.kind === 'theme' ? 'var(--stage)' : filled ? 'var(--navy)' : 'var(--field)'
  const ink = cell.kind === 'action' && filled ? 'var(--field)' : 'var(--ink)'
  return (
    <span
      style={{
        aspectRatio: '1',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: base,
        color: ink,
        border: '2px solid var(--ink)',
        fontSize: 12,
        lineHeight: 1,
        opacity: cell.kind !== 'action' && !filled ? 0.6 : 1,
      }}
    >
      {clampGraphemes(value.trim(), MAP_PREVIEW_CHARS)}
    </span>
  )
}

function blockTitle(props: MandalaScreenProps, block: number): string {
  if (block === 4) return '목표와 스테이지'
  const cell = cellAt(block, 4)
  const theme = cell.kind === 'theme' ? props.state.themes[cell.theme] : ''
  return theme || '이름 없는 스테이지'
}

function MobileMap({ props, onOpen }: { props: MandalaScreenProps; onOpen: (block: number) => void }) {
  return (
    <div data-tour="grid" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: MAP_GAP }}>
      {BLOCKS.map((block) => (
        <button
          key={block}
          type="button"
          data-tour={block === 4 ? 'center' : undefined}
          aria-label={`${block + 1}번 블록 입력하기`}
          onClick={() => onOpen(block)}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 0, border: 0, background: 'none', cursor: 'pointer', minWidth: 0 }}
        >
          {CELLS.map((index) => (
            <MapCell key={index} cell={cellAt(block, index)} value={getValueAt(props.state, block, index)} />
          ))}
        </button>
      ))}
      {NEIGHBOURS.map(({ dr, dc }) => (
        <MapArrow key={`${dr}${dc}`} dr={dr} dc={dc} />
      ))}
    </div>
  )
}

function BlockSheet({ props, block, onChange, onClose }: { props: MandalaScreenProps; block: number; onChange: (block: number) => void; onClose: () => void }) {
  const { height, offsetTop } = useVisualViewport()
  const refs = useRef<(HTMLTextAreaElement | null)[]>([])
  const step = (d: number) => onChange((block + d + 9) % 9)
  const arrow = (label: string, d: number, aria: string) => (
    <button type="button" aria-label={aria} className="btn-gold px-notch-thin" style={{ width: 44, height: 36, fontSize: 24, background: 'var(--field)' }} onClick={() => step(d)}>
      {label}
    </button>
  )
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${block + 1}번 블록`}
      style={{ position: 'fixed', left: 0, right: 0, top: offsetTop, height, zIndex: 10, overflowY: 'auto', boxSizing: 'border-box', padding: '16px max(16px, env(safe-area-inset-right)) 24px max(16px, env(safe-area-inset-left))', background: 'rgba(9,10,20,0.62)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Panel className="mandala-sheet" style={{ padding: 14, gap: 10, alignItems: 'center' }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          {arrow('◀', -1, '이전 블록')}
          <span className="display" style={{ fontSize: 20, textAlign: 'center', minWidth: 0, wordBreak: 'keep-all' }}>{block + 1}/9 · {blockTitle(props, block)}</span>
          {arrow('▶', 1, '다음 블록')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: 8 }}>
          {CELLS.map((index) => {
            const cell = cellAt(block, index)
            return (
              <MandalaCellInput
                key={`${block}-${index}`}
                forwardRef={(el) => { refs.current[index] = el }}
                cell={cell}
                value={getValueAt(props.state, block, index)}
                size={100}
                label={cellLabel(cell, block, index)}
                onChange={(v) => props.onSetCell(block, index, v)}
                onEnter={(el) => refs.current[(refs.current.indexOf(el) + 1) % 9]?.focus()}
              />
            )
          })}
        </div>
        <GoldButton block onClick={onClose}>
          {ACTION.confirm}
        </GoldButton>
      </Panel>
    </div>
  )
}

function Mobile({ props, open, setOpen, onHelp }: { props: MandalaScreenProps; open: number | null; setOpen: (block: number | null) => void; onHelp: () => void }) {
  return (
    <MobileShell scene={<MobileSkyBackdrop variant="morning" />}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <BackButton size={40} onClick={props.onBack} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--ink)' }}>
          <span role="status">{props.saveNote}</span>
          <HelpButton size={40} onClick={onHelp} />
          <SaveButton size={40} onClick={props.onSave} />
        </div>
      </div>
      <Panel style={{ padding: '20px 20px 22px', gap: 10 }}>
        <div className="label" style={{ color: 'var(--navy)' }}>BONUS STAGE · SEASON PLAN</div>
        <h1 style={{ margin: 0, fontWeight: 400, fontSize: 36, lineHeight: 1.2 }}>2027 시즌 훈련표</h1>
        <p className="panel-text">
          올해를 잘 돌아봤으니 보너스로 새해 목표를 세워봐요! <br/> 최대 9자까지, 적고 싶은 칸만 적어도 돼요.
        </p>
      </Panel>
      <Panel style={{ padding: 14, gap: 12 }}>
        <Legend />
        <span style={{ color: 'var(--navy)' }}>블록을 누르면 크게 열려요</span>
        <MobileMap props={props} onOpen={setOpen} />
      </Panel>
      <Actions props={props} />
      {open !== null && <BlockSheet props={props} block={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </MobileShell>
  )
}

export function MandalaScreen(props: MandalaScreenProps) {
  const mobile = useIsMobile()
  const [open, setOpen] = useState<number | null>(null)
  const [touring, setTouring] = useState(() => !loadTourSeen('mandala'))
  const closeTour = () => {
    saveTourSeen('mandala')
    setTouring(false)
  }
  const tour = touring ? <OnboardingTour steps={mandalaTourSteps(mobile)} onClose={closeTour} docked={mobile} /> : null

  return (
    <>
      {mobile ? (
        <Mobile props={props} open={open} setOpen={setOpen} onHelp={() => setTouring(true)} />
      ) : (
        <Desktop props={props} onHelp={() => setTouring(true)} />
      )}
      {tour}
    </>
  )
}
