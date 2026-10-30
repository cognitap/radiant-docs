import { Demo } from './demo/Demo'
import { RadioPlayground } from '@/examples/radio/RadioPlayground'
export function RadioDemo() {
  return (
    <Demo
      title="Choose a workspace plan"
      files={['radio/RadioExample.tsx']}
    >
      <RadioPlayground task="plan" />
    </Demo>
  )
}
export function RadioDeliveryDemo() {
  return (
    <Demo
      title="Submit a delivery speed"
      files={['radio/RadioExample.tsx']}
    >
      <RadioPlayground task="delivery" />
    </Demo>
  )
}
export function RadioFilterDemo() {
  return (
    <Demo
      title="Filter tasks by status"
      files={['radio/RadioExample.tsx']}
    >
      <RadioPlayground task="filter" />
    </Demo>
  )
}
export function RadioSurveyDemo() {
  return (
    <Demo
      title="Require an answer"
      files={['radio/RadioExample.tsx']}
    >
      <RadioPlayground task="survey" />
    </Demo>
  )
}
