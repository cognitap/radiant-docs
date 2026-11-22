'use client'
import { useState } from 'react'
import {
  RelationGraph,
  type RelationGraphConnectionText,
  type RelationGraphEdge,
  type RelationGraphNode
} from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const connectionText: RelationGraphConnectionText = ({ direction, node, edge }) =>
  `${direction === 'outgoing' ? 'To' : 'From'} ${node.label}${edge.label ? `, ${edge.label}` : ''}`
const people: RelationGraphNode[] = [
  { id: 'ceo', label: 'Chief executive', series: 1, emphasis: 'highlighted' },
  { id: 'ops', label: 'Operations', series: 2 },
  { id: 'eng', label: 'Engineering', series: 3 },
  { id: 'support', label: 'Support', series: 2 },
  { id: 'finance', label: 'Finance', series: 2 },
  { id: 'web', label: 'Web', series: 3 },
  { id: 'platform', label: 'Platform', series: 3 },
  { id: 'data', label: 'Data', emphasis: 'muted', description: 'Open role' }
]
const reports: RelationGraphEdge[] = [
  { from: 'ceo', to: 'ops', label: 'leads' },
  { from: 'ceo', to: 'eng', label: 'leads' },
  { from: 'ops', to: 'support' },
  { from: 'ops', to: 'finance' },
  { from: 'eng', to: 'web' },
  { from: 'eng', to: 'platform' },
  { from: 'eng', to: 'data' }
]
export function ShowOrgChart() {
  return (
    <RelationGraph
      aria-label="Company organization"
      layout="tree"
      nodes={people}
      edges={reports}
      connectionText={connectionText}
    />
  )
}
export function ShowDependencies() {
  return (
    <RelationGraph
      aria-label="Service dependencies"
      layout="layered"
      connectionText={connectionText}
      nodes={[
        { id: 'web', label: 'Web app', series: 1 },
        { id: 'gateway', label: 'API gateway', series: 1 },
        { id: 'orders', label: 'Orders', series: 3 },
        { id: 'billing', label: 'Billing', series: 4, emphasis: 'highlighted' },
        { id: 'queue', label: 'Queue', series: 5 },
        { id: 'db', label: 'Database', series: 6 },
        { id: 'legacy', label: 'Legacy export', emphasis: 'muted', description: 'Retiring' }
      ]}
      edges={[
        { from: 'web', to: 'gateway', label: 'calls' },
        { from: 'gateway', to: 'orders' },
        { from: 'gateway', to: 'billing' },
        { from: 'orders', to: 'queue' },
        { from: 'billing', to: 'queue', label: 'publishes', series: 4 },
        { from: 'orders', to: 'db' },
        { from: 'billing', to: 'db' },
        { from: 'legacy', to: 'db', emphasis: 'muted', description: 'Read only' }
      ]}
    />
  )
}
const states: RelationGraphNode[] = [
  { id: 'draft', label: 'Draft', series: 1 },
  { id: 'review', label: 'In review', series: 4 },
  { id: 'approved', label: 'Approved', series: 3 },
  { id: 'published', label: 'Published', series: 3, emphasis: 'highlighted' },
  { id: 'archived', label: 'Archived', series: 8 }
]
export function PickState() {
  const [state, setState] = useState<string | null>('review')
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <RelationGraph
        aria-label="Document states"
        layout="circular"
        type="single"
        value={state}
        onValueChange={setState}
        connectionText={connectionText}
        nodes={states}
        edges={[
          { from: 'draft', to: 'review', label: 'submit' },
          { from: 'review', to: 'draft', label: 'request changes' },
          { from: 'review', to: 'approved', label: 'approve' },
          { from: 'approved', to: 'published', label: 'publish' },
          { from: 'published', to: 'archived', label: 'archive' },
          { from: 'review', to: 'review', label: 'comment' }
        ]}
      />
      <output>State: {states.find(node => node.id === state)?.label ?? 'none'}</output>
    </div>
  )
}
