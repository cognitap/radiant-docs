'use client'
import { useState } from 'react'
import {
  Switch,
  Tooltip,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  type TooltipProps,
  type TooltipContentProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'

export type TooltipTask = 'draft' | 'toolbar' | 'delay' | 'controlled'
type Options = Pick<TooltipProps, 'openDelay' | 'closeDelay' | 'defaultOpen'> &
  Pick<TooltipContentProps, 'side' | 'align' | 'motion' | 'className' | 'style'>

export function TooltipExample({ task = 'draft', ...options }: Options & { task?: TooltipTask }) {
  return (
    <MotionProvider>
      {task === 'toolbar' ? (
        <Toolbar {...options} />
      ) : task === 'delay' ? (
        <Delay {...options} />
      ) : task === 'controlled' ? (
        <Controlled {...options} />
      ) : (
        <Draft {...options} />
      )}
    </MotionProvider>
  )
}

function Draft({ openDelay, closeDelay, defaultOpen, ...content }: Options) {
  const [saved, setSaved] = useState(false)
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <p>Save this draft to your workspace. Publishing is a separate action.</p>
      <Tooltip
        openDelay={openDelay}
        closeDelay={closeDelay}
        defaultOpen={defaultOpen}
      >
        <TooltipTrigger onClick={() => setSaved(true)}>Save draft</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...content}>
            This draft stays private until you publish it.
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <output>{saved ? 'Draft saved locally.' : 'Unsaved draft.'}</output>
    </div>
  )
}

function Toolbar({ openDelay, closeDelay, defaultOpen, ...content }: Options) {
  const [copied, setCopied] = useState(false),
    [pinned, setPinned] = useState(false)
  const timing = { openDelay, closeDelay }
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <div
        role="toolbar"
        aria-label="Report actions"
        style={{ display: 'flex', gap: '.5rem' }}
      >
        <Tooltip
          {...timing}
          defaultOpen={defaultOpen}
        >
          <TooltipTrigger
            iconOnly
            variant="outline"
            tone="neutral"
            aria-label="Copy link"
            onClick={() => setCopied(true)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
            </svg>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent {...content}>
              Anyone in your workspace can open the link.
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
        <Tooltip {...timing}>
          <TooltipTrigger
            iconOnly
            variant="outline"
            tone="neutral"
            aria-label="Pin report"
            pressed={pinned}
            onPressedChange={setPinned}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 17v5M9 3h6l-1 7 4 4H6l4-4z" />
            </svg>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent {...content}>
              Pinned reports stay at the top of the list.
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </div>
      <output>
        {copied ? 'Link copied.' : 'Link not copied.'}{' '}
        {pinned ? 'Report pinned.' : 'Report not pinned.'}
      </output>
    </div>
  )
}

function Delay({ openDelay, closeDelay, defaultOpen, ...content }: Options) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
      <Tooltip
        openDelay={openDelay}
        closeDelay={closeDelay}
        defaultOpen={defaultOpen}
      >
        <TooltipTrigger variant="outline">Archive</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...content}>Opens after the hover delay.</TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <Tooltip
        openDelay={0}
        closeDelay={0}
      >
        <TooltipTrigger variant="outline">Restore</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...content}>Opens and closes with the pointer.</TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </div>
  )
}

function Controlled({ openDelay, closeDelay, defaultOpen, ...content }: Options) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  return (
    <div style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <Switch
        label="Show schedule hint"
        checked={open}
        onChange={event => setOpen(event.currentTarget.checked)}
      />
      <Tooltip
        open={open}
        onOpenChange={setOpen}
        openDelay={openDelay}
        closeDelay={closeDelay}
      >
        <TooltipTrigger variant="outline">Schedule report</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent {...content}>Reports send at 9:00 in your time zone.</TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <output>The hint is {open ? 'shown' : 'hidden'}.</output>
    </div>
  )
}
