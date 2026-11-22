'use client'
import { useState } from 'react'
import {
  Button,
  Field,
  SortableList,
  SortableListItem,
  type SortableListProps
} from '@cognitap/radiant'
import { MotionProvider } from '@cognitap/radiant/motion/react'
import '@cognitap/radiant/styles.css'
const text: Pick<
  SortableListProps,
  'instructionsText' | 'pickUpText' | 'moveText' | 'dropText' | 'cancelText'
> = {
  instructionsText:
    'Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel.',
  pickUpText: (item, index, count) => `Picked up ${item}. Position ${index + 1} of ${count}.`,
  moveText: (item, index, count) => `${item}, position ${index + 1} of ${count}.`,
  dropText: (item, index, count) => `Dropped ${item} at position ${index + 1} of ${count}.`,
  cancelText: (item, index, count) =>
    `Cancelled. ${item} is back at position ${index + 1} of ${count}.`
}
const column = { display: 'grid', gap: '0.75rem', width: '24rem', maxWidth: '100%' }
const tasks = [
  { value: 'invoice', label: 'Send the March invoice' },
  { value: 'review', label: 'Review the design proposal' },
  { value: 'backup', label: 'Check last night’s backup' },
  { value: 'venue', label: 'Call the venue about catering' }
]
export function RankPriorities() {
  const [order, setOrder] = useState(tasks.map(task => task.value))
  return (
    <MotionProvider>
      <div style={column}>
        <Field
          layout="group"
          label="Weekly priorities"
          description="Most important first."
        >
          <SortableList
            {...text}
            value={order}
            onValueChange={setOrder}
          >
            {tasks.map(task => (
              <SortableListItem
                key={task.value}
                value={task.value}
              >
                {task.label}
              </SortableListItem>
            ))}
          </SortableList>
        </Field>
        <output>First: {tasks.find(task => task.value === order[0])?.label}</output>
      </div>
    </MotionProvider>
  )
}
const tracks = [
  { value: 'intro', title: 'Intro', length: '1:12' },
  { value: 'tide', title: 'Low Tide', length: '3:48' },
  { value: 'harbor', title: 'Harbor Lights', length: '4:05' },
  { value: 'outro', title: 'Outro', length: '2:20' }
]
export function OrderPlaylist() {
  return (
    <MotionProvider>
      <div style={column}>
        <SortableList
          {...text}
          aria-label="Playlist"
          controlSize="small"
          handleLabel={title => `Move ${title}`}
          defaultValue={tracks.map(track => track.value)}
        >
          {tracks.map(track => (
            <SortableListItem
              key={track.value}
              value={track.value}
              textValue={track.title}
            >
              <span style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <strong>{track.title}</strong>
                <span>{track.length}</span>
              </span>
            </SortableListItem>
          ))}
        </SortableList>
      </div>
    </MotionProvider>
  )
}
export function SaveSearchOrder() {
  const [saved, setSaved] = useState<string[]>([])
  return (
    <form
      style={column}
      onSubmit={event => {
        event.preventDefault()
        setSaved(new FormData(event.currentTarget).getAll('sources').map(String))
      }}
    >
      <SortableList
        {...text}
        aria-label="Search sources, first is searched first"
        name="sources"
      >
        <SortableListItem value="device">This device</SortableListItem>
        <SortableListItem value="team">Team drive</SortableListItem>
        <SortableListItem value="web">The web</SortableListItem>
      </SortableList>
      <Button type="submit">Save order</Button>
      <output>Saved: {saved.length ? saved.join(', ') : 'nothing yet'}</output>
    </form>
  )
}
