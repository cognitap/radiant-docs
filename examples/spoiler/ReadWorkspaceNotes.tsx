'use client'

import { Spoiler } from '@cognitap/radiant'

export function ReadWorkspaceNotes() {
  return (
    <Spoiler
      maxHeight={96}
      className="max-w-md"
    >
      <div className="grid gap-3">
        <p>Workspace members can subscribe to a weekly summary of their open projects.</p>
        <p>
          Every report lists owners, upcoming milestones, and changes since the previous review.
        </p>
        <p>Before the next report goes out, project owners can add a short update for the team.</p>
      </div>
    </Spoiler>
  )
}
