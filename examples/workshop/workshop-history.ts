/** What one edit was, for the undo announcement and for grouping continuous input. */
export interface Change {
  label: string
  /** Edits with the same key inside the coalescing window replace the present entry. */
  coalesce?: string
}
export interface HistoryEntry<T> {
  state: T
  label: string
  coalesce?: { key: string; at: number }
}
export interface History<T> {
  past: readonly HistoryEntry<T>[]
  present: HistoryEntry<T>
  future: readonly HistoryEntry<T>[]
}
export type HistoryAction<T> =
  | { type: 'commit'; state: T | ((state: T) => T); change: Change; at: number }
  | { type: 'undo' }
  | { type: 'redo' }

export const historyLimit = 100
/** Milliseconds since the previous edit of the same control that still count as one gesture. */
export const coalesceWindow = 1000

export function createHistory<T>(state: T): History<T> {
  return { past: [], present: { state, label: 'start' }, future: [] }
}
export function commit<T>(history: History<T>, state: T, change: Change, at: number): History<T> {
  const { present } = history
  const entry: HistoryEntry<T> = {
    state,
    label: change.label,
    coalesce: change.coalesce === undefined ? undefined : { key: change.coalesce, at }
  }
  const continues =
    entry.coalesce !== undefined &&
    present.coalesce?.key === entry.coalesce.key &&
    at - present.coalesce.at <= coalesceWindow
  return {
    past: continues ? history.past : [...history.past, present].slice(-historyLimit),
    present: entry,
    future: []
  }
}
export function undo<T>(history: History<T>): History<T> {
  const previous = history.past.at(-1)
  if (!previous) return history
  return {
    past: history.past.slice(0, -1),
    present: { ...previous, coalesce: undefined },
    future: [history.present, ...history.future]
  }
}
export function redo<T>(history: History<T>): History<T> {
  const [next, ...future] = history.future
  if (!next) return history
  return {
    past: [...history.past, history.present],
    present: { ...next, coalesce: undefined },
    future
  }
}
export function historyReducer<T>(history: History<T>, action: HistoryAction<T>): History<T> {
  switch (action.type) {
    case 'commit':
      return commit(
        history,
        typeof action.state === 'function'
          ? (action.state as (state: T) => T)(history.present.state)
          : action.state,
        action.change,
        action.at
      )
    case 'undo':
      return undo(history)
    case 'redo':
      return redo(history)
  }
}
