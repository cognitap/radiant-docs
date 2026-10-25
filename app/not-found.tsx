import NextLink from 'next/link'

export default function NotFound() {
  return (
    <main
      id="content"
      className="home"
      tabIndex={-1}
    >
      <h1>Page not found</h1>
      <p>This page may have moved.</p>
      <NextLink href="/docs/getting-started/">Browse the documentation</NextLink>
    </main>
  )
}
