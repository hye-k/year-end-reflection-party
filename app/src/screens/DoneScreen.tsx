import { GoldButton } from '../ui/GoldButton'
import { Credits } from '../ui/Credits'
import { Panel } from '../ui/Panel'
import { MobileShell } from '../ui/MobileShell'
import { Stage } from '../ui/Stage'
import { MobileSkyBackdrop } from '../ui/scenes/MobileSkyBackdrop'
import { MorningScene } from '../ui/scenes/MorningScene'
import { useIsMobile } from '../ui/useLayout'

// Keeps the credits box tall enough to read even when the panel's text is short.
const CREDITS_MIN_HEIGHT = 400

interface DoneScreenProps {
  playerName: string
  mandalaSubmitted: boolean // false when the bonus stage was skipped
  onHome: () => void
}

function Body({ props, mobile }: { props: DoneScreenProps; mobile: boolean }) {
  return (
    <>
      <div className="label" style={{ color: 'var(--navy)' }}>SEASON 2027 · READY</div>
      <h1 style={{ margin: 0, fontWeight: 400, fontSize: mobile ? 36 : 48, lineHeight: 1.25 }}>수고했어요!<br />모임에서 만나요!</h1>
      <p className="panel-text">
        {props.mandalaSubmitted
          ? `${props.playerName} 님의 2026 다이브 로그와 2027 시즌 훈련표가 기록됐어요. 고치고 싶어지면 다시 제출해도 돼요.`
          : `${props.playerName} 님의 2026 다이브 로그가 기록됐어요. 보너스 스테이지는 건너뛰었어요. 마음이 바뀌면 처음부터 다시 들어와서 적어도 돼요.`}
      </p>
      <div>
        <GoldButton onClick={props.onHome}>처음으로 돌아가기 ◀</GoldButton>
      </div>
    </>
  )
}

export function DoneScreen(props: DoneScreenProps) {
  const mobile = useIsMobile()
  if (mobile) {
    return (
      <MobileShell scene={<MobileSkyBackdrop variant="morning" />} style={{ justifyContent: 'center' }}>
        <Panel style={{ padding: '24px 20px 26px', gap: 16 }}>
          <Body props={props} mobile />
        </Panel>
        <Credits style={{ height: 260, flex: 'none' }} />
      </MobileShell>
    )
  }
  return (
    <Stage>
      <MorningScene />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', gap: 40 }}>
          <Panel style={{ width: 520, minHeight: CREDITS_MIN_HEIGHT, padding: '28px 32px 32px', gap: 18 }}>
            <Body props={props} mobile={false} />
          </Panel>
          <Credits style={{ width: 520 }} />
        </div>
      </div>
    </Stage>
  )
}
