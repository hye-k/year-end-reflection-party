import { useState } from 'react'
import { ACTION } from '../ui/actionLabels'
import { GoldButton } from '../ui/GoldButton'
import { Panel } from '../ui/Panel'
import { Stage } from '../ui/Stage'
import { BeachTitleScene } from '../ui/scenes/BeachTitleScene'
import { MobileBackdrop } from '../ui/scenes/MobileBackdrop'
import { MobileShell } from '../ui/MobileShell'
import { useIsMobile } from '../ui/useLayout'

export interface TitleScreenProps {
  names: string[] | null
  namesError: boolean
  selected: string
  onSelect: (name: string) => void
  onStart: () => void
}

function Selector({ props, mobile }: { props: TitleScreenProps; mobile: boolean }) {
  const [touched, setTouched] = useState(false)
  const missing = touched && !props.selected
  const start = () => {
    setTouched(true)
    if (props.selected) props.onStart()
  }
  return (
    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: mobile ? 'stretch' : 'flex-end', gap: mobile ? 14 : 20 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: mobile ? undefined : 'none' }}>
        <span className="label">SELECT PLAYER</span>
        <select
          className="field field-select"
          value={props.selected}
          disabled={!props.names}
          style={{ width: mobile ? '100%' : 320, height: mobile ? 52 : 60, padding: '0 14px', fontSize: mobile ? 16 : 24, boxShadow: missing ? '0 0 0 4px var(--orange)' : undefined }}
          onChange={(e) => props.onSelect(e.target.value)}
        >
          <option value="">{props.names ? '이름을 골라 주세요' : props.namesError ? '이름 목록을 못 불러왔어요' : '불러오는 중…'}</option>
          {(props.names ?? []).map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </label>
      <GoldButton block={mobile} onClick={start}>
        {ACTION.start}
      </GoldButton>
      {missing && <span role="alert" style={{ color: '#a64a1a' }}>이름을 먼저 골라 주세요.</span>}
    </div>
  )
}

export function TitleScreen(props: TitleScreenProps) {
  const mobile = useIsMobile()
  const panelText = "질문에 답하면서 올해를 돌아봐요. 쉬운 것부터, 점점 깊게."

  if (mobile) {
    return (
      <MobileShell scene={<MobileBackdrop variant="title" />} style={{ justifyContent: 'center' }}>
        <Panel style={{ padding: '24px 20px 26px', gap: 16 }}>
          <div className="label" style={{ color: 'var(--navy)' }}>STAGE 0 · SURFACE · 0M</div>
          <h1 style={{ margin: 0, fontWeight: 400, fontSize: 36, lineHeight: 1.25 }}>2026 다이브 로그<br />입수 준비 완료?</h1>
          <p className="panel-text">{panelText}</p>
          <Selector props={props} mobile />
        </Panel>
      </MobileShell>
    )
  }
  return (
    <Stage>
      <BeachTitleScene />
      <div style={{ position: 'absolute', left: 56, top: 32 }}>PLAYER 1</div>
      <Panel style={{ position: 'absolute', left: 80, top: 250, width: 700, padding: '32px 36px 36px', gap: 22 }}>
        <div className="label" style={{ color: 'var(--navy)' }}>STAGE 0 · SURFACE · 0M</div>
        <h1 style={{ margin: 0, fontWeight: 400, fontSize: 60, lineHeight: 1.2 }}>2026 다이브 로그<br />입수 준비 완료?</h1>
        <p className="panel-text">{panelText}</p>
        <Selector props={props} mobile={false} />
      </Panel>
    </Stage>
  )
}
