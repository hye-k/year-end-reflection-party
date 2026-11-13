import { useEffect, useRef } from 'react'

const THRESHOLD = 40
const IDLE_GAP_MS = 120
const MAX_LOCK_MS = 900
const LINE_PX = 16

function textareaCanScroll(el: HTMLTextAreaElement, dy: number): boolean {
  if (el.scrollHeight <= el.clientHeight) return false
  return dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0
}

export function useWheelNav(enabled: boolean, onStep: (direction: 1 | -1) => void): void {
  const step = useRef(onStep)
  useEffect(() => {
    step.current = onStep
  })

  useEffect(() => {
    if (!enabled) return
    let acc = 0
    let locked = false
    let lockedAt = 0
    let lastEvent = 0

    const onWheel = (e: WheelEvent) => {
      const now = performance.now()
      const dy = e.deltaMode === 1 ? e.deltaY * LINE_PX : e.deltaY
      if (e.target instanceof HTMLTextAreaElement && textareaCanScroll(e.target, dy)) return
      const idle = now - lastEvent > IDLE_GAP_MS
      lastEvent = now
      if (locked) {
        if (!idle && now - lockedAt < MAX_LOCK_MS) return
        locked = false
        acc = 0
      }
      if (idle) acc = 0
      acc += dy
      if (Math.abs(acc) >= THRESHOLD) {
        step.current(acc > 0 ? 1 : -1)
        acc = 0
        locked = true
        lockedAt = now
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [enabled])
}
