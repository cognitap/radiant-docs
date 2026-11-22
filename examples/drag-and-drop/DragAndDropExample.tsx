'use client'
import { useState } from 'react'
import {
  Button,
  DragAndDrop,
  DragAndDropContainer,
  DragAndDropItem,
  type DragAndDropProps,
  type DragAndDropValue
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
const text: Pick<
  DragAndDropProps,
  'instructionsText' | 'pickUpText' | 'moveText' | 'dropText' | 'cancelText' | 'fullText'
> = {
  instructionsText:
    'Press Space or Enter to pick up. Left and Right move to another list, Up and Down within it. Space or Enter drops, Escape cancels.',
  pickUpText: ({ item, from }) => `Picked up ${item} in ${from}.`,
  moveText: ({ item, to, index, count }) => `${item}, ${to}, position ${index + 1} of ${count}.`,
  dropText: ({ item, from, to, index, count }) =>
    `Moved ${item} from ${from} to ${to}, position ${index + 1} of ${count}.`,
  cancelText: ({ item, to }) => `Cancelled. ${item} is back in ${to}.`,
  fullText: ({ item, to }) => `${to} is full, so ${item} stays out.`
}
const wide = { display: 'grid', gap: '0.75rem', width: '100%', maxWidth: '48rem', minWidth: 0 }
const tasks = [
  { value: 'invoice', label: 'Send the March invoice' },
  { value: 'review', label: 'Review the design proposal' },
  { value: 'backup', label: 'Check last night’s backup' },
  { value: 'venue', label: 'Call the venue about catering' },
  { value: 'tickets', label: 'Book the train tickets' }
]
export function PlanTheWeek() {
  const [board, setBoard] = useState<DragAndDropValue>({
    todo: ['invoice', 'review', 'tickets'],
    doing: ['backup', 'venue'],
    done: []
  })
  return (
    <MotionProvider>
      <div style={wide}>
        <DragAndDrop
          {...text}
          aria-label="Task board"
          value={board}
          onValueChange={setBoard}
        >
          <DragAndDropContainer
            value="todo"
            label="To do"
          />
          <DragAndDropContainer
            value="doing"
            label="Doing (2 at most)"
            textValue="Doing"
            capacity={2}
          />
          <DragAndDropContainer
            value="done"
            label="Done"
          />
          {tasks.map(task => (
            <DragAndDropItem
              key={task.value}
              value={task.value}
            >
              {task.label}
            </DragAndDropItem>
          ))}
        </DragAndDrop>
        <output>
          Done: {board.done?.length ?? 0} of {tasks.length}
        </output>
      </div>
    </MotionProvider>
  )
}
const files = [
  { value: 'lease', name: 'lease-2026.pdf', size: '1.2 MB' },
  { value: 'receipt', name: 'hotel-receipt.pdf', size: '84 KB' },
  { value: 'beach', name: 'beach.jpg', size: '3.4 MB' },
  { value: 'passport', name: 'passport-scan.png', size: '620 KB' }
]
export function SortFiles() {
  return (
    <MotionProvider>
      <div style={wide}>
        <DragAndDrop
          {...text}
          aria-label="Sort downloads into folders"
          controlSize="small"
          handleLabel={name => `Move ${name}`}
          defaultValue={{ downloads: files.map(file => file.value) }}
        >
          <DragAndDropContainer
            value="downloads"
            label="Downloads"
          />
          <DragAndDropContainer
            value="home"
            label="Home"
          />
          <DragAndDropContainer
            value="travel"
            label="Travel"
          />
          {files.map(file => (
            <DragAndDropItem
              key={file.value}
              value={file.value}
              textValue={file.name}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <strong>{file.name}</strong>
                <span>{file.size}</span>
              </span>
            </DragAndDropItem>
          ))}
        </DragAndDrop>
      </div>
    </MotionProvider>
  )
}
export function SubmitSeating() {
  const [saved, setSaved] = useState('nothing yet')
  return (
    <form
      style={wide}
      onSubmit={event => {
        event.preventDefault()
        const tables = JSON.parse(String(new FormData(event.currentTarget).get('tables')))
        setSaved(JSON.stringify(tables))
      }}
    >
      <DragAndDrop
        {...text}
        aria-label="Dinner seating"
        name="tables"
        defaultValue={{ unseated: ['ana', 'ben', 'chloe', 'dev'] }}
      >
        <DragAndDropContainer
          value="unseated"
          label="Not seated"
        />
        <DragAndDropContainer
          value="window"
          label="Window table"
          capacity={2}
        />
        <DragAndDropContainer
          value="garden"
          label="Garden table"
          capacity={2}
        />
        <DragAndDropItem value="ana">Ana</DragAndDropItem>
        <DragAndDropItem value="ben">Ben</DragAndDropItem>
        <DragAndDropItem value="chloe">Chloe</DragAndDropItem>
        <DragAndDropItem value="dev">Dev</DragAndDropItem>
      </DragAndDrop>
      <Button type="submit">Save seating</Button>
      <output>Saved: {saved}</output>
    </form>
  )
}
