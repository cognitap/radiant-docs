'use client'

import { useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  type BreadcrumbLinkRenderProps
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './breadcrumb-example.css'

const routes = [
  { href: '/docs/getting-started/', label: 'Documentation' },
  { href: '/docs/foundations/', label: 'Foundations' },
  { href: '/docs/foundations/theming/', label: 'Theming' }
]
const last = routes[routes.length - 1]

// Stands in for a router's Link: plain clicks route in place, modified clicks stay native.
function RouterAnchor({
  navigate,
  onClick,
  href,
  children,
  ...props
}: BreadcrumbLinkRenderProps & { navigate: (href: string) => void }) {
  return (
    <a
      {...props}
      href={href}
      onClick={event => {
        onClick?.(event)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        event.preventDefault()
        navigate(href)
      }}
    >
      {children}
    </a>
  )
}

export function RouterBreadcrumbExample() {
  const [route, setRoute] = useState(last.href)
  const trail = routes.slice(0, routes.findIndex(item => item.href === route) + 1)
  const current = trail[trail.length - 1]
  return (
    <div className="breadcrumb-example">
      <Breadcrumb aria-label="Routed location">
        <BreadcrumbList>
          {trail.slice(0, -1).map(item => (
            <BreadcrumbItem key={item.href}>
              <BreadcrumbLink
                href={item.href}
                render={props => (
                  <RouterAnchor
                    {...props}
                    navigate={setRoute}
                  />
                )}
              >
                {item.label}
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{current.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <output>Route: {route}</output>
      <Button
        variant="outline"
        tone="neutral"
        disabled={route === last.href}
        onClick={() => setRoute(last.href)}
      >
        Back to Theming
      </Button>
    </div>
  )
}
