import { radiantCandidate, radiantVersion } from '@/lib/radiant'

export default function HomePage() {
  return (
    <main
      className="home"
      id="content"
      tabIndex={-1}
    >
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
      <nav
        aria-label="Examples"
        className="home-links"
      >
        <a
          href="/docs/button/"
          className="explore-link"
        >
          Explore Button <span aria-hidden="true">↗</span>
        </a>
        <a
          href="/docs/recipes/profile-form/"
          className="explore-link"
        >
          Explore form recipes <span aria-hidden="true">↗</span>
        </a>
      </nav>
      <p>
        <a
          href="/docs/workshop/"
          className="explore-link"
        >
          Open the theme workshop <span aria-hidden="true">↗</span>
        </a>
      </p>
      <p className="source-note">
        {radiantCandidate
          ? 'This local preview uses an explicitly selected package candidate. Its APIs may differ from npm.'
          : `These examples run on the published Radiant ${radiantVersion} package. More components and recipes will arrive alongside library releases.`}
      </p>
    </main>
  )
}
