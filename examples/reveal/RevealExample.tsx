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
const notices = [
  { value: 'lift', children: 'The east lift is closed for repairs until Friday.' },
  { value: 'lunch', children: 'Team lunch is on the roof terrace at noon.' },
  {
    value: 'wifi',
    children: 'The guest Wi-Fi network is Lobby, and the password is on the front desk.',
    interval: 8000
  }
]
export function PlayNotices() {
  return (
    <Reveal
      items={notices}
      previousLabel="Previous"
      nextLabel="Next"
      positionLabel={(index, count) => `Notice ${index + 1} of ${count}`}
      playback
      playLabel="Play"
      pauseLabel="Pause"
      interval={4000}
      loop
      style={{ maxWidth: '24rem' }}
    />
  )
}
