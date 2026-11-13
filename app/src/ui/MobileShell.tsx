import type { CSSProperties, ReactNode } from 'react'
import { useVisualViewport } from './useVisualViewport'

interface MobileShellProps {
  background?: string
  scene?: ReactNode
  children: ReactNode
  style?: CSSProperties
}

export function MobileShell({ background, scene, children, style }: MobileShellProps) {
  const { height, offsetTop } = useVisualViewport()
  return (
    <>
      {scene && (
        <div aria-hidden="true" className="mobile-scene" style={{ top: offsetTop, height }}>
          {scene}
        </div>
      )}
      <div className="mobile-shell" style={{ background: scene ? 'transparent' : background, top: offsetTop, height, ...style }}>
        {children}
      </div>
    </>
  )
}
