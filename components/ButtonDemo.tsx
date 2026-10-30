import { Demo } from './demo/Demo'
import { ButtonPlayground } from '@/examples/button/ButtonPlayground'
export function ButtonDemo() {
  return (
    <Demo
      title="Save workspace"
      files={['button/ButtonExample.tsx']}
    >
      <ButtonPlayground />
    </Demo>
  )
}
export function ButtonFormattingDemo() {
  return (
    <Demo
      title="Format a draft"
      files={['button/ButtonExample.tsx']}
    >
      <ButtonPlayground task="format" />
    </Demo>
  )
}
export function ButtonBookmarkDemo() {
  return (
    <Demo
      title="Save an article for later"
      files={['button/ButtonExample.tsx']}
    >
      <ButtonPlayground task="bookmark" />
    </Demo>
  )
}
export function ButtonCompositionDemo() {
  return (
    <Demo
      title="Forward a native action"
      files={['button/ButtonExample.tsx']}
    >
      <ButtonPlayground task="adapter" />
    </Demo>
  )
}
