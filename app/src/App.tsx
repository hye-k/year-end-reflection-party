import { useEffect, useMemo, useState } from 'react'
import { REFLECTION_QUESTS } from './core/content'
import { emptyMandala, mandalaProgress, setValueAt } from './core/mandala'
import { emptyReflection, gaugeStates, setAnswer, skipQuest, validateSubmit, type Answer } from './core/reflection'
import { MANDALA_HEADER, REFLECTION_HEADER, mandalaRow, reflectionRow, restoreMandalaState, restoreReflectionState } from './core/serialize'
import { fetchNames } from './data/api'
import { loadLastName, loadLastStep, saveLastName, saveLastStep } from './data/localDrafts'
import { useFormDraft } from './data/useFormDraft'
import { ClearScreen } from './screens/ClearScreen'
import { DoneScreen } from './screens/DoneScreen'
import { MandalaScreen } from './screens/MandalaScreen'
import { QuestScreen } from './screens/QuestScreen'
import { TitleScreen } from './screens/TitleScreen'
import { saveNote } from './screens/saveNote'
import './ui/tokens.css'

type Screen = 'title' | 'quest' | 'clear' | 'mandala' | 'done'

const DEV_NAMES = ['이름 1', '이름 2', '이름 3', '이름 4', '이름 5', '이름 6', '이름 7', '이름 8']
const LAST = REFLECTION_QUESTS.length - 1
const RESUMABLE: Screen[] = ['quest', 'clear', 'mandala']

// Picks up where this browser left off, but only for the same person.
function resumePoint(): { screen: Screen; index: number } {
  const step = loadLastStep()
  const resumable = step !== null && step.name === loadLastName() && step.index >= 0 && step.index <= LAST
  const screen = RESUMABLE.find((s) => s === step?.screen)
  return resumable && screen ? { screen, index: step.index } : { screen: 'title', index: 0 }
}

export default function App() {
  const [resume] = useState(resumePoint)
  const [screen, setScreen] = useState<Screen>(resume.screen)
  const [name, setName] = useState(() => loadLastName() ?? '')
  const [names, setNames] = useState<string[] | null>(null)
  const [namesError, setNamesError] = useState(false)
  const [index, setIndex] = useState(resume.index)
  const [mandalaSubmitted, setMandalaSubmitted] = useState(false)
  const active = screen === 'title' ? null : name

  useEffect(() => {
    saveLastStep(screen === 'title' ? null : { name, screen, index })
  }, [screen, name, index])

  useEffect(() => {
    let cancelled = false
    void fetchNames().then((result) => {
      if (cancelled) return
      if (result.ok) setNames(result.names)
      else if (import.meta.env.DEV) setNames(DEV_NAMES)
      else setNamesError(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const reflection = useFormDraft({
    form: 'reflection',
    name: active,
    empty: emptyReflection,
    restore: restoreReflectionState,
    header: REFLECTION_HEADER,
    toRow: reflectionRow,
  })
  const mandala = useFormDraft({
    form: 'mandala',
    name: active,
    empty: emptyMandala,
    restore: restoreMandalaState,
    header: MANDALA_HEADER,
    toRow: mandalaRow,
  })

  const validation = useMemo(() => validateSubmit(reflection.state), [reflection.state])
  const unanswered = useMemo(() => new Set([...validation.missingRequired, ...validation.skipped]), [validation])
  const firstUnanswered = () => REFLECTION_QUESTS.findIndex((q) => unanswered.has(q.id))

  const start = () => {
    saveLastName(name)
    setScreen('quest')
  }

  if (screen === 'title') {
    return <TitleScreen names={names} namesError={namesError} selected={name} onSelect={setName} onStart={start} />
  }

  if (!reflection.ready || !mandala.ready) {
    return <div style={{ padding: 24, color: '#ebede9' }}>불러오는 중…</div>
  }

  const save = (form: typeof reflection | typeof mandala) => void form.saveToServer()

  if (screen === 'quest') {
    const quest = REFLECTION_QUESTS[index]
    const go = (to: number) => {
      if (to === index) return
      reflection.update((prev) => skipQuest(prev, quest.id))
      setIndex(Math.min(LAST, Math.max(0, to)))
    }
    return (
      <QuestScreen
        quest={quest}
        index={index}
        total={REFLECTION_QUESTS.length}
        answer={reflection.state.answers[quest.id]}
        gauge={gaugeStates(reflection.state, index)}
        playerName={name}
        saveNote={saveNote(reflection.serverStatus, reflection.serverSavedAt, reflection.localSavedAt)}
        isLast={index === LAST}
        remaining={{ answered: REFLECTION_QUESTS.length - unanswered.size, count: unanswered.size, first: firstUnanswered() }}
        submitting={reflection.submitStatus === 'submitting'}
        submitError={reflection.submitStatus === 'error'}
        onFinish={async () => {
          if (await reflection.submit()) setScreen('clear')
        }}
        onChange={(next: Answer) => reflection.update((prev) => setAnswer(prev, quest.id, next))}
        onGo={go}
        onBack={() => (index > 0 ? go(index - 1) : setScreen('title'))}
        onSave={() => save(reflection)}
      />
    )
  }

  if (screen === 'clear') {
    // Only reachable with every quest answered; a stale resume point or an edited draft can land here without that.
    if (unanswered.size > 0) {
      setIndex(firstUnanswered())
      setScreen('quest')
      return null
    }
    return (
      <ClearScreen
        onBack={() => {
          setIndex(LAST)
          setScreen('quest')
        }}
        onNext={() => setScreen('mandala')}
      />
    )
  }

  if (screen === 'mandala') {
    return (
      <MandalaScreen
        state={mandala.state}
        progress={mandalaProgress(mandala.state)}
        saveNote={saveNote(mandala.serverStatus, mandala.serverSavedAt, mandala.localSavedAt)}
        submitStatus={mandala.submitStatus}
        onSetCell={(block, cell, value) => mandala.update((prev) => setValueAt(prev, block, cell, value))}
        onSubmit={async () => {
          if (await mandala.submit()) {
            setMandalaSubmitted(true)
            setScreen('done')
          }
        }}
        onSkip={() => {
          setMandalaSubmitted(false)
          setScreen('done')
        }}
        onBack={() => setScreen('clear')}
        onSave={() => save(mandala)}
      />
    )
  }

  return (
    <DoneScreen
      playerName={name}
      mandalaSubmitted={mandalaSubmitted}
      onHome={() => {
        setIndex(0)
        setScreen('title')
      }}
    />
  )
}
