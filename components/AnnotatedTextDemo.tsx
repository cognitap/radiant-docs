import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import {
  ReviewRetryCall,
  TagEntities,
  ReadLogLine
} from '@/examples/annotated-text/AnnotatedTextExample'
export function ReviewRetryCallDemo() {
  return (
    <Demo
      title="Review a retry call"
      files={['annotated-text/AnnotatedTextExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ReviewRetryCall />
      </DemoPreview>
    </Demo>
  )
}
export function TagEntitiesDemo() {
  return (
    <Demo
      title="Tag entities in a sentence"
      files={['annotated-text/AnnotatedTextExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <TagEntities />
      </DemoPreview>
    </Demo>
  )
}
export function ReadLogLineDemo() {
  return (
    <Demo
      title="Read a log line"
      files={['annotated-text/AnnotatedTextExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <ReadLogLine />
      </DemoPreview>
    </Demo>
  )
}
