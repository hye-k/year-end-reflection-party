import { useEffect, useState } from 'react'

interface ViewportBox {
  height: number
  offsetTop: number
}

function read(): ViewportBox {
  const vv = window.visualViewport
  return { height: vv?.height ?? window.innerHeight, offsetTop: vv?.offsetTop ?? 0 }
}

export function useVisualViewport(): ViewportBox {
  const [box, setBox] = useState(read)
  useEffect(() => {
    const vv = window.visualViewport
    const update = () => setBox(read())
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return box
}
