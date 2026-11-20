# core

Pure logic (no React, DOM or network). Every state update returns a new object.

- `text.ts`: `graphemeLength`, `clampGraphemes`, `isBlank` (user-perceived character helpers).
- `content.ts`: `QUEST_STRUCTURES` (language-independent: id, section, required, input limits), `buildQuests(texts)` (merges one language's `content/<lang>.json` into `Quest`s and throws if text is missing or mismatched), `REFLECTION_QUESTS` (Korean), `findQuest`, `MAX_DEPTH_M`, and the character-limit constants (`SHORT_ANSWER_MAX`, `LONG_ANSWER_MAX`, `SHORT_SLOT_MAX`, `LONG_SLOT_MAX`; the single place to change a limit).
- `mandala.ts`: `MandalaState`, `emptyMandala`, `cellAt`/`positionsOf` (grid position <-> source cell), `getValueAt`/`setValueAt` (+ `getCellValue`/`setCellValue`), `mandalaProgress` (how much is filled, nothing is mandatory), `allCells`, `MANDALA_CELL_LIMIT`.
- `reflection.ts`: `ReflectionState`, `emptyReflection`, `setAnswer`, `skipQuest`, `gaugeStates`, `validateSubmit`, `isAnswered`, `normalizeAnswer`.
- `events.ts`: `TrackEvent`, `EVENTS_HEADER`/`eventRow`/`makeEvent` (usage log rows) and `reflectionTally`/`mandalaTally` (answered count and characters at the moment of an event).
- `serialize.ts`: `REFLECTION_HEADER`/`reflectionRow`, `MANDALA_HEADER`/`mandalaRow`, `prefixFormulaLikeTextWithApostrophe`, `createDraft`/`parseDraft`/`parseDraftJson`/`newerDraft`, `restoreReflectionState`/`restoreMandalaState`.
