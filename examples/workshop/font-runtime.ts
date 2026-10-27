import type { TrialFont, FontStyle } from './workshop-fonts'

/** One workshop session owns its faces. No persistence, uploads or object URLs. */
export class WorkshopFontLoader {
  private faces = new Map<string, FontFace[]>()
  private pending = new Map<string, { abort: AbortController; promise: Promise<boolean> }>()
  private disposed = false
  private version = 0
  private listeners = new Set<() => void>()
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  snapshot = () => this.version
  has(family: string) {
    return this.faces.has(family)
  }
  isLoading(family: string) {
    return this.pending.has(family)
  }
  private notify() {
    ++this.version
    for (const listener of this.listeners) listener()
  }

  load(font: TrialFont, local?: ArrayBuffer): Promise<boolean> {
    if (this.disposed) return Promise.resolve(false)
    if (this.faces.has(font.family)) return Promise.resolve(true)
    const pending = this.pending.get(font.family)
    if (pending) return pending.promise
    const abort = new AbortController()
    const promise = this.loadFaces(font, abort, local).finally(() => {
      if (this.pending.get(font.family)?.abort === abort) {
        this.pending.delete(font.family)
        this.notify()
      }
    })
    this.pending.set(font.family, { abort, promise })
    this.notify()
    return promise
  }
  private async loadFaces(
    font: TrialFont,
    abort: AbortController,
    local?: ArrayBuffer
  ): Promise<boolean> {
    const sources = await Promise.all(
      font.styles.map(async style => {
        if (local) return { style, bytes: local }
        const path = font.files?.[style]
        if (!path) throw new Error('This face has no font file. Choose the local file again.')
        const response = await fetch(path, { signal: abort.signal })
        if (!response.ok) throw new Error(`Font file unavailable (${response.status}).`)
        return { style, bytes: await response.arrayBuffer() }
      })
    )
    const faces = await Promise.all(
      sources.map(async ({ style, bytes }: { style: FontStyle; bytes: ArrayBuffer }) => {
        const width = font.axes.find(axis => axis.tag === 'wdth')
        const face = new FontFace(JSON.stringify(font.family), bytes, {
          style,
          weight: font.weights.join(' '),
          stretch: width ? `${width.min}% ${width.max}%` : 'normal',
          display: 'swap'
        })
        await face.load()
        return face
      })
    )
    if (this.disposed || abort.signal.aborted) return false
    for (const face of faces) document.fonts.add(face)
    this.faces.set(font.family, faces)
    return true
  }
  remove(family: string) {
    this.pending.get(family)?.abort.abort()
    this.pending.delete(family)
    for (const face of this.faces.get(family) ?? []) document.fonts.delete(face)
    this.faces.delete(family)
    this.notify()
  }
  dispose() {
    this.disposed = true
    for (const pending of this.pending.values()) pending.abort.abort()
    this.pending.clear()
    for (const faces of this.faces.values()) for (const face of faces) document.fonts.delete(face)
    this.faces.clear()
    this.notify()
  }
}
