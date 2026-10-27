import type { TrialFont, FontStyle } from './workshop-fonts'

/** One workshop session owns its faces. No persistence, uploads or object URLs. */
export class WorkshopFontLoader {
  private faces = new Map<string, FontFace[]>()
  private revision = 0
  private abort?: AbortController
  private disposed = false
  async load(font: TrialFont, local?: ArrayBuffer): Promise<boolean> {
    const revision = ++this.revision
    this.abort?.abort()
    if (this.disposed) return false
    if (this.faces.has(font.family)) return true
    const abort = new AbortController()
    this.abort = abort
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
    if (this.disposed || revision !== this.revision) return false
    for (const face of faces) document.fonts.add(face)
    this.faces.set(font.family, faces)
    return true
  }
  remove(family: string) {
    ++this.revision
    this.abort?.abort()
    for (const face of this.faces.get(family) ?? []) document.fonts.delete(face)
    this.faces.delete(family)
  }
  dispose() {
    this.disposed = true
    ++this.revision
    this.abort?.abort()
    for (const faces of this.faces.values()) for (const face of faces) document.fonts.delete(face)
    this.faces.clear()
  }
}
