import { Alert, AlertDescription, Spinner, type SpinnerProps } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type SpinnerOptions = Pick<SpinnerProps, 'controlSize' | 'motion' | 'style'>
export function LoadAccount({
  loaded,
  standalone,
  ...options
}: SpinnerOptions & { loaded: boolean; standalone: boolean }) {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '32rem' }}>
      <section
        aria-label="Account details"
        aria-busy={!loaded}
        style={{ minHeight: '5rem', display: 'flex', alignItems: 'center', gap: '.75rem' }}
      >
        {loaded ? (
          <p>Account: Jordan Rivera. Email preferences are ready.</p>
        ) : standalone ? (
          <Spinner
            {...options}
            label="Loading account"
          />
        ) : (
          <>
            <Spinner {...options} />
            <span>Loading account…</span>
          </>
        )}
      </section>
      <Alert
        announce="polite"
        aria-label="Account result"
        style={loaded ? undefined : { padding: 0, borderWidth: 0 }}
      >
        {loaded && <AlertDescription>Account loaded.</AlertDescription>}
      </Alert>
    </div>
  )
}
export function LoadReportPreview(options: SpinnerOptions) {
  return (
    <figure
      aria-busy="true"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        maxWidth: '20rem',
        aspectRatio: '4 / 3',
        margin: 0,
        border: '1px dashed currentColor',
        borderRadius: '.5rem'
      }}
    >
      <Spinner
        {...options}
        label="Loading report preview"
      />
    </figure>
  )
}
export function RefreshResults(options: SpinnerOptions) {
  return (
    <section
      aria-label="Search results"
      aria-busy="true"
      style={{ display: 'grid', gap: '.5rem', width: '100%', maxWidth: '24rem' }}
    >
      <p style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: 0 }}>
        <Spinner
          {...options}
          style={{ '--rad-spinner-color': 'var(--rad-color-accent)', ...options.style }}
        />
        Refreshing 3 results…
      </p>
      <ul>
        <li>Interview recordings</li>
        <li>Research notes</li>
        <li>Reference clips</li>
      </ul>
    </section>
  )
}
