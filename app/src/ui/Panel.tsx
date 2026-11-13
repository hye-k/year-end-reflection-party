import type { CSSProperties, ReactNode } from 'react'

interface BoxProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export function Panel({ children, style, className = '' }: BoxProps) {
  return (
    <div className={`panel px-notch ${className}`} style={style}>
      {children}
    </div>
  )
}

export function Plate({ children, style, className = '' }: BoxProps) {
  return (
    <div className={`plate px-notch-thin ${className}`} style={style}>
      {children}
    </div>
  )
}
