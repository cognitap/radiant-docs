import { Demo } from './demo/Demo'
import { DemoControls, DemoPreview } from './demo/DemoFrame'
import { PlayVoiceNote, PreviewEpisodes } from '@/examples/audio-player/AudioPlayerExample'
export function PlayVoiceNoteDemo() {
  return (
    <Demo
      title="Play a voice note"
      files={['audio-player/AudioPlayerExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PlayVoiceNote />
      </DemoPreview>
    </Demo>
  )
}
export function PreviewEpisodesDemo() {
  return (
    <Demo
      title="Preview podcast episodes"
      files={['audio-player/AudioPlayerExample.tsx']}
    >
      <DemoControls />
      <DemoPreview>
        <PreviewEpisodes />
      </DemoPreview>
    </Demo>
  )
}
