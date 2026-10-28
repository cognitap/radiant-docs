import type { ComponentType, Dispatch } from 'react'
import type { Editor } from './workshop-theme'
import type { PreviewAction, PreviewSession, PreviewState } from './workshop-preview'
import { TypographyTools } from './TypographyTools'
import { MotionTools } from './MotionScenes'

export interface ToolProps {
  view: PreviewState
  session: PreviewSession
  dispatch: Dispatch<PreviewAction>
  disabled: boolean
  replay: () => void
}

/** Each editor contributes its inspection controls to the one preview toolbar. */
export const previewTools: Partial<Record<Editor, ComponentType<ToolProps>>> = {
  typography: TypographyTools,
  motion: MotionTools
}
