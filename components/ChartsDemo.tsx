import { Demo } from './demo/Demo'
import {
  ReviewRecruitment,
  TrackStudyEnrollment,
  UnderstandSessionMix
} from '@/examples/charts/ChartsExample'
export function ChartsDemo() {
  return (
    <Demo
      title="Review study recruitment"
      files={['charts/ChartsExample.tsx']}
    >
      <ReviewRecruitment />
    </Demo>
  )
}
export function ChartsEnrollmentDemo() {
  return (
    <Demo
      title="Track research enrollment"
      files={['charts/ChartsExample.tsx']}
    >
      <TrackStudyEnrollment />
    </Demo>
  )
}
export function ChartsMixDemo() {
  return (
    <Demo
      title="Plan the research mix"
      files={['charts/ChartsExample.tsx']}
    >
      <UnderstandSessionMix />
    </Demo>
  )
}
