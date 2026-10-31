import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateTitle
} from '@cognitap/radiant'
import { SiteFrame } from '@/components/docs/SiteChrome'
import { RouteLink } from '@/components/docs/RouteLink'

export default function NotFound() {
  return (
    <SiteFrame>
      <main
        id="content"
        className="home"
        tabIndex={-1}
      >
        <EmptyState variant="no-results">
          <EmptyStateTitle level={1}>Page not found</EmptyStateTitle>
          <EmptyStateDescription>This page may have moved.</EmptyStateDescription>
          <EmptyStateActions>
            <RouteLink
              href="/docs/getting-started/"
              variant="solid"
            >
              Browse the documentation
            </RouteLink>
          </EmptyStateActions>
        </EmptyState>
      </main>
    </SiteFrame>
  )
}
