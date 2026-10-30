import { Demo } from './demo/Demo'
import { MeterPlayground } from '@/examples/meter/MeterPlayground'
export function MeterDemo() {
  return (
    <Demo
      title="Manage recording storage"
      files={['meter/MeterExample.tsx']}
    >
      <MeterPlayground task="storage" />
    </Demo>
  )
}
export function MeterRecorderDemo() {
  return (
    <Demo
      title="Choose a recorder"
      files={['meter/MeterExample.tsx']}
    >
      <MeterPlayground task="recorder" />
    </Demo>
  )
}
export function MeterRoomDemo() {
  return (
    <Demo
      title="Choose a study room"
      files={['meter/MeterExample.tsx']}
    >
      <MeterPlayground task="room" />
    </Demo>
  )
}
