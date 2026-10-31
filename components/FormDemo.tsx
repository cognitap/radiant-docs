import { Demo } from './demo/Demo'
import {
  CreateResearchWorkspace,
  RecoverWorkspaceInvitation,
  EditProfileWithTanStack
} from '@/examples/form/FormExample'
export function FormDemo() {
  return (
    <Demo
      title="Create a research workspace"
      files={['form/FormExample.tsx']}
    >
      <CreateResearchWorkspace />
    </Demo>
  )
}
export function FormRecoveryDemo() {
  return (
    <Demo
      title="Recover a collaborator invitation"
      files={['form/FormExample.tsx']}
    >
      <RecoverWorkspaceInvitation />
    </Demo>
  )
}
export function FormProfileDemo() {
  return (
    <Demo
      title="Edit a research profile"
      files={['form/FormExample.tsx']}
    >
      <EditProfileWithTanStack />
    </Demo>
  )
}
