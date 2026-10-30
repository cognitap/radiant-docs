import { Demo } from './demo/Demo'
import { NativeSelectPlayground } from '@/examples/nativeselect/NativeSelectPlayground'
export function NativeSelectDemo() {
  return (
    <Demo
      title="Save a study phase"
      files={['nativeselect/NativeSelectExample.tsx']}
    >
      <NativeSelectPlayground task="phase" />
    </Demo>
  )
}
export function NativeSelectGroupedDemo() {
  return (
    <Demo
      title="Browse grouped studies"
      files={['nativeselect/NativeSelectExample.tsx']}
    >
      <NativeSelectPlayground task="grouped" />
    </Demo>
  )
}
export function NativeSelectCohortsDemo() {
  return (
    <Demo
      title="Filter participant cohorts"
      files={['nativeselect/NativeSelectExample.tsx']}
    >
      <NativeSelectPlayground task="cohorts" />
    </Demo>
  )
}
