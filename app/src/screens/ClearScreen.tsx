import { ACTION } from '../ui/actionLabels'
import { Confetti } from '../ui/Confetti'
import { GoldButton } from '../ui/GoldButton'
import { Panel } from '../ui/Panel'
import { BackButton } from '../ui/HeaderButtons'
import { MobileShell } from '../ui/MobileShell'
import { Stage } from '../ui/Stage'
import { MobileSkyBackdrop } from '../ui/scenes/MobileSkyBackdrop'
import { SunsetScene } from '../ui/scenes/SunsetScene'
import { useIsMobile } from '../ui/useLayout'

export interface ClearScreenProps {
  onNext: () => void
  onBack: () => void
}

function Body({ props, mobile }: { props: ClearScreenProps; mobile: boolean }) {
  return (
    <>
      <div className="label" style={{ color: 'var(--navy)' }}>STAGE CLEAR · NEW PB</div>
      <h1 style={{ margin: 0, fontWeight: 400, fontSize: mobile ? 36 : 48, lineHeight: 1.25 }}>올해의 PB 갱신!<br />회복호흡 하세요.</h1>
      <p className="panel-text">
        생각처럼 풀렸든 아니든, 올해를 잘 보내고 오늘까지 온 것 자체가 기록이에요. PB를 축하해요! <br/>다음은 보너스 스테이지예요. 건너뛰어도 괜찮아요.
      </p>
      <div>
        <GoldButton onClick={props.onNext}>{ACTION.bonus}</GoldButton>
      </div>
    </>
  )
}

export function ClearScreen(props: ClearScreenProps) {
  const mobile = useIsMobile()
  if (mobile) {
    return (
      <MobileShell scene={<MobileSkyBackdrop variant="sunset" />}>
        <BackButton size={40} style={{ alignSelf: 'flex-start' }} onClick={props.onBack} />
        <Panel style={{ padding: '24px 20px 26px', gap: 16 }}>
          <Body props={props} mobile />
        </Panel>
        <Confetti fixed />
      </MobileShell>
    )
  }
  return (
    <Stage>
      <SunsetScene />
      <BackButton style={{ position: 'absolute', left: 80, top: 32 }} onClick={props.onBack} />
      <div style={{ position: 'absolute', left: 80, right: 80, top: 84, bottom: 0, display: 'flex', alignItems: 'center' }}>
        <Panel style={{ width: 520, padding: '28px 32px 32px', gap: 18 }}>
          <Body props={props} mobile={false} />
        </Panel>
      </div>
      <Confetti />
    </Stage>
  )
}
