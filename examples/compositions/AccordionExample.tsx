'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Link
} from '@cognitap/radiant'
import type { CompositionOptions } from './composition-types'
import '@cognitap/radiant/styles.css'
import './composition-example.css'

export function AccordionExample({
  compact = false,
  multiple = false,
  controlled = false,
  disabled = false
}: CompositionOptions & { multiple?: boolean; controlled?: boolean; disabled?: boolean }) {
  const [singleValue, setSingleValue] = useState<string | null>('installation')
  const [multipleValue, setMultipleValue] = useState<string[]>(['installation'])
  const items = (
    <>
      <AccordionItem value="installation">
        <AccordionTrigger level={3}>Installation</AccordionTrigger>
        <AccordionContent>
          <Link href="/docs/getting-started/">Open installation guide</Link>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="themes">
        <AccordionTrigger level={3}>Themes and modes</AccordionTrigger>
        <AccordionContent>
          <p className="composition-copy">
            Choose a published preset with ThemeScope. Light, dark and system modes are independent
            of the preset.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="future"
        disabled
      >
        <AccordionTrigger level={3}>Future integrations</AccordionTrigger>
        <AccordionContent>More integrations will arrive in a future release.</AccordionContent>
      </AccordionItem>
    </>
  )
  const style = compact ? { '--rad-collapsible-padding': '1rem' } : undefined
  return (
    <div className="composition-example">
      <div className="composition-stack">
        {multiple ? (
          <Accordion
            type="multiple"
            {...(controlled ? { value: multipleValue } : { defaultValue: ['installation'] })}
            onValueChange={setMultipleValue}
            disabled={disabled}
            style={style}
          >
            {items}
          </Accordion>
        ) : (
          <Accordion
            type="single"
            {...(controlled ? { value: singleValue } : { defaultValue: 'installation' })}
            onValueChange={setSingleValue}
            disabled={disabled}
            style={style}
          >
            {items}
          </Accordion>
        )}
        {controlled && (
          <div className="composition-actions">
            <Button
              disabled={disabled}
              variant="outline"
              onClick={() => {
                setSingleValue(null)
                setMultipleValue([])
              }}
            >
              Close all sections
            </Button>
          </div>
        )}
        <output className="composition-result">
          Open sections:{' '}
          {multiple ? multipleValue.join(', ') || '(none)' : (singleValue ?? '(none)')}.
        </output>
      </div>
    </div>
  )
}
