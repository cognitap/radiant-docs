'use client'
import { useRef, useState } from 'react'
import {
  ScrollArea,
  Button,
  Table,
  TableCaption,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Select,
  SelectTrigger,
  SelectValue,
  SelectPortal,
  SelectContent,
  SelectItem
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
export type ScrollAreaTask = 'activity' | 'table' | 'select' | 'filter'
const entries = Array.from({ length: 24 }, (_, index) => ({
  value: String(index),
  label: `Project ${index + 1}`
}))
function Activity({ recent = false }: { recent?: boolean }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {entries.slice(0, recent ? 2 : 24).map((item, index) => (
        <li
          key={item.value}
          style={{ padding: '0.75rem', borderBottom: '1px solid var(--rad-color-border)' }}
        >
          <strong>{item.label}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>The team shared update {index + 1}.</p>
        </li>
      ))}
    </ol>
  )
}
export function ScrollAreaExample({ task = 'activity' }: { task?: ScrollAreaTask }) {
  const viewport = useRef<HTMLDivElement>(null),
    [recent, setRecent] = useState(false)
  if (task === 'select')
    return (
      <div style={{ width: '18rem', maxWidth: '100%' }}>
        <Select items={entries}>
          <SelectTrigger
            aria-label="Project"
            style={{ width: '100%' }}
          >
            <SelectValue placeholder="Choose a project" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <ScrollArea
                aria-label="Available projects"
                tabIndex={-1}
                style={{ maxHeight: '12rem' }}
              >
                {entries.map(item => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </SelectPortal>
        </Select>
      </div>
    )
  if (task === 'table')
    return (
      <ScrollArea
        aria-label="Quarterly estimates"
        orientation="both"
        visibility="always"
        style={{ width: '28rem', maxWidth: '100%', height: '14rem' }}
      >
        <Table style={{ minWidth: '42rem' }}>
          <TableCaption>Quarterly estimates</TableCaption>
          <TableHead>
            <TableRow>
              <TableHeader>Team</TableHeader>
              {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                <TableHeader key={quarter}>{quarter}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.slice(0, 12).map((item, index) => (
              <TableRow key={item.value}>
                <TableHeader scope="row">{item.label}</TableHeader>
                {[1, 2, 3, 4].map(quarter => (
                  <TableCell key={quarter}>{(index + 1) * quarter * 10} hours</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  return (
    <div style={{ width: '24rem', maxWidth: '100%', display: 'grid', gap: '0.75rem' }}>
      {task === 'filter' ? (
        <Button
          variant="outline"
          onClick={() => setRecent(!recent)}
        >
          {recent ? 'Show all activity' : 'Show recent activity'}
        </Button>
      ) : null}
      <ScrollArea
        ref={viewport}
        aria-label={task === 'filter' ? 'Filtered activity' : 'Recent activity'}
        visibility={task === 'filter' ? 'scroll' : 'hover'}
        style={{ height: '16rem' }}
        parts={{ content: { style: { padding: '0.5rem' } } }}
      >
        <Activity recent={recent} />
      </ScrollArea>
      <Button
        variant="ghost"
        onClick={() => viewport.current?.scrollTo({ top: 0, behavior: 'instant' })}
      >
        Back to top
      </Button>
    </div>
  )
}
