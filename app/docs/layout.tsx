import type { ReactNode } from 'react'
import { getNavigation } from '@/lib/navigation'
import { DocsShell } from '@/components/docs/DocsShell'

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell groups={getNavigation()}>{children}</DocsShell>
}
