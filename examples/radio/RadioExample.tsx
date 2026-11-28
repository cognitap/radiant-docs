import { Radio, RadioGroup } from '@cognitap/radiant'
import '@cognitap/radiant/styles.css'

export function RadioExample() {
  return (
    <RadioGroup
      label="Delivery speed"
      name="delivery"
      defaultValue="standard"
    >
      <Radio
        value="standard"
        label="Standard"
        description="Arrives in 3 to 5 days."
      />
      <Radio
        value="overnight"
        label="Overnight"
        disabled
      />
      <Radio
        value="express"
        label="Express"
        description="Arrives in 2 days."
      />
    </RadioGroup>
  )
}
