import type { KeyboardEvent } from 'react'
import { MANDALA_CELL_LIMIT, type MandalaCell as Cell } from '../core/mandala'
import { clampGraphemes, graphemeLength } from '../core/text'

interface MandalaCellProps {
  cell: Cell
  value: string
  size: number
  label: string
  onChange: (value: string) => void
  onEnter: (target: HTMLTextAreaElement) => void
  forwardRef?: (el: HTMLTextAreaElement | null) => void
}

const PER_LINE = 3
const LINE_HEIGHT = 16
const LINE_HEIGHT_LARGE = 18

function look(cell: Cell, border: number) {
  if (cell.kind === 'goal') return { background: 'var(--gold)', border: `${border}px solid var(--ink)` }
  if (cell.kind === 'theme') return { background: 'var(--stage)', border: `${border}px solid var(--ink)` }
  return { background: 'var(--field)', border: `${border}px solid var(--ink)` }
}

export function MandalaCellInput({ cell, value, size, label, onChange, onEnter, forwardRef }: MandalaCellProps) {
  const border = size >= 90 ? 4 : 3
  const lines = Math.max(1, Math.ceil(graphemeLength(value) / (size >= 90 ? 5 : PER_LINE)))
  const inner = size - border * 2
  const lineHeight = size >= 90 ? LINE_HEIGHT_LARGE : LINE_HEIGHT
  const top = Math.max(2, (inner - lines * lineHeight) / 2)

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      onEnter(e.currentTarget)
    }
  }

  return (
    <div
      className="mandala-cell"
      style={{ width: size, height: size, boxSizing: 'border-box', ...look(cell, border) }}
    >
      <textarea
        ref={forwardRef}
        data-mandala-cell=""
        aria-label={label}
        rows={1}
        value={value}
        maxLength={MANDALA_CELL_LIMIT * 4}
        spellCheck={false}
        style={{ paddingTop: top, height: inner, lineHeight: `${lineHeight}px` }}
        onChange={(e) => onChange(clampGraphemes(e.target.value.replace(/\n/g, ''), MANDALA_CELL_LIMIT))}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}
