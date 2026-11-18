'use client'

import { useState } from 'react'
import { Button, Rating } from '@cognitap/radiant'

export function SubmitFeedback() {
  const [score, setScore] = useState('')
  return (
    <form
      className="grid gap-3"
      onReset={() => setScore('')}
      onSubmit={event => {
        event.preventDefault()
        setScore(String(new FormData(event.currentTarget).get('score')))
      }}
    >
      <Rating
        name="score"
        label="Service rating"
        required
      />
      <div className="flex gap-2">
        <Button type="submit">Send rating</Button>
        <Button
          type="reset"
          variant="outline"
        >
          Reset
        </Button>
      </div>
      <output className="text-sm">{score && score + ' out of 5 submitted'}</output>
    </form>
  )
}
