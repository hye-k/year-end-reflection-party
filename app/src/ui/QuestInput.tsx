import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type { Answer } from '../core/reflection'
import { clampGraphemes, graphemeLength } from '../core/text'
import { NAME_TOKEN, type Quest } from '../core/content'

interface QuestInputProps {
  quest: Quest
  playerName: string
  value: Answer | undefined
  onChange: (next: Answer) => void
  onFocusChange: (focused: boolean) => void
  compact: boolean
  tight: boolean
}

type Field = HTMLInputElement | HTMLTextAreaElement

// The counter only appears once the writer is close to the limit; before that the placeholder states it.
const COUNTER_FROM = 0.8
const SHORT_ANSWER_MAX = 100
// On a phone the soft keyboard takes half the screen, so the field scrolls earlier than the desktop panel would force it to.
const MOBILE_MAX_FIELD_HEIGHT = 220

const placeholderOf = (custom: string | null, max: number) => custom ?? `최대 ${max}자`
const nearLimit = (text: string, max: number) => graphemeLength(text) >= max * COUNTER_FROM

// Always rendered so that it appearing never shifts the layout.
function Counter({ text, max, style }: { text: string; max: number; style?: CSSProperties }) {
  const visible = nearLimit(text, max)
  return (
    <span aria-hidden={!visible} style={{ fontSize: 14, lineHeight: 1, color: 'var(--navy)', whiteSpace: 'nowrap', visibility: visible ? 'visible' : 'hidden', ...style }}>
      {graphemeLength(text)}/{max}
    </span>
  )
}

// Grows the textarea with its content. The layout (flex + the panel's max height) decides how far it may grow before it scrolls.
function useAutoGrow(text: string, deps: readonly unknown[]) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const { flex } = el.style
    el.style.flex = 'none'
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px` // + border
    el.style.flex = flex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ...deps])
  return ref
}

function asText(value: Answer | undefined): string {
  return typeof value === 'string' ? value : ''
}

function asList(value: Answer | undefined): string[] {
  return Array.isArray(value) ? value : []
}

// Plain Enter breaks the line in a textarea; the single-line slots have no line to break,
// so it moves to the next slot instead.
function handleEnter(e: KeyboardEvent<Field>, compact: boolean) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
  const field = e.currentTarget
  if (field instanceof HTMLTextAreaElement) return
  e.preventDefault()
  const fields = Array.from(field.closest('[data-quest-input]')?.querySelectorAll<Field>('input, textarea') ?? [])
  const next = fields[fields.indexOf(field) + 1]
  if (next) next.focus()
  else if (compact) field.blur()
}

export function QuestInput({ quest, playerName, value, onChange, onFocusChange, compact, tight }: QuestInputProps) {
  const { input } = quest
  const focusProps = { onFocus: () => onFocusChange(true), onBlur: () => onFocusChange(false) }
  const keyProps = { onKeyDown: (e: KeyboardEvent<Field>) => handleEnter(e, compact) }
  const fieldStyle = { width: '100%', fontSize: compact ? 16 : 20, lineHeight: 1.5, padding: compact ? '10px 12px' : '12px 16px' } as const

  const textRef = useAutoGrow(asText(value), [compact, tight])

  if (input.kind === 'text') {
    const text = asText(value)
    const long = input.maxLength > SHORT_ANSWER_MAX
    const shortHeight = tight ? 68 : compact ? 76 : 92
    const longMinHeight = tight ? 88 : compact ? 160 : 120
    return (
      <label data-quest-input style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: long ? '1 1 auto' : '0 1 auto', minHeight: 0 }}>
        <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{quest.prompt}</span>
        {input.salutation ? (
          <div className="letter" style={{ flex: '1 1 auto', minHeight: 0, ['--line' as string]: `${compact ? 24 : 30}px` }}>
            <div className="label" style={{ padding: compact ? '10px 12px 4px' : '14px 16px 6px', fontSize: compact ? 16 : 20, color: 'var(--navy)' }}>
              {input.salutation.replace(NAME_TOKEN, playerName)}
            </div>
            <textarea
              ref={textRef}
              className="letter-body"
              value={text}
              placeholder={placeholderOf(input.placeholder, input.maxLength)}
              style={{ fontSize: compact ? 16 : 20, padding: compact ? '0 12px 6px' : '0 16px 8px', flex: '1 1 auto', minHeight: long ? longMinHeight : shortHeight, maxHeight: compact ? MOBILE_MAX_FIELD_HEIGHT : undefined, resize: 'none' }}
              onChange={(e) => onChange(clampGraphemes(e.target.value, input.maxLength))}
              {...keyProps}
              {...focusProps}
            />
          </div>
        ) : (
          <textarea
            ref={textRef}
            className="field"
            value={text}
            placeholder={placeholderOf(input.placeholder, input.maxLength)}
            style={{ ...fieldStyle, flex: long ? '1 1 auto' : '0 1 auto', minHeight: long ? longMinHeight : shortHeight, maxHeight: compact ? MOBILE_MAX_FIELD_HEIGHT : undefined, resize: 'none' }}
            onChange={(e) => onChange(clampGraphemes(e.target.value, input.maxLength))}
            {...keyProps}
            {...focusProps}
          />
        )}
        <Counter text={text} max={input.maxLength} style={{ alignSelf: 'flex-end' }} />
      </label>
    )
  }

  const slots = asList(value)
  const { slotCount, slotLabels } = input
  const setSlot = (i: number, text: string) => {
    const next = Array.from({ length: slotCount }, (_, k) => slots[k] ?? '')
    next[i] = clampGraphemes(text, input.slotMaxLength)
    onChange(next)
  }
  return (
    <div data-quest-input style={{ display: 'grid', gridTemplateColumns: compact || input.columns === 1 ? '1fr' : 'repeat(2, 1fr)', gap: compact ? 18 : '20px 20px' }}>
      {Array.from({ length: slotCount }, (_, i) => {
        const label = slotLabels?.[i]
        const text = slots[i] ?? ''
        const field = (
          <input
            className="field"
            type="text"
            enterKeyHint={i < slotCount - 1 ? 'next' : 'done'}
            aria-label={label ? undefined : `${quest.prompt} ${i + 1}번`}
            value={text}
            placeholder={placeholderOf(input.slotPlaceholders[i], input.slotMaxLength)}
            style={{ ...fieldStyle, height: compact ? 48 : 52, flex: 1, minWidth: 0 }}
            onChange={(e) => setSlot(i, e.target.value)}
            {...keyProps}
            {...focusProps}
          />
        )
        if (label) {
          return (
            <label key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 16, color: 'var(--navy)' }}>{`${i + 1}. ${label}`}</span>
              <span style={{ position: 'relative', display: 'flex' }}>
                {field}
                <Counter text={text} max={input.slotMaxLength} style={{ position: 'absolute', right: 2, top: '100%', marginTop: 3 }} />
              </span>
            </label>
          )
        }
        // Without a label the number sits beside the field, so the counter floats in the gap above its right edge.
        return (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, color: 'var(--navy)', width: 20, flex: 'none' }}>{i + 1}</span>
            <span style={{ position: 'relative', display: 'flex', flex: 1, minWidth: 0 }}>
              {field}
              <Counter text={text} max={input.slotMaxLength} style={{ position: 'absolute', right: 2, bottom: '100%', marginBottom: 2 }} />
            </span>
          </label>
        )
      })}
    </div>
  )
}
