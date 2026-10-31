import type { ReactNode } from 'react'
import { SiteFrame } from '@/components/docs/SiteChrome'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>
}
