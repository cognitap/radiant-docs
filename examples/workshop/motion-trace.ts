import { useSyncExternalStore } from 'react'
import type { CurvePoint } from './workshop-motion-view'

/** One movement the preview's inspector sampled, normalized so it draws over the step response:
    t in seconds from the first moving frame, x as a fraction of the excursion from where it started. */
export interface Movement {
  label: string
  points: CurvePoint[]
}
let latest: Movement | null = null
const listeners = new Set<() => void>()
export function publishMovement(movement: Movement): void {
  latest = movement
  listeners.forEach(listener => listener())
}
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const useMovement = () =>
  useSyncExternalStore(
    subscribe,
    () => latest,
    () => null
  )
