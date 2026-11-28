import { Field, NumberField } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function NumberFieldExample() {
  return (
    <Field
      label="Price"
      style={{ width: '100%', maxWidth: '26rem' }}
    >
      <NumberField
        name="price"
        defaultValue={12.5}
        min={0}
        max={100}
        step={0.25}
        locale="de-DE"
        formatOptions={{ style: 'currency', currency: 'EUR' }}
      />
    </Field>
  )
}
