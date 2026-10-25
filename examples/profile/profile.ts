export type Profile = {
  displayName: string
  email: string
  contact: 'email' | 'none'
  updates: boolean
}

export const defaultProfile: Profile = {
  displayName: '',
  email: '',
  contact: 'email',
  updates: false
}

export function validateName(value: string) {
  return value.trim().length < 2 ? 'Enter a name with at least two characters.' : undefined
}

export function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? undefined
    : 'Enter a valid email address.'
}

export type ProfileFormProps = {
  onSave: (profile: Profile) => void
  onReset: () => void
}
