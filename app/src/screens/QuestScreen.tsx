import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import type { Quest, SectionName } from '../core/content'
import type { Answer } from '../core/reflection'
import { DepthGauge, type GaugeState } from '../ui/DepthGauge'
import { BackButton, HelpButton, SaveButton } from '../ui/HeaderButtons'
import { Panel } from '../ui/Panel'
import { QuestInput } from '../ui/QuestInput'
import { RemainingModal } from '../ui/RemainingModal'
import { ACTION } from '../ui/actionLabels'
import { GoldButton } from '../ui/GoldButton'
import { OnboardingTour, type TourStep } from '../ui/OnboardingTour'
import { loadTourSeen, saveTourSeen } from '../data/localDrafts'
import { Stage } from '../ui/Stage'
import { UnderwaterScene } from '../ui/scenes/UnderwaterScene'
import { MobileBackdrop } from '../ui/scenes/MobileBackdrop'
import { MobileStrip } from '../ui/scenes/MobileStrip'
import { MobileShell } from '../ui/MobileShell'
import { useFocusFlag } from '../ui/useFocusFlag'
import { useIsMobile } from '../ui/useLayout'
import { useWheelNav } from '../ui/useWheelNav'

const SECTION_EN: Record<SectionName, string> = {
  warmup: 'WARM-UP',
  people: 'PEOPLE',
  attempts: 'ATTEMPTS',
  self: 'SELF',
  brag: 'BRAG',
  finish: 'FINISH',
}

const HEADING_DESKTOP = 36
const HEADING_MOBILE = 24
const PANEL_MIN_HEIGHT = 470
// Leaves the back/save buttons above and the sea floor below clear; past this the answer field scrolls instead.
const PANEL_MAX_HEIGHT = 620

const TOUR_STEPS: TourStep[] = [
  { target: 'back', title: '이전 질문으로 돌아가요', body: '첫 질문에서는 시작 화면으로 돌아가요. 쓰던 내용은 그대로 남아요.' },
  { target: 'save', title: '직접 저장할 수도 있어요', body: '쓰는 동안 자동으로 저장되지만, 이 버튼으로 바로 서버에 저장할 수 있어요.' },
  { target: 'gauge', title: '수심계로 질문을 옮겨 다녀요', body: '칸을 누르면 그 질문으로 바로 가요. 답한 질문과 건너뛴 질문도 여기서 보여요.', placement: 'left' },
  { target: null, title: '스크롤로 질문을 넘겨요', body: '마우스 휠을 굴리면 다음 질문, 이전 질문으로 넘어가요.', icon: 'mouse' },
]
// The wheel step only makes sense with a mouse; touch tablets in landscape get the desktop layout without one.
const stepsFor = (mobile: boolean): TourStep[] => {
  const wheel = !mobile && window.matchMedia('(pointer: fine)').matches
  return TOUR_STEPS.filter((step) => step.icon !== 'mouse' || wheel).map((step) => (mobile && step.target === 'gauge' ? { ...step, placement: 'below' } : step))
}

export interface QuestScreenProps {
  quest: Quest
  index: number
  total: number
  answer: Answer | undefined
  gauge: GaugeState[]
  playerName: string
  saveNote: string
  isLast: boolean
  // Quests still unanswered, counted from the whole reflection (the current one included).
  remaining: { answered: number; count: number; first: number }
  submitting: boolean
  submitError: boolean
  onFinish: () => void // every quest is answered: save and surface
  onChange: (next: Answer) => void
  onGo: (to: number) => void
  onBack: () => void
  onSave: () => void
}

function Heading({ prompt, mobile }: { prompt: string; mobile: boolean }) {
  return (
    <h1 id="quest-prompt" style={{ margin: 0, fontWeight: 400, fontSize: mobile ? HEADING_MOBILE : HEADING_DESKTOP, lineHeight: 1.3, wordBreak: 'keep-all' }}>
      {prompt}
    </h1>
  )
}

function Hint({ text }: { text: string }) {
  return <p className="panel-text" style={{ color: 'var(--navy)' }}>{text}</p>
}

// Remounts per quest so the content slides in from the direction of travel.
function Swap({ id, dir, gap, children }: { id: string; dir: 1 | -1; gap: number; children: ReactNode }) {
  const style: CSSProperties = { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap }
  return (
    <div key={id} className={dir > 0 ? 'quest-swap-fwd' : 'quest-swap-back'} style={style}>
      {children}
    </div>
  )
}

