'use client'

import dynamic from 'next/dynamic'
import { DemoControls, DemoPreview } from '@/components/demo/DemoFrame'

const Dashboard = dynamic(() =>
  import('./CardExamples').then(module => module.CardDashboardExample)
)

export function CardPlayground({ states = false }: { states?: boolean }) {
  return (
    <>
      <DemoControls />
      <DemoPreview>
        <Dashboard staticMotion={states} />
      </DemoPreview>
    </>
  )
}
