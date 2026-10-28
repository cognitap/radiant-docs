import { maxConfigurationBytes } from './workshop-handoff.ts'

/** Save text through a temporary object URL. JSON stays within the import limit so the file can
    come back in. */
export function downloadText(text: string, name: string, type: string) {
  if (type === 'application/json' && new TextEncoder().encode(text).length > maxConfigurationBytes)
    throw new Error('Configuration exceeds 256 KiB. Copy the typed theme instead.')
  const url = URL.createObjectURL(new Blob([text], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
