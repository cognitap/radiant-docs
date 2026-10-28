'use client'

import { useEffect, useState } from 'react'
import { generateColorWall } from '@cognitap/radiant'
import type { ColorInput, WallView } from './workshop-color.ts'

/* Strips and cards paint walls the user has not chosen yet. Each one costs a generator run
   (about 5 ms), so they are computed in frame-sized chunks once the input settles, never on
   the input event itself, and remembered across edits. */

const settleMs = 150
const frameBudgetMs = 6
const cacheLimit = 600
const cache = new Map<string, WallView>()
const queue = new Map<string, ColorInput>()
let frame: number | null = null
let notify: () => void = () => {}

export const sampleKey = (input: ColorInput) => JSON.stringify(input)

function run() {
  frame = null
  const start = performance.now()
  for (const [key, input] of queue) {
    if (performance.now() - start > frameBudgetMs) break
    cache.set(key, generateColorWall(input))
    queue.delete(key)
  }
  if (cache.size > cacheLimit)
    for (const key of [...cache.keys()].slice(0, cache.size - cacheLimit)) cache.delete(key)
  notify()
  if (queue.size && frame === null) frame = requestAnimationFrame(run)
}

/** Walls for `inputs` (memoized by the caller), filled in over the frames after they stop changing. */
export function useWallSamples(
  inputs: readonly ColorInput[]
): (input: ColorInput) => WallView | undefined {
  const [, setFilled] = useState(0)
  useEffect(() => {
    const missing = inputs.filter(input => !cache.has(sampleKey(input)))
    if (!missing.length) return
    notify = () => setFilled(value => value + 1)
    const timer = setTimeout(() => {
      for (const input of missing) queue.set(sampleKey(input), input)
      if (frame === null) frame = requestAnimationFrame(run)
    }, settleMs)
    return () => {
      clearTimeout(timer)
      queue.clear()
    }
  }, [inputs])
  return input => cache.get(sampleKey(input))
}
