import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteTheme } from '@/components/docs/SiteTheme'
import { presetFontsHref } from '@/lib/preset-fonts'
import '@cognitap/radiant/styles.css'
import './styles.css'

export const metadata: Metadata = {
  title: { default: 'Radiant', template: '%s · Radiant' },
  description: 'React interaction components and presentation primitives.',
  robots: { index: false, follow: false }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href={presetFontsHref}
        />
      </head>
      <body>
        <SiteTheme>{children}</SiteTheme>
      </body>
    </html>
  )
}
