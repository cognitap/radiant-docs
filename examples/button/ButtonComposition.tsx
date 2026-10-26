'use client'

import { useRef, useState } from 'react'
import { Button, ThemeScope, radiant, type Theme, type ThemeMode } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
import './button-example.css'
import { useHydrated } from '../profile/useHydrated'

export function ButtonComposition({
  pending = false,
  theme = radiant,
  mode = 'light'
}: {
  pending?: boolean
  theme?: Theme
  mode?: ThemeMode
}) {
  const actionRef = useRef<HTMLButtonElement>(null)
  const ready = useHydrated()
  const [feedback, setFeedback] = useState('Focus the action with the arrow, then activate it.')
  const [reviews, setReviews] = useState(0)

  return (
    <ThemeScope
      theme={theme}
      mode={mode}
      className="button-example"
    >
      <Button
        ref={actionRef}
        disabled={!ready}
        pending={pending}
        fullWidth
        onFocus={() => setFeedback('The ref reached the native button.')}
        onClick={() => {
          setReviews(value => value + 1)
          setFeedback('Review recorded locally.')
        }}
        render={props => (
          <button
            {...props}
            data-review-action="true"
          />
        )}
      >
        Mark as reviewed
      </Button>
      <Button
        iconOnly
        disabled={!ready}
        variant="outline"
        aria-label="Focus action"
        title="Focus action"
        onClick={() => actionRef.current?.focus()}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 19V5m-6 6 6-6 6 6" />
        </svg>
      </Button>
      <span className="button-state">
        {pending ? 'Working… activation is paused.' : 'Ready to review.'}
      </span>
      <output>
        {feedback} Reviews: {reviews}.
      </output>
    </ThemeScope>
  )
}
