import type { ReactNode } from 'react'
import type { IconComponent, IconSet } from '@cognitap/radiant'

function draw(paths: ReactNode): IconComponent {
  return function Icon(props) {
    return (
      <svg
        {...props}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths}
      </svg>
    )
  }
}

export const roundIcons: IconSet = {
  check: draw(<path d="M5 12.5 9.5 17 19 7.5" />),
  indeterminate: draw(<path d="M6 12h12" />),
  chevronDown: draw(<path d="m6 9 6 6 6-6" />),
  chevronUp: draw(<path d="m6 15 6-6 6 6" />),
  chevronLeft: draw(<path d="m15 6-6 6 6 6" />),
  chevronRight: draw(<path d="m9 6 6 6-6 6" />),
  close: draw(<path d="M6 6l12 12M18 6 6 18" />),
  calendar: draw(
    <>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="4"
      />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  grip: draw(<path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />),
  spinner: draw(<path d="M12 3a9 9 0 1 0 9 9" />)
}
