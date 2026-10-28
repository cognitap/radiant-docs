'use client'

import { pageContexts, pageNames, readCopy, sceneCopy } from './page-copy'
import type { ToolProps } from './preview-tools'

export function TypographyTools({ view, session, dispatch, disabled, role }: ToolProps) {
  const page = view.scene.kind === 'page' ? view.scene.page : undefined
  return (
    <div className="preview-tools">
      <div className="preview-probes">
        <label>
          <input
            type="checkbox"
            disabled={disabled}
            checked={view.probes.textSpacing}
            onChange={event =>
              dispatch({ type: 'probe', probe: 'textSpacing', on: event.target.checked })
            }
          />
          Text spacing probe
        </label>
      </div>
      <p className="preview-note">
        {view.probes.inspect ? `Selected style: ${role}. ` : ''}
        {page ? `${pageContexts[page]}.` : 'Component controls use the installed UI styles.'}
      </p>
      {page && (
        <details className="preview-copy-editor">
          <summary>Edit {pageNames[page].toLowerCase()} copy</summary>
          <p className="preview-note">
            Plain text only. Changes appear in every frame and stay in this session.
          </p>
          <div className="preview-copy-fields">
            {Object.entries(sceneCopy[page]).map(([key, fallback]) => (
              <label key={`${page}:${key}`}>
                {pageNames[page]} · {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                <textarea
                  disabled={disabled}
                  value={readCopy(session.copy, page, key as keyof (typeof sceneCopy)[typeof page])}
                  rows={fallback.length > 90 ? 3 : 2}
                  onChange={event =>
                    dispatch({ type: 'copy', page, key, value: event.target.value })
                  }
                />
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
