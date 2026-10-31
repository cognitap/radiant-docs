import { Demo } from './demo/Demo'
import { SkeletonPlayground } from '@/examples/skeleton/SkeletonPlayground'
export function SkeletonDemo() {
  return (
    <Demo
      title="Account placeholders"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonPlayground task="account" />
    </Demo>
  )
}
export function SkeletonArticleDemo() {
  return (
    <Demo
      title="Hold a text block's place"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonPlayground task="article" />
    </Demo>
  )
}
export function SkeletonCardDemo() {
  return (
    <Demo
      title="Hold a card's place"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonPlayground task="card" />
    </Demo>
  )
}
export function SkeletonResultsDemo() {
  return (
    <Demo
      title="Swap in loaded results"
      files={['skeleton/SkeletonExample.tsx']}
    >
      <SkeletonPlayground task="results" />
    </Demo>
  )
}
