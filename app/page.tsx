import { radiantCandidate, radiantVersion } from '@/lib/radiant'

export default function HomePage() {
  return (
    <div className="home">
      <p className="eyebrow">A language for interfaces</p>
      <h1>
        Make room for
        <br />
        what matters.
      </h1>
      <p className="lede">
        React components with native behavior, shared design tokens, and room for your own
        expression.
      </p>
      <a
        href="/docs/button/"
        className="explore-link"
      >
        Explore Button <span aria-hidden="true">↗</span>
      </a>
      <p className="source-note">
        {radiantCandidate
          ? 'This local preview uses an explicitly selected package candidate. Its APIs may differ from npm.'
          : `These examples run on the published Radiant ${radiantVersion} package. More components and recipes will arrive alongside library releases.`}
      </p>
    </div>
  )
}
