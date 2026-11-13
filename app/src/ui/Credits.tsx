import type { CSSProperties } from 'react'
import { CREDITS } from '../core/credits'

const SECONDS_PER_LINE = 1.5
const MIN_SECONDS = 20

const rollSeconds = () =>
  Math.max(MIN_SECONDS, (CREDITS.sections.reduce((lines, section) => lines + section.lines.length + 2, 0) + 4) * SECONDS_PER_LINE)

// Film-style credits that scroll up and start over. The box takes its height from its parent (stretch or `height`),
// and the roll starts one box-height below the top edge so each pass begins with the box empty.
export function Credits({ style }: { style?: CSSProperties }) {
  return (
    <div className="credits" style={style} role="region" aria-label="크레딧">
      <div className="credits-roll" style={{ animationDuration: `${rollSeconds()}s` }}>
        <div className="display credits-title">{CREDITS.title}</div>
        {CREDITS.sections.map((section) => (
          <div key={section.heading} className="credits-section">
            <div className="label credits-heading">{section.heading}</div>
            {section.lines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        ))}
        {CREDITS.footer && <div className="label credits-heading credits-footer">{CREDITS.footer}</div>}
      </div>
    </div>
  )
}
