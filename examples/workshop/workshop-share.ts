// Browser-owned transport, independent of theme validation. Call the public
// document parser after decoding, before applying anything to the workshop.
export const maxShareLength = 16000
const maxBytes = 262144
async function transform(bytes: Uint8Array, decompress: boolean): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined')
    throw new Error('This browser cannot encode share links. Use a configuration file instead.')
  const stream = new Blob([Uint8Array.from(bytes)])
    .stream()
    .pipeThrough(decompress ? new DecompressionStream('gzip') : new CompressionStream('gzip'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maxBytes) {
        await reader.cancel()
        throw new Error('Shared configuration exceeds 256 KiB. Use a smaller configuration.')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const result = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
export async function encodeShare(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  if (bytes.length > maxBytes)
    throw new Error('Configuration exceeds 256 KiB. Use a smaller configuration.')
  const compressed = await transform(bytes, false)
  let binary = ''
  for (let i = 0; i < compressed.length; i += 8192)
    binary += String.fromCharCode(...compressed.subarray(i, i + 8192))
  const payload = `1.${btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')}`
  if (payload.length > maxShareLength)
    throw new Error('Configuration is too large for a share link. Download the JSON file instead.')
  return payload
}
/** The payload of a pasted share link, a bare payload, or null for anything else. */
export function sharePayload(text: string): string | null {
  const trimmed = text.trim()
  const marker = trimmed.indexOf('#workshop=')
  if (marker !== -1) return trimmed.slice(marker + '#workshop='.length)
  return trimmed.startsWith('1.') ? trimmed : null
}
export async function decodeShare(payload: string): Promise<string> {
  if (payload.length > maxShareLength)
    throw new Error('Share link is too large. Import a configuration file instead.')
  if (!/^1\.[A-Za-z0-9_-]+$/.test(payload))
    throw new Error('Invalid or unsupported share link. Expected workshop link version 1.')
  try {
    const binary = atob(payload.slice(2).replaceAll('-', '+').replaceAll('_', '/'))
    const decoded = await transform(
      Uint8Array.from(binary, character => character.charCodeAt(0)),
      true
    )
    return new TextDecoder('utf-8', { fatal: true }).decode(decoded)
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('256 KiB') || error.message.includes('browser cannot'))
    )
      throw error
    throw new Error('Unable to decode this share link. It may be incomplete or damaged.')
  }
}
