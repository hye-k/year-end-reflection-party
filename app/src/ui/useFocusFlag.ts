import { useCallback, useEffect, useRef, useState } from 'react'

const BLUR_DELAY_MS = 300

export function useFocusFlag(): [boolean, (focused: boolean) => void] {
  const [focused, setFocused] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const set = useCallback((next: boolean) => {
    window.clearTimeout(timer.current)
    if (next) setFocused(true)
    else timer.current = window.setTimeout(() => setFocused(false), BLUR_DELAY_MS)
  }, [])

  return [focused, set]
}
