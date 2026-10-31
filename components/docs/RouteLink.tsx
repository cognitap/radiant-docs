'use client'

import NextLink from 'next/link'
import { Link, type LinkProps } from '@cognitap/radiant'

/** A Radiant Link that navigates through the Next router. */
export function RouteLink({ href, ...props }: LinkProps & { href: string }) {
  return (
    <Link
      {...props}
      href={href}
      render={rendered => (
        <NextLink
          {...rendered}
          href={href}
        />
      )}
    />
  )
}
