import { Field, PasswordInput } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function PasswordInputExample() {
  return (
    <Field
      label="Password"
      style={{ width: '100%', maxWidth: '26rem' }}
    >
      <PasswordInput
        name="password"
        defaultValue="demo-pass"
      />
    </Field>
  )
}
