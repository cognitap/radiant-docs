'use client'
import { useState } from 'react'
import { AudioPlayer, AudioPlayerGroup } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const labels = { playLabel: 'Play', pauseLabel: 'Pause', seekLabel: 'Seek' }
export function PlayVoiceNote() {
  const [playing, setPlaying] = useState(false)
  return (
    <div style={{ display: 'grid', gap: '0.75rem', width: '28rem', maxWidth: '100%' }}>
      <AudioPlayer
        {...labels}
        src="/audio/voice-note.wav"
        aria-label="Voice note from Priya"
        errorText="This voice note cannot be played."
        onPlayingChange={setPlaying}
      />
      <output>{playing ? 'Playing' : 'Paused'}</output>
    </div>
  )
}
const episodes = [
  { title: 'Shipping on Fridays', number: 'Episode 12' },
  { title: 'Inside the support queue', number: 'Episode 13' },
  { title: 'What we learned from outages', number: 'Episode 14' }
]
export function PreviewEpisodes() {
  return (
    <AudioPlayerGroup>
      <ul style={{ display: 'grid', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' }}>
        {episodes.map(episode => (
          <li
            key={episode.title}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <AudioPlayer
              compact
              playLabel="Play preview"
              pauseLabel="Pause preview"
              src="/audio/episode-preview.wav"
              aria-label={episode.title}
            />
            <span>
              <strong>{episode.title}</strong> · {episode.number}
            </span>
          </li>
        ))}
      </ul>
    </AudioPlayerGroup>
  )
}
