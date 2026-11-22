'use client'
import { useState } from 'react'
import {
  Button,
  Skeleton,
  Stage,
  StageActions,
  StageBody,
  StageDescription,
  StageFooter,
  StageHeader,
  StageTitle,
  type StageProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type StageTask = 'gradient' | 'streaming'
const hues = [200, 40, 140, 300]
function Swatch({ hue }: { hue: number }) {
  return (
    <div
      aria-hidden
      style={{
        borderRadius: '0.5rem',
        background: `linear-gradient(120deg, oklch(0.8 0.1 ${hue}), oklch(0.6 0.15 ${hue + 60}))`
      }}
    />
  )
}
export function StageExample({
  task = 'gradient',
  width = '45rem',
  ...props
}: Pick<StageProps, 'padding'> & { task?: StageTask; width?: string }) {
  return (
    <div style={{ width, maxWidth: '100%' }}>
      {task === 'streaming' ? <StreamingStage {...props} /> : <GradientStage {...props} />}
    </div>
  )
}
function GradientStage(props: Pick<StageProps, 'padding'>) {
  const [step, setStep] = useState(0),
    hue = hues[step % hues.length]!
  return (
    <Stage {...props}>
      <StageHeader>
        <StageTitle>Gradient</StageTitle>
        <StageDescription>Hue {hue}, mixed in oklch.</StageDescription>
        <StageActions>
          <Button onClick={() => setStep(step + 1)}>Shift hue</Button>
        </StageActions>
      </StageHeader>
      <StageBody aspectRatio={16 / 9}>
        <Swatch hue={hue} />
      </StageBody>
      <StageFooter>
        <Button
          variant="ghost"
          onClick={() => setStep(0)}
        >
          Reset
        </Button>
        <Button>Copy CSS</Button>
      </StageFooter>
    </Stage>
  )
}
function StreamingStage(props: Pick<StageProps, 'padding'>) {
  const [loaded, setLoaded] = useState(false)
  return (
    <Stage {...props}>
      <StageHeader>
        <StageTitle>Route map</StageTitle>
        <StageDescription>The body keeps its 4:3 box while tiles arrive.</StageDescription>
      </StageHeader>
      <StageBody
        aspectRatio={4 / 3}
        aria-busy={loaded ? undefined : true}
      >
        {loaded ? <Swatch hue={140} /> : <Skeleton style={{ '--rad-skeleton-height': '100%' }} />}
      </StageBody>
      <StageFooter>
        <Button onClick={() => setLoaded(!loaded)}>{loaded ? 'Clear' : 'Load tiles'}</Button>
      </StageFooter>
    </Stage>
  )
}
