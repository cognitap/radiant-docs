import { Demo } from './demo/Demo'
import { AspectRatioPlayground } from '@/examples/aspectratio/AspectRatioPlayground'
export function AspectRatioDemo() {
  return (
    <Demo
      title="Crop a landscape image"
      files={['aspectratio/AspectRatioExample.tsx']}
    >
      <AspectRatioPlayground />
    </Demo>
  )
}
export function AspectRatioVideoDemo() {
  return (
    <Demo
      title="Play a video"
      files={['aspectratio/AspectRatioExample.tsx']}
    >
      <AspectRatioPlayground task="video" />
    </Demo>
  )
}
export function AspectRatioEmbedDemo() {
  return (
    <Demo
      title="Embed a document"
      files={['aspectratio/AspectRatioExample.tsx']}
    >
      <AspectRatioPlayground task="embed" />
    </Demo>
  )
}