export function QuestScreen(props: QuestScreenProps) {
  const mobile = useIsMobile()
  const [focused, setFocused] = useFocusFlag()
  const [view, setView] = useState<{ index: number; dir: 1 | -1 }>({ index: props.index, dir: 1 })
  if (view.index !== props.index) setView({ index: props.index, dir: props.index > view.index ? 1 : -1 })
  const { quest, index, total } = props
  const deep = quest.depthM >= 20
  const tag = `QUEST ${index + 1}/${total} · ${SECTION_EN[quest.section]}`
  const [touring, setTouring] = useState(() => !loadTourSeen('quest'))
  const closeTour = () => {
    saveTourSeen('quest')
    setTouring(false)
  }
  const [askingRemaining, setAskingRemaining] = useState(false)
  const finish = () => (props.remaining.count > 0 ? setAskingRemaining(true) : props.onFinish())
  const next = () => (props.isLast ? finish() : props.onGo(index + 1))
  const returnToRemaining = () => {
    setAskingRemaining(false)
    if (props.remaining.first >= 0) props.onGo(props.remaining.first)
  }

  // The field unmounts on navigation without a blur event, so clear the flag here.
  useEffect(() => setFocused(false), [quest.id, setFocused])

  useWheelNav(!mobile && !touring, (direction) => {
    if (direction < 0 && index > 0) props.onGo(index - 1)
    if (direction > 0 && index < total - 1) props.onGo(index + 1)
  })

  const input = (
    <QuestInput
      key={quest.id}
      quest={quest}
      playerName={props.playerName}
      value={props.answer}
      onChange={props.onChange}
      onFocusChange={setFocused}
      compact={mobile}
      tight={mobile && focused}
    />
  )
  const saveError = props.submitError ? (
    <span role="alert" style={{ color: '#a64a1a' }}>저장하지 못했어요. 다시 눌러 주세요.</span>
  ) : null
  const tour = touring ? <OnboardingTour steps={stepsFor(mobile)} onClose={closeTour} docked={mobile} /> : null
  const modal = askingRemaining ? (
    <RemainingModal answered={props.remaining.answered} remaining={props.remaining.count} fixed={mobile} compact={mobile} onReturn={returnToRemaining} onClose={() => setAskingRemaining(false)} />
  ) : null
  const nextButton = (
    <GoldButton block={mobile} disabled={props.submitting} onClick={next}>
      {props.submitting ? ACTION.submitting : props.isLast ? ACTION.submit : ACTION.next}
    </GoldButton>
  )

  if (mobile) {
    return (
      <>
      <MobileShell scene={<MobileBackdrop variant={deep ? 'deep' : 'shallow'} />}>
        {!focused && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <BackButton size={40} tour="back" onClick={props.onBack} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: deep ? '#a4dddb' : 'var(--ink)' }}>
              <span role="status">{props.saveNote}</span>
              <HelpButton size={40} onClick={() => setTouring(true)} />
              <SaveButton size={40} tour="save" onClick={props.onSave} />
            </div>
          </div>
        )}
        {!focused && <MobileStrip variant={deep ? 'deep' : 'shallow'} />}
        <Panel style={{ padding: focused ? '12px 16px 16px' : '16px 20px 22px', gap: focused ? 8 : 10, flex: '1 0 auto' }}>
          <div className="label" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--navy)' }}>
            <span>{tag}</span>
            <span>DEPTH {quest.depthM.toFixed(0)}M</span>
          </div>
          <div data-tour="gauge" style={{ margin: '0 -4px' }}>
            <DepthGauge inline states={props.gauge} onSelect={props.onGo} />
          </div>
          <Swap id={quest.id} dir={view.dir} gap={focused ? 8 : 12}>
            <div>
              <Heading prompt={quest.prompt} mobile />
              {!focused && <Hint text={quest.hint} />}
            </div>
            {input}
            {nextButton}
            {saveError}
          </Swap>
        </Panel>
        {modal}
      </MobileShell>
      {tour}
      </>
    )
  }

  const ink = deep ? '#a4dddb' : 'var(--ink)'
  return (
    <>
    <Stage>
      <UnderwaterScene variant={deep ? 'deep' : 'shallow'} />
      <div style={{ position: 'absolute', left: 80, right: 56, top: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackButton tour="back" onClick={props.onBack} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: ink }}>
          <span role="status">{props.saveNote}</span>
          <HelpButton onClick={() => setTouring(true)} />
          <SaveButton tour="save" onClick={props.onSave} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 80, right: 56, top: 84, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Panel style={{ width: 720, minHeight: PANEL_MIN_HEIGHT, maxHeight: PANEL_MAX_HEIGHT, padding: '30px 36px 32px' }}>
          <Swap id={quest.id} dir={view.dir} gap={18}>
            <div className="label" style={{ color: 'var(--navy)' }}>{tag}</div>
            <div>
              <Heading prompt={quest.prompt} mobile={false} />
              <Hint text={quest.hint} />
            </div>
            {input}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 'auto' }}>
              {nextButton}
              {saveError}
            </div>
          </Swap>
        </Panel>
        <div data-tour="gauge" style={{ display: 'flex' }}>
          <DepthGauge states={props.gauge} label={`DEPTH ${quest.depthM.toFixed(0)}M`} onSelect={props.onGo} />
        </div>
      </div>
      {modal}
    </Stage>
    {tour}
    </>
  )
}
