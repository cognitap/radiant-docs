import { Demo } from './demo/Demo'
import { FileInputPlayground } from '@/examples/fileinput/FileInputPlayground'
export function FileInputDemo() {
  return (
    <Demo
      title="Attach a study protocol"
      files={['fileinput/FileInputExample.tsx']}
    >
      <FileInputPlayground task="protocol" />
    </Demo>
  )
}
export function FileInputRecordingsDemo() {
  return (
    <Demo
      title="Attach session recordings"
      files={['fileinput/FileInputExample.tsx']}
    >
      <FileInputPlayground task="recordings" />
    </Demo>
  )
}
export function FileInputConsentDemo() {
  return (
    <Demo
      title="Submit a consent form"
      files={['fileinput/FileInputExample.tsx']}
    >
      <FileInputPlayground task="consent" />
    </Demo>
  )
}
