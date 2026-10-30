import { AspectRatio } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type AspectRatioTask = 'image' | 'video' | 'embed'
const landscape = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#d8eee7"/><circle cx="700" cy="180" r="74" fill="#f8ca78"/><path d="M0 410 300 140 660 640H0" fill="#2f7766"/><path d="m320 640 360-330 280 240v90" fill="#194e42"/><path d="M0 540q260-90 470 20t490-20v100H0" fill="#64a597"/></svg>')}`
const mediaStyle = { display: 'block', width: '100%', height: '100%', objectFit: 'cover' } as const
const embeddedDocument =
  '<!doctype html><html lang="en"><head><title>Studio notes</title><style>body{margin:0;padding:24px;background:#143d34;color:#fff;font:16px/1.5 system-ui}h1{font-size:24px}p{max-width:36ch}</style></head><body><h1>Studio notes</h1><p>Make room for the work. This embedded document keeps its own content inside a responsive frame.</p></body></html>'
export function AspectRatioExample({ task = 'image' }: { task?: AspectRatioTask }) {
  const ratio = task === 'video' ? 16 / 9 : task === 'embed' ? 4 / 3 : 1
  return (
    <figure style={{ margin: 0, width: '24rem', maxWidth: '100%' }}>
      <AspectRatio
        ratio={ratio}
        style={{ borderRadius: 'var(--rad-surface-radius,0.75rem)' }}
      >
        {task === 'video' ? (
          <video
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
            aria-label="Flowers in a garden"
            poster={landscape}
            controls
            muted
            playsInline
            preload="none"
            style={mediaStyle}
          />
        ) : task === 'embed' ? (
          <iframe
            title="Studio notes"
            srcDoc={embeddedDocument}
            sandbox=""
            style={{ ...mediaStyle, border: 0 }}
          />
        ) : (
          <img
            src={landscape}
            alt="Green mountains beneath a golden sun"
            style={mediaStyle}
          />
        )}
      </AspectRatio>
      <figcaption style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
        {task === 'video'
          ? 'Play the short flower clip.'
          : task === 'embed'
            ? 'An embedded document in a responsive frame.'
            : 'A square crop from a landscape image.'}
      </figcaption>
    </figure>
  )
}
