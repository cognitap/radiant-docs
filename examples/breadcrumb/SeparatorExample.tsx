'use client'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './breadcrumb-example.css'

function Chevron() {
  return (
    <BreadcrumbSeparator>
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4.5 2.5 8 6l-3.5 3.5" />
      </svg>
    </BreadcrumbSeparator>
  )
}

export function SeparatorExample() {
  return (
    <div className="breadcrumb-example">
      <Breadcrumb aria-label="Foundations location">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs/getting-started/">Documentation</BreadcrumbLink>
            <Chevron />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs/foundations/">Foundations</BreadcrumbLink>
            <Chevron />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>Theming</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
