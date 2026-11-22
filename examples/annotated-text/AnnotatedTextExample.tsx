'use client'
import { AnnotatedText, type AnnotatedTextArcText } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'
const arcText: AnnotatedTextArcText = ({ from, to, label }) =>
  label ? `${from} to ${to}: ${label}` : `${from} to ${to}`
export function ReviewRetryCall() {
  return (
    <div style={{ width: '32rem', maxWidth: '100%' }}>
      <AnnotatedText
        aria-label="Review of the retry call"
        arcText={arcText}
        tokens={[
          { text: 'const', labels: ['keyword'] },
          { text: 'delay', labels: ['binding'] },
          { text: '=', labels: ['operator'] },
          { text: 'retry', labels: ['call'] },
          { text: '(' },
          { text: 'attempts', labels: ['argument'] },
          { text: ')' }
        ]}
        spans={[
          { start: 0, end: 6, label: 'Statement', series: 1 },
          { start: 3, end: 6, label: 'Call', series: 2 },
          { start: 5, end: 5, label: 'Unchecked', series: 8 }
        ]}
        arcs={[
          { from: 1, to: 3, label: 'assigned from' },
          { from: 5, to: 3, label: 'passed to', series: 2 }
        ]}
      />
    </div>
  )
}
export function TagEntities() {
  return (
    <div style={{ width: '40rem', maxWidth: '100%' }}>
      <AnnotatedText
        aria-label="Entities and relations in a sentence"
        arcText={arcText}
        tokens={[
          { text: 'The', labels: ['DET'] },
          { text: 'committee', labels: ['NOUN', 'subject'] },
          { text: 'approved', labels: ['VERB'] },
          { text: 'the', labels: ['DET'] },
          { text: 'revised', labels: ['ADJ'] },
          { text: 'budget', labels: ['NOUN', 'object'] },
          { text: 'on', labels: ['ADP'] },
          { text: 'Friday', labels: ['NOUN'] }
        ]}
        spans={[
          { start: 0, end: 1, label: 'Organization', series: 1 },
          { start: 3, end: 5, label: 'Document', series: 3 },
          { start: 4, end: 5, label: 'Changed item', series: 4 },
          { start: 7, end: 7, label: 'Date', series: 6 }
        ]}
        arcs={[
          { from: 2, to: 1, label: 'agent' },
          { from: 2, to: 5, label: 'theme' },
          { from: 2, to: 7, label: 'time' },
          { from: 5, to: 4, label: 'modifier', series: 4 }
        ]}
      />
    </div>
  )
}
export function ReadLogLine() {
  return (
    <AnnotatedText
      aria-label="Request log line"
      arcText={arcText}
      tokens={[
        { text: '12:04:31', labels: ['time', 'UTC'] },
        { text: 'GET', labels: ['method'] },
        { text: '/orders/1042', labels: ['path', 'order 1042'] },
        { text: '200', labels: ['status', 'OK'] },
        { text: '84ms', labels: ['duration'] }
      ]}
    />
  )
}
