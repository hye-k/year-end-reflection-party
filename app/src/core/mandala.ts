import { clampGraphemes, graphemeLength, isBlank } from "./text";

export const MANDALA_CELL_LIMIT = 9;
export const THEME_COUNT = 8;
export const ACTIONS_PER_THEME = 8;
// Distinct cells on the board: the goal, each theme once (it is shown twice), and every action.
export const MANDALA_CELL_TOTAL = 1 + THEME_COUNT + THEME_COUNT * ACTIONS_PER_THEME;

const CENTRE = 4;

export interface MandalaState {
  goal: string;
  themes: string[];
  actions: string[][];
}

export type MandalaCell =
  | { kind: "goal" }
  | { kind: "theme"; theme: number }
  | { kind: "action"; theme: number; action: number };

export interface GridPosition {
  block: number;
  cell: number;
}

export interface MandalaProgress {
  filled: number;
  total: number;
  empty: MandalaCell[];
}

export function emptyMandala(): MandalaState {
  return {
    goal: "",
    themes: Array.from({ length: THEME_COUNT }, () => ""),
    actions: Array.from({ length: THEME_COUNT }, () =>
      Array.from({ length: ACTIONS_PER_THEME }, () => ""),
    ),
  };
}

function ringIndex(position: number): number {
  return position < CENTRE ? position : position - 1;
}

function ringPosition(index: number): number {
  return index < CENTRE ? index : index + 1;
}

function assertGridIndex(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 8) {
    throw new RangeError(`grid index out of range: ${value}`);
  }
}

export function cellAt(block: number, cell: number): MandalaCell {
  assertGridIndex(block);
  assertGridIndex(cell);
  if (block === CENTRE) {
    return cell === CENTRE
      ? { kind: "goal" }
      : { kind: "theme", theme: ringIndex(cell) };
  }
  const theme = ringIndex(block);
  return cell === CENTRE
    ? { kind: "theme", theme }
    : { kind: "action", theme, action: ringIndex(cell) };
}

export function positionsOf(cell: MandalaCell): GridPosition[] {
  switch (cell.kind) {
    case "goal":
      return [{ block: CENTRE, cell: CENTRE }];
    case "theme":
      return [
        { block: CENTRE, cell: ringPosition(cell.theme) },
        { block: ringPosition(cell.theme), cell: CENTRE },
      ];
    case "action":
      return [
        { block: ringPosition(cell.theme), cell: ringPosition(cell.action) },
      ];
  }
}

export function getCellValue(state: MandalaState, cell: MandalaCell): string {
  switch (cell.kind) {
    case "goal":
      return state.goal;
    case "theme":
      return state.themes[cell.theme] ?? "";
    case "action":
      return state.actions[cell.theme]?.[cell.action] ?? "";
  }
}

export function setCellValue(
  state: MandalaState,
  cell: MandalaCell,
  value: string,
): MandalaState {
  const clamped = clampGraphemes(value, MANDALA_CELL_LIMIT);
  switch (cell.kind) {
    case "goal":
      return { ...state, goal: clamped };
    case "theme":
      return {
        ...state,
        themes: state.themes.map((theme, i) =>
          i === cell.theme ? clamped : theme,
        ),
      };
    case "action":
      return {
        ...state,
        actions: state.actions.map((row, t) =>
          t === cell.theme
            ? row.map((action, a) => (a === cell.action ? clamped : action))
            : row,
        ),
      };
  }
}

export function getValueAt(
  state: MandalaState,
  block: number,
  cell: number,
): string {
  return getCellValue(state, cellAt(block, cell));
}

export function setValueAt(
  state: MandalaState,
  block: number,
  cell: number,
  value: string,
): MandalaState {
  return setCellValue(state, cellAt(block, cell), value);
}

export function normalizeCellValue(value: string): string {
  return clampGraphemes(value.trim(), MANDALA_CELL_LIMIT);
}

export function isOverCellLimit(value: string): boolean {
  return graphemeLength(value.trim()) > MANDALA_CELL_LIMIT;
}

export function allCells(): MandalaCell[] {
  const cells: MandalaCell[] = [{ kind: "goal" }];
  for (let theme = 0; theme < THEME_COUNT; theme++) {
    cells.push({ kind: "theme", theme });
    for (let action = 0; action < ACTIONS_PER_THEME; action++) {
      cells.push({ kind: "action", theme, action });
    }
  }
  return cells;
}

// Nothing here is mandatory: it only tells how much of the board is written.
export function mandalaProgress(state: MandalaState): MandalaProgress {
  const cells = allCells();
  const empty = cells.filter((cell) => isBlank(getCellValue(state, cell)));
  return { filled: cells.length - empty.length, total: cells.length, empty };
}
