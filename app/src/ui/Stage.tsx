import { useEffect, useState, type ReactNode } from 'react'
import { useVisualViewport } from './useVisualViewport'

// Keep in step with .stage in tokens.css.
const STAGE_W = 1280
const STAGE_H = 760

function useWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

export function Stage({ children }: { children: ReactNode }) {
  // The visible area, not 100vh: on iPadOS the toolbars come and go, and the two disagree.
  const { height, offsetTop } = useVisualViewport()
  const scale = Math.min(useWidth() / STAGE_W, height / STAGE_H)

  return (
    <div className="stage-viewport" style={{ top: offsetTop, height }}>
      <div className="stage" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}
