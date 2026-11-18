'use client'

import { useEffect, useState } from 'react'
import { Button, Dropzone, Field, Progress } from '@cognitap/radiant'

export function UploadAttachments() {
  const [files, setFiles] = useState<readonly File[]>([])
  const [progress, setProgress] = useState<number | null>(null)
  const uploading = progress !== null && progress < 100
  useEffect(() => {
    if (!uploading) return
    const timer = window.setTimeout(() => setProgress(Math.min(100, progress + 20)), 120)
    return () => window.clearTimeout(timer)
  }, [progress, uploading])
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Field label="Attachments">
        <Dropzone
          accept=".txt"
          multiple
          disabled={uploading}
          onFilesChange={selection => {
            setFiles(selection.accepted)
            setProgress(null)
          }}
        />
      </Field>
      <Button
        disabled={!files.length}
        pending={uploading}
        onClick={() => setProgress(0)}
      >
        Upload files
      </Button>
      {progress !== null && (
        <Progress
          aria-label="Upload progress"
          value={progress}
        />
      )}
      <output className="text-sm">{progress === 100 && 'Upload complete'}</output>
    </div>
  )
}
