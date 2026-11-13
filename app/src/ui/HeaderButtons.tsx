import type { CSSProperties } from 'react'

interface HeaderButtonProps {
  onClick: () => void
  size?: number
  style?: CSSProperties
  tour?: string // data-tour id, for the onboarding tour
}

const INK = 'var(--ink)'
const FIELD = 'var(--field)'

// 12x12 pixel floppy disk, drawn at 2x.
function DiskIcon() {
  return (
    <svg aria-hidden="true" width={24} height={24} viewBox="0 0 12 12" shapeRendering="crispEdges">
      <g fill={INK}>
        <rect x="0" y="0" width="9" height="1" />
        <rect x="0" y="1" width="10" height="1" />
        <rect x="0" y="2" width="11" height="1" />
        <rect x="0" y="3" width="12" height="9" />
      </g>
      <rect x="3" y="0" width="5" height="4" fill={FIELD} />
      <rect x="6" y="1" width="1" height="2" fill={INK} />
      <rect x="2" y="6" width="8" height="5" fill={FIELD} />
      <rect x="3" y="8" width="6" height="1" fill={INK} />
    </svg>
  )
}

export function BackButton({ onClick, size = 44, style, tour }: HeaderButtonProps) {
  return (
    <button type="button" data-tour={tour} aria-label="이전 화면" title="이전 화면" className="btn-gold px-notch-thin" style={{ width: size, height: size, fontSize: 24, background: 'var(--panel-deep)', ...style }} onClick={onClick}>
      &lt;
    </button>
  )
}

export function SaveButton({ onClick, size = 44, style, tour }: HeaderButtonProps) {
  return (
    <button type="button" data-tour={tour} aria-label="서버에 저장" title="서버에 저장" className="btn-gold px-notch-thin" style={{ width: size, height: size, background: 'var(--panel-deep)', ...style }} onClick={onClick}>
      <DiskIcon />
    </button>
  )
}

export function HelpButton({ onClick, size = 44, style, tour }: HeaderButtonProps) {
  return (
    <button type="button" data-tour={tour} aria-label="사용법 보기" title="사용법 보기" className="btn-gold px-notch-thin" style={{ width: size, height: size, fontSize: 24, background: 'var(--panel-deep)', ...style }} onClick={onClick}>
      ?
    </button>
  )
}
