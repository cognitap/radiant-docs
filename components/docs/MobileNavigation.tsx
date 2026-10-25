'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@cognitap/radiant'
import type { NavigationGroup } from '@/lib/navigation'
import { Navigation } from './Navigation'

export function MobileNavigation({ groups }: { groups: NavigationGroup[] }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger variant="outline">Browse documentation</DialogTrigger>
      <DialogContent className="docs-menu-dialog">
        <div className="docs-dialog-heading">
          <DialogTitle>Documentation menu</DialogTitle>
          <DialogClose variant="ghost">Close menu</DialogClose>
        </div>
        <DialogDescription>Choose a section or page.</DialogDescription>
        <Navigation
          groups={groups}
          onNavigate={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
