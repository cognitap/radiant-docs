import { Demo } from './demo/Demo'
import { CarouselPlayground } from '@/examples/carousel/CarouselPlayground'
export function CarouselDemo() {
  return (
    <Demo
      title="Review a research study"
      files={['carousel/CarouselExample.tsx']}
    >
      <CarouselPlayground task="review" />
    </Demo>
  )
}
export function CarouselPreparationDemo() {
  return (
    <Demo
      title="Prepare research notes"
      files={['carousel/CarouselExample.tsx']}
    >
      <CarouselPlayground task="notes" />
    </Demo>
  )
}
export function CarouselComparisonDemo() {
  return (
    <Demo
      title="Compare research rounds"
      files={['carousel/CarouselExample.tsx']}
    >
      <CarouselPlayground task="compare" />
    </Demo>
  )
}
