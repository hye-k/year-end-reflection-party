import type { ButtonHTMLAttributes } from 'react'
import { useIsMobile } from './useLayout'

interface GoldButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type'> {
  // `sm` is for buttons inside a small card (the tour); everything else is `md`.
  size?: 'md' | 'sm'
  // Fills the width of its container, as the main button does on a phone.
  block?: boolean
}

const SMALL = { height: 44, padding: '0 22px', fontSize: 20 } as const

// The one gold action button. Height and type size live here so no screen sets its own.
export function GoldButton({ size = 'md', block = false, style, children, ...rest }: GoldButtonProps) {
  const mobile = useIsMobile()
  const dims = size === 'sm' ? SMALL : { height: mobile ? 52 : 60, padding: '0 28px', fontSize: 24 }
  return (
    <button type="button" className="btn-gold px-notch-btn" style={{ ...dims, ...(block ? { width: '100%' } : null), ...style }} {...rest}>
      {children}
    </button>
  )
}
