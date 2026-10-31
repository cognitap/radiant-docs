'use client'
import { Button, Checkbox } from '@cognitap/radiant'
import { useState } from 'react'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'
import {
  ArticlePlaceholder,
  LoadAccount,
  LoadResults,
  ProfileCardPlaceholder
} from './SkeletonExample'
export type SkeletonTask = 'account' | 'article' | 'card' | 'results'
const subjects: Partial<Record<SkeletonTask, string>> = { account: 'account', results: 'results' }
export function SkeletonPlayground({ task = 'account' }: { task?: SkeletonTask }) {
  const [motionOff, setMotionOff] = useState(false),
    [loaded, setLoaded] = useState(false),
    motion = motionOff ? ('off' as const) : ('inherit' as const),
    subject = subjects[task]
  return (
    <>
      <DemoControls>
        <div className="action-toggles">
          <Checkbox
            label="Disable placeholder motion"
            checked={motionOff}
            onChange={event => setMotionOff(event.target.checked)}
          />
        </div>
        {subject && (
          <div className="action-toggles">
            <Button
              variant="outline"
              controlSize="small"
              onClick={() => setLoaded(value => !value)}
            >
              {loaded ? `Reload ${subject}` : `Simulate ${subject} loaded`}
            </Button>
          </div>
        )}
      </DemoControls>
      <DemoPreview>
        {task === 'article' ? (
          <ArticlePlaceholder motion={motion} />
        ) : task === 'card' ? (
          <ProfileCardPlaceholder motion={motion} />
        ) : task === 'results' ? (
          <LoadResults
            loaded={loaded}
            motion={motion}
          />
        ) : (
          <LoadAccount
            loaded={loaded}
            motion={motion}
          />
        )}
      </DemoPreview>
    </>
  )
}
