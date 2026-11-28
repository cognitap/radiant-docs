import { CheckboxGroup } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function CheckboxGroupExample() {
  return (
    <CheckboxGroup
      label="Notifications"
      name="channels"
      defaultValue={['email']}
      selectAll={{ label: 'Select all' }}
      items={[
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'Text messages' },
        { value: 'push', label: 'Push notifications', disabled: true }
      ]}
    />
  )
}
