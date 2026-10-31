'use client'

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Textarea
} from '@cognitap/radiant'
import { pageNames, readCopy, sceneCopy } from './page-copy'
import type { ToolProps } from './preview-tools'

export function TypographyTools({ view, session, dispatch, disabled }: ToolProps) {
  const page = view.scene.kind === 'page' ? view.scene.page : undefined
  const spacing = view.probes.textSpacing
  return (
    <div className="preview-tools">
      <Button
        variant={spacing ? 'solid' : 'outline'}
        controlSize="small"
        aria-pressed={spacing}
        disabled={disabled}
        onClick={() => dispatch({ type: 'probe', probe: 'textSpacing', on: !spacing })}
      >
        Text spacing
      </Button>
      {page && (
        <Collapsible className="preview-copy-editor">
          <CollapsibleTrigger>Edit copy</CollapsibleTrigger>
          <CollapsibleContent>
            <div className="preview-copy-fields">
              {Object.entries(sceneCopy[page]).map(([key, fallback]) => (
                <Field
                  key={`${page}:${key}`}
                  label={`${pageNames[page]} · ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                >
                  <Textarea
                    controlSize="small"
                    disabled={disabled}
                    value={readCopy(
                      session.copy,
                      page,
                      key as keyof (typeof sceneCopy)[typeof page]
                    )}
                    rows={fallback.length > 90 ? 3 : 2}
                    onChange={event =>
                      dispatch({ type: 'copy', page, key, value: event.target.value })
                    }
                  />
                </Field>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
