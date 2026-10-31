import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopy,
  CodeBlockViewport
} from '@cognitap/radiant'
import { RouteLink } from '@/components/docs/RouteLink'
import { getNavigation } from '@/lib/navigation'
import { radiantCandidate, radiantVersion } from '@/lib/radiant'

const install = 'pnpm add @cognitap/radiant'

const foundations = [
  {
    title: 'Native behavior',
    description:
      'Buttons stay buttons, links stay anchors and form controls take part in real forms. Your application owns its data and actions.',
    href: '/docs/foundations/',
    action: 'Read the foundations'
  },
  {
    title: 'One theme for everything',
    description:
      'Choose a preset or author semantic tokens, then scope a theme to any part of the page. Every component reads the same roles.',
    href: '/docs/foundations/theming/',
    action: 'Learn theming'
  },
  {
    title: 'Physical motion',
    description:
      'Springs follow presses, opening panels and changing layouts. The system reduced-motion setting always wins.',
    href: '/docs/foundations/motion/',
    action: 'Explore motion'
  }
]

export default function HomePage() {
  const components = getNavigation().find(group => group.title === 'Components')?.pages ?? []
  return (
    <main
      className="home"
      id="content"
      tabIndex={-1}
    >
      <p className="eyebrow">React components</p>
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
        aria-label="Start"
        className="home-links"
      >
        <RouteLink
          href="/docs/getting-started/"
          variant="solid"
          controlSize="large"
        >
          Get started
        </RouteLink>
        <RouteLink
          href="/workshop/"
          variant="outline"
          controlSize="large"
        >
          Open the theme workshop
        </RouteLink>
      </nav>
      <CodeBlock
        code={install}
        className="home-install"
      >
        <CodeBlockViewport
          aria-label="Install command"
          orientation="horizontal"
          className="home-install-code"
        >
          <CodeBlockContent />
        </CodeBlockViewport>
        <CodeBlockCopy
          variant="ghost"
          tone="neutral"
          controlSize="small"
        >
          Copy
        </CodeBlockCopy>
      </CodeBlock>

      <section
        aria-labelledby="home-foundations"
        className="home-section"
      >
        <h2 id="home-foundations">Built on the platform</h2>
        <div className="home-cards">
          {foundations.map(item => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle level={3}>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <RouteLink href={item.href}>{item.action}</RouteLink>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p>
          <RouteLink href={components[0]?.url ?? '/docs/getting-started/'}>
            Browse all {components.length} components
          </RouteLink>
        </p>
      </section>

      <p className="source-note">
        {radiantCandidate
          ? 'This local preview uses an explicitly selected package candidate. Its APIs may differ from npm.'
          : `These examples run on the published Radiant ${radiantVersion} package.`}
      </p>
    </main>
  )
}
