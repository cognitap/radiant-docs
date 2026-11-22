'use client'
import { Reveal } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const steps = [
  { value: 'mix', children: 'Mix flour, water and salt.' },
  { value: 'rest', children: 'Rest the dough for an hour.' },
  { value: 'bake', children: 'Bake for 40 minutes.' }
]
export function RevealExample() {
  return (
    <Reveal
      items={steps}
      previousLabel="Previous"
      nextLabel="Next"
      positionLabel={(index, count) => `Step ${index + 1} of ${count}`}
      style={{ maxWidth: '24rem' }}
    />
  )
}
