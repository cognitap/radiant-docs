import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { PickSeats, ShowRoomBookings, MarkDeploys } from '@/examples/matrix/MatrixExample'
export function PickSeatsDemo() {
  return (
    <Demo
      title="Pick seats"
      files={['matrix/MatrixExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PickSeats />
      </DemoPreview>
    </Demo>
  )
}
export function ShowRoomBookingsDemo() {
  return (
    <Demo
      title="Show room bookings"
      files={['matrix/MatrixExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ShowRoomBookings />
      </DemoPreview>
    </Demo>
  )
}
export function MarkDeploysDemo() {
  return (
    <Demo
      title="Mark deploys per day"
      files={['matrix/MatrixExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <MarkDeploys />
      </DemoPreview>
    </Demo>
  )
}
