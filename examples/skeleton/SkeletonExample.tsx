import { Alert, AlertDescription, Card, CardContent, CardHeader, Skeleton } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type SkeletonMotion = 'inherit' | 'off'
export function LoadAccount({ loaded, motion }: { loaded: boolean; motion: SkeletonMotion }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '32rem' }}>
      <section
        aria-label="Account details"
        aria-busy={!loaded}
        style={{ minHeight: '10rem', display: 'grid', alignContent: 'center', gap: '1rem' }}
      >
        {loaded ? (
          <>
            <h3>Jordan Rivera</h3>
            <p>Weekly product updates are enabled.</p>
          </>
        ) : (
          <>
            <Skeleton
              motion={motion}
              style={{ width: '4rem', height: '4rem', borderRadius: '50%' }}
            />
            <Skeleton
              motion={motion}
              style={{ width: '70%' }}
            />
            <Skeleton motion={motion} />
            <Skeleton
              motion={motion}
              style={{ width: '55%' }}
            />
          </>
        )}
      </section>
      <Alert
        announce="polite"
        aria-label="Account loading status"
      >
        <AlertDescription>{loaded ? 'Account loaded.' : 'Loading account…'}</AlertDescription>
      </Alert>
    </div>
  )
}
export function ArticlePlaceholder({ motion }: { motion: SkeletonMotion }) {
  return (
    <article
      aria-label="Release notes"
      aria-busy="true"
      style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}
    >
      <Skeleton
        motion={motion}
        style={{ width: '40%', height: '1.5rem' }}
      />
      <Skeleton motion={motion} />
      <Skeleton motion={motion} />
      <Skeleton
        motion={motion}
        style={{ width: '65%' }}
      />
    </article>
  )
}
export function ProfileCardPlaceholder({ motion }: { motion: SkeletonMotion }) {
  return (
    <Card
      aria-label="Researcher profile"
      aria-busy="true"
      style={{ width: '100%', maxWidth: '20rem' }}
    >
      <CardHeader style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        <Skeleton
          motion={motion}
          style={{
            '--rad-skeleton-width': '2.5rem',
            '--rad-skeleton-height': '2.5rem',
            '--rad-skeleton-radius': '50%',
            flexShrink: 0
          }}
        />
        <div style={{ display: 'grid', gap: '.5rem', flex: 1 }}>
          <Skeleton
            motion={motion}
            style={{ width: '60%' }}
          />
          <Skeleton
            motion={motion}
            style={{ width: '40%', height: '.75rem' }}
          />
        </div>
      </CardHeader>
      <CardContent style={{ display: 'grid', gap: '.75rem' }}>
        <Skeleton
          motion={motion}
          style={{ height: '8rem' }}
        />
        <Skeleton motion={motion} />
        <Skeleton
          motion={motion}
          style={{ width: '80%' }}
        />
      </CardContent>
    </Card>
  )
}
export function LoadResults({ loaded, motion }: { loaded: boolean; motion: SkeletonMotion }) {
  return (
    <div style={{ display: 'grid', gap: '.75rem', width: '100%', maxWidth: '24rem' }}>
      <section
        aria-label="Search results"
        aria-busy={!loaded}
      >
        {loaded ? (
          <ul>
            <li>Interview recordings</li>
            <li>Research notes</li>
            <li>Reference clips</li>
          </ul>
        ) : (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            <Skeleton
              motion={motion}
              style={{ width: '60%' }}
            />
            <Skeleton
              motion={motion}
              style={{ width: '50%' }}
            />
            <Skeleton
              motion={motion}
              style={{ width: '55%' }}
            />
          </div>
        )}
      </section>
      <output aria-label="Search status">{loaded ? '3 results.' : 'Searching…'}</output>
    </div>
  )
}
